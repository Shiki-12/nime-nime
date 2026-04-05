import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us — NimeNime",
  description:
    "Get in touch with the NimeNime team. Reach us via email or the contact form for questions, feedback, or business inquiries.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* ── Page Title ──────────────────────────────────────────── */}
      <header className="mb-10 text-center">
        <h1 className="bg-gradient-to-r from-hn-primary via-pink-300 to-hn-primary bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          Contact Us
        </h1>
        <p className="mt-3 text-sm text-white/40">
          We&rsquo;d love to hear from you. Reach out anytime.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* ── Contact Form ────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <ContactForm />
        </div>

        {/* ── Contact Info Sidebar ────────────────────────────── */}
        <aside className="space-y-6 lg:col-span-2">
          {/* Email */}
          <div className="rounded-xl border border-white/[0.06] bg-hn-card p-5">
            <div className="mb-2 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-hn-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h2 className="text-sm font-bold text-white">Email</h2>
            </div>
            <a
              href="mailto:admin@nime-nime.web.id"
              className="text-sm text-hn-primary hover:underline"
            >
              admin@nime-nime.web.id
            </a>
            <p className="mt-1 text-xs text-white/40">
              General inquiries &amp; feedback
            </p>
            <a
              href="mailto:legal@nime-nime.web.id"
              className="mt-2 inline-block text-sm text-hn-primary hover:underline"
            >
              legal@nime-nime.web.id
            </a>
            <p className="mt-1 text-xs text-white/40">
              DMCA &amp; copyright requests
            </p>
          </div>

          {/* Social */}
          <div className="rounded-xl border border-white/[0.06] bg-hn-card p-5">
            <h2 className="mb-3 text-sm font-bold text-white">
              Follow Us
            </h2>
            <div className="space-y-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/nimenime_id/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-hn-primary"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                @nimenime_id
              </a>

              {/* Twitter / X */}
              <a
                href="https://x.com/nimenime_id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-hn-primary"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @nimenime_id
              </a>

              {/* Discord */}
              <a
                href="https://discord.gg/JzjhYef86W"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-hn-primary"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Nime-Nime
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/nimenime_id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-hn-primary"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                NimeNime Official
              </a>
            </div>
          </div>

          {/* Response Time */}
          <div className="rounded-xl border border-hn-secondary/20 bg-hn-secondary/5 p-5">
            <h2 className="mb-1 text-sm font-bold text-white">
              Response Time
            </h2>
            <p className="text-xs text-white/50">
              We typically respond within{" "}
              <strong className="text-white/70">24 – 48 hours</strong>. For
              DMCA-related requests, please email{" "}
              <a
                href="mailto:legal@nime-nime.web.id"
                className="text-hn-primary hover:underline"
              >
                legal@nime-nime.web.id
              </a>{" "}
              directly.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
