"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";

/**
 * Thin fixed progress bar pinned to the top edge, driven by page scroll.
 *
 * The gold gradient ties it into the cinematic scroll narrative rather than
 * reading as a generic loading bar. Under `prefers-reduced-motion` the spring
 * smoothing is dropped so the bar tracks scroll position directly with no
 * easing/overshoot.
 */
export default function ScrollProgress() {
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const smoothed = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const scaleX = prefersReduced ? scrollYProgress : smoothed;

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-accent-deep via-accent to-accent-bright"
    />
  );
}
