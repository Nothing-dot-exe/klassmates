import { useState, useEffect } from 'react';
import { User, Classroom } from '@/types';
import { dbLookupStudentByIdentifier, dbUpdateStudent, dbUpdateClassroom } from '@/lib/databaseService';

interface UseForgotPasswordProps {
  existingStudents: User[];
  classroom: Classroom;
  onPasswordResetSuccess: (user: User) => void;
  setErrorMessage: (msg: string) => void;
  setSuccessMessage: (msg: string) => void;
}

export const useForgotPasswordState = ({
  existingStudents,
  classroom,
  onPasswordResetSuccess,
  setErrorMessage,
  setSuccessMessage,
}: UseForgotPasswordProps) => {
  const [identifier, setIdentifier] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [isAdminAccount, setIsAdminAccount] = useState(false);

  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const maskEmail = (email: string) => {
    return email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.max(2, Math.min(b.length, 5))) + c);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const cleanId = identifier.trim();

    if (!cleanId) return setErrorMessage('Please enter your Roll Number, Email, or Mobile Number.');

    setIsSendingOtp(true);
    try {
      let user: User | null = null;
      let isAdmin = false;

      user =
        existingStudents.find(
          (s) =>
            s.rollNo.toUpperCase() === cleanId.toUpperCase() ||
            s.email.toLowerCase() === cleanId.toLowerCase() ||
            (s.phone && s.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, ''))
        ) || null;

      if (!user) {
        const lookup = await dbLookupStudentByIdentifier(cleanId);
        if (lookup) user = lookup.student;
      }

      if (!user && classroom) {
        if (
          cleanId.toLowerCase() === classroom.adminEmail?.toLowerCase() ||
          cleanId.replace(/\D/g, '') === classroom.adminPhone?.replace(/\D/g, '') ||
          cleanId.toUpperCase() === 'ADMIN' ||
          cleanId.toUpperCase() === 'CR'
        ) {
          isAdmin = true;
          user = {
            id: classroom.adminId || 'usr_admin',
            name: classroom.adminName || 'Class Representative',
            rollNo: 'CR-LEAD',
            phone: classroom.adminPhone || '',
            email: classroom.adminEmail || '',
            password: classroom.adminPassword || '',
            showPhone: true,
            showEmail: true,
            role: 'admin',
            isTeacher: false,
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
            status: 'online',
            joinedAt: new Date().toISOString().split('T')[0],
          };
        }
      }

      if (!user) {
        setIsSendingOtp(false);
        return setErrorMessage(`No account found matching "${cleanId}". Please verify your details.`);
      }

      const emailToSend = user.email || (isAdmin ? classroom.adminEmail : '');
      if (!emailToSend || !emailToSend.includes('@')) {
        setIsSendingOtp(false);
        return setErrorMessage('No verified email address is associated with this account. Please contact your Class Representative.');
      }

      setMatchedUser(user);
      setIsAdminAccount(isAdmin || user.role === 'admin');
      setTargetEmail(emailToSend);

      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSend }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsOtpSent(true);
        setCountdown(60);
        setSuccessMessage(`A 6-digit verification code has been sent to ${maskEmail(emailToSend)}. Check your inbox.`);
      } else {
        setErrorMessage(data.message || 'Failed to dispatch verification email. Please try again.');
      }
    } catch {
      setErrorMessage('Network error while dispatching verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!targetEmail) return setErrorMessage('Verification email address missing. Please restart reset.');
    const cleanToken = otpCode.trim();
    if (cleanToken.length < 6) return setErrorMessage('Please enter the full 6-digit code received in your email.');
    if (newPassword.length < 6) return setErrorMessage('New password must be at least 6 characters long.');
    if (newPassword !== confirmPassword) return setErrorMessage('Passwords do not match. Please re-type.');

    setIsResetting(true);
    try {
      const verifyRes = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, token: cleanToken }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        setIsResetting(false);
        return setErrorMessage(verifyData.message || 'Invalid or expired 6-digit code. Please try again.');
      }

      if (!matchedUser) {
        setIsResetting(false);
        return setErrorMessage('Target user account not found.');
      }

      if (isAdminAccount && classroom.id) {
        await dbUpdateClassroom(classroom.id, { adminPassword: newPassword });
      }
      await dbUpdateStudent(matchedUser.id, { password: newPassword, mustChangePassword: false });

      const updatedUser: User = { ...matchedUser, password: newPassword, mustChangePassword: false };
      setSuccessMessage('Password reset successfully! Signing you in...');
      setTimeout(() => onPasswordResetSuccess(updatedUser), 1200);
    } catch {
      setErrorMessage('Failed to complete password reset. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return {
    identifier,
    setIdentifier,
    targetEmail,
    otpCode,
    setOtpCode,
    isOtpSent,
    isSendingOtp,
    countdown,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    isResetting,
    maskEmail,
    handleSendOtp,
    handleResetSubmit,
  };
};
