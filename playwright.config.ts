import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Feral Agent Quarantine Zone: Force AI-generated tests into an isolated directory
  testDir: './qa-agent/@quarantine',

  // O-Ring Rule: Ensure systemic integrity by forcing isolated execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Sentinel Catch: Requires JSON for the LLM ingestion buffer, HTML for human review
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'qa-agent/docs/sentinel-catch-report.json' }],
  ],

  use: {
    // Adjusted for Next.js 15 / RSC default port mapping
    baseURL: 'http://localhost:3000',

    // Critical for deterministic auditing and negative-space debugging
    trace: 'retain-on-failure',
    colorScheme: 'dark',

    // Screenshots are retained strictly to feed the multimodal base64 error buffer
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
