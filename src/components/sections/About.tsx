import Reveal from "@/components/ui/Reveal";

const skills: ReadonlyArray<string> = [
  "React",
  "Next.js",
  "TypeScript",
  "Three.js",
  "Tailwind CSS",
  "Framer Motion",
  "Supabase",
  "Node.js",
];

export default function About() {
  return (
    <section
      id="about"
      className="relative bg-gradient-to-b from-transparent via-white/[0.015] to-transparent"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-28 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
            02 &mdash; Profile
          </p>
          <h2 className="mt-3 text-headline font-bold">
            About <span className="text-gold-gradient">Me</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/70">
            I&rsquo;m Harsh Rai, a frontend developer and UI/UX enthusiast
            focused on crafting immersive, high-performance web experiences. I
            care deeply about motion, detail, and the feel of an interface as
            much as the code behind it.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            From WebGL scenes to realtime data with Supabase, I enjoy turning
            ambitious ideas into polished, production-ready products.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Skills
          </h3>
          <ul className="mt-6 grid grid-cols-2 gap-3">
            {skills.map((skill) => (
              <li
                key={skill}
                className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/80 transition-all duration-300 hover:border-accent/40 hover:bg-accent/[0.06] hover:text-white"
              >
                {skill}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
