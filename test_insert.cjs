const fs = require('fs');
const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/['"]/g, '');
});

const url = env.VITE_SUPABASE_URL + '/rest/v1/artist_sessions';
const key = env.VITE_SUPABASE_ANON_KEY;

fetch(url, {
  method: 'POST',
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    session_id: 'test_12345',
    last_seen: new Date().toISOString(),
    user_agent: 'Node test script'
  })
}).then(r => r.json().then(data => console.log('SESSIONS:', r.status, data)));

const url2 = env.VITE_SUPABASE_URL + '/rest/v1/artist_views';
fetch(url2, {
  method: 'POST',
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    session_id: 'test_12345',
    artist_id: '00000000-0000-0000-0000-000000000000',
    source: 'test script'
  })
}).then(r => r.json().then(data => console.log('VIEWS:', r.status, data)));
