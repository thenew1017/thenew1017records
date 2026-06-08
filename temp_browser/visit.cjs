const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Set a mobile-ish user agent to test both formats
  await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1");

  console.log("Navigating to https://thenew1017records.us ...");
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  let analyticsCalls = 0;
  page.on('request', request => {
    if (request.url().includes('site_settings')) {
      console.log('API Request ->', request.method(), request.url());
      analyticsCalls++;
    }
  });

  await page.goto('https://thenew1017records.us', { waitUntil: 'networkidle0' });
  console.log("Home page loaded. Waiting 2 seconds...");
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Navigating to /artists ...");
  await page.goto('https://thenew1017records.us/artists', { waitUntil: 'networkidle0' });
  console.log("Artists page loaded. Waiting 2 seconds...");
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Navigating to /applications ...");
  await page.goto('https://thenew1017records.us/applications', { waitUntil: 'networkidle0' });
  console.log("Applications page loaded. Waiting 2 seconds...");
  await new Promise(r => setTimeout(r, 2000));
  
  console.log(`Total Analytics API requests made: ${analyticsCalls}`);

  await browser.close();
  console.log("Browser closed.");
})();
