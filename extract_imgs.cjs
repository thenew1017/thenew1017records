const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf16le');
const matches = html.match(/<img[^>]*>/g);
if (matches) matches.forEach(m => console.log(m));
