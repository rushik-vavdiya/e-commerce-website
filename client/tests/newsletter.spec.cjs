'use strict';
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test('home newsletter form submits to the API and reports success', async function ({
  page,
}) {
  let submittedEmail;

  await page.route('**/api/newsletter/subscribe', async function (route) {
    submittedEmail = route.request().postDataJSON().email;
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Subscribed to the newsletter',
        data: { email: submittedEmail },
      }),
    });
  });

  await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('#newsletter-email').fill('reader@example.com');
  await page.getByRole('button', { name: /subscribe/i }).last().click();

  await expect(page.getByRole('status')).toContainText('Subscribed to the newsletter');
  expect(submittedEmail).toBe('reader@example.com');
  await expect(page.locator('#newsletter-email')).toHaveValue('');
});

test('admin newsletter screen lists subscribers returned by the protected API', async function ({
  page,
}) {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'admin-test-token');
    localStorage.setItem(
      'user',
      JSON.stringify({ _id: 'admin-1', role: 'admin' }),
    );
  });

  await page.route('**/api/newsletter/subscribers', async function (route) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Newsletter subscribers fetched',
        data: [
          {
            _id: 'subscriber-1',
            email: 'reader@example.com',
            createdAt: '2026-10-14T10:00:00.000Z',
          },
        ],
      }),
    });
  });

  await page.goto(BASE_URL + '/admin/newsletter', {
    waitUntil: 'domcontentloaded',
  });

  await expect(
    page.getByRole('heading', { name: 'Newsletter subscribers' }),
  ).toBeVisible();
  await expect(page.getByText('reader@example.com')).toBeVisible();
});
