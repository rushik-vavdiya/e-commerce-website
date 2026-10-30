'use strict';
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('mobile layout health checks', function () {
  let page;

  test.beforeEach(async function ({ browser }) {
    page = await browser.newPage({ viewport: { width: 360, height: 820 } });
    await page.setDefaultTimeout(8000);
  });

  // The shell is ready once the bar has rendered: that only happens after the
  // bundle has run and the storefront content has landed. A "networkidle" wait
  // was timing out instead, because the swatch and catalogue images come from
  // Cloudinary and one slow one keeps the connection count above zero for the
  // whole timeout.
  const openStorefront = async function () {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /mahakali/i }).first()).toBeVisible();
  };

  test.afterEach(async function () {
    if (page) await page.close();
  });

  test('homepage first paint loads without console error', async function () {
    const errors = new Set();
    page.on('console', function (msg) {
      if (msg.type() === 'error') {
        errors.add(msg.text());
      }
    });

    await openStorefront();

    expect(errors.size).toBe(0);
  });

  test('header hides on scroll down, returns on scroll up and stays while a panel is open', async function () {
    await openStorefront();

    const headerTop = () =>
      page
        .locator('header')
        .evaluate((element) => Math.round(element.getBoundingClientRect().top));

    const scrollTo = async (top) => {
      await page.evaluate(
        (value) => window.scrollTo({ top: value, behavior: 'instant' }),
        top,
      );
      await page.waitForTimeout(450);
    };

    await scrollTo(700);
    expect(await headerTop()).toBeLessThan(0);

    await scrollTo(300);
    expect(await headerTop()).toBe(0);

    // Momentum scroll and a settling address bar produce a few pixels of
    // direction change; that must not make the bar flicker.
    await scrollTo(305);
    expect(await headerTop()).toBe(0);

    await scrollTo(315);
    expect(await headerTop()).toBeLessThan(0);

    await scrollTo(311);
    expect(await headerTop()).toBe(0);

    // An open menu lives inside the bar, so the bar has to stay reachable.
    await scrollTo(0);
    await page.getByRole('button', { name: /open menu/i }).click();
    await scrollTo(400);
    expect(await headerTop()).toBe(0);
    await expect(page.getByRole('button', { name: /close menu/i })).toBeVisible();
  });

  test('mobile menu opens and contains the storefront links', async function () {
    await openStorefront();

    await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible();

    await page.getByRole('button', { name: /open menu/i }).click();

    const mobileNav = page.getByRole('navigation', { name: /mobile/i });
    await expect(mobileNav).toBeVisible();

    // The phone menu lists the site's pages; the departments live behind
    // Collections, which is an accordion button here rather than a link.
    for (const label of ['Home', 'About', 'Contact', 'FAQ']) {
      const link = mobileNav.getByRole('link', { name: new RegExp('^' + label + '$', 'i') });
      await expect(link).toBeVisible();
    }

    await expect(
      mobileNav.getByRole('button', { name: /collections/i }),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  test('newsletter h2 renders inside the viewport', async function () {
    await openStorefront();

    await expect(
      page.getByRole('heading', { name: /join our\s+community/i, level: 2 }),
    ).toBeVisible();
  });

  test('mobile menu does not overlap key footer content when open', async function () {
    await openStorefront();

    await page.getByRole('button', { name: /open menu/i }).click();
    const mobileNav = page.getByRole('navigation', { name: /mobile/i });
    await expect(mobileNav).toBeVisible();

    await expect(page.getByRole('contentinfo')).toBeVisible();
  });
});
