"use client";

import { useEffect, useRef } from "react";

/**
 * Volumetric plasma comet cursor (WebGL).
 *
 * A small, intensely bright head glides after the pointer, trailing hundreds of
 * tiny plasma wisps. Each wisp is an additively-blended GL point with a sharp
 * bright core and a soft halo (per-fragment falloff), so the trail keeps crisp
 * detail and high contrast instead of melting into one blurred blob. Wisps are
 * pushed by a curl-noise flow field and age through four zones —
 *   core (white + gold) → hot plasma (orange/amber) → cooling gas (yellow→green)
 *   → dissipation (soft green → gone).
 * Emission is laid along the head's travel path, so fast movement stretches the
 * trail and reads as velocity/direction.
 *
 * Why WebGL over Canvas2D: this look needs many hundreds of small, sharp,
 * additive sprites with per-particle colour and a non-uniform (core vs halo)
 * falloff. Canvas2D can only stamp pre-blurred bitmaps, which is precisely the
 * "blurry brush" failure mode. A single dynamic point buffer on a dedicated,
 * self-contained GL context renders the whole field in one draw call at 60fps,
 * fully isolated from the React Three Fiber scene.
 *
 * Disabled entirely on touch devices and under `prefers-reduced-motion`; the
 * loop pauses when the tab is hidden and all GL resources are released on
 * unmount.
 */
