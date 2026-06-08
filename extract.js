const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const regex = /https:\/\/vveslmalxlprmlfcdjae.supabase.co\/storage\/v1\/object\/public\/media\/[^\s"'>]+/g;
const matches = html.match(regex);
console.log(Array.from(new Set(matches)).join('\n'));
