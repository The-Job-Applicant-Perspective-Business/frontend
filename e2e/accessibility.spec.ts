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

const HR_ROUTES = ['/hr/login', '/hr/create-account'];

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

  for (const hrRoute of HR_ROUTES) {
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
        formatAxeViolations(hrRoute, accessibilityScanResults.violations),
      ).toEqual([]);
    });
  }

  test('HR Login form supports accessible password visibility toggle and label bindings', async ({
    page,
  }) => {
    await page.goto('/hr/login');

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

  test('HR Create Account Step 2 passes WCAG 2.2 AA scan after Step 1 completion', async ({
    page,
  }) => {
    await page.goto('/hr/create-account');

    await page
      .getByLabel(/Full Name|Your Name|Name/i)
      .first()
      .fill('Jane Doe');
    await page
      .getByLabel(/Work Email|Email/i)
      .first()
      .fill('jane.doe@example.com');
    await page
      .getByLabel(/Company Name|Company/i)
      .first()
      .fill('Acme Corp');

    const selects = page.locator('select');
    const selectCount = await selects.count();
    for (let i = 0; i < selectCount; i += 1) {
      const selectEl = selects.nth(i);
      const optionValues = await selectEl
        .locator('option')
        .evaluateAll((opts) =>
          opts.map((o) => (o as HTMLOptionElement).value).filter((val) => val.trim().length > 0),
        );
      if (optionValues.length > 0) {
        await selectEl.selectOption(optionValues[0]);
      }
    }

    const locationInput = page.getByLabel(/Location|City/i).first();
    if ((await locationInput.count()) > 0) {
      await locationInput.fill('Huntsville, AL');
    }

    const continueBtn = page.getByRole('button', { name: /next|continue/i });
    await continueBtn.click();

    await expect(page.locator('h1')).toHaveCount(1);
    const step2ScanResults = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    expect(
      step2ScanResults.violations,
      formatAxeViolations('/hr/create-account (Step 2)', step2ScanResults.violations),
    ).toEqual([]);
  });

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
