import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const page = await browser.newPage();
page.on('console', msg => console.log(`[console.${msg.type()}] ${msg.text()}`));

const rand = Math.floor(Math.random() * 1e6);
const username = `repro${rand}`;

await page.goto('http://localhost:3001/register', { waitUntil: 'networkidle' });
await page.fill('input[name="name"]', 'Repro User4');
await page.fill('input[name="email"]', `repro${rand}@example.com`);
await page.fill('input[name="username"]', username);
await page.fill('input[name="password"]', 'Password123!');
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(800);

await page.fill('input[name="username"]', username);
await page.fill('input[name="password"]', 'Password123!');
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(2000);
console.log('after login, url:', page.url());

const ls = await page.evaluate(() => ({ ...localStorage }));
console.log('localStorage keys:', Object.keys(ls));
for (const [k,v] of Object.entries(ls)) console.log(k, '=>', v.slice(0, 100));

const apiKeyResp = await page.evaluate(async () => {
  const r = await fetch('/api/key');
  return { status: r.status, contentType: r.headers.get('content-type'), body: await r.text() };
});
console.log('api/key:', JSON.stringify(apiKeyResp));

await browser.close();
