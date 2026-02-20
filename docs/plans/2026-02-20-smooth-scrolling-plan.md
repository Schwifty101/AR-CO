# Buttery Smooth Scrolling Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make every public page's scroll feel buttery smooth by synchronizing Lenis with GSAP, centralizing scroll locking, removing dead code, and fixing scoping bugs.

**Architecture:** GSAP ticker drives Lenis's RAF loop (single animation heartbeat). A ref-counted `useScrollLock` hook replaces scattered scroll lock logic across 5 overlay/menu components. Navigation's ScrollTrigger cleanup is scoped to its own instance only.

**Tech Stack:** Lenis ^1.3.17, GSAP ^3.14.2, @gsap/react ^2.1.2, Framer Motion ^12.29.0, React 19, Next.js 16

**Design doc:** `docs/plans/2026-02-20-smooth-scrolling-design.md`

---

### Task 1: Delete Dead Code

**Files to delete:**
- `apps/web/components/home/practice-areas/PracticeAreasHorizontal.tsx`
- `apps/web/components/home/practice-areas/PracticeAreasHorizontal.module.css`
- `apps/web/components/home/practice-areas/PracticeAreasScroll.tsx`
- `apps/web/components/home/practice-areas/PracticeAreasScroll.module.css`
- `apps/web/components/home/practice-areas/PracticeAreasList.tsx`
- `apps/web/components/home/practice-areas/PracticeAreasList.module.css`
- `apps/web/components/home/practice-areas/.DS_Store`
- `apps/web/components/home/cta/CTASection.tsx`
- `apps/web/components/home/cta/CTASection.module.css`
- `apps/web/components/shared/animations/ScrollRevealText.tsx`
- `apps/web/components/shared/animations/ScrollRevealText.module.css`

**Preserve:** `apps/web/components/home/hero/Hero.tsx` (testing component).

**Step 1: Delete the files**

```bash
cd apps/web
rm components/home/practice-areas/PracticeAreasHorizontal.tsx
rm components/home/practice-areas/PracticeAreasHorizontal.module.css
rm components/home/practice-areas/PracticeAreasScroll.tsx
rm components/home/practice-areas/PracticeAreasScroll.module.css
rm components/home/practice-areas/PracticeAreasList.tsx
rm components/home/practice-areas/PracticeAreasList.module.css
rm components/home/practice-areas/.DS_Store
rm components/home/cta/CTASection.tsx
rm components/home/cta/CTASection.module.css
rm components/shared/animations/ScrollRevealText.tsx
rm components/shared/animations/ScrollRevealText.module.css
```

**Step 2: Verify no imports break**

```bash
cd /path/to/AR-CO && pnpm --filter web build
```

Expected: Build succeeds. None of these files are imported by any active code.

**Step 3: Verify the practice-areas directory still has Hero.tsx**

```bash
ls apps/web/components/home/hero/Hero.tsx
```

Expected: File exists.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove unused scroll components (PracticeAreasHorizontal, PracticeAreasScroll, PracticeAreasList, CTASection, ScrollRevealText)"
```

---

### Task 2: GSAP Ticker Drives Lenis (Core Integration)

**Files:**
- Modify: `apps/web/components/SmoothScroll.tsx` (entire file, 42 lines)

**Step 1: Rewrite SmoothScroll.tsx**

Replace the entire file with:

```tsx
"use client"

import { useEffect, ReactNode } from "react"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// Global Lenis instance
let lenisInstance: Lenis | null = null

// Export function to get the Lenis instance (drop-in for getSmoother)
export const getSmoother = () => lenisInstance

interface SmoothScrollProps {
  children: ReactNode
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.04,
    })

    lenisInstance = lenis

    // Connect Lenis scroll events to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update)

    // Use GSAP ticker as the single animation heartbeat
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000) // GSAP ticker uses seconds, Lenis expects ms
    }
    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    window.dispatchEvent(new CustomEvent("scroll-smoother-ready", { detail: lenis }))

    return () => {
      gsap.ticker.remove(tickerCallback)
      lenis.destroy()
      lenisInstance = null
    }
  }, [])

  return <>{children}</>
}
```

**Step 2: Verify the app starts**

```bash
pnpm --filter web dev
```

Visit `http://localhost:3000`. Scroll should feel smooth. GSAP ScrollTrigger animations (Testimonials parallax, Navigation hero detection) should sync perfectly.

