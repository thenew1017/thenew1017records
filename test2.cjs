const fs = require('fs');
const content = fs.readFileSync('src/lib/admin.server.ts', 'utf8');
const match = content.match(/normalizedEmail === "([^"]+)"/);
if(match) {
  console.log("STRING:", match[1]);
  console.log("HEX:", Buffer.from(match[1]).toString('hex'));
}
