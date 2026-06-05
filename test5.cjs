const fs = require('fs');
const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/['"]/g, '');
});

const url = env.VITE_SUPABASE_URL + '/rest/v1/artists';
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
    name: 'Analytics Tracker',
    id: '00000000-0000-0000-0000-000000000000',
    published: false,
    sort_order: 999
  })
}).then(r => r.json().then(data => console.log('INSERT ARTIST:', r.status, data)));
