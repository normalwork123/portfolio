"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import BadgePhysics from "@/components/three/BadgePhysics";

export default function Hero() {
  const prefersReduced = useReducedMotion();

  const ease = [0.22, 1, 0.36, 1] as const;

  const enter = (delay: number) => ({
    initial: { opacity: 0, y: prefersReduced ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease },
  });

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden px-6"
    >
      {/* Physics Badge Overlay */}
<div className="pointer-events-auto absolute inset-0 z-[2]">
  <BadgePhysics />
</div>
      {/* Atmosphere */}
      <div className="hero-glow pointer-events-none absolute inset-0 -z-[5]" />

      <div className="pointer-events-none absolute inset-0 -z-[4] bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.6))]" />

      {/* Content */}
      <div className="relative z-0 mx-auto w-full max-w-6xl py-24">
        <div className="max-w-2xl">
          <motion.span
            {...enter(0)}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.08] px-4 py-1.5 text-sm text-accent shadow-glow"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Available for work
          </motion.span>

          <motion.h1
            {...enter(0.1)}
            className="text-display font-bold tracking-tightest"
          >
            Harsh Rai
            <span className="mt-1 block text-gold-gradient">
              Frontend Developer
            </span>
          </motion.h1>

          <motion.p
            {...enter(0.22)}
            className="mt-7 max-w-2xl text-lg leading-relaxed text-white/65"
          >
            I build immersive, performant web experiences with React, Next.js,
            and WebGL — blending clean engineering with cinematic design.
          </motion.p>

          <motion.div
            {...enter(0.34)}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <a
              href="#work"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-semibold text-background shadow-glow transition-transform duration-300 hover:scale-[1.03]"
            >
              View My Work

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 font-semibold text-white/90 transition-colors duration-300 hover:border-accent/60 hover:text-accent"
            >
              Get in Touch
            </a>
          </motion.div>
        </div>
      </div>

      <a
        href="#work"
        aria-label="Scroll to work"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 transition-colors hover:text-accent"
      >
        <ChevronDown className="animate-bounce" size={28} />
      </a>
    </section>
  );
}