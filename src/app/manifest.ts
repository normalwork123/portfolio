import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Harsh Rai — Frontend Developer",
    short_name: "Harsh Rai",
    description:
      "Cinematic portfolio of Harsh Rai, frontend developer building immersive web experiences.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
