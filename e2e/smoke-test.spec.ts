import { test, expect } from '@playwright/test';

interface RouteAssertion {
  path: string;
  expectedHeading?: RegExp;
}

const CANONICAL_ROUTES: RouteAssertion[] = [
  { path: '/', expectedHeading: /Skip the Recruitment Scams/i },
  { path: '/who-we-are', expectedHeading: /About Us|Who We Are/i },
  { path: '/job-insights', expectedHeading: /Job Insights|Blog|Intel|Insights/i },
  { path: '/privacy-policy', expectedHeading: /Privacy Policy/i },
  { path: '/self-care-tools', expectedHeading: /Staying Sane|Self[- ]Care/i },
  { path: '/us-govt-financial-support', expectedHeading: /Financial Support/i },
  { path: '/career-fairs', expectedHeading: /Career Fairs/i },
  { path: '/ai-tools', expectedHeading: /Artificial Intelligence|AI Tools/i },
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

      // 3. Landmark Verification via Explicit WCAG Roles (SC 1.3.1)
      const banner = page.getByRole('banner');
      const main = page.getByRole('main');
      const footer = page.getByRole('contentinfo');

      // Verify exactly one primary instance of each landmark role exists
      await expect(banner).toHaveCount(1);
      await expect(main).toHaveCount(1);
      await expect(footer).toHaveCount(1);

      // Verify landmarks are visible in the layout tree
      await expect(banner).toBeVisible();
      await expect(main).toBeVisible();
      await expect(footer).toBeVisible();

      // 4. Primary Heading Verification
      const levelOneHeading = page.getByRole('heading', { level: 1 });
      await expect(levelOneHeading).toBeVisible();

      if (expectedHeading) {
        await expect(page.getByRole('heading', { name: expectedHeading })).toBeVisible();
      }
    });
  }
});
