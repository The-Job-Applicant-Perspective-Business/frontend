# GitHub Issue Metadata

- **Repository:** `thejobapplicantperspective` (Next.js App Router / Tailwind v4)
- **Issue Type:** Enhancement / Tech Debt
- **Labels:** `enhancement`, `ui/ux`, `typography`, `tailwind-v4`, `storyblok`
- **Assignee:** `@genovaise` (James Hood)
- **Milestone:** Brand Alignment & Tailwind v4 Migration
- **Priority:** Medium
- **Story Points / Estimate:** `2` (approx. 1–2 hours)

---

## Issue Title

`feat(typography): Configure Jost (headings) and Manrope (body/subtitles) via next/font and Tailwind v4 @theme`

---

### Issue Body (Copy-Paste Markdown)

```markdown
## User Story

**As a** job seeker visiting The Job Applicant Perspective,  
**I want** consistent brand typography across all static pages and Storyblok components (Jost for titles, Manrope for subtitles and body copy),  
**So that** the platform matches Sarah's brand guidelines with zero layout shift (CLS) and clean Tailwind v4 utility support.

---

## Context & Background

In the legacy production build (`21309756baa11228.css`), `next/font/google` loaded both `Manrope` (`__className_da1155`) and `Jost` (`__className_54b096`), applying Manrope globally and attaching Jost manually to `<h1>`/`<h2>` tags.

In the new Tailwind v4 `global.css`:

- `Manrope` is currently loaded via a blocking CSS `@import` from Google Fonts and mapped to `--font-sans`.
- `Jost` is missing from both `app/layout.tsx` and `global.css`.
- Legacy hashed classes (e.g., `.__className_54b096`) should be replaced with semantic CSS custom properties (`--font-jost`, `--font-manrope`) and `@theme` tokens (`font-heading`, `font-sans`).

_(Note: Verify hex `#733aab0` in Sarah's original brand color notes in a separate color-audit ticket—it contains 7 characters instead of 6)._

---

## Technical Implementation Plan

### 1. `app/layout.tsx`

- Import `Jost` and `Manrope` from `next/font/google`.
- Configure CSS variables `--font-jost` (weights `500`, `600`, `700`) and `--font-manrope` (weights `400`, `500`, `600`, `700`) with `display: 'swap'`.
- Apply `${jost.variable} ${manrope.variable}` to the root `<html>` tag.

### 2. `app/global.css`

- Remove the external `@import url('https://fonts.googleapis.com/...')` rule at the top of the file (self-hosted automatically via `next/font`).
- Update `@theme`:
  - `--font-sans: var(--font-manrope), ui-sans-serif, system-ui, sans-serif;`
  - `--font-heading: var(--font-jost), ui-sans-serif, system-ui, sans-serif;`
- Update `@layer base`:
  - Set `h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }`.
  - Keep `body { font-family: var(--font-sans); }`.

### 3. Storyblok & Page Components

- Remove any hardcoded `.__className_54b096` or `.__className_da1155` references.
- Use semantic heading tags (`<h1>`–`<h6>`) or Tailwind's `font-heading` class for titles, and `font-sans` for subtitles and body text.

---

## Acceptance Criteria

- [ ] `Jost` and `Manrope` load via `next/font/google` in `app/layout.tsx` with no external Google Fonts `@import` network requests.
- [ ] All `<h1>` through `<h6>` elements across static routes and Storyblok components render in **Jost** by default.
- [ ] All subtitles, paragraphs, buttons, and form inputs render in **Manrope** by default.
- [ ] Tailwind utility classes `font-heading` (Jost) and `font-sans` (Manrope) compile and apply properly in Tailwind v4.
- [ ] DevTools **Computed > Rendered Fonts** confirms local `woff2` subsets for both `Jost` and `Manrope` with zero fallback font flash (FOUT/CLS).
- [ ] WCAG 2.2 AA fluid typography (`clamp()`) and 200% browser zoom scaling remain unaffected.
```
