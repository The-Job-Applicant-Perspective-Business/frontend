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

const HR_SUBDOMAIN_ROUTES = ['/login', '/create-account', '/verify'];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'section508'];

const formatAxeViolations = (
  route: string,
  violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'],
): string => {
  if (violations.length === 0) return '';
  const summary = violations
    .map((v) => {
      const targets = v.nodes.map((n) => n.target.join(' ')).join(', ');
      return `[${v.impact?.toUpperCase() ?? 'UNKNOWN'}] ${v.id}: ${v.help} -> ${targets}`;
    })
    .join('\n');
  return `Accessibility violations detected on "${route}":\n${summary}`;
};

test.describe('WCAG 2.2 AA & Section 508 Accessibility Smoke Suite', () => {
  for (const route of CANONICAL_ROUTES) {
    test(`Route "${route}" passes WCAG 2.2 AA, Section 508, and landmark invariants`, async ({
      page,
    }) => {
      await page.goto(route);

      const mainLandmark = page.locator('main');
      await expect(mainLandmark).toHaveCount(1);
      await expect(mainLandmark).toBeVisible();

      // Enforce single top-level heading hierarchy and zero dead '#' anchors
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('a[href="#"]')).toHaveCount(0);

      const accessibilityScanResults = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

      expect(
        accessibilityScanResults.violations,
        formatAxeViolations(route, accessibilityScanResults.violations),
      ).toEqual([]);
    });
  }

  test('Dynamic blog article route (/job-insights/[slug]) passes accessibility scan', async ({
    page,
  }) => {
    await page.goto('/job-insights');

    const firstArticleLink = page.locator('main a[href^="/job-insights/"]').first();
    const articleCount = await firstArticleLink.count();
    test.skip(articleCount === 0, 'No blog article links rendered in offline fixture');

    const targetHref = await firstArticleLink.getAttribute('href');
    await firstArticleLink.click();

    await expect(page).toHaveURL(/\/job-insights\/.+/);
    const mainLandmark = page.locator('main');
    await expect(mainLandmark).toHaveCount(1);
    await expect(mainLandmark).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);

    const scanResults = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    expect(
      scanResults.violations,
      formatAxeViolations(targetHref ?? '/job-insights/[slug]', scanResults.violations),
    ).toEqual([]);
  });

  test('MainNav Job App Tools dropdown supports keyboard navigation and Escape dismissal', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const toolsTrigger = page.getByRole('button', { name: /Job App Tools/i });
    await expect(toolsTrigger).toBeVisible();

    await toolsTrigger.focus();
    await page.keyboard.press('Enter');
    await expect(toolsTrigger).toHaveAttribute('aria-expanded', 'true');

    const careerFairsLink = page.getByRole('link', { name: /Career Fairs/i }).first();
    await expect(careerFairsLink).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toolsTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('MainFooter contact form enforces WCAG 2.2 AA label, contrast, and focus criteria', async ({
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

    await submitBtn.focus();
    await expect(submitBtn).toBeFocused();
  });
});

test.describe('HR Subdomain Accessibility Suite (hr.localhost:3000)', () => {
  test.use({ baseURL: 'http://hr.localhost:3000' });

  for (const hrRoute of HR_SUBDOMAIN_ROUTES) {
    test(`HR Subdomain route "${hrRoute}" passes WCAG 2.2 AA, Section 508, and landmark invariants`, async ({
      page,
    }) => {
      await page.goto(hrRoute);

      const mainLandmark = page.locator('main');
      await expect(mainLandmark).toHaveCount(1);
      await expect(mainLandmark).toBeVisible();

      // Enforce single top-level heading hierarchy and zero dead '#' anchors
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('a[href="#"]')).toHaveCount(0);

      const accessibilityScanResults = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

      expect(
        accessibilityScanResults.violations,
        formatAxeViolations(`hr.localhost:3000${hrRoute}`, accessibilityScanResults.violations),
      ).toEqual([]);
    });
  }

  test('HR Login form supports accessible password visibility toggle and label bindings', async ({
    page,
  }) => {
    await page.goto('/login');

    const emailInput = page.getByLabel(/Email/i);
    const passwordInput = page.getByLabel(/^Password/i);
    const toggleBtn = page.getByRole('button', { name: /show password|hide password/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await toggleBtn.focus();
    await page.keyboard.press('Enter');
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await page.keyboard.press('Enter');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('HR Create Account Steps 2 and 3 pass WCAG 2.2 AA scan', async ({ page }) => {
    await page.route('**/api/v1/auth/check-exist', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            exist: false,
          },
        }),
      });
    });

    await page.route('**/api/v1/auth/signup', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Registration success',
          data: {
            token: 'mock-hr-jwt-token',
            user: {
              _id: 'mock-hr-id',
              email: 'jane.doe@example.com',
              role: 'hr',
              name: 'Jane Doe',
              companyName: 'Acme Corp',
            },
          },
        }),
      });
    });

    await page.route('**/api/v1/users/mock-hr-id', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'User updated successfully',
        }),
      });
    });

    await page.goto('/create-account');

    await page.getByLabel(/Full Name/i).fill('Jane Doe');
    await page.getByLabel(/^Email/i).fill('jane.doe@example.com');
    await page.getByLabel(/Company Name/i).fill('Acme Corp');
    await page.getByLabel(/Industry/i).selectOption({ index: 1 });
    await page.getByLabel(/No of employees/i).selectOption({ index: 1 });
    await page.getByLabel(/Location/i).fill('Huntsville, AL');

    await page.getByRole('button', { name: /^Next$/i }).click();

    await expect(
      page.getByRole('heading', { level: 1, name: /Secure your account/i }),
    ).toBeVisible();
    const step2Scan = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(
      step2Scan.violations,
      formatAxeViolations('hr.localhost:3000/create-account (Step 2)', step2Scan.violations),
    ).toEqual([]);

    await page.getByLabel(/^New password/i).fill('StrongPass123!');
    await page.getByLabel(/^Confirm password/i).fill('StrongPass123!');
    await page.getByRole('button', { name: /^Create account$/i }).click();

    await expect(
      page.getByRole('heading', { level: 1, name: /Add more details about your company/i }),
    ).toBeVisible();

    await page.getByLabel(/Social media platform 1/i).selectOption('linkedin');
    await page.getByLabel(/Paste URL/i).fill('https://www.linkedin.com/company/acme-corp');

    const step3Scan = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(
      step3Scan.violations,
      formatAxeViolations('hr.localhost:3000/create-account (Step 3)', step3Scan.violations),
    ).toEqual([]);
  });

  test('HR Verify form enforces accessible label bindings, alert feedback, and password reset dispatch', async ({
    page,
  }) => {
    let capturedPayload: unknown = null;

    await page.route('**/api/v1/auth/forgot-password', async (route) => {
      capturedPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Verification email sent',
        }),
      });
    });

    await page.goto('/verify');

    const emailInput = page.getByLabel(/^Email/i);
    const submitBtn = page.getByRole('button', { name: /^Send$/i });

    await expect(emailInput).toBeVisible();
    await submitBtn.click();

    const alertBanner = page.getByRole('alert');
    await expect(alertBanner).toBeVisible();

    await emailInput.fill('jane.doe@example.com');
    await submitBtn.click();

    await expect(page).toHaveURL(/\/login$/);
    expect(capturedPayload).toEqual({
      email: 'jane.doe@example.com',
      role: 'hr',
    });
  });
});
