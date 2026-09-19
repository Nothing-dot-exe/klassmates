import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { storeServerOtp } from '@/lib/server/otpStore';
import { sendVerificationEmail, isSmtpConfigured } from '@/lib/server/mailer';

// In-memory rate limiting: max 3 requests per 10 minutes per email, 10 per IP
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const emailRateLimits = new Map<string, RateLimitRecord>();
const ipRateLimits = new Map<string, RateLimitRecord>();

function checkRateLimit(map: Map<string, RateLimitRecord>, key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = map.get(key);

  if (!record || now > record.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ipRateLimits, ip, 10, 10 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: 'Too many verification attempts from this network. Please wait a few minutes.' },
        { status: 429 }
      );
    }

    const { email } = await req.json();
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!checkRateLimit(emailRateLimits, cleanEmail, 3, 10 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: 'Too many verification codes requested for this email. Please check your inbox or wait 10 minutes.' },
        { status: 429 }
      );
    }

    // 1. Generate cryptographically secure 6-digit OTP
    const sixDigitOtp = crypto.randomInt(100000, 1000000).toString();
    await storeServerOtp(cleanEmail, sixDigitOtp);

    let emailDelivered = false;
    let deliveryError = '';

    // 2. Try SMTP Delivery if configured
    if (isSmtpConfigured()) {
      const smtpRes = await sendVerificationEmail({ to: cleanEmail, code: sixDigitOtp });
      if (smtpRes.success) {
        emailDelivered = true;
      } else {
        deliveryError = smtpRes.message || 'SMTP delivery failed';
      }
    }

    // 3. Fallback or parallel Supabase Auth OTP delivery
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: { shouldCreateUser: true },
        });

        if (!error) {
          emailDelivered = true;
        } else if (!emailDelivered) {
          if (error.status === 429 || error.message.includes('rate limit')) {
            deliveryError = 'Email rate limit reached. Please wait before requesting another code.';
          } else {
            deliveryError = error.message;
          }
        }
      } catch (err: any) {
        if (!emailDelivered) deliveryError = err?.message || 'Email delivery service error';
      }
    }

    if (!emailDelivered) {
      return NextResponse.json(
        {
          success: false,
          message: deliveryError || 'Could not send verification email. Please check your email configuration.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please check your inbox and spam folder.`,
    });
  } catch (err: any) {
    console.error('Error in send-otp API:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal server error while sending OTP.' },
      { status: 500 }
    );
  }
}
