import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const page = await browser.newPage();

const consoleMsgs = [];
page.on('console', msg => consoleMsgs.push(`[console.${msg.type()}] ${msg.text()}`));
page.on('pageerror', err => consoleMsgs.push(`[pageerror] ${err.message}`));
page.on('requestfailed', req => consoleMsgs.push(`[requestfailed] ${req.method()} ${req.url()} ${req.failure()?.errorText}`));
page.on('response', res => {
  if (res.url().includes('8082') || res.status() >= 400) {
    consoleMsgs.push(`[response] ${res.status()} ${res.url()}`);
  }
});

await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

console.log('--- initial load done ---');

// Fill login form
await page.fill('#\\:r1\\:-username, input[name="username"]', 'testuser');
await page.fill('input[name="password"]', 'wrongpassword');

const button = page.locator('button[type="submit"]');
console.log('button count:', await button.count());
console.log('button disabled?', await button.isDisabled());

for (let i = 1; i <= 3; i++) {
  console.log(`--- click ${i} ---`);
  await button.click();
  await page.waitForTimeout(800);
}

console.log('--- console/network log ---');
console.log(consoleMsgs.join('\n'));

await browser.close();
