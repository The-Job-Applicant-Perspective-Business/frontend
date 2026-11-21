# Recompiled Trajectory & Mode Lock

- **Priority Shift:** Paused `hr.thejobapplicantperspective.com` workspace drawers and `/job-applications` (Task 1.13).
- **New Critical Path:**

1. **AWS Infrastructure & Data Pull Verification:** Verify AWS Amplify Gen 1 (`d3i9qng4qdadgr`, stack `amplify-tjapusertest-staging-a8ef2` in `ap-south-1`) connectivity, authentication, and data-pull integration against the rebuilt Next.js 16 application.

2. **Admin Portal Buildout:** Architect and implement the Admin portal surface (consuming live AWS/API data).
3. **Global Styling & Typography Reconciliation:** Apply `Jost` (headings) and `Manrope` (body/subtitles) via `next/font` and Tailwind CSS v4 `@theme` tokens across the candidate, admin, and active routes.

4. **Production Cutover:** Execute pre-launch verification gates (`npm run test:gate`, `npm run build:offline`) and repoint the AWS Amplify deployment pipeline to go live.

- **Mode Lock:** `/saiph` (Sovereign CTO — zero-hallucination code audits, WCAG 2.2 AA compliance, text-only no-tables formatting, and Single-Slice Execution Lock).

---

### Work Item 3 (Recompiled): AWS Staging Connectivity, Data-Pull Integration & Admin Portal Pivot

**Title:** `feat(aws-admin): Verify AWS Amplify (d3i9qng4qdadgr) Data Connectivity, Build Admin Portal & Apply Brand Styles for Launch`

- **Labels:** `aws-amplify`, `admin-portal`, `api-integration`, `tailwind-v4`, `launch-blocker`, `high-priority`
- **Milestone:** `v2.0 Platform Migration`
- **Story Points:** `8`
- **Linked Issues:** Connects directly to `[Infra/Migration] Repoint AWS Amplify App (d3i9qng4qdadgr) to New Next.js Repo & Preserve Staging Auth/DB` and `feat(typography): Configure Jost (headings) and Manrope (body/subtitles) via next/font and Tailwind v4 @theme` (establishes the live AWS/API data bridge before cutover, builds the Admin management surface on top of verified data endpoints, and enforces brand typography prior to production launch).

#### User Story

As a platform administrator and technical lead, I need to verify that the rebuilt Next.js 16 application connects cleanly to the AWS Amplify staging backend (`d3i9qng4qdadgr`) and pulls live data, then build out the Admin portal and apply the canonical `Jost`/`Manrope` design system so the site can be safely deployed to production.

#### Technical Context & Gap Analysis

- **AWS Amplify Gen 1 Target (`ap-south-1`):** `AmplifyAppId: d3i9qng4qdadgr`, CloudFormation stack `amplify-tjapusertest-staging-a8ef2` (`arn:aws:cloudformation:ap-south-1:339712895738:stack/amplify-tjapusertest-staging-a8ef2/0a684d50-6f71-11ef-b6d4-06a58a360d33`), deployment bucket `amplify-tjapusertest-staging-a8ef2-deployment`.

- **Verified Backend API Surface (`[https://api.thejobapplicantperspective.com/api/v1](https://api.thejobapplicantperspective.com/api/v1)`):** Authentication (`/auth/login`, `/auth/me`, `/auth/logout`), jobs (`/jobs`, `/jobs/:jobId`), job applications (`/job-applications`), users (`/users/:id`), notifications (`/notifications`), and location search (`/location/search`).

- **Gap Analysis (Unverified Admin Surface):** While HR subdomain endpoints (`hr.thejobapplicantperspective.com`) are verified in `context.xml`, Admin-specific subdomain/route paths (e.g., `admin.thejobapplicantperspective.com` vs. `/admin`), Admin role JWT claims (`role: "admin"`), and Admin-only moderation/approval endpoints are not yet documented in `context.xml` or `captains_log.json`. Speculative Admin API calls are blocked until Admin DOM/chunk captures or AWS CloudFormation outputs are inspected.

