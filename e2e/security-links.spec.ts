import { test, expect } from '@playwright/test';

test('verify all target="_blank" anchors enforce rel="noopener noreferrer"', async ({ page }) => {
  await page.goto('/');

  const externalLinks = page.locator('a[target="_blank"]');
  const count = await externalLinks.count();

  for (let i = 0; i < count; i++) {
    const link = externalLinks.nth(i);
    const rel = await link.getAttribute('rel');

    expect(rel, `Link ${await link.getAttribute('href')} missing security rel`).toBeTruthy();
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
  }
});