**Step 3: Commit**

```bash
git add apps/web/components/SmoothScroll.tsx
git commit -m "feat: integrate GSAP ticker with Lenis for synchronized smooth scrolling"
```

---

### Task 3: Create `useScrollLock` Hook

**Files:**
- Create: `apps/web/lib/hooks/useScrollLock.ts`

**Step 1: Create the hook**

```ts
import { useCallback, useEffect, useRef } from "react"
import { getSmoother } from "@/components/SmoothScroll"

/**
 * Ref-counted scroll lock manager.
 *
 * Multiple overlays can call lock/unlock independently.
 * Lenis only resumes when ALL locks are released (counter reaches 0).
 *
 * @example
 * ```tsx
 * const { lock, unlock } = useScrollLock()
 * useEffect(() => { if (isOpen) lock(); else unlock() }, [isOpen])
 * ```
 */

let lockCount = 0
let savedPaddingRight = ""

function applyLock() {
  if (lockCount === 1) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    savedPaddingRight = document.body.style.paddingRight
    document.body.style.overflow = "hidden"
    document.body.style.paddingRight = `${scrollbarWidth}px`
    getSmoother()?.stop()
  }
}

function releaseLock() {
  if (lockCount === 0) {
    document.body.style.overflow = ""
    document.body.style.paddingRight = savedPaddingRight
    savedPaddingRight = ""
    getSmoother()?.start()
  }
}

export function useScrollLock() {
  const lockedByThis = useRef(false)

  const lock = useCallback(() => {
    if (lockedByThis.current) return
    lockedByThis.current = true
    lockCount++
    applyLock()
  }, [])

  const unlock = useCallback(() => {
    if (!lockedByThis.current) return
    lockedByThis.current = false
    lockCount--
    releaseLock()
  }, [])

  // Safety: always unlock on unmount
  useEffect(() => {
    return () => {
      if (lockedByThis.current) {
        lockedByThis.current = false
        lockCount--
        releaseLock()
      }
    }
  }, [])

  return { lock, unlock }
}
```

**Step 2: Commit**

```bash
git add apps/web/lib/hooks/useScrollLock.ts
git commit -m "feat: add ref-counted useScrollLock hook for centralized scroll locking"
```

---

### Task 4: Update PracticeAreasOverlay to Use `useScrollLock`

**Files:**
- Modify: `apps/web/components/practice-areas/PracticeAreasOverlay.tsx:1-56`

This overlay currently does NOT pause Lenis. The fix adds Lenis pause via `useScrollLock`.

**Step 1: Replace scroll lock logic**

Replace the imports (line 3) to add `useScrollLock`:

```tsx
import { useEffect, useCallback } from 'react'
```

becomes:

```tsx
import { useEffect, useCallback } from 'react'
import { useScrollLock } from '@/lib/hooks/useScrollLock'
```

Replace the scroll lock `useEffect` (lines 38-56) with:

```tsx
  const { lock, unlock } = useScrollLock()

  // Lock body scroll + pause Lenis when overlay is open
  useEffect(() => {
    if (isOpen) {
      lock()
      window.addEventListener('keydown', handleKeyDown)
    } else {
      unlock()
    }

    return () => {
      unlock()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown, lock, unlock])
```

**Step 2: Verify overlay opens/closes correctly**

Open PracticeAreasOverlay, confirm background doesn't scroll. Close it, confirm scroll resumes.

**Step 3: Commit**

```bash
git add apps/web/components/practice-areas/PracticeAreasOverlay.tsx
git commit -m "fix: PracticeAreasOverlay now pauses Lenis via useScrollLock"
```

---

### Task 5: Update FacilitationOverlay to Use `useScrollLock`

**Files:**
- Modify: `apps/web/components/facilitation/FacilitationOverlay.tsx:12-14,118-150`

**Step 1: Replace imports**

Remove the `getSmoother` import (line 12):

```tsx
import { getSmoother } from '@/components/SmoothScroll'
```

Add `useScrollLock`:

```tsx
import { useScrollLock } from '@/lib/hooks/useScrollLock'
```

**Step 2: Replace the scroll lock useEffect (lines 118-150)**

Replace with:

