import { test, expect, type Page } from '@playwright/test';

// ── Helper ────────────────────────────────────────────────
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('alex@opal.salon').fill(email);
  await page.locator('input[type="password"], input[data-testid="password-input"]').first().fill(password);
  await page.getByTestId('sign-in-button').click();
}

// ── Tests ─────────────────────────────────────────────────

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders email, password inputs and sign-in button', async ({ page }) => {
    await expect(page.getByPlaceholder('alex@opal.salon')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Sign In')).toBeVisible();
    await expect(page.getByText('OPAL', { exact: true })).toBeVisible();
    await expect(page.getByText('Welcome to Opal')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await login(page, 'bad@email.com', 'wrong');
    await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 10000 });
  });

  test('owner (alex) can log in and sees home with greeting', async ({ page }) => {
    await login(page, 'alex@opal.salon', 'owner123');
    await expect(page.getByText(/Good (morning|afternoon|evening), Alex/)).toBeVisible({
      timeout: 15000,
    });
  });

  test('receptionist (naomi) can log in and sees home', async ({ page }) => {
    await login(page, 'naomi@opal.salon', 'front123');
    await expect(page.getByText(/Good (morning|afternoon|evening), Naomi/)).toBeVisible({
      timeout: 15000,
    });
  });

  test('staff (sofia) can log in and sees home', async ({ page }) => {
    await login(page, 'sofia@opal.salon', 'staff123');
    await expect(page.getByText(/Good (morning|afternoon|evening), Sofia/)).toBeVisible({
      timeout: 15000,
    });
  });
});
