'use strict';

// Throwaway check: render the admin customer directory with stubbed auth and
// API data, then measure the email column so the "email breaks mid-word" bug
// stays fixed.
const { chromium } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

const USERS = [
  {
    _id: '6ada360a80cabb47da734111',
    firstName: 'Test',
    lastName: 'Cartdemo',
    email: 'cartdemo.e2e@rynova.test',
    phone: '9876501234',
    role: 'admin',
    emailVerified: false,
    status: 'active',
    createdAt: '2026-10-22T10:00:00.000Z',
  },
  {
    _id: '6ad50e474618e817f48c6222',
    firstName: 'Layout',
    lastName: 'Check',
    email: 'buffylayout1792347717@example.com',
    phone: '9876543210',
    role: 'customer',
    emailVerified: false,
    status: 'active',
    createdAt: '2026-10-18T10:00:00.000Z',
  },
  {
    _id: '6ad50e474618e817f48c6333',
    firstName: 'Rushik',
    lastName: 'Vavdiya',
    email: 'rushi.kavdiya1998@gmail.com',
    phone: '7283998918',
    role: 'customer',
    emailVerified: true,
    status: 'active',
    createdAt: '2026-10-12T10:00:00.000Z',
  },
];

const ADMIN = {
  _id: '6ada360a80cabb47da734111',
  firstName: 'Test',
  lastName: 'Cartdemo',
  email: 'cartdemo.e2e@rynova.test',
  role: 'admin',
  status: 'active',
  emailVerified: true,
};

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  await context.addInitScript(
    ([token, user]) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
    },
    ['stub-token', JSON.stringify(ADMIN)],
  );

  const page = await context.newPage();

  // Everything else the shell asks for gets an empty, well-formed answer.
  await page.route('**/api/**', (route) =>
    route.fulfill({ json: { data: [], pagination: { total: 0, page: 1, limit: 20 } } }),
  );

  // Registered last, so it wins over the catch-all above.
  await page.route('**/api/admin/users', (route) =>
    route.fulfill({ json: { data: USERS } }),
  );

  await page.goto(BASE_URL + '/admin/customers', { waitUntil: 'domcontentloaded' });

  try {
    await page.getByRole('table').waitFor({ state: 'visible', timeout: 15000 });
  } catch (error) {
    console.log('URL', page.url());
    console.log('BODY', (await page.locator('body').innerText()).slice(0, 600));
    throw error;
  }

  const report = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('tbody tr')];
    return rows.map((row) => {
      const cell = row.children[1];
      const link = cell.querySelector('a');
      const style = getComputedStyle(link ?? cell);
      const range = document.createRange();
      range.selectNodeContents(link ?? cell);
      const lineHeight = parseFloat(getComputedStyle(cell).lineHeight) || 20;
      return {
        name: row.querySelector('p')?.textContent?.trim(),
        email: link?.textContent?.trim(),
        cellWidth: Math.round(cell.getBoundingClientRect().width),
        lines: Math.round(range.getBoundingClientRect().height / lineHeight),
        overflowsCell: (link ?? cell).getBoundingClientRect().right >
          cell.getBoundingClientRect().right + 1,
        whiteSpace: style.whiteSpace,
      };
    });
  });

  const tableScroll = await page.evaluate(() => {
    const wrap = document.querySelector('table').parentElement;
    return {
      wrapperClient: wrap.clientWidth,
      wrapperScroll: wrap.scrollWidth,
      tableWidth: Math.round(document.querySelector('table').getBoundingClientRect().width),
    };
  });

  await page.screenshot({ path: '.scratch/admin-customers-email.png' });

  console.log(JSON.stringify({ report, tableScroll }, null, 2));
  await browser.close();
})();
