require('dotenv').config({path: '.env.production'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vveslmalxlprmlfcdjae.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.auth.admin.getUserById('cd45b27d-7cce-47fe-8457-2cf5c098bb3f').then(r => console.log(JSON.stringify(r.data, null, 2)));
