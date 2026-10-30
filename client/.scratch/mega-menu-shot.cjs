'use strict';

// Throwaway capture of the Collections mega menu plus a nav-fit check at the
// lg breakpoint, where the header's overflow utilities were removed.
const { chromium } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

const openMenu = async (page) => {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => window.scrollTo(0, 0));

  const trigger = page.locator('header nav button[aria-controls="rv-collections-menu"]');
  await trigger.hover();

  const panel = page.locator('#rv-collections-menu');
  await panel.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(2500);

  return panel;
};

(async () => {
  const browser = await chromium.launch();

  const wide = await browser.newPage({ viewport: { width: 1280, height: 820 } });
  const panel = await openMenu(wide);

  const columns = await panel.evaluate((element) =>
    [...element.querySelectorAll('div.min-w-0')].map((column) => ({
      category: column.querySelector('a')?.textContent?.trim() ?? '',
      links: [...column.querySelectorAll('ul a')].map((link) => link.textContent.trim()),
    })),
  );

  await wide.screenshot({ path: '.scratch/mega-menu.jpg', type: 'jpeg', quality: 62 });

  const narrow = await browser.newPage({ viewport: { width: 1024, height: 780 } });
  await openMenu(narrow);

  const navFit = await narrow.evaluate(() => {
    const nav = document.querySelector('header nav');
    const bar = nav.closest('.rv-site-header-bar');
    const actions = bar.lastElementChild;
    const navBox = nav.getBoundingClientRect();
    const actionBox = actions.getBoundingClientRect();
    return {
      navRight: Math.round(navBox.right),
      actionsLeft: Math.round(actionBox.left),
      overlapsActions: navBox.right > actionBox.left + 1,
      barScrollsHorizontally: bar.scrollWidth > bar.clientWidth + 1,
    };
  });

  await narrow.screenshot({ path: '.scratch/mega-menu-lg.jpg', type: 'jpeg', quality: 62 });

  console.log(JSON.stringify({ columns, navFit }, null, 2));
  await browser.close();
})();
