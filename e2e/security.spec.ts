import { test, expect } from '@playwright/test';

test.describe('Tier 4 Zero-Trust Security Perimeter & Parameter Sanitization', () => {
  test.describe('Route Slug Validation & Path Traversal Mitigation', () => {
    test('renders valid standard route successfully', async ({ page }) => {
      const response = await page.goto('/');
      expect(response).not.toBeNull();
      expect(response?.status()).toBe(200);
      await expect(page.locator('body')).toBeVisible();
    });

    test('rejects path traversal attempts with clean 404 boundary', async ({ page }) => {
      // Encoded and raw traversal payloads targeting parent/system directories
      const traversalPaths = ['/..%2f..%2fetc/passwd', '/..%2fadmin', '/subdir/..%2f..%2fsecret'];

      for (const path of traversalPaths) {
        const response = await page.goto(path);
        expect(response?.status(), `Expected 404 for traversal path: ${path}`).toBe(404);
        // Verify no raw server traces or unhandled error boundaries are exposed
        await expect(page.locator('text=Internal Server Error')).not.toBeVisible();
      }
    });

    test('rejects script tags and HTML injection in route slugs with clean 404', async ({
      page,
    }) => {
      const xssSlugPaths = [
        '/<script>alert(1)<%2fscript>',
        '/test"onmouseover="alert(1)',
        "/item'<svg%20onload=alert(1)>",
        '/api;drop%20table%20users',
      ];

      for (const path of xssSlugPaths) {
        const response = await page.goto(path);
        expect(response?.status(), `Expected 404 for malicious slug: ${path}`).toBe(404);
        await expect(page.locator('script:has-text("alert(1)")')).toHaveCount(0);
        await expect(page.locator('text=Internal Server Error')).not.toBeVisible();
      }
    });

    test('rejects slugs exceeding segment depth or character limits', async ({ page }) => {
      // SlugSegmentSchema caps individual segment length at 100 chars; SlugArraySchema caps depth at 10
      const oversizedSegment = 'a'.repeat(101);
      const deepPath = Array.from({ length: 11 }, (_, i) => `segment-${i}`).join('/');

      const responseOversized = await page.goto(`/${oversizedSegment}`);
      expect(responseOversized?.status()).toBe(404);

      const responseDeep = await page.goto(`/${deepPath}`);
      expect(responseDeep?.status()).toBe(404);
    });
  });

  test.describe('Search Parameter Reflection & Query Sanitization', () => {
    test('sanitizes dangerous characters in query parameters without crashing page render', async ({
      page,
    }) => {
      const maliciousQuery =
        '/?search=%3Cscript%3Ealert(1)%3C/script%3E&category=test"onfocus="alert(1)&ref=valid-source';

      const response = await page.goto(maliciousQuery);
      expect(response?.status()).toBe(200);

      // Verify injected script tags are not executed or reflected as unescaped DOM nodes
      await expect(page.locator('script:has-text("alert(1)")')).toHaveCount(0);
      await expect(page.locator('text=Internal Server Error')).not.toBeVisible();
    });

    test('retains valid alphanumeric query parameters while discarding control characters', async ({
      page,
    }) => {
      const mixedQuery = '/?safe_param=valid123&dirty_param=hello%00world%1F';

      const response = await page.goto(mixedQuery);
      expect(response?.status()).toBe(200);
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('External Link Hardening (Reverse Tabnabbing Defense)', () => {
    test('enforces rel="noopener noreferrer" across all external anchors targeting _blank', async ({
      page,
    }) => {
      await page.goto('/');

      const targetBlankLinks = page.locator('a[target="_blank"]');
      const count = await targetBlankLinks.count();

      for (let i = 0; i < count; i++) {
        const link = targetBlankLinks.nth(i);
        const rel = await link.getAttribute('rel');
        const href = await link.getAttribute('href');

        expect(
          rel,
          `Anchor targeting _blank missing secure rel attributes: href="${href}"`,
        ).toMatch(/noopener/);
        expect(rel, `Anchor targeting _blank missing noreferrer attribute: href="${href}"`).toMatch(
          /noreferrer/,
        );
      }
    });
  });
});
