'use strict';
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// The sign-in form, the shared spinner and the site icon: three things a visitor
// meets before anything else, so they are checked here rather than left to a
// manual look after every change.

test.describe('auth form, loading spinner and favicon', function () {
  test('the password can be revealed and hidden again', async function ({ page }) {
    await page.goto(BASE_URL + '/login', { waitUntil: 'domcontentloaded' });

    const password = page.locator('input[name="password"]');
    await expect(password).toHaveAttribute('type', 'password');

    await page.getByRole('button', { name: /show password/i }).click();
    await expect(password).toHaveAttribute('type', 'text');

    await page.getByRole('button', { name: /hide password/i }).click();
    await expect(password).toHaveAttribute('type', 'password');
  });

  test('the submit button shows a spinner and keeps its label while signing in', async function ({
    page,
  }) {
    // Slowing the request down keeps the in-flight state on screen long enough
    // to assert; the login itself is aborted, so no session is created.
    await page.route('**/api/auth/login', async function (route) {
      await new Promise(function (resolve) {
        setTimeout(resolve, 800);
      });
      await route.abort();
    });

    await page.goto(BASE_URL + '/login', { waitUntil: 'domcontentloaded' });

    await page.locator('input[name="email"]').fill('someone@example.com');
    await page.locator('input[name="password"]').fill('secret123');

    const submit = page.locator('form button[type="submit"]');
    await submit.click();

    await expect(submit).toHaveAttribute('aria-busy', 'true');
    await expect(submit.locator('[role="status"] .animate-spin')).toBeVisible();
    await expect(submit).toContainText('Sign In');
  });

  test('the browser tab uses the site favicon', async function ({ page, request }) {
    await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveTitle(/Mahakali/);

    const href = await page.locator('link[rel="icon"]').getAttribute('href');
    const response = await request.get(BASE_URL + href);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('svg');
  });
});