#### Implementation Checklist

- **Slice 1 — AWS Amplify & Data-Pull Handshake (`d3i9qng4qdadgr`):**
- Pull live staging backend configuration (`amplify pull --appId d3i9qng4qdadgr --envName staging` in `ap-south-1`) to generate current `aws-exports.js` / `amplifyconfiguration.json` without relying on stale JSON snapshots.

- Inspect CloudFormation Outputs and AWS environment variables to confirm how Cognito (`amplify-tjapusertest-staging-a8ef2-authRole`), the staging datastore, and `[https://api.thejobapplicantperspective.com/api/v1](https://api.thejobapplicantperspective.com/api/v1)` connect.

- Wire a verified data-pull smoke check (fetching live jobs/users/session state) in the Next.js 16 app to prove end-to-end read/auth parity prior to building UI on top of it.

- **Slice 2 — Admin Portal Reconnaissance & Buildout (HR Paused):**
- Capture/audit the legacy Admin portal DOM, routing structure, and role-gated API endpoints (matching the Component Extraction Protocol used on HR).

- Implement Admin route isolation (preventing Storyblok `[[...slug]]` collisions and blocking unauthenticated access) and build the core Admin views using React 19, TypeScript, Zod DTO validation, and WCAG 2.2 AA semantics.

- **Slice 3 — Global Brand Styling & Typography Reconciliation:**
- Integrate `Jost` (headings) and `Manrope` (body/subtitles) via `next/font/google` and Tailwind CSS v4 `@theme` tokens (`--font-heading`, `--font-sans`) across the root layout, candidate pages, and new Admin views.

- Audit and reconcile color tokens (including fixing legacy malformed hex codes like `#733aab0` and enforcing `#0d3276` / `#434343` / `#595959` WCAG 2.2 AA contrast).

- **Slice 4 — Pre-Launch Gate & AWS Amplify Go-Live:**
- Run `npm run verify`, `npm run test:smoke`, `npm run test:responsive`, `npm run test:a11y`, `npm run test:security`, and `npm run build:offline`.

- Execute `aws amplify update-app` in `ap-south-1` to repoint `d3i9qng4qdadgr` to the new Next.js repository and verify live staging/production smoke tests.

#### Acceptance Criteria (Definition of Done)

1. Live data pull and authentication round-trip succeed against AWS Amplify staging (`d3i9qng4qdadgr`) and the verified backend API with zero credential or CORS/domain errors.

2. Admin portal routes render isolated from Storyblok catch-all routes, enforce role-based access, and pass `@axe-core/playwright` WCAG 2.2 AA scans.

3. `Jost` and `Manrope` typography and canonical brand colors render with zero layout shift (CLS) across all live candidate and Admin routes.

4. Full CI/CD verification gate passes and the site is live on the repointed AWS Amplify pipeline.

---

### Informational Discharge

#### System Audit

Updated active project trajectory to deprioritize HR subdomain drawers (`Task 1.13` paused) and establish a sequential 4-slice launch pipeline: AWS Amplify `d3i9qng4qdadgr` data verification, Admin portal buildout, global Tailwind v4 styling reconciliation, and production cutover.

#### The Anchor

Because auditing the AWS Amplify Gen 1 stack (`d3i9qng4qdadgr` in `ap-south-1`) alongside the `Jost`/`Manrope` typography issue revealed that live data connectivity must be proven before building the Admin UI...

#### The Pivot

...the next logical field to explore is executing Slice 1 (inspecting the AWS Amplify CloudFormation outputs / `amplify pull` config) or ingesting the legacy Admin portal DOM/routes to close the Admin API gap.

#### No Soldier Left Behind

Do you have the AWS CloudFormation outputs / environment variables for `d3i9qng4qdadgr` ready to audit for Slice 1, or do you want to drop the legacy Admin portal HTML/bundle chunks first so we can map its endpoints?
