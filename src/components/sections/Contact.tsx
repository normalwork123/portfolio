"use client";

import { useState, type FormEvent } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import Reveal from "@/components/ui/Reveal";

interface FormState {
  readonly name: string;
  readonly email: string;
  readonly message: string;
}

type Status = "idle" | "submitting" | "success" | "error" | "unconfigured";

const initialForm: FormState = { name: "", email: "", message: "" };

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-white placeholder-white/40 transition-colors duration-300 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40";

export default function Contact() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const supabase = getSupabaseClient();
    if (!supabase) {
      // Graceful fallback: no backend configured, so don't attempt a call.
      setStatus("unconfigured");
      return;
    }

    setStatus("submitting");

    const { error } = await supabase.from("messages").insert({
      name: form.name,
      email: form.email,
      message: form.message,
    });

    if (error) {
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

            {!isSupabaseConfigured && (
              <p className="text-sm text-white/40">
                Messaging is currently unavailable. Reach me via the social links
                in the footer.
              </p>
            )}
            {status === "unconfigured" && (
              <p className="text-sm text-amber-400">
                Messaging is not configured yet. Please use the social links
                below.
              </p>
            )}
            {status === "success" && (
              <p className="text-sm text-accent">
                Thanks! Your message was sent.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-400">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
