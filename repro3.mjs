import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const page = await browser.newPage();

await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
await page.fill('input[name="username"]', 'testuser');
await page.fill('input[name="password"]', 'wrongpassword');

const button = page.locator('button[type="submit"]');
await button.click();
await page.waitForTimeout(1500);

const formHtml = await page.locator('form, [as="form"], .chakra-stack').first().evaluate(el => el.closest('div')?.outerHTML ?? el.outerHTML);
console.log(formHtml.slice(0, 3000));
