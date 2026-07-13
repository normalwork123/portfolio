"use client";

import dynamic from "next/dynamic";

// `ssr: false` is only allowed inside a Client Component. This wrapper isolates
// the browser-only Three.js scene so that pages can stay Server Components.
const Scene = dynamic(() => import("@/components/three/Scene"), { ssr: false });

export default function SceneBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Scene />
    </div>
  );
}
