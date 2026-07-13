import { Github, ExternalLink, Check, Star, GitFork } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

interface CaseStudy {
  readonly title: string;
  readonly tagline: string;
  readonly category: string;
  readonly problem: string;
  readonly solution: string;
  readonly features: ReadonlyArray<string>;
  readonly tech: ReadonlyArray<string>;
  readonly impact: ReadonlyArray<string>;
  /** Optional links. When empty the button is hidden. */
  readonly github?: string;
  readonly demo?: string;
  /** Highlights the card as the featured project. */
  readonly featured?: boolean;
  /** Optional repo metrics. Render only when a real value is provided. */
  readonly stars?: number;
  readonly forks?: number;
}

const caseStudies: ReadonlyArray<CaseStudy> = [
  {
    title: "CodeArena",
    tagline: "AI-powered coding platform for students and teachers",
    category: "Full-Stack \u00b7 EdTech \u00b7 MERN",
    featured: true,
    problem:
      "Classrooms juggle separate tools for writing code, grading it, and running contests, so teachers lose time stitching results together and students get feedback far too late to act on it. There was no single place to practise, compete, and be mentored.",
    solution:
      "A MERN platform built around three roles \u2014 Student, Teacher, and Admin \u2014 each with a tailored dashboard. Students solve coding problems in an embedded Monaco editor and submit for evaluation; teachers author problems and run contests with a live leaderboard; admins manage users and content. A JWT auth layer secures every route, and an AI mentor returns targeted hints instead of full solutions to keep learning honest.",
    features: [
      "Student, Teacher & Admin dashboards",
      "Coding problems with submission flow",
      "Contest system with live leaderboard",
      "Monaco Editor integration",
      "AI Mentor / AI Hint system",
      "JWT authentication & route guards",
    ],
    tech: [
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Tailwind CSS",
      "JWT",
      "Monaco Editor",
    ],
    impact: [
      "Unifies practice, contests & mentorship in one product",
      "AI hints shorten the feedback loop from days to seconds",
      "Three-role architecture supports institution-wide rollout",
    ],
    github: "https://github.com/raiharsh24/finalproject",
    demo: "",
  },
  {
    title: "Sakshi Hardware & Building Material",
    tagline: "Premium website for a building-materials business",
    category: "Web \u00b7 Brand \u00b7 B2B",
    problem:
      "An established building-materials business ran entirely offline \u2014 catalogue shared by phone and in person, no way to present its range to dealers or track stock digitally. Its online presence didn\u2019t reflect the scale or trustworthiness of the company.",
    solution:
      "A premium, motion-led website that presents the product range as a curated showcase with a strong brand identity, plus a dealer and inventory-management concept that gives the business a credible digital storefront and a foundation for B2B ordering. Framer Motion drives the cinematic feel while staying responsive on mid-range devices.",
    features: [
      "Categorised product showcase",
      "Brand-forward presentation",
      "Premium cinematic UI",
      "Fully responsive design",
      "Dealer / inventory concept",
      "Enquiry & lead capture",
    ],
    tech: ["Next.js", "React", "Tailwind CSS", "Framer Motion"],
    impact: [
      "Gave an offline business a credible digital storefront",
      "Replaced manual catalogue sharing with a live showcase",
      "Laid groundwork for dealer & inventory workflows",
    ],
    github: "https://github.com/raiharsh24/sakshi-hardware",
    demo: "",
  },
  {
    title: "Bank Management System",
    tagline: "Account and transaction management application",
    category: "Application \u00b7 FinTech \u00b7 Backend",
    problem:
      "Managing customers, accounts, and transactions by hand is error-prone and hard to audit. The goal was a structured system where account operations and money movement are validated, consistent, and controlled by an administrator.",
    solution:
      "A banking management application that models the core domain end to end \u2014 customer records, account operations, and transaction workflows \u2014 with administrative controls layered on top. The design keeps data integrity central so balances and transaction history stay consistent across operations.",
    features: [
      "Customer management",
      "Account operations",
      "Transaction workflows",
      "Data management & integrity",
      "Administrative controls",
      "Validated money movement",
    ],
    tech: ["Java", "OOP", "Database"],
    impact: [
      "Models core banking operations end to end",
      "Centralises data integrity for accounts & transactions",
      "Admin controls keep operations auditable",
    ],
    github: "https://github.com/raiharsh24/bank-management-system",
    demo: "",
  },
];

export default function Work() {
  return (
    <section id="work" className="mx-auto max-w-6xl px-6 py-28">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
          01 &mdash; Portfolio
        </p>
        <h2 className="mt-3 text-headline font-bold">
          Selected <span className="text-gold-gradient">Work</span>
        </h2>
        <p className="mt-4 max-w-2xl text-white/60">
          A closer look at the products I&rsquo;ve built &mdash; the problem, the
          approach, and the impact.
        </p>
      </Reveal>

      <div className="mt-16 space-y-10">
        {caseStudies.map((study, i) => (
          <Reveal as="article" key={study.title} delay={i * 0.05}>
            <div
              className={`group relative overflow-hidden rounded-3xl border bg-white/[0.02] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-glow sm:p-10 ${
                study.featured
                  ? "border-accent/40 shadow-glow ring-1 ring-accent/20"
                  : "border-white/10 hover:border-accent/40"
              }`}
            >
              {/* Cinematic gold wash on hover (always on for featured) */}
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.08] via-transparent to-transparent transition-opacity duration-500 ${
                  study.featured
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              />

              <div className="relative">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent/80">
                        {study.category}
                      </p>
                      {study.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">
                          <Star size={10} className="fill-background" />
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                      {study.title}
                    </h3>
                    <p className="mt-1 text-white/60">{study.tagline}</p>

                    {/* Repo metrics (render only when provided) */}
                    {(study.stars !== undefined ||
                      study.forks !== undefined) && (
                      <div className="mt-3 flex items-center gap-4 text-xs text-white/50">
                        {study.stars !== undefined && (
                          <span className="inline-flex items-center gap-1">
                            <Star size={13} className="text-accent" />
                            {study.stars}
                          </span>
                        )}
                        {study.forks !== undefined && (
                          <span className="inline-flex items-center gap-1">
                            <GitFork size={13} className="text-accent" />
                            {study.forks}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex flex-shrink-0 flex-wrap gap-3">
                    {study.github && (
                      <a
                        href={study.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${study.title} on GitHub`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:border-accent/60 hover:text-accent"
                      >
                        <Github size={16} /> Code
                      </a>
                    )}
                    {study.demo && (
                      <a
                        href={study.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${study.title} live demo`}
                        className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background transition-transform duration-300 hover:scale-[1.03]"
                      >
                        <ExternalLink size={16} /> Live Demo
                      </a>
                    )}
                  </div>
                </div>

                {/* Problem & Solution */}
                <div className="mt-8 grid gap-8 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                      Problem
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      {study.problem}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent/70">
                      Solution
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      {study.solution}
                    </p>
                  </div>
                </div>

                {/* Features & Impact */}
                <div className="mt-8 grid gap-8 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                      Key Features
                    </p>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {study.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-white/70"
                        >
                          <Check
                            size={15}
                            className="mt-0.5 flex-shrink-0 text-accent"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent/70">
                      Impact
                    </p>
                    <ul className="mt-3 space-y-2">
                      {study.impact.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-white/70"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tech stack */}
                <ul className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                  {study.tech.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 transition-colors group-hover:border-accent/30"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
