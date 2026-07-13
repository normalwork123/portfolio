import Hero from "@/components/sections/Hero";
import Work from "@/components/sections/Work";
import About from "@/components/sections/About";
import Certificates from "@/components/sections/Certificates";
import Contact from "@/components/sections/Contact";
import SceneBackground from "@/components/three/SceneBackground";

// This page is a Server Component. The browser-only Three.js scene is loaded
// inside SceneBackground, a Client Component that owns the `ssr: false` import.
export default function Home() {
  return (
    <>
      <div className="relative">
        <SceneBackground />
        <Hero />
      </div>
      <Work />
      <About />
      <Certificates />
      <Contact />
    </>
  );
}
