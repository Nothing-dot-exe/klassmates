import { useEffect, useRef } from 'react';
import { User } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export const useApprovalListener = (
  isWaitingApproval: boolean,
  pendingRollNo: string,
  existingStudents: User[],
  resolvedClassroomId: string,
  onLoginStudent: (student: User) => void,
  setIsWaitingApproval: (v: boolean) => void,
  onDeclined?: (reason?: string) => void
) => {
  const hasSeenInPendingRef = useRef(false);
  const pollCountRef = useRef(0);

  useEffect(() => {
    if (!isWaitingApproval || !pendingRollNo) {
      hasSeenInPendingRef.current = false;
      pollCountRef.current = 0;
      return;
    }

    const rollUpper = pendingRollNo.toUpperCase();
    const matched = existingStudents.find((s) => s.rollNo.toUpperCase() === rollUpper);
    if (matched) {
      setIsWaitingApproval(false);
      onLoginStudent(matched);
      return;
    }

    let pollInterval: NodeJS.Timeout | null = null;
    let channel: any = null;

    if (isSupabaseConfigured() && supabase) {
      const roomKey = resolvedClassroomId || 'default';
      channel = supabase
        .channel(`approval_listener_${roomKey}`)
        .on('broadcast', { event: 'request_declined' }, (payload) => {
          const data = payload.payload;
          if (data && data.rollNo && data.rollNo.toUpperCase() === rollUpper) {
            setIsWaitingApproval(false);
            onDeclined?.('Your join request was declined by the room admin.');
          }
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'students' }, (payload) => {
          const row = payload.new as Record<string, unknown>;
          if (row && typeof row.roll_no === 'string' && row.roll_no.toUpperCase() === rollUpper) {
            const approvedStudent: User = {
              id: String(row.id),
              name: String(row.name),
              rollNo: String(row.roll_no),
              email: String(row.email || ''),
              phone: String(row.phone || ''),
              password: String(row.password || ''),
              mustChangePassword: !!row.must_change_password,
              showPhone: !!row.show_phone,
              showEmail: !!row.show_email,
              role: (row.role as User['role']) || 'student',
              avatar: String(row.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.roll_no}`),
              status: 'online',
              joinedAt: String(row.joined_at || new Date().toISOString().split('T')[0]),
            };
            setIsWaitingApproval(false);
            onLoginStudent(approvedStudent);
          }
        })
        .subscribe();

      pollInterval = setInterval(async () => {
        try {
          pollCountRef.current += 1;

          // 1. Check if approved into students
          const { data: studentsData } = await supabase!
            .from('students')
            .select('*')
            .eq('classroom_id', resolvedClassroomId);

          if (studentsData) {
            const found = studentsData.find(
              (r: any) => r.roll_no && r.roll_no.toUpperCase() === rollUpper
            );
            if (found) {
              const approvedStudent: User = {
                id: String(found.id),
                name: String(found.name),
                rollNo: String(found.roll_no),
                email: String(found.email || ''),
                phone: String(found.phone || ''),
                password: String(found.password || ''),
                mustChangePassword: !!found.must_change_password,
                showPhone: !!found.show_phone,
                showEmail: !!found.show_email,
                role: (found.role as User['role']) || 'student',
                avatar: String(found.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${found.roll_no}`),
                status: 'online',
                joinedAt: String(found.joined_at || new Date().toISOString().split('T')[0]),
              };
              setIsWaitingApproval(false);
              onLoginStudent(approvedStudent);
              return;
            }
          }

          // 2. If not approved, check pending_requests table
          const { data: pendingData } = await supabase!
            .from('pending_requests')
            .select('roll_no')
            .eq('classroom_id', resolvedClassroomId);

          if (pendingData) {
            const stillPending = pendingData.some(
              (r: any) => r.roll_no && r.roll_no.toUpperCase() === rollUpper
            );

            if (stillPending) {
              hasSeenInPendingRef.current = true;
            } else if (hasSeenInPendingRef.current || pollCountRef.current >= 4) {
              setIsWaitingApproval(false);
              onDeclined?.('Your join request was declined by the room admin.');
            }
          }
        } catch (e) {
          // ignore network glitch
        }
      }, 2500);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (supabase && channel) supabase.removeChannel(channel);
    };
  }, [isWaitingApproval, pendingRollNo, existingStudents, onLoginStudent, resolvedClassroomId, setIsWaitingApproval, onDeclined]);
};
