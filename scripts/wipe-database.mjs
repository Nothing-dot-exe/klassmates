import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

// Parse .env.local manually without external packages
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
  console.error('Missing Supabase URL or Service Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function wipeDatabase() {
  console.log('--- STARTING FRESH DATABASE WIPE ---');
  console.log('Target URL:', supabaseUrl);

  const tables = [
    'messages',
    'documents',
    'pending_requests',
    'password_reset_requests',
    'students',
    'email_otps',
    'classrooms',
  ];

  for (const table of tables) {
    try {
      console.log(`Checking rows in ${table}...`);
      const { count, error: countErr } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (countErr) {
        console.warn(`Could not count ${table}:`, countErr.message);
      } else {
        console.log(`Table ${table} currently has ${count ?? 0} rows.`);
      }

      // Delete all records where id is not null (or email is not null for email_otps)
      const idCol = table === 'email_otps' ? 'email' : 'id';
      const { error: delErr } = await supabase
        .from(table)
        .delete()
        .neq(idCol, '___DUMMY_NEVER_MATCH___');

      if (delErr) {
        console.error(`Error wiping ${table}:`, delErr.message);
      } else {
        console.log(`✓ Table ${table} successfully emptied.`);
      }
    } catch (e) {
      console.error(`Exception wiping ${table}:`, e);
    }
  }

  console.log('--- ALL TABLES EMPTIED ---');
}

wipeDatabase().then(() => {
  console.log('Database wipe completed successfully. Fresh start ready.');
  process.exit(0);
}).catch((err) => {
  console.error('Failed to wipe database:', err);
  process.exit(1);
});
