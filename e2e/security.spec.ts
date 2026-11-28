import { expect, test } from '@playwright/test';

const PUBLIC_ROUTES_WITH_EXTERNAL_LINKS = [
  '/',
  '/who-we-are',
  '/self-care-tools',
  '/us-govt-financial-support',
  '/career-fairs',
  '/ai-tools',
] as const;

test.describe('Tier 4 Zero-Trust Security & Portal Airlock Suite', () => {
  test('All external _blank anchors enforce rel="noopener noreferrer" and safe URL schemes', async ({
    page,
  }) => {
    const violations: string[] = [];

    for (const route of PUBLIC_ROUTES_WITH_EXTERNAL_LINKS) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `Expected HTTP 200 on ${route}`).toBe(200);

      const routeViolations = await page.evaluate((currentRoute) => {
        const anchors = Array.from(
          document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'),
        );
        const issues: string[] = [];

        for (const anchor of anchors) {
          const href = (anchor.getAttribute('href') ?? '').trim();
          const relTokens = (anchor.getAttribute('rel') ?? '')
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

          if (/^(javascript|data|vbscript):/i.test(href)) {
            issues.push(`${currentRoute}: dangerous href "${href}"`);
          }

          if (!relTokens.includes('noopener') || !relTokens.includes('noreferrer')) {
            issues.push(
              `${currentRoute}: anchor "${href}" missing noopener/noreferrer (rel="${anchor.getAttribute('rel') ?? ''}")`,
            );
          }
        }

        return issues;
      }, route);

      violations.push(...routeViolations);
    }

    expect(violations).toEqual([]);
  });

  test('Query parameter reflection blocks XSS script injection on search and filter routes', async ({
    page,
  }) => {
    const xssRoutes = [
      '/?tab=%22%3E%3Cscript%3Ewindow.__tjapXss%3D1%3C%2Fscript%3E&jobId=%27%20onfocus%3D%27window.__tjapXss%3D2',
      '/job-insights?category=%3Cimg%20src%3Dx%20onerror%3Dwindow.__tjapXss%3D3%3E&page=1',
    ] as const;

    for (const maliciousUrl of xssRoutes) {
      const response = await page.goto(maliciousUrl, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      const xssExecuted = await page.evaluate(() => {
        return Boolean((window as unknown as { __tjapXss?: unknown }).__tjapXss);
      });
      expect(xssExecuted).toBe(false);

      const injectedElementsCount = await page.locator('img[src="x"][onerror]').count();
      expect(injectedElementsCount).toBe(0);
    }
  });

  test('Subdomain proxy blocks direct apex /hr and /admin paths while serving isolated portals with noindex', async ({
    page,
    request,
  }) => {
    const blockedApexPaths = ['/hr', '/HR/login', '/admin', '/ADMIN/classified'] as const;

    for (const blockedPath of blockedApexPaths) {
      const res = await request.get(`http://localhost:3000${blockedPath}`);
      expect(res.status(), `Apex path ${blockedPath} must return 404`).toBe(404);
    }

    const hrResponse = await page.goto('http://hr.localhost:3000/login', {
      waitUntil: 'domcontentloaded',
    });
    expect(hrResponse?.status()).toBe(200);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);

    const adminResponse = await page.goto('http://admin.localhost:3000/login', {
      waitUntil: 'domcontentloaded',
    });
    expect(adminResponse?.status()).toBe(200);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
  });

  test('Excluded draft Storyblok slugs return HTTP 404', async ({ request }) => {
    const excludedDraftSlugs = ['/michael-smith-who-', '/blog/deloitte-manpower'] as const;

    for (const slugPath of excludedDraftSlugs) {
      const res = await request.get(`http://localhost:3000${slugPath}`);
      expect(res.status(), `Excluded draft slug ${slugPath} must return 404`).toBe(404);
    }
  });
});
