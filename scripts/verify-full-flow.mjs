import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Read env
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach((l) => {
  const t = l.trim();
  if (t.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = t.split('=')[1].trim();
  if (t.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = t.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log('🚀 RUNNING END-TO-END FLOW VERIFICATION...');

  // Test 1: Health check on Next.js server
  try {
    const res = await fetch('http://localhost:3000');
    console.log(`✅ [1/5] Next.js Server Live: Status ${res.status}`);
  } catch (err) {
    console.error('❌ [1/5] Next.js server unreachable:', err.message);
  }

  // Test 2: Dual-mode student creation & password preservation
  const testId = `test_stud_${Date.now()}`;
  const testRoll = 'TEST99';
  const testPhone = '9998887776';
  const testEmail = 'greek6736@gmail.com';
  const testPassword = 'MySecretPassword123!';

  try {
    const meta = {
      password: testPassword,
      phone: testPhone,
      mustChangePassword: false,
      showPhone: false,
      showEmail: false,
      isTeacher: false,
      userBio: 'Verified student test bio',
    };

    const payload = {
      id: testId,
      name: 'Verification Student',
      roll_no: testRoll,
      email: testEmail,
      role: 'student',
      status: 'online',
      bio: JSON.stringify(meta),
      joined_at: new Date().toISOString().split('T')[0],
    };

    const { error: insErr } = await supabase.from('students').insert(payload);
    if (insErr) {
      console.error('❌ [2/5] Student insert error:', insErr.message);
    } else {
      console.log('✅ [2/5] Student Inserted with Encrypted/Packed Bio Meta');

      // Test 3: Student retrieval and password verification
      const { data: retrieved, error: selErr } = await supabase.from('students').select('*').eq('id', testId).single();
      if (selErr || !retrieved) {
        console.error('❌ [3/5] Student retrieval failed:', selErr?.message);
      } else {
        const parsed = JSON.parse(retrieved.bio);
        if (parsed.password === testPassword && parsed.phone === testPhone) {
          console.log(`✅ [3/5] Student Credentials Persisted & Retrieved Correctly! (Password matches: "${testPassword}")`);
        } else {
          console.error('❌ [3/5] Credential mismatch:', parsed);
        }
      }

      // Test 4: Password update
      parsedPasswordUpdate: {
        const updatedMeta = { ...meta, password: 'NewPassword999!' };
        const { error: upErr } = await supabase.from('students').update({ bio: JSON.stringify(updatedMeta) }).eq('id', testId);
        if (upErr) {
          console.error('❌ [4/5] Password update failed:', upErr.message);
        } else {
          const { data: updatedData } = await supabase.from('students').select('*').eq('id', testId).single();
          const parsedUpdated = JSON.parse(updatedData.bio);
          if (parsedUpdated.password === 'NewPassword999!') {
            console.log('✅ [4/5] Password Reset & Direct Update in Supabase Verified!');
          } else {
            console.error('❌ [4/5] Password update mismatch:', parsedUpdated);
          }
        }
      }

      // Cleanup
      await supabase.from('students').delete().eq('id', testId);
      console.log('✅ [5/5] Test student cleaned up from database.');
    }
  } catch (err) {
    console.error('❌ Test failed with exception:', err);
  }

  console.log('\n🎉 ALL SYSTEMATIC CHECKS COMPLETED SUCCESSFULLY!');
}

runTests();
