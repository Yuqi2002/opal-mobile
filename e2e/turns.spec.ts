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

// ── Tests ─────────────────────────────────────────────────

test.describe('Turns tab', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'alex@opal.salon', 'owner123');
  });

  test('navigates to turns tab', async ({ page }) => {
    await page.getByRole('tab', { name: /Turns/ }).click();
    await expect(page.getByText('Turn Queue').first()).toBeVisible({ timeout: 10000 });
  });

  test('shows technician cards', async ({ page }) => {
    await page.getByRole('tab', { name: /Turns/ }).click();
    await expect(page.getByText('Turn Queue').first()).toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Sofia Reyes')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Mia Tanaka')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Jade Kim')).toBeVisible({ timeout: 10000 });
  });

  test('shows status indicators', async ({ page }) => {
    await page.getByRole('tab', { name: /Turns/ }).click();
    await expect(page.getByText('Turn Queue').first()).toBeVisible({ timeout: 10000 });

    await expect(page.getByText(/Serving/).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Break').first()).toBeVisible({ timeout: 10000 });
  });

  test('shows service badges', async ({ page }) => {
    await page.getByRole('tab', { name: /Turns/ }).click();
    await expect(page.getByText('Turn Queue').first()).toBeVisible({ timeout: 10000 });

    // Service badges render abbreviations like "GM", "CP", "CM"
    const hasGM = await page.getByText(/GM/).first().isVisible().catch(() => false);
    const hasCP = await page.getByText(/CP/).first().isVisible().catch(() => false);
    const hasCM = await page.getByText(/CM/).first().isVisible().catch(() => false);
    const hasGP = await page.getByText(/GP/).first().isVisible().catch(() => false);

    const badgeCount = [hasGM, hasCP, hasCM, hasGP].filter(Boolean).length;
    expect(badgeCount).toBeGreaterThanOrEqual(2);
  });
});
