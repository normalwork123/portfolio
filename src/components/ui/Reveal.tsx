"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  readonly children: ReactNode;
  /** Stagger delay in seconds for sequenced entrances. */
  readonly delay?: number;
  /** Vertical offset the element travels on entrance. */
  readonly y?: number;
  readonly className?: string;
  /** Render as a list item / other element instead of a div. */
  readonly as?: "div" | "li" | "article" | "span";
}

/**
 * Scroll-triggered reveal primitive.
 *
 * Animations only fire when the element enters the viewport (`whileInView`),
 * run once, and are fully disabled for users who prefer reduced motion. This
 * keeps entrances cinematic without firing off-screen work on mount.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
}: RevealProps) {
  const prefersReduced = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : y },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </MotionTag>
  );
}
