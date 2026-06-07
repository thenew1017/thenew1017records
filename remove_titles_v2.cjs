const fs = require('fs');
const path = require('path');
function getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  });
  return Array.prototype.concat(...files);
}
const files = getFiles('src/routes').filter(f => f.endsWith('.tsx'));
for (const file of files) {
  if (file.endsWith('__root.tsx')) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace { title: ... } inside head/meta
  // For index.tsx and about-1017.tsx
  content = content.replace(/\{\s*title:\s*\"[^\"]+\"\s*\},?\s*\n?/g, '');
  
  // For admin routes
  content = content.replace(/\{\s*title:\s*\"Admin[^}]+\}\s*,\s*/g, '');
  
  // For dynamic routes (artist.$name, release.$name)
  content = content.replace(/\{\s*title:\s*[^}]+\}\s*,\s*\n?/g, (match) => {
    if (match.includes('artist ?') || match.includes('release ?')) return '';
    return match;
  });

  fs.writeFileSync(file, content);
}
console.log('Done');
