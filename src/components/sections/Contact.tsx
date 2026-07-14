"use client";

import { useState, type FormEvent } from "react";
import Reveal from "@/components/ui/Reveal";

interface FormState {
  readonly name: string;
  readonly email: string;
  readonly message: string;
}

type Status = "idle" | "submitting" | "success" | "error";

interface ApiResponse {
  success: boolean;
  error?: string;
}

const initialForm: FormState = { name: "", email: "", message: "" };

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-white placeholder-white/40 transition-colors duration-300 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40";

export default function Contact() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error ?? "Something went wrong. Please try again."
        );
        setStatus("error");
        return;
      }
    } catch {
      setErrorMessage("Unable to reach the server. Please try again.");
      setStatus("error");
      return;
    }

    setForm(initialForm);
    setStatus("success");
  }

  return (
    <section
      id="contact"
      className="relative bg-gradient-to-b from-transparent to-white/[0.015]"
    >
      <div className="mx-auto max-w-2xl px-6 py-28">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
            04 &mdash; Contact
          </p>
          <h2 className="mt-3 text-headline font-bold">
            Get in <span className="text-gold-gradient">Touch</span>
          </h2>
          <p className="mt-4 text-white/60">
            Have a project in mind or just want to say hello? Send a message.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <input
              type="text"
              required
              aria-label="Your name"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
            <input
              type="email"
              required
              aria-label="Your email"
              placeholder="Your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
            <textarea
              required
              rows={5}
              aria-label="Your message"
              placeholder="Your message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 font-semibold text-background shadow-glow transition-all duration-300 hover:scale-[1.03] hover:shadow-glow-lg disabled:opacity-50 disabled:hover:scale-100"
            >
              {status === "submitting" ? "Sending..." : "Send Message"}
            </button>

            {status === "success" && (
              <p className="text-sm text-accent">
                Message sent successfully.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-400">{errorMessage}</p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
