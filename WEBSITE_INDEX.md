# Talentry Website Index (Current Build)

## 1) Project Overview
- Stack: React 19 + TypeScript + Vite.
- App type: Single-page marketing/waitlist site with hash-based pseudo-routing.
- Runtime entry: `index.html` -> `src/main.tsx` -> `src/App.tsx`.
- Styling model: global tokens in `src/index.css`, feature/page styles in `src/App.css`.
- Current architecture is intentionally compact: nearly all UI and logic are in one component (`App`).

## 2) Site Map (User-Facing)

### Route A: Waitlist Page (`#waitlist` default)
- Sticky header:
  - Brand logo (light/dark variants).
  - Anchor nav links: pain points, how it works, pricing.
- Hero + problem framing:
  - Main value proposition headline and lead paragraph.
  - "Performance gap" list (pain points).
  - "Talentry closes both sides" explanation.
- Pricing preview + billing toggle:
  - Monthly/Annual toggle.
  - Three plans: Starter, Growth, Team.
  - Conditional pricing display and pricing notes.
- Waitlist form:
  - Fields: full name, business name, email, WhatsApp, staff count.
  - Frontend validation and submit states.
  - CTA button text changes by submit state.
- How it works section:
  - 3-step onboarding flow.
- Testimonials section:
  - Placeholder testimonials.
- Final CTA section:
  - Secondary "Secure My Spot" anchor button.
- Footer:
  - Copyright + "A NerdzFactory Programme."

### Route B: Thanks Page (`#thanks`)
- Triggered after successful form submission.
- Header with reduced nav.
- Confirmation card:
  - Success message.
  - Social share buttons for WhatsApp, Facebook, X.
  - Copy-link button (clipboard API).
  - "Join again" button linking back to `#waitlist`.
- Footer repeats brand/legal strip.

## 3) Content and Information Architecture
- Audience focus: Nigerian SMEs/employers.
- Core promise: 12-month staff development + employer guidance.
- Conversion goal: waitlist sign-up.
- Funnel sequence:
  1. Problem awareness (pain points).
  2. Solution framing.
  3. Price qualification.
  4. Form completion.
  5. Referral/share on thanks page.
- Trust assets currently minimal:
  - Placeholder testimonials.
  - No case studies, social proof metrics, FAQ, or founder credibility block.

## 4) Behavioral Logic Index

### Routing
- Hash-based route state:
  - `#thanks` => thanks view.
  - anything else => waitlist view.
- Route synced through `hashchange` listener.

### Pricing Logic
- In-memory pricing object:
  - Starter: 35,000 monthly / 300,000 annual.
  - Growth: 65,000 monthly / 564,000 annual.
  - Team: 90,000 monthly / 780,000 annual.
- Annual mode displays equivalent monthly value (derived with `Math.round(annual/12)`).
- Currency formatting via `toLocaleString("en-NG")` wrapped in `formatNaira`.

### Form Validation
- Required checks for all fields.
- Email regex validation (`validateEmail`).
- WhatsApp/phone regex validation (`validateWhatsapp`).
- Error and loading states drive UI feedback.

### Submission Flow (Important)
- Current submit handler is mocked:
  - Artificial delay (`setTimeout` promise for 900ms).
  - No backend/API call.
  - Immediately marks success and navigates to `#thanks`.
- This is a major rebuild dependency: real integration is still pending.

### Sharing / Referral
- Share URL generated from current page URL without hash.
- Encoded deep links for WhatsApp/Facebook/X.
- Clipboard copy behavior with short-lived success/failure messages.

## 5) UI System Index

### Design Tokens (`src/index.css`)
- Colors: dark navy text, white/light background, orange accent.
- Typography:
  - Sans: Outfit.
  - Heading serif: Cormorant Garamond.
- Effects:
  - Accent backgrounds, borders, soft shadows.
- Theme behavior:
  - Supports OS `prefers-color-scheme: dark`.
  - Logos swap to dark-mode variant.

### Component Style Groups (`src/App.css`)
- Layout: `.page`, `.main`, `.container`, `.heroGrid`.
- Navigation: `.header`, `.nav`, `.brand`.
- Pricing: `.pricingHeader`, `.toggleButton`, `.planCard`.
- Forms: `.form`, `.formGrid`, `.field`, `.primaryButton`, `.formMessage`.
- Content sections: `.section`, `.sectionAlt`, `.steps`, `.quoteCard`, `.cta`.
- Thanks page: `.thanksCard`, `.shareBox`, `.shareButton`, `.ghostButton`.

## 6) Asset Index
- Public:
  - `public/favicon.svg`
  - `public/icons.svg` (symbol sprite; currently not used by `App.tsx`)
- Source assets:
  - `src/assets/talentry-logo.svg` (light mode logo)
  - `src/assets/talentry-logo-dark.svg` (dark mode logo)
  - Template leftovers: `react.svg`, `vite.svg` (not used by UI flow)

## 7) Technical Debt / Complexity Risks Before Rebuild
- Monolithic `App.tsx` (~single-file page + behavior) will become hard to scale as visuals and interactions grow.
- No real data layer (submission is mocked), so conversion analytics and reliability are not production-ready.
- No component boundaries for design system elements (buttons, cards, sections), which raises maintenance costs.
- Hash routing works for a tiny funnel but can become limiting for richer multi-page experiences.
- Minimal accessibility hardening:
  - Baseline semantics are present, but no explicit keyboard flow QA, focus management, or form error summary pattern.
- No test coverage for critical conversion paths.

## 8) Rebuild-Ready Recommended Structure
- `src/pages/`: `WaitlistPage`, `ThanksPage`.
- `src/components/layout/`: `Header`, `Footer`, `Section`, `Container`.
- `src/components/marketing/`: `Hero`, `PainPoints`, `HowItWorks`, `Testimonials`, `FinalCta`.
- `src/components/pricing/`: `PricingToggle`, `PlanCard`, `PricingGrid`.
- `src/components/forms/`: `WaitlistForm`, `Field`, validation helpers.
- `src/lib/`: formatting, URL/share utils.
- `src/theme/`: design tokens, spacing scale, typography primitives.
- `src/services/`: waitlist API integration.

## 9) What "Complex but Manageable" Looks Like
- Introduce complexity in layers:
  1. Visual system first (tokens, typography, spacing, component primitives).
  2. Section-level componentization.
  3. Real waitlist API + submission telemetry.
  4. Interaction polish (motion, microinteractions, progressive disclosure).
  5. Conversion optimization (A/B-ready structure, proof blocks, FAQ, trust badges).
- Keep each layer independently testable and reversible.

## 10) Current State Verdict
- This codebase is a clean MVP landing/waitlist shell.
- You can absolutely rebuild it into a more visually rich, complex experience without losing control.
- The key is to separate content sections, interaction logic, and design system primitives before adding advanced visuals.
