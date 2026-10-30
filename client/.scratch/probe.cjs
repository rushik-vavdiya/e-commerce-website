const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  console.log('HOME errors:', errors.length);
  errors.slice(0, 8).forEach((e) => console.log(' -', e.slice(0, 300)));

  const p2 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const e2 = [];
  p2.on('console', (m) => { if (m.type() === 'error') e2.push(m.text()); });
  p2.on('pageerror', (e) => e2.push('PAGEERROR ' + e.message));
  await p2.goto('http://localhost:5174/shop', { waitUntil: 'networkidle' });
  console.log('SHOP errors:', e2.length);
  e2.slice(0, 8).forEach((e) => console.log(' -', e.slice(0, 300)));
  console.log('SHOP cards:', await p2.locator('article').count());
  await browser.close();
})();
