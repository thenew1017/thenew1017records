import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(ROOT, ".env");

if (!existsSync(envPath)) {
  console.error("Error: .env file not found.");
  process.exit(1);
}

const envFile = readFileSync(envPath, "utf8");
const vars = {};
envFile.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join("=").trim().replace(/"/g, "").replace(/'/g, "");
    vars[key] = val;
  }
});

const url = vars.SUPABASE_URL || vars.VITE_SUPABASE_URL;
const key = vars.SUPABASE_PUBLISHABLE_KEY || vars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function run() {
  console.log('--- DB Inspection ---');
  console.log('Querying public.user_roles...');
  const { data, error } = await supabase.from('user_roles').select('*');
  if (error) {
    console.log('Result: RLS prevents reading user_roles anonymously. Error:', error.message);
  } else {
    console.log('Result: user_roles:', data);
  }
}
run();
