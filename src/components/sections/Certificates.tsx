import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

interface Certificate {
  readonly title: string;
  readonly issuer: string;
  readonly year: string;
  /**
   * Public verification URL for the credential. Opens in a new tab.
   * TODO: replace the placeholder IDs/usernames below with the real
   * credential IDs before shipping. When omitted the card renders
   * non-interactive.
   */
  readonly href?: string;
}

const certificates: ReadonlyArray<Certificate> = [
  {
    title: "Meta Front-End Developer",
    issuer: "Coursera / Meta",
    year: "2024",
    // TODO: swap REPLACE_WITH_CREDENTIAL_ID for the real Coursera verify code.
    href: "https://www.coursera.org/account/accomplishments/professional-cert/REPLACE_WITH_CREDENTIAL_ID",
  },
  {
    title: "Responsive Web Design",
    issuer: "freeCodeCamp",
    year: "2023",
    // TODO: swap REPLACE_USERNAME for the real freeCodeCamp username.
    href: "https://www.freecodecamp.org/certification/REPLACE_USERNAME/responsive-web-design",
  },
  {
    title: "JavaScript Algorithms & Data Structures",
    issuer: "freeCodeCamp",
    year: "2023",
    // TODO: swap REPLACE_USERNAME for the real freeCodeCamp username.
    href: "https://www.freecodecamp.org/certification/REPLACE_USERNAME/javascript-algorithms-and-data-structures",
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
        {certificates.map((cert, i) => {
          const cardClass =
            "group relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow";
          const inner = (
            <>
              {cert.href && (
                <ArrowUpRight
                  size={18}
                  aria-hidden
                  className="absolute right-6 top-6 text-white/30 transition-colors duration-300 group-hover:text-accent"
                />
              )}
              <p className="text-xs uppercase tracking-widest text-accent">
                {cert.year}
              </p>
              <h3 className="mt-3 pr-6 text-lg font-semibold text-white">
                {cert.title}
              </h3>
              <p className="mt-2 text-sm text-white/60">{cert.issuer}</p>
            </>
          );

          return (
            <Reveal as="article" key={cert.title} delay={i * 0.1}>
              {cert.href ? (
                <a
                  href={cert.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Verify ${cert.title} credential (opens in new tab)`}
                  className={cardClass}
                >
                  {inner}
                </a>
              ) : (
                <div className={cardClass}>{inner}</div>
              )}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
