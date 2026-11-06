import { test, expect } from '@playwright/test';

interface RouteAssertion {
  path: string;
  expectedHeading?: RegExp;
}

const CANONICAL_ROUTES: RouteAssertion[] = [
  { path: '/', expectedHeading: /Skip the Recruitment Scams/i },
  { path: '/who-we-are', expectedHeading: /About Us/i },
  { path: '/job-insights', expectedHeading: /Job Insights|Blog/i },
  { path: '/privacy-policy', expectedHeading: /Privacy Policy/i },
  { path: '/self-care-tools', expectedHeading: /Self Care/i },
  { path: '/us-govt-financial-support', expectedHeading: /Financial Support/i },
  { path: '/career-fairs', expectedHeading: /Career Fairs/i },
  { path: '/ai-tools', expectedHeading: /AI Tools/i },
];

test.describe('Base Route Smoke & Landmark Verification Suite', () => {
  for (const { path: routePath, expectedHeading } of CANONICAL_ROUTES) {
    test(`Route "${routePath}" loads with 200 status, valid landmarks, and zero console exceptions`, async ({
      page,
    }) => {
      const pageErrors: string[] = [];

      // Intercept and record uncaught browser exceptions
      page.on('pageerror', (exception) => {
        pageErrors.push(exception.message);
      });

      const response = await page.goto(routePath, {
        waitUntil: 'domcontentloaded',
      });

      // 1. Verify HTTP Response Status
      expect(response?.status()).toBe(200);

      // 2. Enforce Zero Uncaught JavaScript Crashes
      expect(pageErrors).toEqual([]);

      // 3. Structural Landmark Verification (WCAG 2.2 AA / SC 1.3.1)
      const mainElements = page.locator('main');
      const headerElements = page.locator('header');
      const footerElements = page.locator('footer');

      await expect(mainElements).toHaveCount(1);
      await expect(headerElements).toHaveCount(1);
      await expect(footerElements).toHaveCount(1);

      // Verify landmarks are visible and interactable
      await expect(mainElements).toBeVisible();
      await expect(headerElements).toBeVisible();
      await expect(footerElements).toBeVisible();

      // 4. Primary Heading Verification
      const levelOneHeading = page.getByRole('heading', { level: 1 });
      await expect(levelOneHeading).toBeVisible();

      if (expectedHeading) {
        await expect(page.getByRole('heading', { name: expectedHeading })).toBeVisible();
      }
    });
  }
});
