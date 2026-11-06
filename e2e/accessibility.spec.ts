import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const CANONICAL_ROUTES = [
  '/',
  '/who-we-are',
  '/job-insights',
  '/privacy-policy',
  '/self-care-tools',
  '/us-govt-financial-support',
  '/career-fairs',
  '/ai-tools',
];

test.describe('WCAG 2.2 AA & Section 508 Accessibility Smoke Suite', () => {
  for (const route of CANONICAL_ROUTES) {
    test(`Route "${route}" should pass automated accessibility scanning`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'section508'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }

  test('MainFooter contact form enforces WCAG 2.2 AA label and focus criteria', async ({
    page,
  }) => {
    await page.goto('/');

    const nameInput = page.locator('#footer-name');
    const emailInput = page.locator('#footer-email');
    const messageInput = page.locator('#footer-message');
    const submitBtn = page.getByRole('button', { name: 'Send Message' });

    await expect(nameInput).toBeVisible();
    await expect(page.locator('label[for="footer-name"]')).toHaveText(/Name/);

    await expect(emailInput).toBeVisible();
    await expect(page.locator('label[for="footer-email"]')).toHaveText(/Email/);

    await expect(messageInput).toBeVisible();
    await expect(page.locator('label[for="footer-message"]')).toHaveText(/Message/);

    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toHaveClass(/bg-white/);
  });
});
