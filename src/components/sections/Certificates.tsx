import Reveal from "@/components/ui/Reveal";

interface Certificate {
  readonly title: string;
  readonly issuer: string;
  readonly year: string;
}

const certificates: ReadonlyArray<Certificate> = [
  {
    title: "Meta Front-End Developer",
    issuer: "Coursera / Meta",
    year: "2024",
  },
  {
    title: "Responsive Web Design",
    issuer: "freeCodeCamp",
    year: "2023",
  },
  {
    title: "JavaScript Algorithms & Data Structures",
    issuer: "freeCodeCamp",
    year: "2023",
  },
];

export default function Certificates() {
  return (
    <section id="certificates" className="mx-auto max-w-6xl px-6 py-28">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
          03 &mdash; Credentials
        </p>
        <h2 className="mt-3 text-headline font-bold text-gold-gradient">
          Certificates
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert, i) => (
          <Reveal as="article" key={cert.title} delay={i * 0.1}>
            <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow">
              <p className="text-xs uppercase tracking-widest text-accent">
                {cert.year}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-white">
                {cert.title}
              </h3>
              <p className="mt-2 text-sm text-white/60">{cert.issuer}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
