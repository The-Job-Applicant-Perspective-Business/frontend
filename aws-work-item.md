**Title:** `[Infra/Migration] Repoint AWS Amplify App (d3i9qng4qdadgr) to New Next.js Repo & Preserve Staging Auth/DB`

**Labels:** `infrastructure`, `migration`, `aws-amplify`, `backend`, `high-priority`

**Assignee:** `@genovaise` (or lead developer)

**Milestone:** `v2.0 Platform Migration`

**Story Points / Estimate:** `5 pts`

---

### Summary / User Story

**As a** developer maintaining the platform,

**I want to** reconnect our existing AWS Amplify hosting environment (`d3i9qng4qdadgr`) to the new Next.js GitHub repository and pull down the live `staging` backend configuration,

**So that** the production URL routes to the new frontend without breaking existing user accounts, login persistence, or database records.

### Context & Infrastructure Metadata

The legacy configuration files (`team-provider-info.json`) point to an **Amplify Gen 1** CloudFormation stack in `ap-south-1`. Because custom domains are bound to the Amplify App ID and Cognito/DB resources are bound to the CloudFormation stack, **we must migrate in-place rather than creating a new Amplify app.**

- **AWS Account ID:** `339712895738`
- **AWS Region:** `ap-south-1` (Mumbai)
- **Amplify App ID:** `d3i9qng4qdadgr`
- **Target Backend Environment:** `staging`
- **CloudFormation Stack Name:** `amplify-tjapusertest-staging-a8ef2`
- **CloudFormation Stack ID:** `arn:aws:cloudformation:ap-south-1:339712895738:stack/amplify-tjapusertest-staging-a8ef2/0a684d50-6f71-11ef-b6d4-06a58a360d33`
- **Deployment S3 Bucket:** `amplify-tjapusertest-staging-a8ef2-deployment`
- **Auth Role ARN:** `arn:aws:iam::339712895738:role/amplify-tjapusertest-staging-a8ef2-authRole`
- **Unauth Role ARN:** `arn:aws:iam::339712895738:role/amplify-tjapusertest-staging-a8ef2-unauthRole`

---

### Tasks & Implementation Checklist

- [ ] **Phase 1: Pre-Migration Audit (AWS Console `ap-south-1`)**
- [ ] Confirm CloudFormation stack `amplify-tjapusertest-staging-a8ef2` is `CREATE_COMPLETE` / `UPDATE_COMPLETE` and record `Outputs` (Cognito `UserPoolId`, `AppClientID`, and AppSync/API Gateway endpoints).
- [ ] Inspect the existing user pool / database (Cognito / DynamoDB or external DB) to verify where persistent account records live.
- [ ] Export all key-value pairs from **Amplify Console > Hosting > Environment variables**.
- [ ] Copy existing build pipeline rules from **Amplify Console > Hosting > Build settings** (`amplify.yml`).

- [ ] **Phase 2: Backend Config Pull & Local Integration**
- [ ] Run `amplify pull --appId d3i9qng4qdadgr --envName staging` in the root of the new Next.js repository to generate fresh `amplify/` metadata and `aws-exports.js` / `amplifyconfiguration.json`.
- [ ] Configure `Amplify.configure(...)` in the Next.js entry point (`_app.tsx` or client root layout) using the pulled config.
- [ ] Migrate any custom middleware or Next.js `/api/*` routes handling account creation/session persistence from the legacy repo.
- [ ] Verify locally (`npm run dev`) that an existing production user can log in and maintain a persistent session across page reloads.

- [ ] **Phase 3: Cutover & CI/CD Reconnection**
- [ ] Re-populate all required environment variables in **Amplify Console > Hosting > Environment variables**.
- [ ] Generate a temporary classic GitHub PAT (`repo`, `admin:repo_hook`) and repoint the app via AWS CLI:

```bash
aws amplify update-app \
  --region ap-south-1 \
  --app-id d3i9qng4qdadgr \
  --repository https://github.com/<ORG_OR_USER>/<NEW_REPO> \
  --access-token <GITHUB_PAT>

```

- [ ] Link the target branch (e.g., `main`) to the `staging` backend environment in the Amplify Console and revoke the temporary GitHub PAT.

---

### Acceptance Criteria (Definition of Done)

1. Pushing a commit to the new GitHub repository automatically triggers a build and deployment under Amplify App ID `d3i9qng4qdadgr`.
2. The existing live URL serves the new Next.js frontend with zero DNS downtime.
3. New user registration writes to the existing backend/database and persists across logout and fresh browser sessions.
4. Legacy test accounts created prior to migration can authenticate and retrieve their existing data on the new frontend.
5. No orphaned Amplify apps or duplicate CloudFormation stacks are created in `ap-south-1`.

### Risks & Rollback Plan

- **Risk:** `team-provider-info.json` values in hand may be stale if manual console changes occurred previously. _Mitigation:_ Rely strictly on `amplify pull` rather than pasting the old JSON blocks.
- **Rollback:** If the new build fails or breaks auth/middleware, run `aws amplify update-app` pointing back to the original GitHub repository URL and trigger a redeploy of the last known good commit.
