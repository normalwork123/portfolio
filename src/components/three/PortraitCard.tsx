"use client";

import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useReducedMotion,
  useAnimationFrame,
} from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";

/**
 * Luxury suspended portrait card.
 *
 * Goal
 * ----
 * The card should read as a premium identity badge hanging from a point ABOVE
 * the portrait — with real weight, inertia and a slow pendulum swing — rather
 * than an interactive floating glass panel. Three systems create that:
 *
 *   1. SUSPENDED PIVOT. The 3D stage rotates around `transformOrigin` set above
 *      the card, so every tilt and the idle swing arc from a point overhead.
 *      This single cue is what makes it feel hung rather than centred.
 *
 *   2. PHYSICS MOTION. The pointer sets a target; under-damped springs chase it,
 *      overshooting and settling (no snapping). Each depth layer has its OWN
 *      spring, softer the further it sits from the frame, so layers lag with
 *      independent inertia — portrait trails frame, reflection trails portrait,
 *      glow trails everything. A slow, non-harmonic pendulum keeps it alive when
 *      untouched.
 *
 *   3. DEPTH (preserve-3d). Layers are pushed far apart in Z so the portrait is
 *      physically in front of the frame, glass ahead again:
 *        ground shadow (far -Z) | glow | backplate | frame(0) |
 *        portrait(+120) | glass/specular(+180)
 *      The ground shadow reads the live tilt + swing, shifting, stretching and
 *      softening like a real cast shadow.
 *
 * All motion is GPU transform/opacity only. Reduced-motion users get a static,
 * fully-composed card; small screens keep the look at a reduced scale.
 */

interface PortraitCardProps {
  readonly src?: string;
  readonly alt?: string;
}

export default function PortraitCard({
  src = "/hars.png",
  alt = "Portrait",
}: PortraitCardProps) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Raw, normalised pointer target in [-0.5, 0.5]. Springs chase these.
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // Idle drift offsets (organic, non-looping). Updated every frame.
  const driftX = useMotionValue(0);
  const driftY = useMotionValue(0);
  // Slow pendulum swing angle (deg) around the raised pivot.
  const swing = useMotionValue(0);

  const [hovered, setHovered] = useState(false);

  // PER-LAYER SPRINGS ------------------------------------------------------
  // Each depth layer chases the pointer with its own spring. Lower stiffness +
  // higher mass the further the layer sits from the frame, so closer layers
  // arrive first and deeper/closer-to-camera layers visibly lag — independent
  // inertia per layer. All are under-damped so they overshoot and swing back
  // (pendulum settle) instead of snapping when the pointer stops moving.
 const frameX = useSpring(px, { stiffness: 45, damping: 10, mass: 2.2 });
const frameY = useSpring(py, { stiffness: 45, damping: 10, mass: 2.2 });

const portraitSX = useSpring(px, { stiffness: 32, damping: 9, mass: 2.8 });
const portraitSY = useSpring(py, { stiffness: 32, damping: 9, mass: 2.8 });

const reflSX = useSpring(px, { stiffness: 22, damping: 8, mass: 3.5 });

