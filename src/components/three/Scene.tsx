"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Cinematic multi-layer particle field.
 *
 * Three depth layers (far / mid / near) parallax against the pointer to create
 * atmosphere and dimensionality. Performance is protected by:
 *  - capping device pixel ratio,
 *  - scaling particle counts down on small screens,
 *  - pausing the render loop when the tab or canvas is off-screen,
 *  - honouring `prefers-reduced-motion`.
 */
export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isSmall = window.innerWidth < 768;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.06);

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Build one parallax layer of points at a given depth + visual weight.
    const makeLayer = (
      count: number,
      spread: number,
      size: number,
      opacity: number,
      color: number
    ): THREE.Points => {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < positions.length; i += 1) {
        positions[i] = (Math.random() - 0.5) * spread;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color,
        size,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      return new THREE.Points(geometry, material);
    };

    const scale = isSmall ? 0.5 : 1;
    const layers = [
      makeLayer(Math.round(700 * scale), 18, 0.018, 0.35, 0x8a6f2e), // far
      makeLayer(Math.round(500 * scale), 13, 0.026, 0.6, 0xd4a843), // mid
      makeLayer(Math.round(220 * scale), 9, 0.04, 0.9, 0xf0c75e), // near
    ];
    layers.forEach((layer) => scene.add(layer));

    // Pointer-driven parallax target (eased toward each frame).
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const handlePointer = (e: PointerEvent): void => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!prefersReduced) {
      window.addEventListener("pointermove", handlePointer, { passive: true });
    }

    // Pause rendering when the canvas scrolls out of view to save the GPU.
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
    const loop = (): void => {
      if (!visible || document.hidden) {
        cancelAnimationFrame(frameId);
        return;
      }

      pointer.x += (target.x - pointer.x) * 0.04;
      pointer.y += (target.y - pointer.y) * 0.04;

      layers.forEach((layer, i) => {
        const depth = (i + 1) * 0.12;
        layer.rotation.y += prefersReduced ? 0 : 0.0004 * (i + 1);
        layer.position.x = pointer.x * depth;
        layer.position.y = -pointer.y * depth;
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(loop);
    };
    loop();

    const handleVisibility = (): void => {
      if (!document.hidden) loop();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleResize = (): void => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      io.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointer);
      document.removeEventListener("visibilitychange", handleVisibility);
      layers.forEach((layer) => {
        layer.geometry.dispose();
        (layer.material as THREE.Material).dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
