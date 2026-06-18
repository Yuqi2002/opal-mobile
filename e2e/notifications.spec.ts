import { test, expect, type Page } from '@playwright/test';

// ── Helper ────────────────────────────────────────────────
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('alex@opal.salon').fill(email);
  await page.locator('input[type="password"], input[data-testid="password-input"]').first().fill(password);
  await page.getByTestId('sign-in-button').click();
  await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible({
    timeout: 15000,
  });
}

async function openNotifications(page: Page) {
  await page.goto('/notifications');
  await expect(page.getByText('Notifications')).toBeVisible({ timeout: 10000 });
}

// ── Tests ─────────────────────────────────────────────────

test.describe('Notifications modal', () => {
  test('opens notification center', async ({ page }) => {
    await login(page, 'alex@opal.salon', 'owner123');
    await openNotifications(page);

    await expect(page.getByText('Notifications')).toBeVisible({ timeout: 10000 });
    // At least one notification item from mock data
    await expect(page.getByText('New Booking').first()).toBeVisible({ timeout: 10000 });
  });

  test('shows notification items grouped', async ({ page }) => {
    await login(page, 'alex@opal.salon', 'owner123');
    await openNotifications(page);

    const groupLabels = ['TODAY', 'YESTERDAY', 'EARLIER'];
    let foundGroup = false;

    for (const label of groupLabels) {
      const count = await page.getByText(label).count();
      if (count > 0) {
        foundGroup = true;
        break;
      }
    }

    expect(foundGroup).toBeTruthy();
  });

  test('has mark all read button', async ({ page }) => {
    await login(page, 'alex@opal.salon', 'owner123');
    await openNotifications(page);

    await expect(page.getByText('Mark all read')).toBeVisible({ timeout: 10000 });
  });

  test('can close notifications', async ({ page }) => {
    await login(page, 'alex@opal.salon', 'owner123');
    await openNotifications(page);

    await expect(page.getByText('Notifications')).toBeVisible({ timeout: 10000 });

    await page.goBack();

    await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible({
      timeout: 10000,
    });
  });
});
