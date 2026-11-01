# Storyblok Error Handler Integration: Implementation Record with WCAG 2.2 AA and Section 508 Review

**Project:** The Job Applicant Perspective (TJAP) technical remediation
**Scope of this document:** Integration of the shared Storyblok error handler into the dynamic catch-all route and the Storyblok initialization module, plus an accessibility and compliance analysis of that change.
**Accessibility frameworks considered:** WCAG 2.2 Level AA and Section 508 (Revised 508 Standards).
**Document status:** Implementation record. No build, type check, lint run, automated test, keyboard test, screen reader test, or conformance audit has been performed on this change.
**Revision:** Corrected edition. Section 2.5 records a correction to an earlier characterization made during review of this work.

---

## 1. Executive summary

A shared TypeScript utility, `storyblokErrorHandler.ts`, existed but was not called from anywhere in the application. This work integrated it into the dynamic route at `src/app/[[...slug]]/page.tsx` and added a small configuration check to `src/lib/storyblok.ts`.

The most important behavioral outcome is a change in how failures are distinguished. Before this change, every failure in the story fetch path, whether a missing page, a rejected payload, a network failure, a rejected credential, or a missing token, ended the same way: the fetcher returned `null` and the page rendered a 404. After this change, the route separates "this page does not exist" from "the content pipeline failed," logs each with a distinct category through one logging boundary, and only renders a 404 for the cases that genuinely mean a missing or unusable page.

This document does not claim WCAG 2.2 AA conformance or Section 508 conformance. A server-side error classification and logging change cannot establish conformance by itself. Its accessibility value is indirect and depends on the user-facing error experience, which has not yet been built or tested. Section 7 and Section 8 explain, criterion by criterion, what this change touches, what it does not, and what still has to be verified.

---

## 2. Provenance and attribution

### 2.1 Origin of the handler file

The file `storyblokErrorHandler.ts` was created in an earlier session with ChatGPT. That session also produced the accompanying report, `storyblok-error-handler-wcag-508-report.md`, which described the handler, its error categories, its structured report shape, and a list of work that was explicitly not completed.

The integration described in this document was performed in a separate session with Claude, using the following supplied inputs: the earlier ChatGPT-session report, the project context file `context.xml`, the existing dynamic route `page.tsx`, and the existing `storyblok.ts`.

### 2.2 What Claude had and did not have

Claude did not have the source of `storyblokErrorHandler.ts` itself. It had only the earlier report's description of it. The call signatures used in the integration are therefore inferred from that report and have not been checked against the actual file. This is the single largest uncertainty in the change and is listed again in Section 11.

### 2.3 The HTTP status question

A point of discussion after the integration was whether the original handler or its author handled HTTP status. The record shows the following, and this document states it as precisely as the evidence allows:

- The earlier report states that the handler's context object can carry an optional HTTP status code.
- The earlier report states that `handleStoryblokError()` attempts to obtain an HTTP status from common error fields on the thrown value.
- The earlier report also states that this inference is deliberately basic and must be verified against how the installed Storyblok SDK actually represents failed requests.

So the original design did account for status. What the integration adds is an explicit status extraction at the route, performed by a small local helper, with two uses. The status is placed into the context object that is passed to the handler, so it appears in logs without depending on the handler's own inference. The status is also used to force the `NOT_FOUND` category when it equals 404, so the single most important routing decision does not depend on unverified inference.

Whether the original handler's own status extraction would have worked against the real SDK error shape is unknown and unverified. The explicit extraction is a defensive measure, not a correction of a demonstrated defect.

### 2.4 About the number of arguments

During review it was observed that the handler call in the route passes three arguments where the handler was understood to accept one or two. The third argument in the integration is an options object, used to supply an explicit category (and potentially severity, retryable, or the log suppression flag described in the earlier report). Status is not the third argument; it is carried inside the second argument, the context object. Whether the real function accepts a third options parameter in exactly this shape is unverified, and the TypeScript compiler will report a mismatch if the assumption is wrong.

### 2.5 Correction of the record

During review of this work, two characterizations were made that the evidence does not support. They are corrected here so that this document is the authoritative record.

**Incorrect characterization one:** that the original ChatGPT-session handler or its report overlooked HTTP status handling.

**Correction:** The original report documents that the handler's context object includes an optional HTTP status code, and that the handler attempts to read a status from common error fields. The original design therefore did account for status. The integration in this document adds an explicit status extraction at the route as a defensive measure, because the handler's own inference was described as basic and unverified against the real Storyblok SDK. It is an addition, not the correction of a demonstrated omission. Whether the handler's own extraction works against the real SDK error shape remains unverified.

