"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * Scroll Journey Line — a winding, multi-waypoint narrative rail.
 *
 * As the page scrolls (Hero → Work → About → Certificates → Contact) a gold
 * gradient draws itself along an S-curved path that weaves left↔right, a bright
 * dot travels the exact current scroll position along that curve, and a short
 * step caption highlights at each waypoint as the dot passes.
 *
 * Layout discipline — the whole thing lives in the LEFT GUTTER, right-anchored
 * so its curve hugs the content column's left edge and never crosses into the
 * `max-w-6xl` content (which carries all real text/interaction). The lane width
 * is the measured gutter (`50vw - 37.5rem`); the weave band and captions size
 * themselves to whatever room the gutter offers, so captions only appear on
 * genuinely wide viewports and simply drop out (curve + dot remain) when space
 * is tight. Hidden entirely below `lg`, where the content is near full-width.
 *
 * Mechanics reuse the site's scroll pattern (see `ScrollProgress`): `useScroll`
 * → `useSpring` → the smoothed progress drives BOTH the stroke reveal
 * (`stroke-dashoffset`) and the dot (`getPointAtLength`) from the *same* value +
 * the *same* measured path length, so they can never desync. `getTotalLength()`
 * feeds a dynamic `stroke-dasharray`, recomputed whenever the path is rebuilt
 * (mount / resize). Under `prefers-reduced-motion` the spring is dropped and
 * everything snaps directly to scroll position.
 *
 * Purely decorative: `pointer-events: none`, `aria-hidden`, `z-0` (below the
 * hero badge's `z-[2]`) — it shares no stacking context with the ID card.
 */

interface Waypoint {
  x: number;
  y: number;
}

interface Step {
  title: string;
  caption: string;
  /** Horizontal position of this waypoint as a fraction of the weave band. */
  xFrac: number;
}

// One waypoint per major section. `xFrac` alternates to force a visible weave.
const STEPS: Step[] = [
  { title: "The beginning", caption: "Where the idea takes its first shape.", xFrac: 0.35 },
  { title: "The craft", caption: "Real problems, real products, built end to end.", xFrac: 0.72 },
  { title: "The approach", caption: "How the work actually gets done.", xFrac: 0.4 },
  { title: "The proof", caption: "Credentials that back up the craft.", xFrac: 0.68 },
  { title: "The next step", caption: "Where this journey meets yours.", xFrac: 0.33 },
];

// Horizontal span (px) the weave occupies inside the lane; capped by the gutter.
const MAX_BAND = 96;
// Vertical padding (fraction of viewport height) above the first / below the
// last waypoint, so the curve doesn't run flush into the screen edges.
const Y_PAD = 0.1;
// Captions render only when the gutter leaves at least this much clear width
// to the left of the weave — otherwise there isn't room without crowding.
const CAPTION_MIN_WIDTH = 220;

/**
 * Build a smooth cubic-bezier path through the waypoints. Control points sit at
 * the vertical midpoint between neighbours (sharing each end's x), so the curve
 * flows through every waypoint without kinking.
 */
function buildPath(points: Waypoint[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x.toFixed(2)} ${midY.toFixed(2)}, ${curr.x.toFixed(
      2
    )} ${midY.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
  }
  return d;
}

/**
 * A single step caption. Its own component so each can own a `useTransform`
 * hook (hook count stays constant — STEPS is fixed length). Rests at 40%
 * opacity and rises to full as the dot passes its scroll fraction.
 */
function Caption({
  progress,
  center,
  y,
  rightInset,
  width,
  title,
  caption,
}: {
  progress: MotionValue<number>;
  center: number;
  y: number;
  rightInset: number;
  width: number;
  title: string;
  caption: string;
}) {
  const opacity = useTransform(
    progress,
    [center - 0.14, center, center + 0.14],
    [0.4, 1, 0.4]
  );

  return (
    <motion.div
      style={{
        position: "absolute",
        top: y,
        right: rightInset,
        width,
        transform: "translateY(-50%)",
        textAlign: "right",
        opacity,
      }}
    >
      <div className="text-xs font-semibold uppercase tracking-widest text-accent-bright">
        {title}
      </div>
      <div className="mt-1 text-xs leading-snug text-white/60">{caption}</div>
    </motion.div>
  );
}

export default function ScrollJourney() {
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const smoothed = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  // Single source of truth for both the stroke reveal and the dot position.
  const progress = prefersReduced ? scrollYProgress : smoothed;

  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  // Measured lane size in px (gutter width × viewport height).
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = (): void =>
      setDims({ w: el.clientWidth, h: el.clientHeight });
    measure();

    // ResizeObserver catches viewport changes (gutter grows/shrinks) so the
    // path length recalculates without a manual resize listener race.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Weave band width, clamped to whatever the gutter actually offers.
  const band = Math.min(MAX_BAND, dims.w);

  const waypoints = useMemo<Waypoint[]>(() => {
    if (dims.w <= 0 || dims.h <= 0) return [];
    const top = dims.h * Y_PAD;
    const usableH = dims.h * (1 - 2 * Y_PAD);
    const denom = Math.max(1, STEPS.length - 1);
    // Right-anchor the band against the content edge: x = (w - band) + frac·band.
    return STEPS.map((s, i) => ({
      x: dims.w - band + s.xFrac * band,
      y: top + (i / denom) * usableH,
    }));
  }, [dims.w, dims.h, band]);

  const pathD = useMemo(() => buildPath(waypoints), [waypoints]);

  const [length, setLength] = useState(0);
  useEffect(() => {
    const path = pathRef.current;
    if (!path || !pathD) {
      setLength(0);
      return;
    }
    setLength(path.getTotalLength());
  }, [pathD]);

  // Stroke reveal: progress 0 → dashoffset = length (undrawn); 1 → 0 (drawn).
  const dashoffset = useTransform(progress, [0, 1], [length, 0]);

  // Traveling dot — same `progress` and same `length` as the stroke, so the two
  // are mathematically locked together at any scroll speed.
  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);

  const syncDot = (v: number): void => {
    const path = pathRef.current;
    if (!path || length <= 0) return;
    const pt = path.getPointAtLength(Math.max(0, Math.min(1, v)) * length);
    dotX.set(pt.x);
    dotY.set(pt.y);
  };
  useMotionValueEvent(progress, "change", syncDot);
  // Prime the dot once the path is measured (event only fires on change).
  useEffect(() => {
    syncDot(progress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, pathD]);

  const captionWidth = dims.w - band - 12;
  const showCaptions = captionWidth >= CAPTION_MIN_WIDTH;
  const denom = Math.max(1, STEPS.length - 1);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-y-0 left-0 z-0 hidden lg:block"
      // Lane = the left gutter; its right edge meets the content column's left
      // edge (half of max-w-6xl = 37.5rem). Clamped ≥ 0 when the gutter closes.
      style={{ width: "max(0px, calc(50vw - 37.5rem))" }}
    >
      {dims.w > 0 && dims.h > 0 && pathD && (
        <>
          <svg
            width={dims.w}
            height={dims.h}
            viewBox={`0 0 ${dims.w} ${dims.h}`}
            fill="none"
            className="absolute inset-0"
          >
            <defs>
              <linearGradient id="journey-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#a87f2a" />
                <stop offset="0.5" stopColor="#d4a843" />
                <stop offset="1" stopColor="#f0c75e" />
              </linearGradient>
            </defs>

            {/* Road ahead — faint, always fully visible. */}
            <path
              d={pathD}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />

            {/* Drawn portion — gold gradient revealed by scroll. */}
            <motion.path
              ref={pathRef}
              d={pathD}
              stroke="url(#journey-gradient)"
              strokeWidth={2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ strokeDasharray: length, strokeDashoffset: dashoffset }}
            />

            {/* Traveling dot: soft halo + bright core at the scroll position. */}
            <motion.circle
              cx={dotX}
              cy={dotY}
              r={9}
              fill="#f0c75e"
              opacity={0.18}
            />
            <motion.circle cx={dotX} cy={dotY} r={4.5} fill="#f0c75e" />
          </svg>

          {showCaptions &&
            waypoints.map((wp, i) => (
              <Caption
                key={STEPS[i].title}
                progress={progress}
                center={i / denom}
                y={wp.y}
                // Sit to the LEFT of the weave (toward the viewport edge),
                // right-aligned against the curve.
                rightInset={band + 12}
                width={captionWidth}
                title={STEPS[i].title}
                caption={STEPS[i].caption}
              />
            ))}
        </>
      )}
    </div>
  );
}