const glowSX = useSpring(px, { stiffness: 14, damping: 10, mass: 4.5 });
const glowSY = useSpring(py, { stiffness: 14, damping: 10, mass: 4.5 });

  // Card tilt is driven by the frame spring (its momentum/overshoot included)
  // plus the slow pendulum swing — this is what gives the weighty hang.
  const rotateY = useTransform<number, number>(
    [frameX, swing],
    ([x, s]) => x * 24 + s
  );
  const rotateX = useTransform(frameY, (y) => -y * 20);
  // Pendulum roll around the overhead pivot — the dominant "hanging" motion.
  const rotateZ = useTransform(swing, (s) => s * 0.9);

  // Slow pendulum + heavy idle. Low frequencies + non-harmonic ratios never
  // repeat and read like a pendant settling, not a card hovering. The swing is
  // the lead term; the small x/y drift just stops it feeling locked.
  useAnimationFrame((t) => {
    if (prefersReduced) return;
    const s = t / 1000;
    swing.set(Math.sin(s * 0.34) * 2.4 + Math.sin(s * 0.19 + 1.1) * 1.1);
    driftY.set(Math.sin(s * 0.22) * 9 + Math.sin(s * 0.11 + 1.7) * 5);
    driftX.set(Math.sin(s * 0.16 + 0.6) * 6 + Math.sin(s * 0.09) * 3);
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (prefersReduced) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  // Releasing returns the target to centre; the under-damped springs swing the
  // card back through centre and settle, rather than easing flatly to rest.
  const handlePointerLeave = (): void => {
    setHovered(false);
    px.set(0);
    py.set(0);
  };

  // Per-layer parallax offsets. Each reads its OWN spring, so the offsets carry
  // that layer's independent inertia (frame leads, portrait/reflection/glow lag).
  const glowX = useTransform(glowSX, (v) => v * -55);
  const glowY = useTransform(glowSY, (v) => v * -55);
  const backplateX = useTransform(portraitSX, (v) => v * 14);
  const backplateY = useTransform(portraitSY, (v) => v * 14);
  const portraitX = useTransform(portraitSX, (v) => v * 34); // trails the frame
  const portraitY = useTransform(portraitSY, (v) => v * 34);
  const portraitReflX = useTransform(reflSX, (v) => v * 52); // trails the portrait
  const frameSpecularX = useTransform(reflSX, (v) => v * 80);
  const frameReflX = useTransform(reflSX, (v) => 50 + v * 150); // glass sweep

  // Ground shadow reads tilt AND the pendulum swing, so it shifts, stretches
  // and softens like a real cast shadow tracking the hanging card.
  const shadowX = useTransform<number, number>(
    [frameX, swing],
    ([v, s]) => v * 90 + s * 6
  );
  const shadowSkew = useTransform<number, number>(
    [frameX, swing],
    ([v, s]) => v * 18 + s * 1.2
  );
  const shadowScale = useTransform(frameY, (v) => 1 + Math.abs(v) * 0.2);

  // DYNAMIC LIGHT RESPONSE -------------------------------------------------
  // Reads the live frame spring (with its momentum), so the gold edge light
  // pools toward the tilt and the glass reflection brightens at grazing angles
  // — and keeps reacting during the swing-back.
  const angle = useTransform<number, number>(
    [frameX, frameY],
    ([x, y]) => (Math.atan2(y, x) * 180) / Math.PI + 90
  );
  const edgeGlow = useMotionTemplate`conic-gradient(from ${angle}deg at 50% 50%, rgba(240,199,94,0.55), rgba(212,168,67,0.05) 25%, rgba(168,127,42,0.05) 60%, rgba(240,199,94,0.55))`;

  const grazing = useTransform<number, number>(
    [frameX, frameY],
    ([x, y]) => Math.min(1, Math.hypot(x, y) * 2)
  );
  const reflectionOpacity = useTransform(grazing, (g) =>
    Math.min(0.95, 0.35 + g * 0.6 + (hovered ? 0.15 : 0))
  );
  const edgeOpacity = useTransform(grazing, (g) => 0.3 + g * 0.55);

  // ENTRANCE: emerge from darkness, rotate in, settle with inertia. Driven by
  // animate props so it runs once on mount, independent of idle/pointer motion.
  const entrance = prefersReduced
    ? { opacity: 1, rotateY: 0, rotateX: 0, scale: 1, y: 0 }
    : { opacity: [0, 1], rotateY: [-32, 0], rotateX: [10, 0], scale: [0.86, 1], y: [40, 0] };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={handlePointerLeave}
      className="relative flex items-center justify-center"
      style={{ perspective: 1500 }}
    >
      {/* CINEMATIC GROUND SHADOW (far -Z, physically separated from the card) */}
      <motion.div
        aria-hidden
        className="absolute -z-10 h-20 w-[90%] rounded-[50%] bg-black/80 blur-[40px]"
        style={{
          bottom: "-4rem",
          x: prefersReduced ? 0 : shadowX,
          skewX: prefersReduced ? 0 : shadowSkew,
          scaleX: prefersReduced ? 1 : shadowScale,
          opacity: hovered ? 0.55 : 0.85, // softens as the badge lifts
          transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1)",
        }}
      />

      {/* 3D STAGE — suspended from a point above (raised transform origin).
          Entrance runs once on mount. */}
      <motion.div
        className="relative aspect-[3/4] w-[300px] sm:w-[360px] lg:w-[420px]"
        initial={false}
        animate={entrance}
        transition={{
          duration: 1.4,
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.9 },
        }}
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "50% -28%", // pivot ABOVE the card — the "hang" cue
          rotateX: prefersReduced ? 0 : rotateX,
          rotateY: prefersReduced ? 0 : rotateY,
          rotateZ: prefersReduced ? 0 : rotateZ,
          x: prefersReduced ? 0 : driftX,
          y: prefersReduced ? 0 : driftY,
          willChange: "transform",
        }}
      >
        {/* BACKGROUND GLOW LAYER (deepest, far behind the frame) */}
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(circle_at_50%_40%,rgba(212,168,67,0.55),transparent_65%)] blur-3xl"
          style={{
            transform: "translateZ(-220px) scale(1.45)",
            x: prefersReduced ? 0 : glowX,
            y: prefersReduced ? 0 : glowY,
          }}
        />

        {/* AMBIENT LIGHT LAYER */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-[2.5rem] bg-[conic-gradient(from_140deg_at_50%_50%,rgba(240,199,94,0.18),transparent_30%,rgba(168,127,42,0.14),transparent_70%)] blur-xl"
          style={{ transform: "translateZ(-110px) scale(1.15)" }}
        />

        {/* DEPTH-BLUR BACKPLATE behind the subject (sits between frame and
            portrait) — gives the cutout something soft to read against. */}
        <motion.div
          aria-hidden
          className="absolute inset-5 overflow-hidden rounded-[1.6rem]"
          style={{
            transform: "translateZ(40px)",
            x: prefersReduced ? 0 : backplateX,
            y: prefersReduced ? 0 : backplateY,
          }}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="420px"
            aria-hidden
            className="scale-110 object-cover opacity-40 blur-md saturate-50"
            draggable={false}
          />
          <div className="absolute inset-0 bg-background/40" />
        </motion.div>

        {/* FRAME LAYER (glassmorphism) — translateZ(0) */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[1.9rem] border border-white/15 bg-white/[0.04] shadow-glow-lg backdrop-blur-[3px]"
          style={{ transform: "translateZ(0px)" }}
        >
          {/* Inner highlight + frosted top edge */}
          <div className="pointer-events-none absolute inset-0 rounded-[1.9rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_0_50px_rgba(212,168,67,0.1)]" />
        </div>

        {/* DYNAMIC GOLD EDGE ILLUMINATION — pools toward the pointer/light. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.9rem] p-[1.5px]"
          style={{
            transform: "translateZ(2px)",
            background: prefersReduced
              ? "conic-gradient(from 90deg at 50% 50%, rgba(240,199,94,0.5), rgba(168,127,42,0.05) 50%, rgba(240,199,94,0.5))"
              : edgeGlow,
            opacity: prefersReduced ? 0.5 : edgeOpacity,
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        {/* STRONG CONTACT SHADOW the raised portrait casts onto the frame */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-4 rounded-[1.6rem] shadow-[0_50px_90px_-20px_rgba(0,0,0,0.95)]"
          style={{ transform: "translateZ(60px)" }}
        />

        {/* PORTRAIT LAYER — raised subject, trails the frame with its own spring. */}
        <motion.div
          className="absolute inset-4 overflow-hidden rounded-[1.5rem]"
          style={{
            transform: "translateZ(120px)",
            x: prefersReduced ? 0 : portraitX,
            y: prefersReduced ? 0 : portraitY,
            scale: hovered && !prefersReduced ? 1.04 : 1,
            transition: "scale 0.6s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-[14px] p-[18px] flex items-center justify-center w-full h-full">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(max-width: 640px) 300px, (max-width: 1024px) 360px, 420px"
                  priority
                  className="rounded-[0.8rem] object-cover"
                  draggable={false}
                />
              </div>
            </div>
          </div>

          {/* Cinematic vignette grounding the subject */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(0,0,0,0.7))]" />

          {/* STRONG gold rim light hugging the subject edge */}
          <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] shadow-[inset_0_0_45px_rgba(212,168,67,0.5),inset_0_-16px_40px_rgba(0,0,0,0.6)]" />

          {/* Reflection sweep ON the portrait — trails the portrait (slower spring) */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-y-8 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            style={{
              left: prefersReduced ? "60%" : portraitReflX,
              x: "-50%",
              rotate: 14,
              opacity: hovered ? 0.7 : 0.3,
            }}
          />
        </motion.div>

        {/* TOP GLASS REFLECTION / SPECULAR SWEEP (closest layer) translateZ(180) */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.9rem]"
          style={{
            transform: "translateZ(180px)",
            x: prefersReduced ? 0 : frameSpecularX,
          }}
        >
          <motion.div
            className="absolute -inset-y-12 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            style={{
              left: prefersReduced ? "50%" : frameReflX,
              rotate: 18,
              opacity: prefersReduced ? 0.45 : reflectionOpacity,
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