```tsx
  const { lock, unlock } = useScrollLock()

  useEffect(() => {
    if (isOpen) {
      lock()
      window.addEventListener('keydown', handleKeyDown)
    } else {
      unlock()
      setExpandedId(null)
    }

    return () => {
      unlock()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown, lock, unlock])
```

**Step 3: Commit**

```bash
git add apps/web/components/facilitation/FacilitationOverlay.tsx
git commit -m "refactor: FacilitationOverlay uses centralized useScrollLock"
```

---

### Task 6: Update ConsultationOverlay to Use `useScrollLock`

**Files:**
- Modify: `apps/web/components/consultation/ConsultationOverlay.tsx:6,72-101`

**Step 1: Replace imports**

Remove line 6:

```tsx
import { getSmoother } from '@/components/SmoothScroll'
```

Add:

```tsx
import { useScrollLock } from '@/lib/hooks/useScrollLock'
```

**Step 2: Replace the scroll lock useEffect (lines 72-101)**

Replace with:

```tsx
  const { lock, unlock } = useScrollLock()

  /* ─── Body lock & Lenis pause ─── */
  useEffect(() => {
    if (isOpen) {
      lock()
      window.addEventListener('keydown', handleKeyDown)
    } else {
      unlock()
      // Reset form when closing
      setTimeout(() => {
        setStep(1)
        setSubmitted(false)
        setErrors({})
        setFormData({ name: '', email: '', phone: '', practiceArea: '', caseDescription: '' })
      }, 400)
    }

    return () => {
      unlock()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown, lock, unlock])
```

**Step 3: Commit**

```bash
git add apps/web/components/consultation/ConsultationOverlay.tsx
git commit -m "refactor: ConsultationOverlay uses centralized useScrollLock"
```

---

### Task 7: Update AboutOverlay to Use `useScrollLock`

**Files:**
- Modify: `apps/web/components/about/AboutOverlay.tsx:6,28-60`

**Step 1: Replace imports**

Remove line 6:

```tsx
import { getSmoother } from '@/components/SmoothScroll'
```

Add:

```tsx
import { useScrollLock } from '@/lib/hooks/useScrollLock'
```

**Step 2: Replace the scroll lock useEffect (lines 28-60)**

Replace with:

```tsx
  const { lock, unlock } = useScrollLock()

  useEffect(() => {
    if (isOpen) {
      lock()
      window.addEventListener('keydown', handleKeyDown)
    } else {
      unlock()
    }

    return () => {
      unlock()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown, lock, unlock])
```

**Step 3: Commit**

```bash
git add apps/web/components/about/AboutOverlay.tsx
git commit -m "refactor: AboutOverlay uses centralized useScrollLock"
```

---

### Task 8: Fix Navigation — Scoped ScrollTrigger + FullScreenMenu Scroll Lock

**Files:**
- Modify: `apps/web/components/nav/Navigation.tsx:1-4,314-334,668-711`

This task fixes TWO issues:
1. FullScreenMenu doesn't pause Lenis (lines 329-334)
2. Navigation kills ALL ScrollTriggers globally (line 675, 709)

**Step 1: Add useScrollLock import**

Add to the imports (after line 3):

```tsx
import { useScrollLock } from '@/lib/hooks/useScrollLock'
```

**Step 2: Fix FullScreenMenu scroll lock (lines 328-334)**

Replace the scroll lock `useEffect` in `FullScreenMenu`:

```tsx
    // Lock body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [])
```

with:

```tsx
    const { lock, unlock } = useScrollLock()

    // Lock body scroll + pause Lenis when menu is open
    useEffect(() => {
        lock()
        return () => {
            unlock()
        }
    }, [lock, unlock])
```

**Step 3: Fix scoped ScrollTrigger cleanup (lines 673-711)**

Add a ref at the top of the `Navigation` component (after line 607):

```tsx
    const navTriggerRef = useRef<globalThis.ScrollTrigger | null>(null)
```

Replace the `useGSAP` block (lines 673-711):

