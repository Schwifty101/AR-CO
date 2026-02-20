/**
 * GSAP Scroll Animation Utilities for Team Page
 *
 * Provides parallax and scroll-triggered animation functions.
 * Use sparingly to maintain performance and accessibility.
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const cleanup = initTeamParallax('.heroImage', 0.3);
 *   return cleanup;
 * }, []);
 * ```
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Initializes parallax effect on an element
 * @param selector - CSS selector for target element
 * @param speed - Parallax speed (0.1-0.5 recommended)
 * @returns Cleanup function to remove ScrollTrigger
 */
export const initTeamParallax = (
  selector: string,
  speed: number = 0.3
): (() => void) => {
  if (typeof window === 'undefined') return () => { };

  const element = document.querySelector(selector);
  if (!element) return () => { };

  const scrollTrigger = gsap.to(element, {
    y: () => window.innerHeight * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  });

  return () => {
    scrollTrigger.scrollTrigger?.kill();
    scrollTrigger.kill();
  };
};

/**
 * Initializes multi-speed parallax for floating cards
 * @param containerSelector - Container element selector
 * @returns Cleanup function
 */
export const initFloatingCardParallax = (
  containerSelector: string
): (() => void) => {
  if (typeof window === 'undefined') return () => { };

  const container = document.querySelector(containerSelector);
  if (!container) return () => { };

  const cards = container.querySelectorAll('.floating-card');
  const triggers: gsap.core.Tween[] = [];

  cards.forEach((card, _index) => {
    const speed = 0.1 + (_index % 3) * 0.05; // Varying speeds
    const tween = gsap.to(card, {
      y: () => -50 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
    triggers.push(tween);
  });

  return () => {
    triggers.forEach((tween) => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });
  };
};

/**
 * Initializes subtle twinkling animation for starfield
 * @param containerSelector - Container element selector
 * @returns Cleanup function
 */
export const initStarfieldAnimation = (
  containerSelector: string
): (() => void) => {
  if (typeof window === 'undefined') return () => { };

  const container = document.querySelector(containerSelector);
  if (!container) return () => { };

  const stars = container.querySelectorAll('.star');
  const timelines: gsap.core.Timeline[] = [];

  stars.forEach((star) => {
    const timeline = gsap.timeline({ repeat: -1, yoyo: true });
    timeline.to(star, {
      opacity: Math.random() * 0.3 + 0.2,
      duration: Math.random() * 2 + 2,
      delay: Math.random() * 4,
      ease: 'sine.inOut',
    });
    timelines.push(timeline);
  });

  return () => {
    timelines.forEach((timeline) => timeline.kill());
  };
};

/**
 * Initializes fade-in animation on scroll
 * @param selector - CSS selector for elements to animate
 * @returns Cleanup function
 */
export const initFadeInOnScroll = (selector: string): (() => void) => {
  if (typeof window === 'undefined') return () => { };

  const elements = document.querySelectorAll(selector);
  const triggers: ScrollTrigger[] = [];

  elements.forEach((element) => {
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        });
      },
    });
    triggers.push(trigger);
  });

  return () => {
    triggers.forEach((trigger) => trigger.kill());
  };
};

/**
 * Refresh ScrollTrigger instances (useful after layout changes)
 */
export const refreshScrollTriggers = (): void => {
  if (typeof window !== 'undefined') {
    ScrollTrigger.refresh();
  }
};

/**
 * Kill all ScrollTrigger instances
 */
export const killAllScrollTriggers = (): void => {
  if (typeof window !== 'undefined') {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
};

const teamScrollAnimations = {
  initTeamParallax,
  initFloatingCardParallax,
  initStarfieldAnimation,
  initFadeInOnScroll,
  refreshScrollTriggers,
  killAllScrollTriggers,
};

export default teamScrollAnimations;
