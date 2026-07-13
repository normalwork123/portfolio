"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Home", href: "#home" },
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");
  const [open, setOpen] = useState(false);

  // Shrink + intensify background once the user scrolls past the hero fold.
  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the nav link for whichever section is currently in view.
  useEffect(() => {
    const sections = links
      .map((l) => document.querySelector(l.href))
      .filter((el): el is Element => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="#home"
          className="text-lg font-semibold tracking-tight text-white"
        >
          Welcome to my Portfolio Website..<span className="text-accent">.</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`relative transition-colors hover:text-white ${
                  active === link.href ? "text-accent" : ""
                }`}
              >
                {link.label}
                {active === link.href && (
                  <span className="absolute -bottom-1.5 left-0 h-px w-full bg-accent" />
                )}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="#contact"
              className="rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 font-medium text-accent transition-colors hover:bg-accent hover:text-background"
            >
              Hire Me
            </Link>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="text-white/80 transition-colors hover:text-accent md:hidden"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-background/95 backdrop-blur-md md:hidden">
          <ul className="flex flex-col px-6 py-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block py-3 text-base transition-colors ${
                    active === link.href ? "text-accent" : "text-white/80"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-full bg-accent px-4 py-3 text-center font-semibold text-background"
              >
                Hire Me
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