**Incorrect characterization two:** that the additional third argument in the handler call is the status.

**Correction:** The third argument is an options object, assumed to accept an explicit category. Status is passed inside the second argument, the context object. The shape of the third argument is an assumption made without access to the handler's source, and it is unverified until the project type check is run against the real file.

Neither correction changes the code. Both change how the code and its origin should be described.

---

## 3. Inputs and constraints applied

The integration followed the directives in `context.xml`:

- Zero-trust context: only the supplied files were treated as ground truth, and the unseen handler source was flagged as an assumption rather than guessed silently.
- Syntax mandate: all new code uses ES6 arrow functions. The `function` keyword is not used.
- Architectural isolation: no files were added to or moved between `components/ui`, `components/blocks`, `components/layout`, or `components/storyblok`. The changes are confined to the route file and `src/lib/storyblok.ts`.
- Headless contract: Storyblok remains a data provider only. No markup, styling, or iframe behavior was introduced.
- Existing behaviors preserved: React `cache()` deduplication, `draftMode()` support, the early fast-fail for system paths, the Zod-backed `safeSanitizeStoryPayload` boundary, and the absence of a nested main landmark.
- Scope lock: nothing in this change touches Phase 2 (Mobile/PWA) or ongoing maintenance, both of which are out of scope.

---

## 4. Files changed

### 4.1 `src/app/[[...slug]]/page.tsx`

**New imports.** The route now imports `handleStoryblokError` and the `StoryblokErrorReport` type from the handler module, and `getStoryblokConfigIssue` from `@/lib/storyblok`.

**New result type.** A discriminated union, `StoryFetchResult`, replaces the previous `ISbStoryData | null` return value. The success arm carries the story. The failure arm carries a report, which is `null` for expected misses that should not be logged, such as browser requests for `favicon.ico` or `.well-known` paths.

**Hoisted constant.** The list of system slug prefixes moved out of the cached function to module scope so it is not rebuilt on every call. Its contents are unchanged.

**Status helper.** A small function, `extractStatus`, reads a numeric `status` from an unknown thrown value without trusting its shape. It returns `undefined` when no numeric status is present.

**Fetcher behavior.** `fetchDynamicStory` now proceeds as follows:

1. If the slug matches a system prefix, it returns a failure with a `null` report and logs nothing.
2. It builds a context object containing the operation name and the slug.
3. It calls the configuration check. If a problem is returned, it reports a `CONFIG` failure through the handler and returns without calling the CMS.
4. It initializes the client and requests the story, preserving the draft and published version logic and the draft cache-version parameter.
5. It passes the response to `safeSanitizeStoryPayload`. If validation fails, it reports a `VALIDATION` failure through the handler and returns a failure.
6. If the request throws, it extracts a status, adds it to the context, and reports the error through the handler. When the status is 404 it supplies an explicit `NOT_FOUND` category. Otherwise the handler's own inference decides.

**Metadata behavior.** `generateMetadata` no longer destructures a story directly. It inspects the result and falls back to the site default title and description whenever the fetch failed or the story has no content. It never throws, so a CMS failure cannot break metadata generation.

**Page behavior.** The page component inspects the result:

- A `null` report, a `NOT_FOUND` category, or a `VALIDATION` category calls `notFound()`. This preserves the earlier clean-404 handling of missing and corrupt content.
- Any other category (`CONFIG`, `API`, `INITIALIZATION`, `UNKNOWN`) throws an error whose message is the visitor-safe message from the report. The error is handled by the nearest Next.js error boundary.
- A successful result renders the story inside the same full-width flex container as before. No landmark was added or removed.

### 4.2 `src/lib/storyblok.ts`

A new exported function, `getStoryblokConfigIssue`, was added. It returns a diagnostic string when no access token is configured, naming the environment variables that were checked, and returns `null` otherwise. It never returns or logs a token value. It intentionally does not import the error handler, so this module stays free of handler coupling and the route remains the one place that reports.

The existing token fallback chain, the region default, the `storyblokInit` call, the component registry, and the `initStoryblok` export are unchanged.

---

## 5. Behavior before and after

**Missing story.** Before: logged as a generic warning, then a 404. After: classified as `NOT_FOUND` when the upstream status is 404, logged through the handler, then a 404.

**Rejected or malformed payload.** Before: logged as a generic warning, then a 404. After: classified as `VALIDATION`, logged through the handler, then a 404. The visitor-facing outcome is unchanged; the diagnostics are better.

