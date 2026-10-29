# Storyblok Centralized Error Handling --- Implementation and Accessibility Review

**Status:** Shared error-handler utility created; application
integration and accessibility verification remain pending.\
**Scope:** Next.js App Router, Storyblok React SDK, dynamic Storyblok
pages, payload sanitization, component registry diagnostics.\
**Target accessibility frameworks:** WCAG 2.2 Level AA and Section 508.

## 1. Executive summary

We created a TypeScript utility named `storyblokErrorHandler.ts`,
intended to live at:

`lib/dto/storyblok/storyblokErrorHandler.ts`

The purpose is to centralize how Storyblok-related failures are
classified, logged, and described to the application. Instead of
scattering unrelated `console.warn()` and `console.error()` calls
throughout the dynamic route, provider, and validation code, the utility
provides a shared set of error categories and helper functions.

The handler is framework-agnostic. It does not import React, Next.js, or
the Storyblok SDK. It can be called from the relevant error boundaries
without coupling the diagnostic logic to a particular rendering layer.

**Important implementation status:** The file was created, but it has
not yet been integrated into the dynamic route, `StoryblokProvider`,
`initStoryblok()`, or the existing sanitizer. The custom Storyblok
fallback component discussed during planning was not implemented in the
created `.ts` file. No automated tests, keyboard tests, screen-reader
tests, or WCAG/Section 508 conformance assessment were performed.
Therefore, this work is a foundation for more consistent error handling,
not evidence that the application currently conforms to WCAG 2.2 AA or
Section 508.

## 2. Context and existing application structure

The work followed a review of these supplied files:

- `app/[[...slug]]/page.tsx`
- `components/storyblok/PageBlok.tsx`
- The `StoryblokProvider` implementation shared in the conversation.

### 2.1 Dynamic route

The dynamic route uses the Next.js App Router optional catch-all route
pattern. It resolves the URL segments into a Storyblok slug, using
`home` when the slug is absent, and fetches the corresponding story.

The supplied route already:

- Imports `getStoryblokApi` and `StoryblokStory` from
  `@storyblok/react/rsc`.
- Calls `initStoryblok()` before requesting a story.
- Selects the `draft` or `published` version based on Next.js
  `draftMode()`.
- Wraps `fetchDynamicStory()` in React `cache()` so the fetch can be
  shared between metadata generation and page execution.
- Passes the API response through `safeSanitizeStoryPayload()`.
- Logs a warning when sanitization rejects a payload.
- Catches upstream fetch errors and returns `null`.
- Calls Next.js `notFound()` when no story is returned.
- Renders a resolved story using `<StoryblokStory story={story} />`.

The new handler is intended to standardize diagnostics in this flow. It
does not replace the route's responsibilities, automatically intercept
errors, or decide every routing outcome without being called.

### 2.2 Page block and provider

The supplied `PageBlok` component renders nested Storyblok blocks from
`blok.body` using `StoryblokComponent`. The provider registers component
names such as `page`, `Home Content`, `home_content`, `hero_section`,
`tabbed_interface`, `local_jobs_grid`, `mission_banner`, `promo_banner`,
and `blog_grid`.

The registry is responsible for mapping Storyblok technical component
names to React components. An unknown component name is a different
problem from a failed API request or a missing story. The handler
therefore includes a separate `COMPONENT` category.

The provider also checks whether a public Storyblok token is configured
before calling `storyblokInit()`. This is a client-side configuration
check; it does not, by itself, prove that the server-side token used by
`initStoryblok()` is present or valid.

## 3. File created

**File:** `lib/dto/storyblok/storyblokErrorHandler.ts`

The module is designed to be imported from other code using a path such
as:

```ts
import {
  handleStoryblokError,
  storyblokConfigError,
  storyblokNotFound,
  storyblokComponentError,
  storyblokFailure,
  getStoryblokSafeMessage,
} from '@/lib/dto/storyblok/storyblokErrorHandler';
```

This is the intended import path, assuming the file is saved at the
location above and the project alias `@/` resolves to the project source
root.

### 3.1 Error categories

The module defines these categories:

