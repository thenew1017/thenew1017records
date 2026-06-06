const puppeteer = require('puppeteer');

(async () => {
  console.log("🚀 Starting E2E test for Artist Application...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to http://localhost:5173/about-1017");
    await page.goto('http://localhost:5173/about-1017', { waitUntil: 'networkidle2' });

    console.log("Scrolling to form...");
    await page.evaluate(() => {
      document.getElementById('recruitment-portal')?.scrollIntoView();
    });

    // Wait for the first input to be visible
    await page.waitForSelector('#candidate-name-input', { timeout: 10000 });
    
    console.log("Filling form step 1...");
    // The form uses multiple inputs, let's type into them based on placeholders or id
    // Looking at the code: "candidate-name-input" is the ID of the first one? Let's check `AboutPage` code. Wait, we don't know the exact IDs. Let's just use evaluate to find inputs by placeholder.
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const textAreas = Array.from(document.querySelectorAll('textarea'));
      const getByText = (text) => inputs.find(i => i.placeholder && i.placeholder.toLowerCase().includes(text.toLowerCase())) || inputs.find(i => i.previousElementSibling && i.previousElementSibling.textContent.toLowerCase().includes(text.toLowerCase()));
      
      const name = getByText("name") || getByText("alias") || inputs[0];
      if (name) { name.value = "Test Artist"; name.dispatchEvent(new Event('input', { bubbles: true })); name.dispatchEvent(new Event('change', { bubbles: true })); }
      
      const alias = getByText("artist") || inputs[1];
      if (alias) { alias.value = "Lil Test"; alias.dispatchEvent(new Event('input', { bubbles: true })); alias.dispatchEvent(new Event('change', { bubbles: true })); }

      const email = document.querySelector('input[type="email"]') || inputs.find(i => i.type === 'email');
      if (email) { email.value = "test@example.com"; email.dispatchEvent(new Event('input', { bubbles: true })); email.dispatchEvent(new Event('change', { bubbles: true })); }
      
      // Step 2... The form has "Continue to Portfolio" button
      const buttons = Array.from(document.querySelectorAll('button'));
      const continueBtn = buttons.find(b => b.textContent.toLowerCase().includes("continue"));
      if (continueBtn) continueBtn.click();
    });

    await new Promise(r => setTimeout(r, 1000));

    console.log("Filling form step 2...");
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const textAreas = Array.from(document.querySelectorAll('textarea'));
      
      const spotify = inputs.find(i => i.placeholder && i.placeholder.toLowerCase().includes("spotify")) || inputs.find(i => i.type === 'url');
      if (spotify) { spotify.value = "https://open.spotify.com/artist/123"; spotify.dispatchEvent(new Event('input', { bubbles: true })); spotify.dispatchEvent(new Event('change', { bubbles: true })); }
      
      const details = textAreas[0];
      if (details) { details.value = "This is a test application sent by automated script."; details.dispatchEvent(new Event('input', { bubbles: true })); details.dispatchEvent(new Event('change', { bubbles: true })); }

      const buttons = Array.from(document.querySelectorAll('button'));
      const submitBtn = buttons.find(b => b.textContent.toLowerCase().includes("transmit dossier") || b.textContent.toLowerCase().includes("submit"));
      if (submitBtn) submitBtn.click();
    });

    console.log("Waiting for submission response...");
    await new Promise(r => setTimeout(r, 5000));

    console.log("✅ E2E application script completed.");

  } catch (error) {
    console.error("❌ E2E test failed:", error);
  } finally {
    await browser.close();
  }
})();
