import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const page = await browser.newPage();

page.on('response', res => {
  if (res.url().includes('8082')) console.log(`[response ${Date.now()}] ${res.status()} ${res.request().method()} ${res.url()}`);
});
page.on('request', req => {
  if (req.url().includes('8082')) console.log(`[request ${Date.now()}] ${req.method()} ${req.url()}`);
});

await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });

// reuse account from repro4 - but we don't know which random username; register fresh one here
const rand = Math.floor(Math.random() * 1e6);
const username = `repro${rand}`;
await page.goto('http://localhost:3001/register', { waitUntil: 'networkidle' });
await page.fill('input[name="name"]', 'Repro User2');
await page.fill('input[name="email"]', `repro${rand}@example.com`);
await page.fill('input[name="username"]', username);
await page.fill('input[name="password"]', 'Password123!');
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(1000);

console.log('--- now on login page, url:', page.url());
await page.fill('input[name="username"]', username);
await page.fill('input[name="password"]', 'Password123!');

const t0 = Date.now();
console.log('--- click login (1) ---');
await page.locator('button[type="submit"]').click();
for (let i = 0; i < 10; i++) {
  console.log(`t=${Date.now()-t0}ms url=${page.url()}`);
  if (page.url().includes('/feed')) break;
  await page.waitForTimeout(200);
}

await browser.close();
