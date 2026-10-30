'use strict';
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('redesigned static page layouts', function () {
  let page;

  test.beforeEach(async function ({ browser }) {
    page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.setDefaultTimeout(8000);
  });

  test.afterEach(async function () {
    if (page) await page.close();
  });

  test('About page renders its redesigned sections', async function () {
    await page.goto(BASE_URL + '/about', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // The banner is the shared simple one: eyebrow, heading and text only.
    await expect(
      page.getByRole('heading', { level: 1, name: /fashion for every you/i }),
    ).toBeVisible();

    await expect(page.getByRole('heading', { name: /behind the clothes is a small studio/i })).toBeVisible();
  });

  test('FAQ page still lists the question groups', async function () {
    await page.goto(BASE_URL + '/faq', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /frequently asked questions/i })).toBeVisible();

    // The page shows one topic at a time: every group is a button in the topic
    // picker and the chosen one is the heading beside it.
    const topics = page.getByRole('navigation', { name: /faq categories/i });

    for (const title of [
      'Orders',
      'Shipping',
      'Returns & Exchanges',
      'Payments',
      'Products & Sizing',
    ]) {
      await expect(
        topics.getByRole('button', { name: new RegExp('^' + title + '\\b', 'i') }),
      ).toBeVisible();
    }

    await expect(page.getByRole('heading', { name: /^orders$/i, level: 2 })).toBeVisible();
  });

  test('Contact page still renders the form, info cards and map hero', async function () {
    await page.goto(BASE_URL + '/contact', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /send us a message/i })).toBeVisible();
    await expect(page.getByLabel(/your name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    // The form no longer asks for a subject: name, email and the message are the
    // only fields left.
    await expect(page.getByLabel(/subject/i)).toHaveCount(0);
    await expect(page.getByLabel(/message/i)).toBeVisible();

    // The embed iframe is present in the page source even when the parent frame
    // cannot load Google Maps over the network from this machine.
    await expect(page.locator('iframe[title^="Google Maps"]')).toBeAttached();
  });
});
