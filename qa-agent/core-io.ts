import { GenerativeModel } from '@google/generative-ai';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Phase 2: Deploy to the actual Quarantine suite
export const deployAgentCode = (aiGeneratedCode: string, testName: string): string => {
  const quarantineDir = path.join(__dirname, '@quarantine');
  if (!fs.existsSync(quarantineDir)) {
    fs.mkdirSync(quarantineDir, { recursive: true });
  }

  const testPath = path.join(quarantineDir, `${testName}.spec.ts`);
  let cleanCode = aiGeneratedCode;

  // Extract from markdown code fence if present
  const match = aiGeneratedCode.match(/```(?:typescript|ts)?\n([\s\S]*?)```/);
  if (match) {
    cleanCode = match[1];
  } else {
    cleanCode = aiGeneratedCode.replace(/```(?:typescript|ts)?|```/g, '');
  }

  // 🚀 THE INDUSTRIAL SOLDER: Comma-Immune & Async-Enforcing Edition
  // Fix 1: test.step('name') { -> test.step('name', async () => {
  cleanCode = cleanCode.replace(/(test\.step\([^)]+\))\s*\{/g, '$1, async () => {');
  // Fix 2: test.step('name', () => { -> test.step('name', async () => {
  cleanCode = cleanCode.replace(
    /(test\.step\([^,]+),\s*(?:\(\)|async\s*\(\))\s*=>\s*\{/g,
    '$1, async () => {',
  );

  fs.writeFileSync(testPath, cleanCode.trim());
  console.log(
    `[System Audit] 🚀 Agent test physically anchored with Brute Force Solder: ${testPath}`,
  );
  return testPath;
};

// Phase 3: Asynchronous Execution
export const executePlaywright = (
  testPath: string,
): { status: 'success' | 'failure'; log: string | null } => {
  console.log(`[IRQ] Executing deterministic verification on: ${testPath}...`);
  try {
    // Increased timeout to 30000ms for Next.js App Router compilation headroom
    execSync(`npx playwright test "${testPath}" --project=qa-quarantine --timeout=30000`, {
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    console.log('[Verification] 💎 Zero bugs detected. Archiving success.');
    return { status: 'success', log: null };
  } catch (error: unknown) {
    console.log('[Verification] ⚠️ Structural failure detected. Capturing the black box.');
    const execError = error as {
      stdout?: string | Buffer;
      stderr?: string | Buffer;
      message?: string;
    };
    const stdout = execError.stdout ? execError.stdout.toString() : '';
    const stderr = execError.stderr ? execError.stderr.toString() : '';
    const errorLog =
      `${stdout}\n${stderr}`.trim() || execError.message || 'Unknown execution error';
    return {
      status: 'failure',
      log: errorLog,
    };
  }
};

// Phase 4 & 5: Sentinel Catch & Report Generation
export const analyzeFailureAndReport = async (
  agent: GenerativeModel,
  failedTaskName: string,
  playwrightErrorLog: string,
  screenshotPath: string,
): Promise<void> => {
  console.log('[System Audit] 🚨 Executing Sentinel Catch via Multimodal Analysis...');
  const imageBuffer = fs.readFileSync(screenshotPath);
  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: 'image/png',
    },
  };

  const bugTemplate = `
# [ISSUE TITLE - COPY THIS TO GITHUB TITLE]
- **Area:** [Application Area / Component]
- **Priority:** [High / Medium / Low]
- **Environment:** <http://localhost:3000>
- **Step:** [e.g., Step 4 of 4 – Search Submission]
---
## Summary
[Briefly summarize the issue. What is happening and why is it a problem?]
---
## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]
---
## Actual Behavior
- [Describe the error/failure exactly as seen in the screenshot/logs]
- [Reference any error banners or console logs]
---
## Expected Behavior
- [Describe the target experience]
- [Identify the intended success state or routing]
---
## Impact
- [Describe how this blocks the Human OS or system flow]
- [Severity Classification]
---
## Acceptance Criteria
1. [Criteria 1]
2. [Criteria 2]
3. Verified on desktop and mobile.
---
## Notes
[Any additional technical constraints or "Negative Space" findings.]
`;

  const prompt = `
  You are a Principal QA Automation Architect. A Playwright UI test has failed.
  Error Log:
  ${playwrightErrorLog}
  Visual Evidence:
  Analyze the provided screenshot. Identify any overlays, loading states, or rendering glitches (Negative Space Debugging).
  Task:
  Generate a bug report strictly using the exact Markdown template provided below.
  Inject the visual findings into the "Summary" and "Problem" sections.
  Template:
  ${bugTemplate}
  `;

  let finalReport = '';
  try {
    const result = await agent.generateContent([prompt, imagePart]);
    finalReport = result.response.text();
  } catch (apiError: unknown) {
    const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
    console.error(`[System Error] Feral Agent API Connection Failed: ${errorMessage}`);
    finalReport = `# [API FAULT] Test Failed: ${failedTaskName}\n\n**System Audit:** The AI API dropped the connection, but Playwright still caught a structural failure.\n\n## Raw Black Box Log\n\`\`\`\n${playwrightErrorLog}\n\`\`\`\n`;
  }

  const reportsDir = path.join(__dirname, 'docs', 'bug-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, `${failedTaskName}-bug.md`);
  const physicalArtifacts = `\n\n**Evidence Files:**\n- **Screenshot:** <${screenshotPath}>\n- **Trace File:** <./test-results/> *(Check recent sub-folders for trace.zip)*\n`;
  fs.writeFileSync(reportPath, finalReport + physicalArtifacts);
  console.log(`[Verification] 📝 April-Approved Bug Report compiled at: ${reportPath}`);
};
