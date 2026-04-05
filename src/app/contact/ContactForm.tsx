"use client";

import { useState } from "react";

const WEB3FORMS_KEY = "62d8b57e-b515-437d-9073-b5bc686ef0b7";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setResultMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", WEB3FORMS_KEY);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResultMessage({
          type: "success",
          text: "✅ Message sent successfully! We'll get back to you within 24–48 hours.",
        });
        form.reset();
      } else {
        setResultMessage({
          type: "error",
          text: `❌ ${data.message ?? "Something went wrong. Please try again."}`,
        });
      }
    } catch {
      setResultMessage({
        type: "error",
        text: "❌ Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label
          htmlFor="contact-name"
          className="mb-1.5 block text-sm font-medium text-white/70"
        >
          Name
        </label>
        <input
          type="text"
          id="contact-name"
          name="name"
          required
          placeholder="Your full name"
          className="w-full rounded-lg border border-white/[0.06] bg-hn-card px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-hn-primary/50 focus:ring-1 focus:ring-hn-primary/30"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="contact-email"
          className="mb-1.5 block text-sm font-medium text-white/70"
        >
          Email
        </label>
        <input
          type="email"
          id="contact-email"
          name="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-white/[0.06] bg-hn-card px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-hn-primary/50 focus:ring-1 focus:ring-hn-primary/30"
        />
      </div>

      {/* Subject */}
      <div>
        <label
          htmlFor="contact-subject"
          className="mb-1.5 block text-sm font-medium text-white/70"
        >
          Subject
        </label>
        <input
          type="text"
          id="contact-subject"
          name="subject"
          required
          placeholder="What is this about?"
          className="w-full rounded-lg border border-white/[0.06] bg-hn-card px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-hn-primary/50 focus:ring-1 focus:ring-hn-primary/30"
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="contact-message"
          className="mb-1.5 block text-sm font-medium text-white/70"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          placeholder="Write your message here..."
          className="w-full resize-none rounded-lg border border-white/[0.06] bg-hn-card px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-hn-primary/50 focus:ring-1 focus:ring-hn-primary/30"
        />
      </div>

      {/* Submit */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          id="contact-submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-hn-primary px-6 py-3 text-sm font-bold text-hn-dark transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? "Sending…" : "Send Message"}
        </button>

        {/* Result feedback */}
        {resultMessage && (
          <p
            className={`text-sm ${
              resultMessage.type === "success"
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {resultMessage.text}
          </p>
        )}
      </div>
    </form>
  );
}
