import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Base directory for test discovery
  testDir: '.',

  // Match standard e2e suites as well as agent quarantine tests
  testMatch: ['e2e/**/*.spec.ts', 'qa-agent/@quarantine/**/*.spec.ts'],

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Dual-reporting: HTML for human review, JSON for Sentinel Catch telemetry ingestion
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'qa-agent/docs/sentinel-catch-report.json' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    colorScheme: 'dark',

    // Negative space & diagnostic trace capture
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'default-e2e',
      testDir: './e2e',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'qa-quarantine',
      testDir: './qa-agent/@quarantine',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
