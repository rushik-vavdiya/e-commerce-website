'use strict';
const { chromium } = require('@playwright/test');

const BASE = 'http://localhost:5173';

const SECTIONS = {
  about: [
    { _id: 's1', page: 'about', sectionName: 'hero', order: 1, isActive: true, heading: 'Behind the clothes', subheading: 'Our studio', content: 'A small studio.', image: '', images: [], benefits: [] },
    { _id: 's2', page: 'about', sectionName: 'values', order: 2, isActive: true, heading: '', subheading: '', content: '', image: '', images: [], benefits: [] },
  ],
};

(async () => {
  const browser = await chromium.launch();
  const problems = [];

  for (const [label, path, expected] of [
    ['home', '/', /elegant kurtis/i],
    ['about', '/about', /behind the clothes/i],
    ['contact', '/contact', /send us a message|message/i],
    ['faq', '/faq', /frequently asked questions/i],
    ['privacy', '/privacy', /privacy policy/i],
    ['terms', '/terms', /terms/i],
    ['shop', '/shop', /all products|shop/i],
    ['search', '/search', /search the shop/i],
    ['wishlist', '/wishlist', /wishlist/i],
  ]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    const text = await page.locator('body').innerText();
    if (!expected.test(text)) problems.push(`${label}: expected ${expected} in page text`);
    if (errors.length) problems.push(`${label}: ${errors.length} console errors — ${errors[0].slice(0, 140)}`);
    console.log(`${label.padEnd(8)} ${errors.length ? 'ERR' : 'ok '} ${(await page.locator('body').innerText()).length} chars`);
    await page.close();
  }

  // Admin customize with a stubbed API, so no password is needed.
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  const adminErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') adminErrors.push(m.text()); });
  page.on('pageerror', (e) => adminErrors.push(e.message));

  await page.addInitScript(() => {
    localStorage.setItem('token', 'preview-token');
    localStorage.setItem('user', JSON.stringify({ _id: 'admin1', firstName: 'Admin', role: 'admin' }));
  });

  await page.route('**/api/home-sections/admin**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: SECTIONS.about }),
    }),
  );

  await page.goto(BASE + '/admin/customize/about', { waitUntil: 'networkidle' });

  const tabs = await page.getByRole('navigation', { name: /pages you can customize/i }).getByRole('link').allInnerTexts();
  console.log('admin tabs:', tabs.join(' | '));

  for (const label of ['About page', 'FAQ page', 'Shop page', 'Privacy policy']) {
    if (!tabs.includes(label)) problems.push(`admin: missing tab ${label}`);
  }

  const rows = await page.locator('li').filter({ hasText: 'Built-in design' }).count();
  console.log('about rows with built-in label:', rows);
  if (rows < 1) problems.push('admin: about page shows no bands');

  await page.getByRole('button', { name: /edit hero/i }).click();
  await page.waitForLoadState('networkidle');
  const formText = await page.locator('form').first().innerText();
  if (!/show this section on the about page/i.test(formText)) {
    problems.push('admin: editor does not name the about page');
  }
  console.log('editor url:', page.url());

  if (adminErrors.length) problems.push(`admin: console errors — ${adminErrors[0].slice(0, 160)}`);

  console.log('\nPROBLEMS:', problems.length ? '\n - ' + problems.join('\n - ') : 'none');
  await browser.close();
})();
