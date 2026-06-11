import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const page = await browser.newPage();

page.on('console', msg => console.log(`[console.${msg.type()}] ${msg.text()}`));
page.on('pageerror', err => console.log(`[pageerror] ${err.message}`));

await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });

await page.fill('input[name="username"]', 'testuser');
await page.fill('input[name="password"]', 'wrongpassword');

const button = page.locator('button[type="submit"]');

console.log('--- click 1 ---');
const t0 = Date.now();
await button.click();
// poll for alert to appear
for (let i = 0; i < 20; i++) {
  const alertCount = await page.locator('[role="alert"], .chakra-alert').count();
  const html = await button.innerHTML();
  console.log(`t=${Date.now()-t0}ms alertCount=${alertCount} buttonHTML=${html.replace(/\s+/g,' ').slice(0,150)}`);
  if (alertCount > 0) break;
  await page.waitForTimeout(100);
}

await browser.close();
