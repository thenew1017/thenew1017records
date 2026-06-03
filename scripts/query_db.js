import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vveslmalxlprmlfcdjae.supabase.co";
const SUPABASE_KEY = "sb_publishable_jjJ_rgamG9H9cTmsq176qA__qlPZSE6";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("--- Querying artists table ---");
  const { data: artists, error: artistErr } = await supabase
    .from('artists')
    .select('*')
    .eq('published', true);
  if (artistErr) {
    console.error("Artist query error:", artistErr);
  } else {
    console.log(`Found ${artists.length} published artists:`);
    artists.forEach(a => {
      console.log(`- ID: ${a.id}, Name: ${a.name}, Role: ${a.role}, Image: ${a.image_url}, Logo: ${a.logo_url}`);
    });
  }

  console.log("\n--- Querying site_settings table ---");
  const { data: settings, error: settingsErr } = await supabase
    .from('site_settings')
    .select('*');
  if (settingsErr) {
    console.error("Settings query error:", settingsErr);
  } else {
    console.log(`Found ${settings.length} settings:`);
    settings.forEach(s => {
      console.log(`- Key: ${s.key}, Value:`, JSON.stringify(s.value).substring(0, 200) + "...");
    });
  }
}

run();