export default function CometCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Gate: mouse-driven pointers only, respect the reduced-motion opt-out.
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!finePointer || coarsePointer || prefersReduced) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
      depth: false,
    });
    if (!gl) return;

    // ------------------------------------------------------------- shaders
    const VERT = `
      attribute vec2 a_pos;      // css pixels
      attribute float a_size;    // css pixels
      attribute vec4 a_color;    // rgb + alpha
      uniform vec2 u_res;
      uniform float u_dpr;
      varying vec4 v_color;
      void main() {
        vec2 clip = (a_pos / u_res) * 2.0 - 1.0;
        clip.y = -clip.y;
        gl_Position = vec4(clip, 0.0, 1.0);
        gl_PointSize = a_size * u_dpr;
        v_color = a_color;
      }
    `;
    const FRAG = `
      precision mediump float;
      varying vec4 v_color;
      void main() {
        // Radial distance across the point sprite (0 = centre, 1 = edge).
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        float s = 1.0 - d;
        // Soft halo + a tight, bright core => contrast, not uniform blur.
        float halo = pow(s, 2.4);
        float core = pow(s, 9.0);
        float intensity = halo * 0.55 + core * 1.7;
        float alpha = v_color.a * intensity;
        gl_FragColor = vec4(v_color.rgb, alpha);
      }
    `;

    const compile = (type: number, src: string): WebGLShader | null => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const a_pos = gl.getAttribLocation(program, "a_pos");
    const a_size = gl.getAttribLocation(program, "a_size");
    const a_color = gl.getAttribLocation(program, "a_color");
    const u_res = gl.getUniformLocation(program, "u_res");
    const u_dpr = gl.getUniformLocation(program, "u_dpr");

    // ------------------------------------------------------------- GL state
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive
    gl.clearColor(0, 0, 0, 0);

    // Interleaved vertex buffer: [x, y, size, r, g, b, a] per point.
    const STRIDE = 7;
    const MAX_PARTICLES = 1000;
    const HEAD_POINTS = 3;
    const MAX_VERTS = MAX_PARTICLES + HEAD_POINTS;
    const packed = new Float32Array(MAX_VERTS * STRIDE);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, packed.byteLength, gl.DYNAMIC_DRAW);
    const BYTES = 4;
    gl.enableVertexAttribArray(a_pos);
    gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, STRIDE * BYTES, 0);
    gl.enableVertexAttribArray(a_size);
    gl.vertexAttribPointer(a_size, 1, gl.FLOAT, false, STRIDE * BYTES, 2 * BYTES);
    gl.enableVertexAttribArray(a_color);
    gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, STRIDE * BYTES, 3 * BYTES);

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = (): void => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u_res, width, height);
      gl.uniform1f(u_dpr, dpr);
    };
    resize();

    // ------------------------------------------------------------- helpers
    const clamp = (v: number, lo: number, hi: number): number =>
      v < lo ? lo : v > hi ? hi : v;
    const smooth = (t: number): number => t * t * (3 - 2 * t);

    // Four-zone colour ramp. Green is kept muted/desaturated and only appears in
    // the cooling tail so it never reads as artificial neon.
    const STOPS: ReadonlyArray<readonly [number, number, number, number]> = [
      [0.0, 1.0, 0.98, 0.9], // core: white-gold
      [0.12, 1.0, 0.85, 0.55], // warm gold
      [0.28, 1.0, 0.6, 0.25], // hot orange
      [0.42, 0.96, 0.46, 0.16], // amber
      [0.58, 0.86, 0.66, 0.22], // cooling yellow
      [0.72, 0.56, 0.62, 0.26], // yellow-green
      [0.86, 0.3, 0.5, 0.31], // muted emerald
      [1.0, 0.2, 0.42, 0.28], // soft green (dissipating)
    ];
    const rampCol = new Float32Array(3);
    const sampleRamp = (t: number): void => {
      const x = clamp(t, 0, 1);
      for (let i = 1; i < STOPS.length; i += 1) {
        const b = STOPS[i];
        if (x <= b[0]) {
          const aStop = STOPS[i - 1];
          const k = (x - aStop[0]) / (b[0] - aStop[0] || 1);
          rampCol[0] = aStop[1] + (b[1] - aStop[1]) * k;
          rampCol[1] = aStop[2] + (b[2] - aStop[2]) * k;
          rampCol[2] = aStop[3] + (b[3] - aStop[3]) * k;
          return;
        }
      }
      const last = STOPS[STOPS.length - 1];
      rampCol[0] = last[1];
      rampCol[1] = last[2];
      rampCol[2] = last[3];
    };

    // Cheap sin-hash 3D value noise -> smooth curl field.
    const hash = (x: number, y: number, z: number): number => {
      const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
      return s - Math.floor(s);
    };
    const noise = (x: number, y: number, z: number): number => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const zi = Math.floor(z);
      const xf = smooth(x - xi);
      const yf = smooth(y - yi);
      const zf = smooth(z - zi);
      const l = (a: number, b: number, t: number): number => a + (b - a) * t;
      const c00 = l(hash(xi, yi, zi), hash(xi + 1, yi, zi), xf);
      const c10 = l(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), xf);
      const c01 = l(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), xf);
      const c11 = l(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), xf);
      return l(l(c00, c10, yf), l(c01, c11, yf), zf);
    };

    // ------------------------------------------------------- particle pool
    const px = new Float32Array(MAX_PARTICLES);
    const py = new Float32Array(MAX_PARTICLES);
    const pvx = new Float32Array(MAX_PARTICLES);
    const pvy = new Float32Array(MAX_PARTICLES);
    const page = new Float32Array(MAX_PARTICLES);
    const pttl = new Float32Array(MAX_PARTICLES);
    const psize = new Float32Array(MAX_PARTICLES);
    const pgrow = new Float32Array(MAX_PARTICLES);
    const pseed = new Float32Array(MAX_PARTICLES);
    const pbright = new Float32Array(MAX_PARTICLES);
    const palive = new Uint8Array(MAX_PARTICLES);
    const freeList: number[] = [];
    for (let i = MAX_PARTICLES - 1; i >= 0; i -= 1) freeList.push(i);

    const head = { x: 0, y: 0, vx: 0, vy: 0 };
    const targetPos = { x: 0, y: 0 };
    let pointerSeen = false;

    const handlePointer = (e: PointerEvent): void => {
      targetPos.x = e.clientX;
      targetPos.y = e.clientY;
      if (!pointerSeen) {
        head.x = e.clientX;
        head.y = e.clientY;
        pointerSeen = true;
      }
    };

    const spawn = (x: number, y: number): void => {
      const i = freeList.pop();
      if (i === undefined) return; // hard cap reached
      px[i] = x + (Math.random() - 0.5) * 3;
      py[i] = y + (Math.random() - 0.5) * 3;
      // Inherit a little head momentum (velocity/direction) + fine drift.
      pvx[i] = head.vx * 0.28 + (Math.random() - 0.5) * 36;
      pvy[i] = head.vy * 0.28 + (Math.random() - 0.5) * 36;
      page[i] = 0;
      pttl[i] = 0.6 + Math.random() * 0.7;
      psize[i] = 1.6 + Math.random() * 3.2; // tiny wisps
      pgrow[i] = 1.3 + Math.random() * 1.1;
      pseed[i] = Math.random() * 100;
      pbright[i] = 0.75 + Math.random() * 0.5;
      palive[i] = 1;
    };

    // --------------------------------------------------------- flow field
    const NOISE_FREQ = 0.0022;
    const NOISE_TIME = 0.00022; // per ms
    const EPS = 5;
    const TURB = 1600;
    const DRAG_K = 1.9;

    let emitAcc = 0;

    const frameStep = (dt: number, nowMs: number): number => {
      // Head easing (frame-rate independent glide).
      const a = 1 - Math.exp(-16 * dt);
      const prevX = head.x;
      const prevY = head.y;
      head.x += (targetPos.x - head.x) * a;
      head.y += (targetPos.y - head.y) * a;
      head.vx = (head.x - prevX) / dt;
      head.vy = (head.y - prevY) / dt;

      // Emission laid along the travel path => continuous, direction-aware trail.
      let vi = 0;
      if (pointerSeen) {
        const moved = Math.hypot(head.x - prevX, head.y - prevY);
        emitAcc += 40 * dt + moved * 1.4;
        const n = Math.floor(emitAcc);
        emitAcc -= n;
        for (let s = 0; s < n; s += 1) {
          const f = n > 1 ? s / (n - 1) : 1;
          spawn(prevX + (head.x - prevX) * f, prevY + (head.y - prevY) * f);
        }
      }

      // Advance + pack live particles.
      const tz = nowMs * NOISE_TIME;
      const damp = Math.exp(-DRAG_K * dt);
      for (let i = 0; i < MAX_PARTICLES; i += 1) {
        if (!palive[i]) continue;
        page[i] += dt;
        const t = page[i] / pttl[i];
        if (t >= 1) {
          palive[i] = 0;
          freeList.push(i);
          continue;
        }

        // Curl of a scalar noise potential = divergence-free swirl (curl/fold).
        const nx = px[i] * NOISE_FREQ;
        const ny = py[i] * NOISE_FREQ;
        const sz = tz + pseed[i];
        const dPdx =
          noise(nx + EPS * NOISE_FREQ, ny, sz) -
          noise(nx - EPS * NOISE_FREQ, ny, sz);
        const dPdy =
          noise(nx, ny + EPS * NOISE_FREQ, sz) -
          noise(nx, ny - EPS * NOISE_FREQ, sz);
        pvx[i] += dPdy * TURB * dt;
        pvy[i] += -dPdx * TURB * dt;
        pvx[i] *= damp;
        pvy[i] *= damp;
        px[i] += pvx[i] * dt;
        py[i] += pvy[i] * dt;

        const size = psize[i] * (1 + t * pgrow[i]);
        const fadeIn = smooth(clamp(t / 0.1, 0, 1));
        const fadeOut = 1 - smooth(clamp((t - 0.4) / 0.6, 0, 1));
        // Subtle per-particle flicker keeps the field alive frame to frame.
        const flick = 0.85 + 0.15 * Math.sin(nowMs * 0.012 + pseed[i] * 6.0);
        const alpha = fadeIn * fadeOut * 0.5 * pbright[i] * flick;

        sampleRamp(t);
        const o = vi * STRIDE;
        packed[o] = px[i];
        packed[o + 1] = py[i];
        packed[o + 2] = size;
        packed[o + 3] = rampCol[0];
        packed[o + 4] = rampCol[1];
        packed[o + 5] = rampCol[2];
        packed[o + 6] = alpha;
        vi += 1;
      }

      // Comet head: three stacked points => tiny, intensely bright golden core.
      if (pointerSeen) {
        const pulse = 1 + 0.05 * Math.sin(nowMs * 0.007);
        const writeHead = (size: number, r: number, g: number, b: number, al: number): void => {
          const o = vi * STRIDE;
          packed[o] = head.x;
          packed[o + 1] = head.y;
          packed[o + 2] = size * pulse;
          packed[o + 3] = r;
          packed[o + 4] = g;
          packed[o + 5] = b;
          packed[o + 6] = al;
          vi += 1;
        };
        writeHead(22, 1.0, 0.72, 0.36, 0.5); // golden halo
        writeHead(13, 1.0, 0.9, 0.7, 0.85); // warm mid
        writeHead(9, 1.0, 1.0, 0.98, 1.0); // white core (brightest point)
      }

      return vi;
    };

    // ------------------------------------------------------------- loop
    let raf = 0;
    let running = false;
    let last = performance.now();
    const frame = (now: number): void => {
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05;

      const count = frameStep(dt, now);

      gl.clear(gl.COLOR_BUFFER_BIT);
      if (count > 0) {
        gl.bufferSubData(
          gl.ARRAY_BUFFER,
          0,
          packed.subarray(0, count * STRIDE)
        );
        gl.drawArrays(gl.POINTS, 0, count);
      }
      raf = requestAnimationFrame(frame);
    };
    const start = (): void => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = (): void => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const handleVisibility = (): void => {
      if (document.hidden) stop();
      else start();
    };

    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);
    start();

    return () => {
      stop();
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      const lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[80]"
    />
  );
}
