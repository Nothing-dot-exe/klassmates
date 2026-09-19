-- =================================================================
-- CLASSMATE — SUPABASE POSTGRESQL DATABASE SCHEMA
-- Copy and paste this entire file into your Supabase SQL Editor and click RUN
-- =================================================================

-- 1. Create Classrooms Table
CREATE TABLE IF NOT EXISTS public.classrooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  section TEXT DEFAULT 'Section B',
  semester TEXT DEFAULT 'Semester 6',
  institution TEXT DEFAULT 'Dept. of Computer Science & Engineering',
  admin_id TEXT DEFAULT 'usr_admin',
  admin_name TEXT,
  admin_phone TEXT,
  admin_email TEXT,
  admin_password TEXT, -- PBKDF2 cryptographic hash (pbkdf2:100000:<salt>:<hash>), never plaintext
  auto_delete_setting TEXT DEFAULT 'off',
  require_approval BOOLEAN DEFAULT true,
  members_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Students Table
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  classroom_id TEXT REFERENCES public.classrooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  roll_no TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  password TEXT, -- PBKDF2 cryptographic hash (pbkdf2:100000:<salt>:<hash>), never plaintext
  must_change_password BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  show_email BOOLEAN DEFAULT false,
  is_teacher BOOLEAN DEFAULT false,
  designation TEXT,
  role TEXT DEFAULT 'student',
  avatar TEXT,
  status TEXT DEFAULT 'online',
  bio TEXT,
  joined_at TEXT DEFAULT CURRENT_DATE::TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  classroom_id TEXT REFERENCES public.classrooms(id) ON DELETE CASCADE,
  channel_id TEXT,
  recipient_id TEXT,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_roll_no TEXT NOT NULL,
  sender_avatar TEXT,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  is_encrypted BOOLEAN DEFAULT true,
  auto_delete TEXT DEFAULT 'off',
  expires_at TEXT,
  voice_note JSONB,
  image_url TEXT,
  document JSONB,
  reactions JSONB DEFAULT '[]'::JSONB,
  reply_to JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  classroom_id TEXT REFERENCES public.classrooms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploader_name TEXT NOT NULL,
  uploaded_at TEXT NOT NULL,
  subject TEXT NOT NULL,
  source TEXT DEFAULT 'chat',
  source_channel TEXT,
  download_url TEXT DEFAULT '#',
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Pending Requests Table
CREATE TABLE IF NOT EXISTS public.pending_requests (
  id TEXT PRIMARY KEY,
  classroom_id TEXT REFERENCES public.classrooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  roll_no TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  password TEXT,
  show_phone BOOLEAN DEFAULT false,
  show_email BOOLEAN DEFAULT false,
  is_teacher BOOLEAN DEFAULT false,
  designation TEXT,
  requested_at TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Password Reset Requests Table (HR / Admin Reset Workflow)
CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id TEXT PRIMARY KEY,
  classroom_id TEXT REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  roll_no TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  note TEXT,
  status TEXT DEFAULT 'pending',
  requested_at TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. High-Performance Indexes for Classroom Queries and Scoping
CREATE INDEX IF NOT EXISTS idx_classrooms_code ON public.classrooms(code);
CREATE INDEX IF NOT EXISTS idx_students_classroom_id ON public.students(classroom_id);
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON public.students(roll_no);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);
CREATE INDEX IF NOT EXISTS idx_messages_classroom_id ON public.messages(classroom_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_classroom_id ON public.documents(classroom_id);
CREATE INDEX IF NOT EXISTS idx_pending_requests_classroom_id ON public.pending_requests(classroom_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_classroom_id ON public.password_reset_requests(classroom_id);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Granular RLS Policies for Web App Client Operations
CREATE POLICY "Allow public select on classrooms" ON public.classrooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert on classrooms" ON public.classrooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on classrooms" ON public.classrooms FOR UPDATE USING (true);

CREATE POLICY "Allow public select on students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public insert on students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on students" ON public.students FOR DELETE USING (true);

CREATE POLICY "Allow public select on messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert on messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on messages" ON public.messages FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on messages" ON public.messages FOR DELETE USING (true);

CREATE POLICY "Allow public select on documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert on documents" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on documents" ON public.documents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on documents" ON public.documents FOR DELETE USING (true);

CREATE POLICY "Allow public select on pending_requests" ON public.pending_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert on pending_requests" ON public.pending_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on pending_requests" ON public.pending_requests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on pending_requests" ON public.pending_requests FOR DELETE USING (true);

CREATE POLICY "Allow public select on password_reset_requests" ON public.password_reset_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert on password_reset_requests" ON public.password_reset_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on password_reset_requests" ON public.password_reset_requests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on password_reset_requests" ON public.password_reset_requests FOR DELETE USING (true);

-- 9. Enable Realtime Replication for Live Sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.classrooms, public.students, public.messages, public.documents, public.pending_requests, public.password_reset_requests;

-- 10. Create Email OTPs Table for Secure Code Persistence (HARDENED)
CREATE TABLE IF NOT EXISTS public.email_otps (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL, -- SHA-256 hashed code, never plaintext
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and revoke all public / anon access.
-- Only backend API routes utilizing SUPABASE_SERVICE_ROLE_KEY can read/write OTP records.
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on email_otps" ON public.email_otps;
DROP POLICY IF EXISTS "Allow public read on email_otps" ON public.email_otps;
REVOKE ALL ON public.email_otps FROM anon, authenticated;

-- 11. Create Storage Bucket for Classroom File Attachments & Documents
-- Creates the public storage bucket for direct PDF, document, and study material uploads.
INSERT INTO storage.buckets (id, name, public)
VALUES ('classroom_files', 'classroom_files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS policies for classroom files
DROP POLICY IF EXISTS "Allow public select on classroom_files storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert on classroom_files storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update on classroom_files storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete on classroom_files storage" ON storage.objects;

CREATE POLICY "Allow public select on classroom_files storage"
ON storage.objects FOR SELECT USING (bucket_id = 'classroom_files');

CREATE POLICY "Allow public insert on classroom_files storage"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'classroom_files');

CREATE POLICY "Allow public update on classroom_files storage"
ON storage.objects FOR UPDATE USING (bucket_id = 'classroom_files');

CREATE POLICY "Allow public delete on classroom_files storage"
ON storage.objects FOR DELETE USING (bucket_id = 'classroom_files');


-- 12. Automated Message Expiration Purge Procedure
CREATE OR REPLACE FUNCTION public.purge_expired_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM public.messages
  WHERE expires_at IS NOT NULL
    AND expires_at != ''
    AND (
      CASE 
        WHEN expires_at ~ '^\d{4}-\d{2}-\d{2}' THEN expires_at::TIMESTAMPTZ < NOW()
        ELSE false
      END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- MIGRATION SCRIPT FOR EXISTING SUPABASE DATABASES:
-- If you already created tables previously, run this snippet in SQL Editor:
--
-- ALTER TABLE public.classrooms ADD COLUMN IF NOT EXISTS admin_password TEXT;
-- ALTER TABLE public.classrooms ADD COLUMN IF NOT EXISTS admin_name TEXT;
-- ALTER TABLE public.classrooms ADD COLUMN IF NOT EXISTS admin_phone TEXT;
-- ALTER TABLE public.classrooms ADD COLUMN IF NOT EXISTS admin_email TEXT;
-- ALTER TABLE public.students ADD COLUMN IF NOT EXISTS phone TEXT;
-- ALTER TABLE public.students ADD COLUMN IF NOT EXISTS password TEXT;
-- ALTER TABLE public.students ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
-- ALTER TABLE public.students ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false;
-- ALTER TABLE public.students ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false;
-- ALTER TABLE public.students ADD COLUMN IF NOT EXISTS is_teacher BOOLEAN DEFAULT false;
-- ALTER TABLE public.students ADD COLUMN IF NOT EXISTS designation TEXT;
-- ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to JSONB;
-- ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '[]'::JSONB;
-- ALTER TABLE public.pending_requests ADD COLUMN IF NOT EXISTS phone TEXT;
-- ALTER TABLE public.pending_requests ADD COLUMN IF NOT EXISTS password TEXT;
-- ALTER TABLE public.pending_requests ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false;
-- ALTER TABLE public.pending_requests ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false;
-- ALTER TABLE public.pending_requests ADD COLUMN IF NOT EXISTS is_teacher BOOLEAN DEFAULT false;
-- ALTER TABLE public.pending_requests ADD COLUMN IF NOT EXISTS designation TEXT;
--
-- DROP POLICY IF EXISTS "Allow public all on email_otps" ON public.email_otps;
-- REVOKE ALL ON public.email_otps FROM anon, authenticated;
-- =================================================================