- `CONFIG`: missing or invalid configuration, including likely token
  and authorization problems.
- `API`: API, network, timeout, or other request-related failures.
- `NOT_FOUND`: a story or requested slug cannot be found.
- `VALIDATION`: a payload or schema validation problem.
- `COMPONENT`: an unregistered or unresolved Storyblok component.
- `INITIALIZATION`: Storyblok setup or initialization failures.
- `RENDER`: a rendering-layer failure.
- `UNKNOWN`: an error that cannot be confidently classified.

These categories are diagnostic labels. They do not automatically detect
every possible failure, and inferred classifications need to be checked
against the actual error shapes returned by the Storyblok SDK and the
sanitizer.

### 3.2 Structured context

`StoryblokErrorContext` allows callers to provide optional information
such as:

- The operation being performed.
- The story slug.
- The Storyblok component technical name.
- The nested block path.
- An HTTP status code.
- Additional diagnostic details.

This allows logs to include useful context without every call site
inventing its own message format.

Callers must not put API tokens, secrets, private user data, or other
sensitive information into `details`. The handler cannot automatically
recognize every secret in arbitrary context values.

### 3.3 Structured error reports

`StoryblokErrorReport` returns a consistent object with:

- `ok: false`
- `category`
- `message`
- `safeMessage`
- `severity`
- `retryable`
- `context`
- `cause`

The `message` is intended for diagnostics. The `safeMessage` is intended
for user-facing fallback UI. The raw `cause` may contain technical
information, so callers should not serialize the whole report into
browser-visible HTML, API responses, analytics, or client logs. In
particular, only deliberately selected, safe fields should cross the
server/client boundary.

The union type `StoryblokResult<T>` also defines a success shape,
`{ ok: true, value: T }`, so application code can use a discriminated
result if that style is useful. The helper `storyblokFailure()`
currently creates the failure side of that result; it does not execute
an operation or create a success result itself.

### 3.4 Consistent logging

`handleStoryblokError()`:

1.  Reads the provided context.
2.  Attempts to obtain an HTTP status from common error fields.
3.  Infers a category when the caller has not explicitly supplied one.
4.  Creates a structured report.
5.  Determines a severity.
6.  Logs using a consistent prefix such as `[Storyblok:API]` or
    `[Storyblok:COMPONENT]`.
7.  Returns the report to the caller.

Supported severities are `debug`, `info`, `warn`, and `error`.

In production mode, the logging object uses the safe message rather than
the raw diagnostic message and omits the optional `details` field. In
development mode, it can log the raw message and details. This is a
useful default, but it is not a complete redaction system: a
safe-looking error message or context field can still contain sensitive
content if a caller supplies it carelessly. The `cause` remains present
on the returned report in all environments, so callers must treat it as
internal diagnostic data.

The `log: false` option allows callers to suppress this module's console
output if another logging system will record the report.

### 3.5 Retryability

The handler provides a `retryable` boolean. Its default logic treats
some network/API errors and common transient HTTP statuses such as
`408`, `429`, and `5xx` as potentially retryable.

This is a hint for callers, not an automatic retry mechanism. The module
does not retry requests, schedule backoff, or guarantee that an
operation is safe to repeat. The caller can override the default when it
knows more about the operation.

### 3.6 Convenience helpers

`storyblokNotFound()` creates a `NOT_FOUND` report for a known missing
slug and defaults to informational severity.

`storyblokConfigError()` reports a configuration failure with error
severity.

`storyblokComponentError()` reports an unregistered component name and
optionally records its nested block path.

`storyblokFailure()` wraps an unknown failure in the standardized
failure result shape.

`getStoryblokSafeMessage()` returns the default user-safe message for a
category so fallback UI can use consistent language.

### 3.7 Safe default messages

The module supplies general visitor-facing messages for configuration,
API, validation, initialization, and unknown failures; a not-found
message for missing pages; and a partial-page message for component and
rendering failures.

These strings avoid exposing implementation details to visitors. They do
not, on their own, make a failure accessible. If a message is rendered
dynamically, the UI still needs appropriate semantic structure, keyboard
behavior where applicable, and assistive-technology announcements when
required.

