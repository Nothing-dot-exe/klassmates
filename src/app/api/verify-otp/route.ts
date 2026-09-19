import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyServerOtp } from '@/lib/server/otpStore';

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const cleanToken = token ? String(token).trim() : '';

    if (!cleanEmail || !cleanToken || cleanToken.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email and 6-digit code.' },
        { status: 400 }
      );
    }

    // 1. Check server-side OTP store
    const isServerVerified = await verifyServerOtp(cleanEmail, cleanToken);
    if (isServerVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email verified successfully!',
      });
    }

    // 2. Check Supabase Auth verifyOtp fallback
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const types = ['email', 'magiclink', 'signup'] as const;
        for (const t of types) {
          const { data, error } = await supabase.auth.verifyOtp({
            email: cleanEmail,
            token: cleanToken,
            type: t as any,
          });

          if (!error && (data?.session || data?.user)) {
            return NextResponse.json({
              success: true,
              message: 'Email verified successfully via Supabase Auth!',
            });
          }
        }
      } catch (err) {
        console.warn('Supabase verifyOtp check error:', err);
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid or expired 6-digit verification code. Please check your email and try again.',
      },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Error in verify-otp API:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal server error while verifying OTP.' },
      { status: 500 }
    );
  }
}
