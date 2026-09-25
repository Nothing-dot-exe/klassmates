import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { sendEmailOtp, verifyEmailOtp } from '@/lib/authService';
import { checkServerUniqueness } from '@/lib/services/uniquenessService';

export const useJoinGateOtp = (
  newAdminEmail: string,
  studentEmail: string,
  setErrorMessage: (v: string) => void,
  setSuccessMessage: (v: string) => void
) => {
  // Admin OTP State
  const [isAdminEmailVerified, setIsAdminEmailVerified] = useState(false);
  const [adminOtpSent, setAdminOtpSent] = useState(false);
  const [adminOtpInput, setAdminOtpInput] = useState('');
  const [adminOtpCountdown, setAdminOtpCountdown] = useState(0);
  const [isAdminSendingOtp, setIsAdminSendingOtp] = useState(false);
  const [isAdminVerifyingOtp, setIsAdminVerifyingOtp] = useState(false);
  const [adminVerificationToken, setAdminVerificationToken] = useState('');
  const [adminOtpError, setAdminOtpError] = useState('');

  // Student OTP State
  const [isStudentEmailVerified, setIsStudentEmailVerified] = useState(false);
  const [studentOtpSent, setStudentOtpSent] = useState(false);
  const [studentOtpInput, setStudentOtpInput] = useState('');
  const [studentOtpCountdown, setStudentOtpCountdown] = useState(0);
  const [isStudentSendingOtp, setIsStudentSendingOtp] = useState(false);
  const [isStudentVerifyingOtp, setIsStudentVerifyingOtp] = useState(false);
  const [studentVerificationToken, setStudentVerificationToken] = useState('');
  const [studentOtpError, setStudentOtpError] = useState('');

  // Timers
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (adminOtpCountdown > 0) {
      timer = setInterval(() => setAdminOtpCountdown((prev) => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [adminOtpCountdown]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (studentOtpCountdown > 0) {
      timer = setInterval(() => setStudentOtpCountdown((prev) => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [studentOtpCountdown]);

  // Supabase Auth link confirmation listener
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email) {
        const confirmedEmail = session.user.email.toLowerCase();
        if (newAdminEmail && confirmedEmail === newAdminEmail.trim().toLowerCase()) {
          setIsAdminEmailVerified(true);
          setAdminOtpSent(false);
          setSuccessMessage(`Email ${confirmedEmail} verified via secure email link!`);
        }
        if (studentEmail && confirmedEmail === studentEmail.trim().toLowerCase()) {
          setIsStudentEmailVerified(true);
          setStudentOtpSent(false);
          setSuccessMessage(`Email ${confirmedEmail} verified via secure email link!`);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [newAdminEmail, studentEmail, setSuccessMessage]);

  const handleSendAdminOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      setErrorMessage('Please enter a valid administrator email address first.');
      return;
    }
    setIsAdminSendingOtp(true);

    // Verify email uniqueness before dispatching OTP
    const uniqueness = await checkServerUniqueness({ email: newAdminEmail.trim() });
    if (!uniqueness.available) {
      setIsAdminSendingOtp(false);
      setErrorMessage(uniqueness.message || 'This administrator email is already registered. Each email can only be used once.');
      return;
    }

    const res = await sendEmailOtp(newAdminEmail);
    setIsAdminSendingOtp(false);
    if (res.success) {
      setAdminOtpSent(true);
      setAdminVerificationToken(res.verificationToken || '');
      setAdminOtpError('');
      setAdminOtpCountdown(60);
      setSuccessMessage(res.message);
    } else {
      setAdminOtpError(res.message);
      setErrorMessage(res.message);
    }
  };

  const handleVerifyAdminOtp = async () => {
    setAdminOtpError('');
    setErrorMessage('');
    setSuccessMessage('');
    if (!adminOtpInput.trim() || adminOtpInput.trim().length < 6) {
      const msg = 'Please enter the complete 6-digit verification code.';
      setAdminOtpError(msg);
      setErrorMessage(msg);
      return;
    }
    setIsAdminVerifyingOtp(true);
    const res = await verifyEmailOtp(newAdminEmail, adminOtpInput, adminVerificationToken);
    setIsAdminVerifyingOtp(false);
    if (res.success) {
      setIsAdminEmailVerified(true);
      setAdminOtpSent(false);
      setAdminOtpError('');
      setSuccessMessage('Administrator email verified successfully! You can now launch your classroom.');
    } else {
      setAdminOtpError(res.message);
      setErrorMessage(res.message);
    }
  };

  const handleSendStudentOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!studentEmail.trim() || !studentEmail.includes('@')) {
      setErrorMessage('Please enter a valid student email address first.');
      return;
    }
    setIsStudentSendingOtp(true);

    // Verify email uniqueness before dispatching OTP
    const uniqueness = await checkServerUniqueness({ email: studentEmail.trim() });
    if (!uniqueness.available) {
      setIsStudentSendingOtp(false);
      setErrorMessage(uniqueness.message || 'This student email is already registered. Each email can only be used once.');
      return;
    }

    const res = await sendEmailOtp(studentEmail);
    setIsStudentSendingOtp(false);
    if (res.success) {
      setStudentOtpSent(true);
      setStudentVerificationToken(res.verificationToken || '');
      setStudentOtpError('');
      setStudentOtpCountdown(60);
      setSuccessMessage(res.message);
    } else {
      setStudentOtpError(res.message);
      setErrorMessage(res.message);
    }
  };

  const handleVerifyStudentOtp = async () => {
    setStudentOtpError('');
    setErrorMessage('');
    setSuccessMessage('');
    if (!studentOtpInput.trim() || studentOtpInput.trim().length < 6) {
      const msg = 'Please enter the complete 6-digit verification code.';
      setStudentOtpError(msg);
      setErrorMessage(msg);
      return;
    }
    setIsStudentVerifyingOtp(true);
    const res = await verifyEmailOtp(studentEmail, studentOtpInput, studentVerificationToken);
    setIsStudentVerifyingOtp(false);
    if (res.success) {
      setIsStudentEmailVerified(true);
      setStudentOtpSent(false);
      setStudentOtpError('');
      setSuccessMessage('Student email verified successfully!');
    } else {
      setStudentOtpError(res.message);
      setErrorMessage(res.message);
    }
  };

  return {
    isAdminEmailVerified,
    adminOtpSent,
    adminOtpInput,
    adminOtpCountdown,
    isAdminSendingOtp,
    isAdminVerifyingOtp,
    adminOtpError,
    setAdminOtpInput,
    handleSendAdminOtp,
    handleVerifyAdminOtp,

    isStudentEmailVerified,
    studentOtpSent,
    studentOtpInput,
    studentOtpCountdown,
    isStudentSendingOtp,
    isStudentVerifyingOtp,
    studentOtpError,
    setStudentOtpInput,
    handleSendStudentOtp,
    handleVerifyStudentOtp,
  };
};