**Network failure, timeout, rate limit, or upstream server error.** Before: logged as a generic warning, then a 404. This was a misclassification, because an outage looked like a missing page. After: classified by the handler, logged, and surfaced as an error to the error boundary rather than as a 404.

**Rejected or missing credential.** Before: a missing token produced a client initialized with an empty token, and the resulting failure appeared as a 404. After: a missing token is caught before any request, reported as `CONFIG`, and surfaced as an error. A present but rejected token depends on how the SDK reports the failure and on the handler's inference, which is unverified.

**System paths.** Before and after: silently return a 404 without querying the CMS.

**Metadata on failure.** Before: fell back to defaults when no story content existed. After: same, and also on any classified failure.

---

## 6. Security and privacy considerations

- Visitors never receive the full report. Only the safe message string from the report is used in the thrown error, and the `cause`, context, and diagnostic message never cross into rendered output.
- The framework behavior matters here: in production, Next.js replaces the message of errors thrown from server components with a generic message and a digest. The safe message therefore does not reliably reach the visitor. Any visitor-facing wording must come from the error boundary component itself.
- The configuration check names environment variable names but never values.
- The validation failure path includes the stringified validation error in the message passed to the handler. Zod messages generally describe paths and expectations rather than raw values, but this has not been verified for this schema. In production the handler is described as omitting detail fields and using the safe message in its log object.
- The report's `cause` field remains on the returned object in all environments. The route does not serialize it.
- A single logging boundary was chosen deliberately to avoid duplicate logs across the cached fetcher, the metadata function, and the page.
- The server token chain falls back to public `NEXT_PUBLIC_*` variables. This is existing behavior, was not changed, and is relevant to the pending credential governance task (task 1.8). A public token is not secret and a server credential must never be exposed to client code.
- The region silently defaults to `eu`. A wrong region would likely present as an API failure rather than a configuration failure, which could mislead diagnosis. This was noted and not changed.

---

## 7. WCAG 2.2 Level AA analysis

The governing principle: WCAG conformance is assessed on complete rendered pages and user flows. A route-level classification and logging change is not itself web content. The analysis below states, for each relevant success criterion, whether this change touches it, how, and what remains unverified.

### 7.1 Success Criterion 2.4.2 Page Titled (Level A)

Relevant and directly touched. Every page needs a title that describes its topic or purpose. The updated `generateMetadata` guarantees a non-empty default title when the story fetch fails, so a failed fetch cannot produce an untitled document. Not verified: that an error boundary page, once it exists, has an appropriate and distinct title, and that the title on a failure page is meaningful rather than identical to the home page. The default title is the site name, which is acceptable for a fallback but may be worth differentiating for error states.

### 7.2 Success Criterion 4.1.3 Status Messages (Level AA)

Relevant to any future inline or partial-content message. If the application later inserts a non-modal message such as a notice that part of a page is unavailable, it must be programmatically determinable by assistive technology without receiving focus. This change renders no such message, so it neither satisfies nor violates the criterion. When a full-page error boundary is used, the situation is a navigation to a new page state rather than a dynamic status message, and page title, heading, and reading order are the relevant checks instead. Live region roles should not be added indiscriminately. Not implemented and not tested.

### 7.3 Success Criterion 1.3.1 Info and Relationships (Level A)

Relevant to the future error boundary. Whatever component renders the failure state must convey structure through semantic HTML: a real heading, real paragraph text, and real controls, not just color or position. This change adds no UI. The thrown error depends entirely on the error boundary component for semantics. Not verified, because the boundary was not provided.

### 7.4 Success Criterion 1.4.1 Use of Color (Level A)

Relevant to the future error boundary. A failure state must not rely on color alone to convey that something went wrong. No UI was added in this change, so there is nothing to assess yet.

### 7.5 Success Criterion 1.4.3 Contrast (Minimum) (Level AA)

Relevant to the future error boundary. Error text must meet 4.5:1 for normal text and 3:1 for qualifying large text, and meaningful non-text indicators have their own contrast expectations under Success Criterion 1.4.11. The project has existing dark-mode high-contrast tokens from Tier 2 work, which a boundary should reuse. This change defines no visual style, so it neither establishes nor verifies contrast.

### 7.6 Success Criterion 2.1.1 Keyboard (Level A) and 4.1.2 Name, Role, Value (Level A)

Relevant only if the error boundary offers a retry, reload, or navigation control. Such controls must be keyboard operable, have accessible names, and perform a real action. The existing `Button` primitive in `components/ui` is the natural candidate, but this change does not use it. Not implemented and not tested.

