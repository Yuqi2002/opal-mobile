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

test.describe('Appointments tab', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'alex@opal.salon', 'owner123');
  });

  test('navigates to appointments tab', async ({ page }) => {
    await page.getByRole('tab', { name: /Appts/ }).click();

    // Appointment cards should be present — look for time-group labels
    const hasMorning = await page.getByText('Morning').isVisible().catch(() => false);
    const hasAfternoon = await page.getByText('Afternoon').isVisible().catch(() => false);
    const hasEvening = await page.getByText('Evening').isVisible().catch(() => false);
    const hasUpcoming = await page.getByText('Upcoming').isVisible().catch(() => false);

    expect(hasMorning || hasAfternoon || hasEvening || hasUpcoming).toBeTruthy();
  });

  test('shows upcoming and past segments', async ({ page }) => {
    await page.getByRole('tab', { name: /Appts/ }).click();

    await expect(page.getByText('Upcoming')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Past')).toBeVisible({ timeout: 10000 });
  });

  test("shows today's date strip", async ({ page }) => {
    await page.getByRole('tab', { name: /Appts/ }).click();

    await expect(page.getByText('Upcoming')).toBeVisible({ timeout: 10000 });

    const todayNum = new Date().getDate().toString();
    await expect(page.getByText(todayNum).first()).toBeVisible({ timeout: 10000 });
  });

  test('can open booking flow', async ({ page }) => {
    await page.getByRole('tab', { name: /Appts/ }).click();
    await expect(page.getByText('Upcoming')).toBeVisible({ timeout: 10000 });

    // Try to find the + button, fallback to direct navigation
    const plusButton = page.locator('[data-testid="book-button"]');
    if ((await plusButton.count()) > 0) {
      await plusButton.first().click();
    } else {
      await page.goto('/(tabs)/appointments/book');
    }

    // The booking flow shows "Book Appointment" header and "Client" step
    await expect(page.getByText('Book Appointment').first()).toBeVisible({ timeout: 10000 });
  });
});
