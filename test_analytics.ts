import { supabase } from './src/integrations/supabase/client';

async function test() {
  const res = await supabase.from('artist_sessions').upsert({
    session_id: 'test', 
    view_count: 1, 
    last_seen: new Date().toISOString()
  });
  console.log('SESSIONS:', res);

  const res2 = await supabase.from('artist_views').insert({
    artist_id: '00000000-0000-0000-0000-000000000000', 
    session_id: 'test'
  });
  console.log('VIEWS:', res2);
}
test();
