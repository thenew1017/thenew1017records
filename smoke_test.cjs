const puppeteer = require('puppeteer');

(async () => {
  console.log("🚀 Starting Production Smoke Test on https://www.thenew1017records.us...");
  
  let failedChecks = [];
  let consoleErrors = [];
  let failedRequests = [];

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('response', async response => {
    if (!response.ok() && response.status() >= 400 && response.request().resourceType() !== 'preflight') {
      const req = response.request();
      let reqHeaders = req.headers();
      
      let errorBody = "could not read body";
      try {
        errorBody = await response.text();
      } catch (e) {}

      failedRequests.push({
        status: response.status(),
        url: response.url(),
        method: req.method(),
        reqHeaders: reqHeaders,
        respBody: errorBody.substring(0, 500)
      });
    }
  });

  try {
    // 1 & 8. Homepage loads successfully & SSL
    console.log("Checking Homepage & SSL...");
    const response = await page.goto('https://www.thenew1017records.us', { waitUntil: 'networkidle2' });
    
    if (!response.ok()) {
      failedChecks.push(`Homepage Load Failed: Status ${response.status()}`);
    } else {
      const securityDetails = response.securityDetails();
      if (!securityDetails) {
        failedChecks.push("SSL Certificate Invalid or Missing");
      }
    }

    // 3. Admin Authentication check
    console.log("Checking Admin Login page...");
    const loginResponse = await page.goto('https://www.thenew1017records.us/admin/login', { waitUntil: 'networkidle2' });
    if (!loginResponse.ok()) failedChecks.push(`Admin Login Load Failed: Status ${loginResponse.status()}`);
    
    await page.waitForSelector('form', { timeout: 5000 }).catch(() => failedChecks.push("Admin login form missing."));

    // Check Console & Network
    if (consoleErrors.length > 0) failedChecks.push(`Console Errors: ${JSON.stringify(consoleErrors, null, 2)}`);
    if (failedRequests.length > 0) failedChecks.push(`Failed Network Requests: ${JSON.stringify(failedRequests, null, 2)}`);

    if (failedChecks.length === 0) {
      console.log("ALL SYSTEMS OPERATIONAL");
    } else {
      console.log("\n❌ FAILED CHECKS:");
      failedChecks.forEach(f => console.log("- " + f));
    }

  } catch (error) {
    console.error("❌ Smoke test crashed:", error);
  } finally {
    await browser.close();
  }
})();
