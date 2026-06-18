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

test.describe('Home screen — role-specific content', () => {
  test('owner sees KPI dashboard with revenue data', async ({ page }) => {
    await login(page, 'alex@opal.salon', 'owner123');

    await expect(page.getByText(/Good (morning|afternoon|evening), Alex/)).toBeVisible({
      timeout: 10000,
    });

    // KPI cards
    await expect(page.getByText("Today's Revenue")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Avg Ticket')).toBeVisible();
    await expect(page.getByText('Utilization')).toBeVisible();

    // Revenue chart section
    await expect(page.getByText('Revenue this week')).toBeVisible();

    // Top performers section
    await expect(page.getByText('Top performers')).toBeVisible();

    // Quick action buttons
    await expect(page.getByText('Book Appointment')).toBeVisible();
    await expect(page.getByText('View Reports')).toBeVisible();
  });

  test('receptionist sees today operations overview', async ({ page }) => {
    await login(page, 'naomi@opal.salon', 'front123');

    await expect(page.getByText(/Good (morning|afternoon|evening), Naomi/)).toBeVisible({
      timeout: 10000,
    });

    // Quick stat cards for today's operations
    await expect(page.getByText('Booked today')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('In service')).toBeVisible();

    // Up Next section
    await expect(page.getByText('Up next')).toBeVisible();
  });

  test('staff sees personal schedule timeline', async ({ page }) => {
    await login(page, 'sofia@opal.salon', 'staff123');

    await expect(page.getByText(/Good (morning|afternoon|evening), Sofia/)).toBeVisible({
      timeout: 10000,
    });

    // My Schedule section header
    await expect(page.getByText('My schedule')).toBeVisible();
  });
});
