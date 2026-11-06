import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'Mobile (375px)', width: 375, height: 667, isMobile: true },
  { name: 'Tablet (768px)', width: 768, height: 1024, isMobile: false },
  { name: 'Desktop (1280px)', width: 1280, height: 800, isMobile: false },
];

test.describe('Responsive Breakpoint & Layout Integrity Matrix', () => {
  for (const vp of VIEWPORTS) {
    test(`Verify layout stability on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Assert no horizontal body overflow / scroll leakage
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);

      if (vp.isMobile) {
        // Assert mobile drawer button is visible and desktop nav is hidden
        const menuButton = page.getByRole('button', { name: /Open Navigation|Close Navigation/i });
        await expect(menuButton).toBeVisible();
        await expect(
          page.getByRole('navigation', { name: 'Main Desktop Navigation' }),
        ).toBeHidden();

        // Open mobile navigation drawer
        await menuButton.click();
        const drawer = page.locator('#mobile-navigation-menu');
        await expect(drawer).toBeVisible();

        // Assert links exist inside mobile drawer
        await expect(drawer.getByRole('link', { name: 'About Us' })).toBeVisible();
        await expect(drawer.getByRole('link', { name: 'Job Insights' })).toBeVisible();
      } else {
        // Assert desktop navigation is visible and mobile hamburger is hidden
        await expect(
          page.getByRole('navigation', { name: 'Main Desktop Navigation' }),
        ).toBeVisible();
        await expect(page.getByRole('button', { name: /Open Navigation/i })).toBeHidden();
      }
    });
  }
});