## 4. What was actually completed

The completed work is the creation of the shared TypeScript utility and
its exported types and functions.

Specifically, the file now provides:

- A common error-category vocabulary.
- A common structured error-report shape.
- Optional context for route, slug, component, path, and status
  information.
- Basic category inference from supplied error data.
- Consistent severity and log prefixes.
- Default visitor-safe messages.
- A basic retryability hint.
- Convenience helpers for configuration, not-found, and
  missing-component errors.
- A result type that can support consistent failure handling at call
  sites.

## 5. What has not yet been completed

The following work was discussed or identified as a next step, but is
**not implemented merely by creating this handler**:

1.  The dynamic route does not yet call `handleStoryblokError()` from
    every relevant failure path.
2.  The provider does not yet route configuration and initialization
    diagnostics through this handler.
3.  The server-side `initStoryblok()` configuration has not been
    inspected or modified as part of this change.
4.  `safeSanitizeStoryPayload()` has not yet been connected to the
    centralized handler.
5.  The component registry has not yet been recursively checked against
    every component name present in a story.
6.  No custom `customFallbackComponent` has been implemented as part of
    the created `.ts` file.
7.  The handler does not create a React error boundary, catch rendering
    exceptions automatically, or replace Next.js `error.tsx` /
    `global-error.tsx`.
8.  No request retry or backoff mechanism has been implemented.
9.  No automated tests, build, lint, type-check, accessibility audit, or
    assistive-technology test has been run as part of this work.

A shared handler is a common reporting and classification layer. Errors
occur at different boundaries, so the route, provider, sanitizer,
component resolver, and rendering layer must call the handler at the
appropriate points. A single imported utility does not automatically
catch errors from the whole application.

## 6. Planned integration behavior

The intended next step is to wire the shared handler into each boundary
without duplicating the classification and logging logic.

### 6.1 Configuration and initialization

Before making a Storyblok request, the server-side setup should verify
that the expected server token and required configuration exist. Missing
configuration should produce a clear internal diagnostic and a safe
visitor-facing outcome.

Client-side public-token configuration and server-side token
configuration should be checked separately. A public token being present
does not establish that server-side credentials or API access are valid.

### 6.2 API requests

API failures should be classified using actual SDK error fields and HTTP
status information where available. Invalid credentials, access-denied
responses, network failures, rate limits, and upstream server failures
should not all be reported as the same generic error.

The current inference logic is deliberately basic. Before relying on
category inference in production, verify how the installed Storyblok SDK
represents response status, errors, and failed requests. Explicit
categories at known call sites are preferable when the failure type is
already known.

### 6.3 Missing stories

A genuinely missing story should be handled as a missing page, normally
through the existing Next.js `notFound()` behavior. It should not be
mislabeled as a network outage or invalid configuration.

The application should decide whether missing slugs are expected enough
to log at informational level, or whether particular missing routes
deserve a warning. The current helper defaults to informational
severity.

### 6.4 Sanitization and validation

When `safeSanitizeStoryPayload()` rejects an API payload, its validation
result should be sent to the centralized handler as a `VALIDATION`
failure. The route can then follow its existing safe behavior, such as
returning `null` and rendering the not-found outcome, if that remains
the intended product behavior.

Do not expose raw payloads, validation internals, or sensitive content
to visitors. Internal logs should include only the diagnostic details
needed to resolve the issue.

### 6.5 Component resolution

The component registry should be checked against the technical component
names found in the story. A recursive diagnostic can identify unknown
components and report the nested location, for example `home.body[0]`.

A custom Storyblok fallback component can display a safe message during
development when an unknown block is encountered. Whether that fallback
should be visible in production, omitted, or replaced with a general
partial-content message is a product decision. A missing component
should not silently be assumed to be an API failure.

The registry pre-check and runtime fallback serve different purposes:
the pre-check can report several unknown names before rendering, while
the fallback helps prevent an unresolved component from becoming an
unexplained blank area. Neither is automatically provided by the new
error-handler file.

### 6.6 Rendering errors