```tsx
    useGSAP(() => {
        // Kill only our own ScrollTrigger, not others
        if (navTriggerRef.current) {
            navTriggerRef.current.kill()
            navTriggerRef.current = null
        }

        const setupTrigger = () => {
            const heroSection = document.querySelector('[data-hero-section="true"]')

            if (heroSection) {
                setIsScrolled(false)

                navTriggerRef.current = ScrollTrigger.create({
                    trigger: heroSection,
                    start: "top top",
                    end: "bottom top",
                    onUpdate: (self) => {
                        const shouldBeScrolled = self.progress > 0.05
                        setIsScrolled(shouldBeScrolled)
                    },
                    onLeave: () => setIsScrolled(true),
                    onEnterBack: () => { },
                    onLeaveBack: () => setIsScrolled(false)
                })
            } else {
                setIsScrolled(true)
            }
        }

        const timer = setTimeout(setupTrigger, 100)

        return () => {
            clearTimeout(timer)
            if (navTriggerRef.current) {
                navTriggerRef.current.kill()
                navTriggerRef.current = null
            }
        }
    }, [pathname])
```

**Step 4: Ensure `useRef` is in the React import (line 3)**

Verify `useRef` is already imported:

```tsx
import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react'
```

Add `useRef` if missing:

```tsx
import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
```

**Step 5: Verify navigation works**

- Visit home page: HeroNavbar visible, transitions to StickyNavbar on scroll
- Navigate to team page: Testimonials parallax and teamClosingStatement pin still work (not killed)
- Open hamburger menu: Background scroll is locked, Lenis is paused

**Step 6: Commit**

```bash
git add apps/web/components/nav/Navigation.tsx
git commit -m "fix: scope Navigation ScrollTrigger cleanup + pause Lenis in FullScreenMenu"
```

---

### Task 9: Add `data-lenis-prevent` to Service Form

**Files:**
- Modify: `apps/web/app/(public)/services/[category]/[slug]/form/page.tsx:544-545`

**Step 1: Add the attribute**

At line 544, the form wrapper div:

```tsx
        ref={formWrapperRef}
        className="relative rounded-xl overflow-hidden border"
```

Add `data-lenis-prevent`:

```tsx
        ref={formWrapperRef}
        data-lenis-prevent
        className="relative rounded-xl overflow-hidden border"
```

**Step 2: Commit**

```bash
git add apps/web/app/(public)/services/[category]/[slug]/form/page.tsx
git commit -m "fix: add data-lenis-prevent to service form wrapper"
```

---

### Task 10: Full Verification

**Step 1: Type check**

```bash
cd apps/web && pnpm tsc --noEmit
```

Expected: No errors.

**Step 2: Build**

```bash
cd /path/to/AR-CO && pnpm --filter web build
```

Expected: Build succeeds.

**Step 3: Manual QA checklist**

Run `pnpm --filter web dev` and test each page:

- [ ] **Home page** (`/`): Smooth scroll, Testimonials parallax synced with scroll, no jank
- [ ] **Team page** (`/team`): teamClosingStatement pins correctly, whileInView animations trigger at right moment, TeamPhilosophyAbstract parallax smooth
- [ ] **Practice areas** (`/practice-areas/[slug]`): Framer Motion whileInView animations work
- [ ] **Services form** (`/services/[category]/[slug]/form`): Form scrolls independently, page doesn't scroll behind it
- [ ] **Subscribe page** (`/subscribe`): Normal smooth scroll
- [ ] **Blog pages** (`/blogs`, `/blogs/[slug]`): Normal smooth scroll
- [ ] **Auth pages** (`/auth/signin`, `/auth/signup`): Smooth scroll via separate SmoothScroll instance
- [ ] **Navigation**: HeroNavbar to StickyNavbar transition on scroll, no premature trigger
- [ ] **FullScreenMenu**: Open menu, background doesn't scroll, close menu, scroll resumes
- [ ] **PracticeAreasOverlay**: Open, background locked, scrollable inside overlay, close, scroll resumes
- [ ] **FacilitationOverlay**: Same as above
- [ ] **ConsultationOverlay**: Same as above
- [ ] **AboutOverlay**: Same as above
- [ ] **Two overlays**: Open menu, then open PracticeAreas from menu — both lock, closing one doesn't re-enable scroll while other is open
- [ ] **Page transitions**: Navigate between pages, scroll resets to top, no scroll leak during transition
- [ ] **Mobile touch**: Smooth touch scrolling on all pages, overlays scrollable by touch

**Step 4: Final commit (if any lint/type fixes needed)**

```bash
git add -A
git commit -m "fix: address lint/type issues from scrolling overhaul"
```
