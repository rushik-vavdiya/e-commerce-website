'use strict';

// Throwaway: contact sheet of the storefront photos so they can be compared
// before wiring any of them into the about/contact/faq pages.
const path = require('path');
const { chromium } = require('@playwright/test');

const DIR = path.resolve(__dirname, '../public/images');

const FILES = [
  'Sunlit Courtyard Fashion Portrait.png',
  'Elegant Ethnic Fashion in a Dreamy Courtyard.png',
  'category.png',
  'category-mobile.png',
  'casual.png',
  'office.png',
  'festive.png',
  'party.png',
  'festival.png',
  'everyday.png',
  'bottom-banner.png',
  'footer.png',
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });

  // The dev server serves public/, so the photos load over http instead of a
  // file:// origin the browser would block.
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

  const cards = FILES.map(
    (file, index) => `
      <figure>
        <img src="/images/${file}" alt="" />
        <figcaption>${index + 1}. ${file}</figcaption>
      </figure>`,
  ).join('');

  await page.setContent(`<!doctype html>
    <html><body style="margin:0;background:#1b1b1b;font:12px/1.4 system-ui;color:#eee">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:14px">
        ${cards}
      </div>
      <style>
        figure{margin:0}
        img{width:100%;height:210px;object-fit:cover;display:block;border-radius:6px}
        figcaption{padding:4px 2px;color:#bbb}
      </style>
    </body></html>`, { waitUntil: 'load' });

  await page.waitForTimeout(1500);
  await page.screenshot({ path: '.scratch/contact-sheet.jpg', type: 'jpeg', quality: 62, fullPage: true });

  const sizes = await page.evaluate(() =>
    [...document.images].map((img) => ({ src: img.currentSrc.split('/').pop(), w: img.naturalWidth, h: img.naturalHeight })),
  );
  console.log(JSON.stringify(sizes, null, 2));

  await browser.close();
})();