### 7.7 Success Criterion 2.4.7 Focus Visible (Level AA) and 2.4.11 Focus Not Obscured (Minimum) (Level AA)

Relevant to controls and fixed banners in a future error experience. The project previously established dark-mode high-contrast focus rings. The new 2.2 criterion requires that a focused component not be entirely hidden by author-created content such as a sticky banner. This change adds no fixed or overlaid elements. Not tested.

### 7.8 Success Criterion 2.4.1 Bypass Blocks (Level A)

The context file records that the route's main landmark and skip-link focus support were established earlier. This change does not alter the container markup or the landmark structure, so it should not regress that behavior. Not re-tested after this change. An error boundary that replaces page content must also preserve or reproduce the skip link and landmark structure, or it risks introducing a regression on error pages only.

### 7.9 Success Criterion 3.2.3 Consistent Navigation (Level AA)

Relevant if an error boundary replaces the shared page shell. Because the root layout supplies the header and footer, a route-level boundary generally renders inside that layout and keeps navigation consistent. A global-level boundary replaces the entire document and would need to reproduce navigation in the same order. Which boundary will be used is undecided. Not verified.

### 7.10 Success Criteria 3.3.1 Error Identification and 3.3.3 Error Suggestion

Not applicable to this change. These criteria concern errors in user input. A CMS failure is not a user input error and must not be described as one. If the affected page later contains a form and a CMS failure interferes with it, the input error criteria must be assessed separately. Error text for outages should not imply the visitor made a mistake.

### 7.11 Success Criterion 2.4.6 Headings and Labels (Level AA) and 1.3.1 for error pages

A full-page error state needs a descriptive heading that states the problem in plain language, and any recovery control needs a descriptive label. This is a requirement on the future boundary component, not on this change.

### 7.12 No conformance claim

WCAG conformance requires all applicable Level A and Level AA criteria to be satisfied for a full page, including its alternates and any process it belongs to. No claim of WCAG 2.2 AA conformance is made for this work. The relevant user-facing behavior has not been built or tested, so there is no evidence on which to base such a claim.

---

## 8. Section 508 analysis

### 8.1 Applicability

The Revised 508 Standards apply to information and communication technology developed, procured, maintained, or used by United States federal agencies, and they are frequently referenced by contract. Whether Section 508 binds the TJAP application is a legal and contractual question, not a technical one, and is outside this document. This analysis assumes it is being used as a benchmark.

### 8.2 Which WCAG version applies

Section 508 incorporates WCAG 2.0 Level A and AA by reference for covered web content and software, through the electronic content and software provisions. WCAG 2.2 is a newer recommendation and is not the version named in the 508 text. The project's target of WCAG 2.2 AA is a stricter and newer benchmark, and is generally a superset of the 2.0 Level A and AA requirements, with one notable exception: the Parsing criterion, 4.1.1, present in 2.0 and marked obsolete in 2.2. Valid, well-formed markup should still be checked when a 508 assessment is performed. This document does not describe WCAG 2.2 as the version incorporated by Section 508.

### 8.3 What this change touches

This change is server-side classification and logging plus a routing decision. It has no direct effect on the functional performance criteria, such as use without vision, use with limited vision, and use without hearing, because those apply to the rendered product. Its indirect relevance is that it makes it possible to present an accurate failure state for genuine outages instead of a misleading 404, which supports understandable and consistent error experiences once the boundary is designed.

### 8.4 What a 508 review would still require

- Evaluating the rendered application and user flows, not the utility module.
- Testing relevant combinations of browsers and assistive technologies.
- Considering the broader standards beyond WCAG success criteria where applicable, including software interoperability with assistive technology and support documentation requirements.
- Basing any accessibility statement or conformance claim on test evidence. A conformance statement derived from the existence of a logging utility would be unsupported.

Official references for verification are the U.S. Access Board's Revised 508 Standards pages and Section508.gov's standards, exceptions, and examples page. Exact provision numbers and current text should be confirmed there rather than relied on from this document.

---

## 9. Receipts: what is verified and what is not

**Established by inspection of the supplied files:**

- The original route returned `null` for every failure path and rendered a 404 in every case.
- The original `storyblok.ts` initialized the client with an empty token when no token variable was set.
- The integration preserved `React.cache` deduplication, draft mode handling, system slug fast-fail, sanitizer usage, and the container markup.
- No component files were created or moved.

**Not established:**

