# Buttery Smooth Scrolling Overhaul

**Date:** 2026-02-20
**Status:** Approved
**Scope:** All public pages, overlays, navigation menu

## Problem

The site has 10 scrolling issues causing jank, scroll leaks, and inconsistent behavior:

1. Lenis and GSAP ScrollTrigger run on separate RAF loops (not synchronized)
2. PracticeAreasOverlay does not pause Lenis when open
3. FullScreenMenu (Navigation) does not pause Lenis when open
4. Navigation kills ALL ScrollTriggers globally on every route change
5. Multiple overlays can open simultaneously with conflicting scroll locks
6. Lenis config uses basic touchMultiplier instead of syncTouch
7. Service form pages lack `data-lenis-prevent` attribute
8. Significant dead code cluttering the codebase

## Architecture Decision

**GSAP ticker drives Lenis** — single animation heartbeat. GSAP controls the frame loop, Lenis gets updated each tick via `gsap.ticker.add()`, and ScrollTrigger stays synced via `lenis.on('scroll', ScrollTrigger.update)`. Industry standard pattern.

## Active vs Dead Code Audit

### Active Components (scroll-related)

| Component | Page | Scroll Mechanism |
|-----------|------|-----------------|
| `SmoothScroll.tsx` | All public + auth | Lenis wrapper |
| `Testimonials.tsx` | Home | GSAP ScrollTrigger scrub:1 parallax |
| `Navigation.tsx` | All public | GSAP ScrollTrigger + FullScreenMenu |
| `teamClosingStatement.tsx` | Team | GSAP ScrollTrigger pin + Framer whileInView |
| `TextReveal.tsx` | Home (HeroV2, QuoteSection) | IntersectionObserver (compatible) |
| `QuoteSection.tsx` | Home | Framer Motion useScroll (compatible) |
| `AboutSection.tsx` | Home | Framer Motion whileInView (compatible) |
| `TeamPhilosophyAbstract.tsx` | Team | Framer Motion useScroll (compatible) |
| `TeamTransition.tsx` | Team | Framer Motion useScroll (compatible) |
| `teamScrollAnimations.ts` | Team (via teamHero) | GSAP ScrollTrigger |
| Service form page | Services | Manual wheel interception |
| 4 overlays | Global | Scroll lock (inconsistent) |
| `FullScreenMenu` | Global | Scroll lock (missing Lenis pause) |
| `LoadingScreen.tsx` | Home | Prevents all scroll events (compatible) |
| `PageTransition.tsx` | Global | Fixed overlay, no scroll (compatible) |
| `ScrollRestoration.tsx` | Public | Lenis scrollTo (compatible) |

### Dead Code (to remove)

| File | Why Dead |
|------|----------|
| `PracticeAreasHorizontal.tsx` + `.module.css` | Not imported anywhere |
| `PracticeAreasScroll.tsx` + `.module.css` | Not imported anywhere |
| `PracticeAreasList.tsx` + `.module.css` | Not imported anywhere |
| `CTASection.tsx` + `.module.css` | Not imported anywhere |
| `ScrollRevealText.tsx` + `.module.css` | Only imported by above dead components |

**Preserved:** `Hero.tsx` (772-frame component) — kept as testing component.

## Fixes

### Fix 1: GSAP Ticker Drives Lenis

**File:** `SmoothScroll.tsx`

Replace independent RAF loop with GSAP ticker integration:

```tsx
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Instead of requestAnimationFrame loop:
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)
```

**Impact:** Testimonials parallax, teamClosingStatement pin, Navigation hero detection — all now read Lenis-synced scroll position.

### Fix 2: Lenis Config Tuning

**File:** `SmoothScroll.tsx`

```tsx
// Before:
{ lerp: 0.1, smoothWheel: true, touchMultiplier: 0.5 }

// After:
{ lerp: 0.08, smoothWheel: true, syncTouch: true, syncTouchLerp: 0.04 }
```

- `lerp: 0.08` — slightly smoother deceleration
- `syncTouch: true` — replaces basic touchMultiplier with proper touch-scroll sync
- `syncTouchLerp: 0.04` — smooth touch deceleration

### Fix 3: Centralized Scroll Lock (`useScrollLock` hook)

**New file:** `apps/web/lib/hooks/useScrollLock.ts`

Ref-counted scroll lock manager:
- `lock()` — increments counter, `body.overflow = 'hidden'`, `smoother.stop()`, scrollbar compensation
- `unlock()` — decrements counter, only restores when counter hits 0
- Prevents Overlay A's close re-enabling Lenis while Overlay B is open

**Components updated:**
1. `PracticeAreasOverlay.tsx` — adds missing Lenis pause
2. `FacilitationOverlay.tsx` — replaces manual stop/start
3. `ConsultationOverlay.tsx` — replaces manual stop/start
4. `AboutOverlay.tsx` — replaces manual stop/start
5. `Navigation.tsx` (FullScreenMenu) — adds missing Lenis pause

### Fix 4: Navigation ScrollTrigger Scoping

**File:** `Navigation.tsx:673-675`

Replace `ScrollTrigger.getAll().forEach(st => st.kill())` with scoped cleanup that only kills Navigation's own ScrollTrigger instance. Currently nukes Testimonials and teamClosingStatement triggers.

### Fix 5: Service Form `data-lenis-prevent`

**File:** `services/[category]/[slug]/form/page.tsx`

Add `data-lenis-prevent` attribute to the form wrapper as belt-and-suspenders alongside the existing capture-phase wheel interception.

### Fix 6: Dead Code Removal

Delete 11 files (5 components + 5 CSS modules + 1 .DS_Store). No barrel exports or index files reference them.

## No Changes Needed

These components are already compatible with Lenis:
- `TextReveal.tsx` — IO works because Lenis updates `window.scrollY`
- `QuoteSection.tsx` — Framer `useScroll` reads `window.scrollY` (developer-verified)
- `AboutSection.tsx` — Framer `whileInView` works with Lenis
- `TeamPhilosophyAbstract.tsx`, `TeamTransition.tsx` — Framer `useScroll` compatible
- `LoadingScreen.tsx` — Correctly blocks all scroll during loading
- `PageTransition.tsx` — Fixed overlay, no scroll interaction
- `Footer.tsx` — Correctly uses `getSmoother()` with fallback
- `ScrollRestoration.tsx` — Correctly uses Lenis API
- `teamClosingStatement.tsx` — Framer `whileInView` + GSAP pin both work (auto-benefits from Fix 1)

## Files Changed

| File | Change |
|------|--------|
| `SmoothScroll.tsx` | GSAP ticker integration + config tuning |
| `lib/hooks/useScrollLock.ts` | **New** — ref-counted scroll lock |
| `PracticeAreasOverlay.tsx` | Use useScrollLock |
| `FacilitationOverlay.tsx` | Use useScrollLock |
| `ConsultationOverlay.tsx` | Use useScrollLock |
| `AboutOverlay.tsx` | Use useScrollLock |
| `Navigation.tsx` | useScrollLock in FullScreenMenu + scoped ScrollTrigger |
| `services/.../form/page.tsx` | Add data-lenis-prevent |
| 11 dead code files | **Deleted** |
