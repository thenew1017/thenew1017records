async function checkFile(name) {
  const url = `https://thenew1017records.vercel.app/assets/${name}`;
  try {
    const res = await fetch(url);
    if (res.status !== 200) {
      console.log(`- ${name}: HTTP ${res.status}`);
      return;
    }
    const code = await res.text();
    const index1 = code.indexOf("vves1malx");
    const indexL = code.indexOf("vveslmalx");
    
    console.log(`- ${name}:`);
    if (index1 !== -1) {
      console.log(`  ❌ Typo URL:`, code.substring(index1 - 30, index1 + 80));
    }
    if (indexL !== -1) {
      console.log(`  ✅ Correct URL:`, code.substring(indexL - 30, indexL + 80));
    }
  } catch (err) {
    console.error(`Error checking ${name}:`, err.message);
  }
}

async function run() {
  const files = [
    'index-CtlMHoqJ.js',
    'index-B7_oqxpY.js',
    'index-Ba9ldfWR.js'
  ];
  for (const f of files) {
    await checkFile(f);
  }
}
run();
