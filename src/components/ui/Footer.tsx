import { Github, Linkedin, Instagram, Youtube } from "lucide-react";

interface Social {
  readonly label: string;
  readonly href: string;
  readonly Icon: typeof Github;
}

const socials: ReadonlyArray<Social> = [
  { label: "GitHub", href: "https://github.com/raiharsh24", Icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/600harsh-rai/", Icon: Linkedin },
  { label: "Instagram", href: "https://www.instagram.com/faith.in.karma?igsh=Z29vazM5enVhdmp5&utm_source=qr", Icon: Instagram },
  { label: "YouTube", href: "https://www.youtube.com/@harshraiwork", Icon: Youtube },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-sm text-white/50">
          © {new Date().getFullYear()} Harsh Rai. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          {socials.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-white/60 transition-colors hover:text-[#d4a843]"
            >
              <Icon size={20} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
