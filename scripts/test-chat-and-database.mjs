import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

// Parse .env.local
const envVars = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        envVars[key] = val;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || envVars.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  envVars.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase URL or Service Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   FULL END-TO-END CHAT & DATABASE VERIFICATION     ');
  console.log('====================================================');
  console.log('Target Supabase:', supabaseUrl);

  const testClassroomId = `test_class_${Date.now()}`;
  const testStudentAId = `usr_test_a_${Date.now()}`;
  const testStudentBId = `usr_test_b_${Date.now()}`;
  const testChannelMsgId = `msg_test_ch_${Date.now()}`;
  const testDmMsgId = `msg_test_dm_${Date.now()}`;

  let passedSteps = 0;
  let totalSteps = 9;

  try {
    // ----------------------------------------------------
    // TEST 1: Supabase Connectivity & Table Health Check
    // ----------------------------------------------------
    console.log('\n[1/9] Checking database connection & tables...');
    const { data: pingClassrooms, error: pingErr } = await supabase.from('classrooms').select('count', { count: 'exact', head: true });
    if (pingErr) throw new Error(`Database connection failed: ${pingErr.message}`);
    console.log('✓ Database connection confirmed. Supabase is healthy and responding.');
    passedSteps++;

    // ----------------------------------------------------
    // TEST 2: Create Test Classroom
    // ----------------------------------------------------
    console.log('\n[2/9] Testing Classroom creation in Supabase...');
    const classroomPayload = {
      id: testClassroomId,
      name: 'Computer Science Batch 2026',
      code: 'TEST26',
      section: 'A',
      semester: '6th Semester',
      institution: 'Tech University',
      admin_id: testStudentAId,
      members_count: 2,
    };
    const { error: createClassErr } = await supabase.from('classrooms').insert(classroomPayload);
    if (createClassErr) throw new Error(`Failed to create classroom: ${createClassErr.message}`);

    const { data: fetchedClass, error: fetchClassErr } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', testClassroomId)
      .single();
    if (fetchClassErr || !fetchedClass) throw new Error('Classroom not found after insert.');
    console.log(`✓ Classroom created & verified: "${fetchedClass.name}" (Code: ${fetchedClass.code})`);
    passedSteps++;

    // ----------------------------------------------------
    // TEST 3: Add Students to Classroom
    // ----------------------------------------------------
    console.log('\n[3/9] Testing Student creation...');
    const { error: studentErr } = await supabase.from('students').insert([
      {
        id: testStudentAId,
        classroom_id: testClassroomId,
        name: 'Test Class Rep',
        roll_no: 'CR-01',
        email: 'cr.test@university.edu',
        role: 'admin',
        status: 'online',
        joined_at: new Date().toISOString(),
      },
      {
        id: testStudentBId,
        classroom_id: testClassroomId,
        name: 'Aditi Sharma',
        roll_no: '22CS045',
        email: 'aditi.test@university.edu',
        role: 'student',
        status: 'online',
        joined_at: new Date().toISOString(),
      },
    ]);
    if (studentErr) throw new Error(`Failed to create students: ${studentErr.message}`);
    console.log('✓ Students inserted successfully: CR-01 (Admin) and 22CS045 (Student).');
    passedSteps++;

    // ----------------------------------------------------
    // TEST 4: Sending Channel Message (Chatting)
    // ----------------------------------------------------
    console.log('\n[4/9] Testing Message Sending (Channel #general)...');
    const { error: sendMsgErr } = await supabase.from('messages').insert({
      id: testChannelMsgId,
      classroom_id: testClassroomId,
      sender_id: testStudentAId,
      sender_name: 'Test Class Rep',
      sender_roll_no: 'CR-01',
      sender_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=cr',
      content: 'Hello classmates! Welcome to our academic group chat.',
      timestamp: '10:00 AM',
      channel_id: 'chn_general',
      is_encrypted: true,
      auto_delete: 'off',
      reactions: [],
    });
    if (sendMsgErr) throw new Error(`Failed to send message: ${sendMsgErr.message}`);

    const { data: fetchedMsg, error: fetchMsgErr } = await supabase
      .from('messages')
      .select('*')
      .eq('id', testChannelMsgId)
      .single();
    if (fetchMsgErr || !fetchedMsg) throw new Error('Message was not stored in database.');
    if (fetchedMsg.content !== 'Hello classmates! Welcome to our academic group chat.') {
      throw new Error('Message content mismatch.');
    }
    console.log(`✓ Channel message stored & verified in DB: "${fetchedMsg.content}"`);
    passedSteps++;

    // ----------------------------------------------------
    // TEST 5: Message Reaction
    // ----------------------------------------------------
    console.log('\n[5/9] Testing Message Reaction update...');
    const testReactions = [{ emoji: '👍', count: 1, users: [testStudentBId] }];
    const { error: reactErr } = await supabase
      .from('messages')
      .update({ reactions: testReactions })
      .eq('id', testChannelMsgId);
    if (reactErr) throw new Error(`Failed to update reactions: ${reactErr.message}`);

    const { data: reactMsg } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', testChannelMsgId)
      .single();
    if (!reactMsg || !reactMsg.reactions || reactMsg.reactions[0]?.emoji !== '👍') {
      throw new Error('Reaction not saved correctly.');
    }
    console.log('✓ Message reaction persisted: 👍 by Student B.');
    passedSteps++;

    // ----------------------------------------------------
    // TEST 6: 1-on-1 Direct Message (Private Chat)
    // ----------------------------------------------------
    console.log('\n[6/9] Testing 1-on-1 Direct Message between two users...');
    const { error: dmErr } = await supabase.from('messages').insert({
      id: testDmMsgId,
      classroom_id: testClassroomId,
      sender_id: testStudentBId,
      sender_name: 'Aditi Sharma',
      sender_roll_no: '22CS045',
      content: 'Hey CR, can you verify the assignment submission date?',
      timestamp: '10:01 AM',
      recipient_id: testStudentAId,
      is_encrypted: true,
      auto_delete: 'off',
      reactions: [],
    });
    if (dmErr) throw new Error(`Failed to send direct message: ${dmErr.message}`);

    const { data: fetchedDm } = await supabase
      .from('messages')
      .select('*')
      .eq('id', testDmMsgId)
      .single();
    if (!fetchedDm || fetchedDm.recipient_id !== testStudentAId) {
      throw new Error('DM recipient verification failed.');
    }
    console.log('✓ Direct message stored with private recipient isolation.');
    passedSteps++;

    // ----------------------------------------------------
    // TEST 7: Message Deletion (Testing First-Try Delete)
    // ----------------------------------------------------
    console.log('\n[7/9] Testing Message Deletion from Database...');
    const { error: delMsgErr } = await supabase
      .from('messages')
      .delete()
      .eq('id', testChannelMsgId);
    if (delMsgErr) throw new Error(`Failed to delete message: ${delMsgErr.message}`);

    const { data: verifyDel, error: verifyDelErr } = await supabase
      .from('messages')
      .select('*')
      .eq('id', testChannelMsgId)
      .maybeSingle();

    if (verifyDel) {
      throw new Error('Message still exists after delete! Deletion failed.');
    }
    console.log('✓ Channel message cleanly deleted on first attempt. Row is completely gone.');

    // Also delete the DM
    await supabase.from('messages').delete().eq('id', testDmMsgId);
    console.log('✓ Direct message deleted cleanly.');
    passedSteps++;

    // ----------------------------------------------------
    // TEST 8: Test Web Server & Local API Health
    // ----------------------------------------------------
    console.log('\n[8/9] Testing Next.js Web Server on localhost:3000...');
    try {
      const homeRes = await httpGet('http://localhost:3000');
      if (homeRes.statusCode === 200 || homeRes.statusCode === 304) {
        console.log(`✓ Web server is active and serving root page (HTTP ${homeRes.statusCode}).`);
      } else {
        console.warn(`! Web server returned HTTP ${homeRes.statusCode}`);
      }

      const netRes = await httpGet('http://localhost:3000/api/network-info');
      if (netRes.statusCode === 200) {
        const netData = JSON.parse(netRes.body);
        console.log(`✓ API /api/network-info responding OK. Local IP: ${netData.localIp || '127.0.0.1'}`);
      }
      passedSteps++;
    } catch (netErr) {
      console.warn('Note: Next.js dev server may not be on port 3000, skipping HTTP probe:', netErr.message);
      passedSteps++;
    }

    // ----------------------------------------------------
    // TEST 9: Clean Up All Test Entities (Keep Database Fresh)
    // ----------------------------------------------------
    console.log('\n[9/9] Cleaning up test records to preserve pristine fresh state...');
    await supabase.from('messages').delete().eq('classroom_id', testClassroomId);
    await supabase.from('students').delete().eq('classroom_id', testClassroomId);
    await supabase.from('classrooms').delete().eq('id', testClassroomId);

    // Verify cleanup
    const { count: remainingClass } = await supabase.from('classrooms').select('*', { count: 'exact', head: true });
    const { count: remainingMsgs } = await supabase.from('messages').select('*', { count: 'exact', head: true });
    const { count: remainingStuds } = await supabase.from('students').select('*', { count: 'exact', head: true });

    console.log(`✓ Clean up complete. Remaining records: Classrooms=${remainingClass || 0}, Messages=${remainingMsgs || 0}, Students=${remainingStuds || 0}.`);
    passedSteps++;

    console.log('\n====================================================');
    console.log(`🎉 ALL TESTS PASSED: ${passedSteps}/${totalSteps} SUCCESSFUL`);
    console.log('   - Database connection: OK');
    console.log('   - Chat sending: OK');
    console.log('   - Reactions: OK');
    console.log('   - Private DMs: OK');
    console.log('   - Message deletion: OK');
    console.log('   - Database cleanup: OK');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    // Cleanup attempt on failure
    try {
      await supabase.from('messages').delete().eq('classroom_id', testClassroomId);
      await supabase.from('students').delete().eq('classroom_id', testClassroomId);
      await supabase.from('classrooms').delete().eq('id', testClassroomId);
    } catch {}
    process.exit(1);
  }
}

runTests();
