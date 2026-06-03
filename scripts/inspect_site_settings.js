import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vveslmalxlprmlfcdjae.supabase.co";
const SUPABASE_KEY = "sb_publishable_jjJ_rgamG9H9cTmsq176qA__qlPZSE6";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*');
  if (error) {
    console.error(error);
    process.exit(1);
  }
  
  for (const row of data) {
    console.log(`\n=== Key: ${row.key} ===`);
    console.dir(row.value, { depth: null });
  }
}
run();
