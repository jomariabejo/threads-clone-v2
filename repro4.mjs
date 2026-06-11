import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const page = await browser.newPage();

page.on('console', msg => console.log(`[console.${msg.type()}] ${msg.text()}`));
page.on('pageerror', err => console.log(`[pageerror] ${err.message}`));
page.on('response', res => {
  if (res.url().includes('8082')) console.log(`[response ${Date.now()}] ${res.status()} ${res.request().method()} ${res.url()}`);
});
page.on('request', req => {
  if (req.url().includes('8082')) console.log(`[request ${Date.now()}] ${req.method()} ${req.url()}`);
});

const rand = Math.floor(Math.random() * 1e6);
const username = `repro${rand}`;

await page.goto('http://localhost:3001/register', { waitUntil: 'networkidle' });
await page.fill('input[name="name"]', 'Repro User');
await page.fill('input[name="email"]', `repro${rand}@example.com`);
await page.fill('input[name="username"]', username);
await page.fill('input[name="password"]', 'Password123!');

const button = page.locator('button[type="submit"]');
console.log('--- click register ---');
await button.click();

for (let i = 0; i < 15; i++) {
  console.log('url:', page.url());
  await page.waitForTimeout(300);
}

await browser.close();
