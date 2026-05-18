"use client";

import { useState } from "react";

// The access key for Web3Forms API
const FORM_API_KEY = "62d8b57e-b515-437d-9073-b5bc686ef0b7";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const formElement = e.currentTarget;
    const payload = new FormData(formElement);
    payload.append("access_key", FORM_API_KEY);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: payload,
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        setStatusMessage({
          type: "success",
          text: "✅ Message sent successfully! We'll get back to you within 24–48 hours.",
        });
        formElement.reset();
      } else {
        setStatusMessage({
          type: "error",
          text: `❌ ${responseData.message ?? "Something went wrong. Please try again."}`,
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: "❌ Network error. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      {/* Name Input */}
      <div>
        <label
          htmlFor="contact-name"
          className="mb-1.5 block text-sm font-medium text-hn-text/70"
        >
          Name
        </label>
        <input
          type="text"
          id="contact-name"
          name="name"
          required
          placeholder="Your full name"
          className="w-full rounded-lg border border-hn-border/50 bg-hn-card px-4 py-3 text-sm text-hn-text placeholder-white/30 outline-none transition-colors focus:border-hn-primary/50 focus:ring-1 focus:ring-hn-primary/30"
        />
      </div>

      {/* Email Input */}
      <div>
        <label
          htmlFor="contact-email"
          className="mb-1.5 block text-sm font-medium text-hn-text/70"
        >
          Email
        </label>
        <input
          type="email"
          id="contact-email"
          name="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-hn-border/50 bg-hn-card px-4 py-3 text-sm text-hn-text placeholder-white/30 outline-none transition-colors focus:border-hn-primary/50 focus:ring-1 focus:ring-hn-primary/30"
        />
      </div>

      {/* Message Input */}
      <div>
        <label
          htmlFor="contact-message"
          className="mb-1.5 block text-sm font-medium text-hn-text/70"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          placeholder="Write your message here..."
          className="w-full resize-none rounded-lg border border-hn-border/50 bg-hn-card px-4 py-3 text-sm text-hn-text placeholder-white/30 outline-none transition-colors focus:border-hn-primary/50 focus:ring-1 focus:ring-hn-primary/30"
        />
      </div>

      {/* Submit Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          id="contact-submit"
          disabled={loading}
          className="w-full rounded-lg bg-hn-primary px-6 py-3 text-sm font-bold text-hn-dark transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {loading ? "Sending…" : "Send Message"}
        </button>

        {/* Feedback Message */}
        {statusMessage && (
          <p
            className={`text-sm ${
              statusMessage.type === "success"
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {statusMessage.text}
          </p>
        )}
      </div>
    </form>
  );
}
