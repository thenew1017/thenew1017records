const fs = require('fs');
const envText = fs.readFileSync('../.env', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/['"]/g, '');
});

const url = env.VITE_SUPABASE_URL + '/rest/v1/site_settings?key=like.analytics:session:*&select=*';
const key = env.VITE_SUPABASE_ANON_KEY;

fetch(url, {
  method: 'GET',
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
  }
}).then(r => r.json().then(data => console.log('SESSIONS:', JSON.stringify(data, null, 2))));