React and Next.js rendering errors need to be handled at the rendering
boundary. The shared handler can normalize and log an error after a
boundary catches it, but it cannot replace the framework's
error-boundary mechanisms.

A Next.js route-level `error.tsx` or `global-error.tsx`, as appropriate,
can render a user-safe error page. These files need accessible headings,
explanatory text, and usable recovery controls if such controls are
provided. A recovery button should have an accessible name, keyboard
support, visible focus, and a real action.

## 7. WCAG 2.2 Level AA relevance

The official WCAG 2.2 Recommendation defines testable accessibility
success criteria for web content. A shared error handler is primarily an
application reliability and diagnostics improvement. It can support
accessible error handling once integrated with the user interface, but
the handler alone does not satisfy or demonstrate WCAG conformance.

Official standard: [Web Content Accessibility Guidelines (WCAG)
2.2](https://www.w3.org/TR/WCAG22/).

### 7.1 Success Criterion 4.1.3 --- Status Messages (Level AA)

This is the most directly relevant criterion to consider when an error
or recovery message is inserted into a page without moving focus.

If the application dynamically presents a non-modal message such as
"Part of this page is currently unavailable," the implementation should
determine whether it qualifies as a status message and ensure that
assistive technologies can programmatically determine the message
without requiring focus to move to it.

The new handler only returns strings and diagnostic data. It does not
render a live region, add `role="status"` or `role="alert"`, or make
messages announce themselves to screen readers. Those behaviors must be
designed and tested in the component that displays the message. The
appropriate semantic pattern depends on the urgency and interaction
model; do not add live-region roles indiscriminately.

If an error causes a full navigation to a dedicated error page, test the
resulting page title, heading, reading order, and announcement behavior
rather than assuming the dynamic-status-message pattern applies in the
same way.

### 7.2 Success Criterion 3.3.1 --- Error Identification (Level A)

This criterion concerns errors detected in user input. A Storyblok API
failure or missing CMS component is not, by itself, a user-input error,
so the new handler cannot be claimed as direct conformance with this
criterion.

However, the broader design principle is relevant: when the application
presents an error to a user, it should explain the problem in text
rather than communicate it only through color, an icon, or a console
log. If a Storyblok failure prevents a user from completing a form or
causes a user-input error, the applicable input-error requirements must
be assessed separately.

### 7.3 Success Criterion 3.3.3 --- Error Suggestion (Level AA)

This criterion applies when an input error is detected and a correction
suggestion is known. The Storyblok error handler does not currently
provide user-input correction suggestions, and ordinary CMS failures are
not automatically within this criterion's scope.

If the affected experience includes user input, the application should
provide useful correction guidance when it is known and appropriate. For
example, a CMS outage should not be misleadingly described as a mistake
made by the visitor.

### 7.4 Success Criterion 1.3.1 --- Info and Relationships (Level A)

If fallback UI is added, its structure must communicate information and
relationships programmatically. Use meaningful headings and text, and
semantic HTML appropriate to the message. Do not rely only on an orange
border, a color change, or a visual position to communicate that a block
is unavailable.

The illustrative fallback discussed earlier used a plain `div` with a
border and text. That is only a visual starting point; it was not
implemented in the handler file and is not a complete accessibility
implementation.

### 7.5 Success Criterion 1.4.3 --- Contrast (Minimum) (Level AA)

If error messages, banners, borders, icons, or controls are rendered,
their relevant text and visual information must meet the applicable
contrast requirements. For normal text, the general minimum is a 4.5:1
contrast ratio; qualifying large text generally requires at least 3:1.
Non-text visual indicators and component boundaries may also be subject
to contrast requirements depending on their role.

The TypeScript handler does not define a visual style, so it neither
establishes nor verifies contrast compliance.

### 7.6 Success Criterion 2.1.1 --- Keyboard (Level A)

If an error fallback includes retry, refresh, dismiss, or navigation
controls, those controls must be operable using a keyboard. The handler
itself creates no controls and does not affect keyboard operation
directly.

### 7.7 Success Criterion 2.4.7 --- Focus Visible (Level AA)

Any keyboard-operable controls in a fallback or error page must have a
visible focus indicator. The handler contains no UI or focus styles, so
this criterion remains a responsibility of the eventual interface
implementation.

### 7.8 Success Criterion 2.4.11 --- Focus Not Obscured (Minimum) (Level AA)

WCAG 2.2 adds a requirement that a focused component not be entirely
hidden by author-created content. If the application presents a fixed
error banner, modal, overlay, or recovery panel, test that it does not
obscure keyboard focus in a way that fails this criterion.

The handler does not create overlays or alter focus. This is a future UI
testing consideration, not a result of the current file.

### 7.9 Success Criterion 3.2.3 --- Consistent Navigation (Level AA)

A CMS error should not cause the site's navigation to appear in an
unexpected order or disappear inconsistently across otherwise comparable
pages. This is relevant if an error page or fallback changes the shared
page shell. The handler does not control the navigation or page layout,
so it cannot establish conformance with this criterion.

### 7.10 Success Criterion 4.1.2 --- Name, Role, Value (Level A)

If the fallback or error experience introduces interactive controls,
their names, roles, states, and values must be programmatically
determinable as applicable. A simple explanatory text message does not
automatically require a control role. Do not turn static text into an
interactive control unless it actually performs an action.

The handler has no interactive UI, so this criterion must be checked
against any eventual fallback or recovery component.

### 7.11 No WCAG conformance claim

WCAG conformance applies to complete web pages and requires all
applicable Level A and Level AA success criteria to be satisfied. A
utility module cannot independently establish that a website or page
conforms.

No WCAG 2.2 AA pass is claimed for this work. The relevant UI behavior
has not yet been implemented or tested.

## 8. Section 508 relevance

The Revised Section 508 Standards include requirements for information
and communication technology (ICT), including software and web content.
The Access Board's standards specify WCAG 2.0 Level A and AA success
criteria for covered software user interfaces and content under E207.2,
subject to the standard's provisions and exceptions.

Official references:

- [U.S. Access Board --- Revised 508 Standards and 255
  Guidelines](https://www.access-board.gov/ict/)
- [Section508.gov --- Standards, Exceptions, and
  Examples](https://www.section508.gov/buy/standards-exceptions/)

Section 508's incorporated WCAG version is WCAG 2.0 Level A and AA for
the cited E207.2 requirement; WCAG 2.2 AA is a newer W3C recommendation
and is the additional target requested for this review. Do not describe
WCAG 2.2 as the exact version incorporated by E207.2.

The Storyblok error-handler utility does not itself provide a user
interface, so its creation alone does not establish Section 508
conformance. Its value for Section 508 is indirect: consistent failure
classification can help the application provide understandable,
consistent error experiences, while safe logging can help developers
diagnose failures that otherwise result in missing or broken content.

For Section 508 review, test the rendered application and the
user-facing behavior at the relevant software and web-content
boundaries. Depending on the product and applicable requirements, the
assessment may also need to consider the broader Revised 508 Standards
beyond WCAG success criteria, including applicable software,
assistive-technology interoperability, and support documentation
requirements. A code-level utility review is not a substitute for that
assessment.

## 9. Security and privacy considerations

The handler was designed with a distinction between diagnostic messages
and visitor-facing messages. This is a useful security practice, but the
integration must preserve that distinction.

- Do not expose access tokens, credentials, environment variables, raw
  API responses, or stack traces to visitors.
- Do not send the full `StoryblokErrorReport` to the browser because
  it contains `cause` and may contain diagnostic context.
- Avoid placing secrets or personal data in `context.details`.
- Treat CMS content and error messages as untrusted data. Escape or
  safely render any dynamic text; do not inject raw HTML into fallback
  UI.
- Ensure production logs contain enough information to diagnose
  failures without leaking secrets or unnecessary user data.
- Avoid logging the same error at every layer if it creates duplicate
  or noisy logs. Choose a primary reporting boundary and add context
  at other layers where useful.
- Keep public-token and server-token checks separate. Public
  environment variables are not secret, and server credentials must
  never be exposed to client code.

These are engineering precautions; the file does not perform
comprehensive secret detection, sanitization of arbitrary diagnostic
objects, or centralized log redaction.

## 10. Testing plan before claiming conformance

### 10.1 Functional and integration tests

After wiring the handler into the application, test at least the
following cases:

1.  Server-side Storyblok token is missing.
2.  Client-side public token is missing.
3.  Token is configured but rejected by the API.
4.  The request fails because of a network error or timeout.
5.  The API responds with a rate limit or server error.
6.  The requested slug does not exist.
7.  The requested story exists but is not published in the selected
    version.
8.  The sanitizer rejects an unexpected or malformed response.
9.  The story contains an unknown root component.
10. A nested body contains an unknown component.
11. A component throws during rendering.
12. A valid story and all registered blocks render normally.
13. Production-mode output does not expose raw error details or
    credentials.
14. Diagnostic logs include useful operation and slug context without
    sensitive data.
15. Any retry behavior is explicitly implemented and tested rather than
    inferred from the `retryable` flag.

Tests should verify both the classification returned by the handler and
the route's chosen behavior. For example, a true missing slug should
lead to the intended not-found response, while a transient upstream
failure should not be silently misclassified as a missing story.

### 10.2 Accessibility tests for any rendered fallback

Once the UI is integrated:

1.  Inspect the error message with a screen reader to verify that it is
    discoverable and announced appropriately when it appears
    dynamically.
2.  Verify that the message is actual text and not conveyed by color or
    icon alone.
3.  Check the heading structure, page title, and reading order on a
    dedicated error page.
4.  Navigate all recovery controls using only the keyboard.
5.  Verify visible focus and ensure focus is not hidden behind banners,
    dialogs, or overlays.
6.  Check text contrast and any meaningful non-text visual indicators.
7.  Verify that recovery controls have accessible names and behave
    predictably.
8.  Confirm that error states do not remove or reorder shared navigation
    unexpectedly.
9.  Test relevant browser and assistive-technology combinations.
10. Combine automated accessibility checks with manual evaluation;
    automated checks alone cannot establish WCAG conformance.

The exact tests depend on whether the application uses inline fallback
content, a full-page error state, a modal, or a route-level Next.js
error page.

## 11. Definition of done

This work should not be considered complete as an application-wide
error-handling feature until all of the following are true:

- The shared handler is committed at
  `lib/dto/storyblok/storyblokErrorHandler.ts`.
- The route, initialization/configuration path, sanitizer, component
  registry diagnostics, and rendering error boundaries call it where
  appropriate.
- The actual Storyblok SDK error shapes have been verified against the
  category-inference logic.
- Missing content, API failures, invalid configuration, invalid
  payloads, and missing component names are distinguishable in logs.
- Visitor-facing messages remain safe and understandable.
- Raw error objects and sensitive context do not leak into
  client-visible output.
- Unit and integration tests cover the important failure paths.
- Any user-facing fallback is implemented with semantic HTML and
  appropriate announcement behavior.
- Keyboard, focus, contrast, and screen-reader checks are completed
  for the affected UI.
- The full applicable page and user flows are evaluated against WCAG
  2.2 Level AA.
- The applicable Section 508 requirements are separately reviewed.
- Any accessibility statement or compliance claim is based on evidence
  from testing, not on the existence of this utility.

## 12. Final status

The concrete deliverable from this session is a reusable TypeScript
Storyblok error-handler module. It establishes common error categories,
structured reports, consistent diagnostic prefixes, safe-message
defaults, basic retryability hints, and convenience helpers.

It does **not** yet intercept application errors automatically,
integrate itself into the route/provider/sanitizer, render an accessible
fallback, or prove WCAG 2.2 AA or Section 508 conformance. The next step
is to wire it into the existing Storyblok boundaries, then test both the
technical failure paths and the accessibility of the resulting
user-facing states.

## References

- W3C, [Web Content Accessibility Guidelines (WCAG)
  2.2](https://www.w3.org/TR/WCAG22/)
- U.S. Access Board, [Revised 508 Standards and 255
  Guidelines](https://www.access-board.gov/ict/)
- Section508.gov, [Standards, Exceptions, and
  Examples](https://www.section508.gov/buy/standards-exceptions/)
