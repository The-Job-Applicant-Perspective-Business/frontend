import { test, expect } from '@playwright/test';

interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  navigationMode: 'drawer' | 'desktop';
}

const VIEWPORTS: ViewportConfig[] = [
  { name: 'Mobile (375px)', width: 375, height: 667, navigationMode: 'drawer' },
  { name: 'Tablet (768px)', width: 768, height: 1024, navigationMode: 'drawer' },
  { name: 'Desktop (1280px)', width: 1280, height: 800, navigationMode: 'desktop' },
];

const TARGET_ROUTES = ['/', '/who-we-are', '/job-insights', '/ai-tools'];

test.describe('Responsive Breakpoint & Layout Integrity Matrix', () => {
  for (const vp of VIEWPORTS) {
    test.describe(`Viewport: ${vp.name}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
      });

      for (const route of TARGET_ROUTES) {
        test(`Verify layout integrity and zero horizontal overflow on "${route}"`, async ({
          page,
        }) => {
          await page.goto(route, { waitUntil: 'domcontentloaded' });

          // 1. Horizontal Overflow Gate: No horizontal leakage
          const hasHorizontalOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
          });
          expect(hasHorizontalOverflow).toBe(false);

          // 2. Navigation State Adaptation
          const desktopNav = page.getByRole('navigation', {
            name: 'Main Desktop Navigation',
          });
          const menuButton = page.getByRole('button', {
            name: /Open Navigation|Toggle Navigation|Menu/i,
          });

          if (vp.navigationMode === 'drawer') {
            await expect(desktopNav).toBeHidden();
            await expect(menuButton).toBeVisible();
          } else {
            await expect(desktopNav).toBeVisible();
            await expect(menuButton).toBeHidden();
          }
        });
      }

      if (vp.navigationMode === 'drawer') {
        test('Verify navigation drawer open, link traversal, and close states', async ({
          page,
        }) => {
          await page.goto('/');

          const menuButton = page.getByRole('button', {
            name: /Open Navigation|Toggle Navigation|Menu/i,
          });
          await expect(menuButton).toBeVisible();
          await menuButton.click();

          const drawer = page.locator('#mobile-navigation-menu');
          await expect(drawer).toBeVisible();

          await expect(drawer.getByRole('link', { name: /About Us|Who We Are/i })).toBeVisible();
          await expect(drawer.getByRole('link', { name: /Job Insights|Blog/i })).toBeVisible();

          const closeButton = page.getByRole('button', {
            name: /Close Navigation|Close Menu/i,
          });
          if (await closeButton.isVisible()) {
            await closeButton.click();
            await expect(drawer).toBeHidden();
          }
        });
      }
    });
  }
});
