export interface SendOtpResult {
  success: boolean;
  message: string;
  verificationToken?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
}

/**
 * Requests a verified 6-digit OTP code sent directly to the specified email address.
 * Never leaks the verification code to the client or session.
 */
export const sendEmailOtp = async (email: string): Promise<SendOtpResult> => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  try {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        verificationToken: data.verificationToken,
        message: data.message || `Verification code sent to ${cleanEmail}. Check your inbox!`,
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to dispatch verification email. Please try again.',
    };
  } catch (err: any) {
    console.error('sendEmailOtp network error:', err);
    return {
      success: false,
      message: 'Network error communicating with the verification service. Please try again.',
    };
  }
};

/**
 * Verifies the 6-digit OTP code against the server with optional signed token for stateless verification.
 */
export const verifyEmailOtp = async (
  email: string,
  token: string,
  verificationToken?: string
): Promise<VerifyOtpResult> => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();

  if (!cleanToken || cleanToken.length < 6) {
    return { success: false, message: 'Please enter the complete 6-digit code.' };
  }

  try {
    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, token: cleanToken, verificationToken }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message || 'Email verified successfully!',
      };
    }

    return {
      success: false,
      message: data.message || 'Invalid or expired 6-digit code. Please try again.',
    };
  } catch (err: any) {
    console.error('verifyEmailOtp network error:', err);
    return {
      success: false,
      message: 'Network error verifying code. Please try again.',
    };
  }
};
