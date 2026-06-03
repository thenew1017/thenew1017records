import fs from "node:fs";
import path from "node:path";

const root = ".vercel/output/functions/__server.func";

function findInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findInDir(fullPath);
    } else if (file.endsWith(".mjs") || file.endsWith(".js")) {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (content.includes("checkIsAdmin")) {
        // Look for createServerFn patterns
        const rpcMatch = content.match(/const\s+checkIsAdmin\s*=\s*createServerFn\([\s\S]*?id:\s*["'](.*?)["']/);
        if (rpcMatch) {
          console.log(`Found checkIsAdmin ID in ${file}:`, rpcMatch[1]);
        }
        
        const registerMatch = content.match(/registerServerFn\([\s\S]*?id:\s*["'](.*?)["']/);
        if (registerMatch) {
          console.log(`Found registered function ID:`, registerMatch[1]);
        }
        
        // Let's also print any string that looks like a SHA256 function ID
        const shaMatches = content.match(/[0-9a-f]{64}/g);
        if (shaMatches) {
          console.log(`Found SHA256 hashes in ${file}:`, shaMatches.slice(0, 3));
        }
      }
    }
  }
}

findInDir(root);
