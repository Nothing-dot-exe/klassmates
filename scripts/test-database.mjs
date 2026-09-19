import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local manually
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
          supabaseUrl = trimmed.replace('NEXT_PUBLIC_SUPABASE_URL=', '').trim();
        }
        if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
          supabaseKey = trimmed.replace('NEXT_PUBLIC_SUPABASE_ANON_KEY=', '').trim();
        }
      });
    }
  } catch (e) {
    console.error('Could not parse .env.local:', e);
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDatabaseDiagnostics() {
  console.log('\n======================================================');
  console.log('🔍 CLASSMATE DATABASE & BACKEND HEALTH DIAGNOSTICS');
  console.log('======================================================');
  console.log('🌐 Endpoint:', supabaseUrl);
  console.log('🕒 Timestamp:', new Date().toLocaleString());
  console.log('------------------------------------------------------\n');

  const tables = [
    { name: 'classrooms', desc: 'Classroom config & master admin security' },
    { name: 'students', desc: 'Classmates roster, credentials & privacy flags' },
    { name: 'messages', desc: 'Encrypted group channels & direct chats' },
    { name: 'documents', desc: 'Classroom study vault & uploaded files' },
    { name: 'pending_requests', desc: 'Outside student entry request queue' },
    { name: 'password_reset_requests', desc: 'HR-style teacher reset requests' },
  ];

  let hasMissingTables = false;

  for (const t of tables) {
    try {
      const { data, error, count } = await supabase.from(t.name).select('*', { count: 'exact' }).limit(3);
      if (error) {
        hasMissingTables = true;
        console.log(`❌ [${t.name.padEnd(24)}] Missing or Error: ${error.message} (${error.code})`);
      } else {
        console.log(`✅ [${t.name.padEnd(24)}] OK (${data.length} sample, ${count} total rows) — ${t.desc}`);
      }
    } catch (err) {
      hasMissingTables = true;
      console.log(`💥 [${t.name.padEnd(24)}] Exception: ${err.message}`);
    }
  }

  console.log('\n--- Checking Student Credentials & Privacy Columns ---');
  try {
    const { data: studentSample } = await supabase.from('students').select('*').limit(1);
    if (studentSample && studentSample.length > 0) {
      const keys = Object.keys(studentSample[0]);
      const checkCol = (col) => (keys.includes(col) ? '✅ Present' : '⚠️ Missing (needs migration)');
      console.log(`  • phone:                ${checkCol('phone')}`);
      console.log(`  • password:             ${checkCol('password')}`);
      console.log(`  • must_change_password: ${checkCol('must_change_password')}`);
      console.log(`  • show_phone:           ${checkCol('show_phone')}`);
      console.log(`  • show_email:           ${checkCol('show_email')}`);
    } else {
      console.log('  ℹ️ No student rows found yet to inspect column names.');
    }
  } catch (err) {
    console.log('  ⚠️ Error inspecting student columns:', err.message);
  }

  console.log('\n--- Checking Classroom Master Password Column ---');
  try {
    const { data: classSample } = await supabase.from('classrooms').select('*').limit(1);
    if (classSample && classSample.length > 0) {
      const keys = Object.keys(classSample[0]);
      console.log(`  • admin_password:       ${keys.includes('admin_password') ? '✅ Present' : '⚠️ Missing (needs migration)'}`);
    }
  } catch (err) {
    console.log('  ⚠️ Error inspecting classroom columns:', err.message);
  }

  console.log('\n======================================================');
  if (hasMissingTables) {
    console.log('👉 ACTION REQUIRED: Run the SQL migration snippet below in your Supabase SQL Editor:');
    console.log('   Dashboard: https://supabase.com/dashboard/project/_/sql');
  } else {
    console.log('🎉 ALL TABLES AND COLUMNS ARE FULLY SYNCED!');
  }
  console.log('======================================================\n');
}

runDatabaseDiagnostics();
