import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const filePath = join(ROOT, "src", "lib", "cms.functions.ts");

let content = readFileSync(filePath, "utf8");

// 1. Replace assertAdmin(context.userId)
content = content.replaceAll(
  "assertAdmin(context.userId)",
  "assertAdmin(context.userId, context.supabase)"
);

// 2. Replace assertAdmin(userId) in checkIsAdmin
content = content.replace(
  "await assertAdmin(userId);",
  "await assertAdmin(userId, client || context?.supabase);"
);

writeFileSync(filePath, content, "utf8");
console.log("Successfully patched cms.functions.ts!");
