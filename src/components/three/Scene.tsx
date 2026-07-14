"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Liquid-metal flow-field background.
 *
 * A fullscreen GLSL shader renders a slowly churning gold/black noise field —
 * like heat distortion off molten metal. It replaces the earlier `THREE.Points`
 * ember field but keeps the exact same integration discipline so it stays a
 * cheap, self-contained layer sitting behind the hero: the ID card floats on
 * top of it unchanged.
 *
 * Technique: a single `PlaneGeometry(2, 2)` whose vertices already span clip
 * space, so the vertex shader writes `gl_Position` directly — no perspective
 * camera, no FOV/resize math, just a `u_resolution` update on resize. Colour
 * comes from layered fBm value-noise (5 octaves) banded across the site's gold
 * palette; the pointer adds a soft local brightening.
 *
 * Performance discipline matches the rest of the codebase:
 *  - device pixel ratio capped at 2,
 *  - render loop paused off-screen (IntersectionObserver) and when the tab is
 *    hidden (visibilitychange),
 *  - full geometry / material / renderer disposal + listener cleanup on unmount,
 *  - `prefers-reduced-motion` freezes `u_time`, rendering a single static frame
 *    instead of an animation.
 *
 * Unlike the ID card, this layer is *not* disabled on mobile — a fullscreen
 * fragment shader is cheap on the GPU at any resolution. If low-end devices
 * struggle, reduce the fBm loop from 5 octaves to 3 before disabling anything.
 */
export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scene = new THREE.Scene();
    // The vertex shader writes clip-space positions directly, so the camera's
    // matrices are never consulted — a bare Camera is all `render()` needs.
    const camera = new THREE.Camera();

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    let pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    container.appendChild(renderer.domElement);

    // Canvas size in device pixels; the shader only uses its ratio (aspect),
    // so css-vs-device px is immaterial as long as we stay consistent.
    const resolution = new THREE.Vector2(
      container.clientWidth * pixelRatio,
      container.clientHeight * pixelRatio
    );

    // Aspect-corrected pointer, matching the shader's `aspectUv` space. Seeded
    // far off-screen so the highlight is invisible until the user moves.
    const mouse = new THREE.Vector2(999, 999);

    const geometry = new THREE.PlaneGeometry(2, 2);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: resolution },
        u_mouse: { value: mouse },
      },
      depthTest: false,
      depthWrite: false,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        varying vec2 vUv;

        vec2 hash(vec2 p) {
          p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
          return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
        }

        float noise(vec2 p) {
          const float K1 = 0.366025404;
          const float K2 = 0.211324865;
          vec2 i = floor(p + (p.x + p.y) * K1);
          vec2 a = p - i + (i.x + i.y) * K2;
          vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec2 b = a - o + K2;
          vec2 c = a - 1.0 + 2.0 * K2;
          vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
          vec3 n = h * h * h * h * vec3(dot(a, hash(i)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
          return dot(n, vec3(70.0));
        }

        float fbm(vec2 p) {
          float f = 0.0;
          float amp = 0.5;
          for (int i = 0; i < 5; i++) {
            f += amp * noise(p);
            p *= 2.02;
            amp *= 0.5;
          }
          return f;
        }

        void main() {
          vec2 uv = vUv;
          vec2 aspectUv = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

          float t = u_time * 0.06;
          vec2 flow = aspectUv * 2.2 + vec2(fbm(aspectUv * 1.5 + t), fbm(aspectUv * 1.5 - t)) * 0.6;
          float n = fbm(flow + t);

          vec2 toMouse = aspectUv - u_mouse;
          float mouseInfluence = smoothstep(0.6, 0.0, length(toMouse));
          n += mouseInfluence * 0.15;

          vec3 black = vec3(0.039, 0.039, 0.039);
          vec3 deep  = vec3(0.659, 0.498, 0.165);
          vec3 gold  = vec3(0.831, 0.659, 0.263);
          vec3 bright= vec3(0.941, 0.780, 0.369);

          vec3 color = mix(black, deep, smoothstep(0.15, 0.45, n));
          color = mix(color, gold, smoothstep(0.45, 0.7, n));
          color = mix(color, bright, smoothstep(0.7, 0.95, n));

          float vignette = 1.0 - smoothstep(0.6, 1.1, length(aspectUv));
          color *= vignette;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const quad = new THREE.Mesh(geometry, material);
    quad.frustumCulled = false;
    scene.add(quad);

    const render = (): void => {
      renderer.render(scene, camera);
    };

    // --- Aspect-corrected pointer tracking ---------------------------------
    // Map screen pixels into the shader's `aspectUv` space: uv in 0..1 (Y up),
    // then centred and scaled by aspect exactly like the fragment shader.
    const handlePointer = (e: PointerEvent): void => {
      const aspect = resolution.x / resolution.y;
      const mx = e.clientX / window.innerWidth;
      const my = 1 - e.clientY / window.innerHeight;
      mouse.set((mx - 0.5) * aspect, my - 0.5);
    };
    if (!prefersReduced) {
      window.addEventListener("pointermove", handlePointer, { passive: true });
    }

    // --- Reduced motion: one static, intentional-looking frame -------------
    if (prefersReduced) {
      // A fixed, non-trivial time so the frozen field shows structure rather
      // than the flat t=0 arrangement.
      material.uniforms.u_time.value = 12.0;
      render();

      const handleResizeStatic = (): void => {
        pixelRatio = Math.min(window.devicePixelRatio, 2);
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        resolution.set(
          container.clientWidth * pixelRatio,
          container.clientHeight * pixelRatio
        );
        render();
      };
      window.addEventListener("resize", handleResizeStatic);

      return () => {
        window.removeEventListener("resize", handleResizeStatic);
        window.removeEventListener("pointermove", handlePointer);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    }

    // --- Off-screen / hidden-tab pausing -----------------------------------
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) loop();
      },
      { threshold: 0 }
    );
    io.observe(container);

    let frameId = 0;
    let clock = 0; // accumulated seconds (pause-safe)
    let last = performance.now();
    const loop = (): void => {
      if (!visible || document.hidden) {
        cancelAnimationFrame(frameId);
        return;
      }

      const now = performance.now();
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05; // clamp long frames (resume from pause, GC)

      clock += dt;
      material.uniforms.u_time.value = clock;

      render();
      frameId = requestAnimationFrame(loop);
    };
    loop();

    const handleVisibility = (): void => {
      if (!document.hidden) {
        last = performance.now();
        loop();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleResize = (): void => {
      pixelRatio = Math.min(window.devicePixelRatio, 2);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      resolution.set(
        container.clientWidth * pixelRatio,
        container.clientHeight * pixelRatio
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      io.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointer);
      document.removeEventListener("visibilitychange", handleVisibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
