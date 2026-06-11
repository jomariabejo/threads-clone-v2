import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const page = await browser.newPage();

const rand = Math.floor(Math.random() * 1e6);
const username = `repro${rand}`;

await page.goto('http://localhost:3001/register', { waitUntil: 'networkidle' });
await page.fill('input[name="name"]', 'Repro User3');
await page.fill('input[name="email"]', `repro${rand}@example.com`);
await page.fill('input[name="username"]', username);
await page.fill('input[name="password"]', 'Password123!');
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(800);

await page.fill('input[name="username"]', username);
await page.fill('input[name="password"]', 'Password123!');
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(500);
console.log('after login, url:', page.url());

console.log('--- reloading /feed ---');
await page.goto('http://localhost:3001/feed', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
console.log('after reload, url:', page.url());

console.log('--- navigating to /feed manually again ---');
await page.goto('http://localhost:3001/feed', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
console.log('after manual nav, url:', page.url());

await browser.close();
