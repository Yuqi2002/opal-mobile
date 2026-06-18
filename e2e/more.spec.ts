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

async function goToMore(page: Page) {
  await page.getByRole('tab', { name: /More/ }).click();
  await expect(page.getByText(/@opal\.salon/).first()).toBeVisible({ timeout: 10000 });
}

// ── Tests ─────────────────────────────────────────────────

test.describe('More tab', () => {
  test('shows profile card for owner', async ({ page }) => {
    await login(page, 'alex@opal.salon', 'owner123');
    await goToMore(page);

    await expect(page.getByText('Alex Moreau')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('alex@opal.salon')).toBeVisible({ timeout: 10000 });
  });

  test('shows business section for owner', async ({ page }) => {
    await login(page, 'alex@opal.salon', 'owner123');
    await goToMore(page);

    await expect(page.getByText('Reports', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Payroll', { exact: true })).toBeVisible({ timeout: 10000 });
  });

  test('shows manage section', async ({ page }) => {
    await login(page, 'alex@opal.salon', 'owner123');
    await goToMore(page);

    await expect(page.getByText('Clients')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Services')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Products')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Staff')).toBeVisible({ timeout: 10000 });
  });

  test('shows preferences section', async ({ page }) => {
    await login(page, 'alex@opal.salon', 'owner123');
    await goToMore(page);

    await expect(page.getByText('Notifications')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Appearance')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Language')).toBeVisible({ timeout: 10000 });
  });

  test('staff sees earnings instead of reports', async ({ page }) => {
    await login(page, 'sofia@opal.salon', 'staff123');
    await goToMore(page);

    await expect(page.getByText('My Earnings')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Reports', { exact: true })).not.toBeVisible({ timeout: 3000 });
    await expect(page.getByText('Payroll', { exact: true })).not.toBeVisible({ timeout: 3000 });
  });

  test('sign out button exists', async ({ page }) => {
    await login(page, 'alex@opal.salon', 'owner123');
    await goToMore(page);

    await expect(page.getByText('Sign Out')).toBeVisible({ timeout: 10000 });
  });

  test('can navigate to appearance', async ({ page }) => {
    await login(page, 'alex@opal.salon', 'owner123');
    await goToMore(page);

    await page.getByText('Appearance').click();

    await expect(page.getByText('Light', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Dark', { exact: true })).toBeVisible({ timeout: 10000 });
  });

  test('can navigate to language', async ({ page }) => {
    await login(page, 'alex@opal.salon', 'owner123');
    await goToMore(page);

    await page.getByText('Language').click();

    await expect(page.getByText('English').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Tiếng Việt')).toBeVisible({ timeout: 10000 });
  });
});
