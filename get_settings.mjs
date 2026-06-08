import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vveslmalxlprmlfcdjae.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your_anon_key'; // Wait, I need the actual anon key.

// I can just read it from .env.local
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('settings').select('*').single();
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

run();
