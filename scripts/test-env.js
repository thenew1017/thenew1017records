import fs from "fs";

// Parse .env manually
const envFile = fs.readFileSync(".env", "utf8");
const envVars = {};
envFile.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    const key = parts[0].trim();
    let val = parts.slice(1).join("=").trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    envVars[key] = val;
  }
});

console.log("=== Environment Variables ===");
for (const k in envVars) {
  const hasVal = envVars[k] ? "Yes" : "No";
  const len = envVars[k] ? envVars[k].length : 0;
  const preview = envVars[k] ? envVars[k].substring(0, 10) + "..." : "empty";
  console.log(`${k}: Present=${hasVal}, Length=${len}, Preview=${preview}`);
}

console.log("\n=== Process Env Keys ===");
for (const k in process.env) {
  if (k.toLowerCase().includes("supabase") || k.toLowerCase().includes("db") || k.toLowerCase().includes("key") || k.toLowerCase().includes("postgres")) {
    const preview = process.env[k] ? process.env[k].substring(0, 10) + "..." : "empty";
    console.log(`${k}: Length=${process.env[k].length}, Preview=${preview}`);
  }
}