- That the code compiles. No type check was run.
- That the handler's real signature matches the assumed call shape, including the optional third argument and the category string values.
- How the installed Storyblok SDK represents failed requests, including whether thrown values carry a numeric `status`.
- Whether the handler's own inference classifies non-404 failures correctly.
- Whether an error boundary exists in the project and whether it is accessible.
- Any runtime behavior, including log output in development and production.

---

## 10. Testing plan

### 10.1 Static checks

1. Run the project's verify script (lint plus strict type check) and resolve any signature mismatch with the handler.
2. Confirm the arrow-function syntax mandate and the directory boundaries are intact.

### 10.2 Functional and integration cases

1. Remove all token variables and confirm a `CONFIG` log and an error outcome, not a 404.
2. Supply an invalid token and observe how the SDK reports it and how the handler classifies it.
3. Request a slug that does not exist and confirm a `NOT_FOUND` log and a 404.
4. Request an unpublished story in published mode and confirm the expected outcome.
5. Simulate a network failure or timeout and confirm it is not reported as a missing page.
6. Simulate a rate limit or upstream server error and confirm the classification and the retryable hint.
7. Return a malformed payload and confirm a `VALIDATION` log and a 404.
8. Request `favicon.ico` and `.well-known` paths and confirm no log and a 404.
9. Load a valid story and confirm normal rendering and that metadata is populated.
10. Confirm that metadata generation does not throw in any failure case.
11. Confirm each failure produces exactly one log entry, not one per caller.
12. In a production build, confirm logs omit detail fields and that no token, raw response, or stack trace is visible in rendered output.

### 10.3 Accessibility tests, once an error boundary exists

1. Verify the page has a distinct, descriptive title on the error state.
2. Verify a descriptive heading and plain-language text that states the problem without relying on color or icon alone.
3. Verify reading order, landmark structure, and skip-link behavior on the error state.
4. Verify that any retry or navigation control is keyboard operable, has an accessible name, shows a visible focus indicator, and is not obscured by fixed content.
5. Verify text and indicator contrast in light and dark themes.
6. Verify shared navigation remains consistent between normal and error states.
7. Test with at least one screen reader and browser combination, and combine automated checks with manual review.

---

## 11. Open items and risks

1. **Handler signature unverified.** The call shape was inferred from a description. Paste or inspect the real file and align the calls.
2. **Behavior change needs sign-off.** Non-404 failures now surface as errors instead of 404s. This is more accurate but is a product decision. The previous always-404 behavior can be restored with a small change.
3. **Error boundary missing from supplied files.** Without an error boundary file, visitors receive the framework's generic production error page. A boundary with accessible semantics is required before any accessibility claim about failure states.
4. **SDK error shape unverified.** The explicit 404 mapping depends on thrown values carrying a numeric `status`.
5. **Token and region defaults.** The public-token fallback and the silent `eu` region default are existing behaviors that affect diagnosis and relate to the pending credential governance work.
6. **Remaining integration work** from the original report is still open: the provider and initialization path, the sanitizer hookup beyond the route, the recursive component registry check, any custom fallback component, and all automated tests.

---

## 12. Definition of done for the broader feature

- The handler is committed at its intended path and all signatures compile cleanly.
- The route, provider, sanitizer, component registry diagnostics, and rendering boundaries call it where appropriate.
- Actual SDK error shapes have been verified against the classification logic.
- Missing content, API failures, invalid configuration, invalid payloads, and unknown components are distinguishable in logs.
- Visitor-facing messages remain safe, and no raw error objects or sensitive context reach client-visible output.
- Unit and integration tests cover the important failure paths.
- Any user-facing fallback uses semantic HTML and appropriate announcement behavior.
- Keyboard, focus, contrast, and screen reader checks are completed for the affected UI.
- Full pages and flows are evaluated against WCAG 2.2 Level AA, and applicable Section 508 requirements are separately reviewed.
- Any accessibility statement is based on test evidence.

---

## 13. Final status

The shared handler, created in a ChatGPT session, is now called from the dynamic route, with a configuration check added to the Storyblok initialization module. The route distinguishes missing pages from pipeline failures, logs them through a single boundary, and no longer presents outages as 404s. The change is a reliability and diagnostics foundation. It does not by itself establish WCAG 2.2 AA or Section 508 conformance, and the user-facing error experience, tests, and signature verification remain to be completed.

## References

- W3C, Web Content Accessibility Guidelines (WCAG) 2.2: https://www.w3.org/TR/WCAG22/
- U.S. Access Board, Revised 508 Standards and 255 Guidelines: https://www.access-board.gov/ict/
- Section508.gov, Standards, Exceptions, and Examples: https://www.section508.gov/buy/standards-exceptions/
