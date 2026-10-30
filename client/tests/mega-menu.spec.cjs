'use strict';
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

const product = (id, name, type) => ({
  _id: id,
  name,
  image: null,
  type,
});

// One department holds more than the panel shows (eight counted, six listed),
// one holds a single product, and one is empty so the "Coming soon" state runs.
const COLLECTIONS = {
  success: true,
  message: 'stubbed',
  data: [
    {
      category: '3 Piece',
      slug: '3-piece',
      count: 8,
      products: Array.from({ length: 6 }, (_, index) =>
        product(`68f1010000000000000000${index + 1}`, `Three Piece Suit ${index + 1}`, 'Embroidered'),
      ),
    },
    {
      category: '2 Piece',
      slug: '2-piece',
      count: 8,
      products: [
        product('68f102000000000000000001', 'Two Piece Silk Set', 'Mirror work'),
        product('68f102000000000000000002', 'Two Piece Cotton Set', 'Floral print'),
      ],
    },
    {
      category: '1 Piece',
      slug: '1-piece',
      count: 1,
      products: [product('68f103000000000000000001', 'One Piece Kurti', 'Chevron yoke')],
    },
    { category: 'Cord Set', slug: 'cord-set', count: 0, products: [] },
  ],
};

const FEATURED = {
  success: true,
  message: 'stubbed',
  data: {
    eyebrow: 'Just in',
    title: 'New festive kurta sets',
    buttonLabel: 'Shop new arrivals',
    href: '/shop',
  },
};

const stubMenu = (page) => {
  page.route('**/api/menu/collections*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(COLLECTIONS),
    }),
  );

  page.route('**/api/menu/featured*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FEATURED) }),
  );
};

test.describe('storefront navigation', function () {
  test('the bar offers the page links and Collections opens the mega panel', async function ({
    page,
  }) {
    await stubMenu(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded' });

    const mainNav = page.locator('header nav[aria-label="Main navigation"]');

    for (const label of ['Home', 'About', 'Contact', 'FAQ']) {
      await expect(mainNav.getByRole('link', { name: label, exact: true })).toBeVisible();
    }

    const trigger = mainNav.getByRole('button', { name: 'Collections' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.hover();
    const panel = page.locator('#rv-mega-menu');
    await expect(panel).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // The panel is painted at its own centre: nothing clips it away.
    const painted = await panel.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return Boolean(hit) && (element === hit || element.contains(hit));
    });
    expect(painted).toBe(true);

    // Left rail: every department with its count, the first one selected.
    const rail = panel.getByRole('tablist', { name: 'Shop by set' });
    await expect(rail.getByRole('tab', { name: '3 Piece 8' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(rail.getByRole('tab', { name: '2 Piece 8' })).toBeVisible();
    await expect(rail.getByRole('tab', { name: 'Cord Set 0' })).toBeVisible();

    // Middle column: the selected department's products, name and sub-type.
    await expect(panel.getByRole('link', { name: /Three Piece Suit 1/ }).first()).toBeVisible();
    await expect(panel.getByText('Embroidered').first()).toBeVisible();
    await expect(panel.getByRole('link', { name: 'See all' })).toHaveAttribute(
      'href',
      '/collections/3-piece',
    );

    // Right card comes from the featured document.
    await expect(panel.getByText('New festive kurta sets')).toBeVisible();
    await expect(panel.getByRole('link', { name: 'Shop new arrivals' })).toHaveAttribute(
      'href',
      '/shop',
    );

    // Hovering another category swaps the products.
    await rail.getByRole('tab', { name: '2 Piece 8' }).hover();
    await expect(panel.getByRole('link', { name: /Two Piece Silk Set/ }).first()).toBeVisible();
    await expect(panel.getByRole('link', { name: 'See all' })).toHaveAttribute(
      'href',
      '/collections/2-piece',
    );

    // An empty department explains itself instead of showing a blank column.
    await rail.getByRole('tab', { name: 'Cord Set 0' }).hover();
    await expect(panel.getByText('Coming soon')).toBeVisible();

    // A product row navigates to its page.
    await rail.getByRole('tab', { name: '3 Piece 8' }).hover();
    await panel.getByRole('link', { name: /Three Piece Suit 1/ }).first().click();
    await expect(page).toHaveURL(/\/products\//);
  });

  test('the panel closes on Escape, on an outside click and on navigation', async function ({
    page,
  }) {
    await stubMenu(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded' });

    const trigger = page
      .locator('header nav[aria-label="Main navigation"]')
      .getByRole('button', { name: 'Collections' });

    await trigger.click();
    await expect(page.locator('#rv-mega-menu')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('#rv-mega-menu')).toHaveCount(0);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await expect(page.locator('#rv-mega-menu')).toBeVisible();
    await page.locator('footer').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('#rv-mega-menu')).toHaveCount(0);

    // Navigating from inside the panel leaves it closed on the new page.
    await trigger.hover();
    await page.locator('#rv-mega-menu').getByRole('link', { name: 'See all' }).click();
    await expect(page).toHaveURL(/\/shop\?category=3-piece/);
    await expect(page.locator('#rv-mega-menu')).toHaveCount(0);
  });

  test('the phone drawer shows Collections as an accordion, not the panel', async function ({
    page,
  }) {
    await stubMenu(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Open menu' }).click();

    const menu = page.locator('header nav[aria-label="Mobile navigation"]');

    for (const [label, href] of [
      ['Home', '/'],
      ['About', '/about'],
      ['Contact', '/contact'],
      ['FAQ', '/faq'],
    ]) {
      await expect(menu.getByRole('link', { name: label, exact: true })).toHaveAttribute(
        'href',
        href,
      );
    }

    // The mega panel is never rendered on a phone.
    await expect(page.locator('#rv-mega-menu')).toHaveCount(0);

    const toggle = menu.getByRole('button', { name: 'Collections' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // Tap a department to expand its products.
    const department = menu.getByRole('button', { name: '3 Piece 8' });
    await department.click();
    await expect(menu.getByRole('link', { name: /Three Piece Suit 1/ })).toBeVisible();

    // Leaving through a product closes the drawer.
    await menu.getByRole('link', { name: /Three Piece Suit 1/ }).click();
    await expect(page).toHaveURL(/\/products\//);
    await expect(menu).toHaveCount(0);
  });
});
