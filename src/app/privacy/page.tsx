import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — NimeNime",
  description:
    "NimeNime's Privacy Policy outlines how we collect, use, and protect your information, including cookies, local storage, and third-party services.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* ── Page Title ──────────────────────────────────────────── */}
      <header className="mb-10 text-center">
        <h1 className="bg-gradient-to-r from-hn-primary via-pink-300 to-hn-primary bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-white/40">
          Last updated: March 18, 2026
        </p>
      </header>

      {/* ── Body ────────────────────────────────────────────────── */}
      <article className="space-y-10 text-[15px] leading-relaxed text-white/75">
        {/* 1 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            1. Introduction
          </h2>
          <p>
            This Privacy Policy describes how{" "}
            <strong className="text-white">NimeNime</strong> (
            <Link
              href="https://nime-nime.web.id"
              className="text-hn-primary hover:underline"
            >
              nime-nime.web.id
            </Link>
            ) collects, uses, and safeguards your personal information when
            you use our website (the &ldquo;Service&rdquo;). By using the
            Service, you consent to the data practices described in this
            policy.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            2. Information We Collect
          </h2>

          <h3 className="mb-2 mt-4 text-base font-semibold text-white/90">
            2.1 Information You Provide
          </h3>
          <p>
            When you create an account, you may provide personal information
            such as your name, email address, profile picture, and password.
            If you sign in through a third-party OAuth provider (e.g., Google
            or Discord), we receive your display name, email, and avatar URL
            from that provider.
          </p>

          <h3 className="mb-2 mt-4 text-base font-semibold text-white/90">
            2.2 Automatically Collected Information
          </h3>
          <ul className="list-inside list-disc space-y-1.5 pl-2 text-white/65">
            <li>
              <strong className="text-white/80">IP Address:</strong> Your IP
              address may be collected by our server infrastructure and
              third-party services (e.g., video hosts, analytics) for security
              and operational purposes.
            </li>
            <li>
              <strong className="text-white/80">Device &amp; Browser Info:</strong>{" "}
              We may collect information about the device and browser you use
              to access NimeNime, including browser type, operating system,
              and screen resolution.
            </li>
            <li>
              <strong className="text-white/80">Usage Data:</strong> Pages
              visited, time spent on the site, referral URLs, and interaction
              data may be collected for analytics purposes.
            </li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            3. Cookies &amp; Local Storage
          </h2>
          <p className="mb-3">NimeNime uses the following technologies:</p>
          <ul className="list-inside list-disc space-y-1.5 pl-2 text-white/65">
            <li>
              <strong className="text-white/80">Cookies:</strong> We use
              cookies to manage user sessions (authentication), remember your
              preferences, and support analytics. Some cookies are essential
              for the Service to function; others help us understand usage
              patterns.
            </li>
            <li>
              <strong className="text-white/80">Local Storage:</strong> We use
              your browser&rsquo;s local storage to persist watch history,
              saved anime lists, and UI preferences (such as theme or video
              player settings) for a seamless experience across visits.
            </li>
          </ul>
          <p className="mt-3">
            You can clear cookies and local storage through your browser
            settings. Doing so may affect certain features of the Service.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            4. Third-Party Services
          </h2>
          <p className="mb-3">
            NimeNime integrates with or links to external third-party
            services, including but not limited to:
          </p>
          <ul className="list-inside list-disc space-y-1.5 pl-2 text-white/65">
            <li>
              <strong className="text-white/80">Video Hosting Providers:</strong>{" "}
              Embedded video players from third-party hosts (e.g., Vidhide,
              Doodstream, StreamWish) may collect your IP address, set
              cookies, and track viewing data according to their own privacy
              policies.
            </li>
            <li>
              <strong className="text-white/80">Analytics Services:</strong>{" "}
              We may use third-party analytics tools (e.g., Google Analytics)
              to understand how users interact with our Service. These tools
              may collect IP addresses and usage data.
            </li>
            <li>
              <strong className="text-white/80">OAuth Providers:</strong> If
              you choose to sign in using Google, Discord, or another OAuth
              provider, we receive limited profile information as permitted by
              that provider.
            </li>
          </ul>
          <p className="mt-3">
            We do not control how third-party services handle your data. We
            encourage you to review their respective privacy policies.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            5. How We Use Your Information
          </h2>
          <ul className="list-inside list-disc space-y-1.5 pl-2 text-white/65">
            <li>To provide and maintain the Service.</li>
            <li>To personalize your experience (e.g., saved anime, watch history).</li>
            <li>To authenticate and manage user accounts.</li>
            <li>To communicate with you regarding your account or changes to the Service.</li>
            <li>To detect, prevent, and address technical issues and abuse.</li>
            <li>To analyze usage trends and improve the Service.</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            6. Data Sharing &amp; Disclosure
          </h2>
          <p>
            We do not sell, trade, or rent your personal data to third
            parties. We may share information only in the following
            circumstances:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2 text-white/65">
            <li>
              <strong className="text-white/80">Legal Compliance:</strong>{" "}
              When required by law, subpoena, or other legal process.
            </li>
            <li>
              <strong className="text-white/80">Protection of Rights:</strong>{" "}
              To enforce our Terms of Service or protect the rights, property,
              or safety of NimeNime, our users, or others.
            </li>
            <li>
              <strong className="text-white/80">Service Providers:</strong>{" "}
              With trusted third-party service providers who assist us in
              operating the Service, subject to confidentiality obligations.
            </li>
          </ul>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            7. Data Security
          </h2>
          <p>
            We implement reasonable security measures to protect your personal
            information against unauthorized access, alteration, disclosure,
            or destruction. However, no method of transmission over the
            internet or method of electronic storage is 100% secure, and we
            cannot guarantee absolute security.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            8. Data Retention
          </h2>
          <p>
            We retain your personal data only for as long as necessary to
            fulfill the purposes for which it was collected and to comply with
            legal obligations. You may request the deletion of your account
            and associated data at any time by contacting us.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            9. Your Rights
          </h2>
          <p>
            Depending on your jurisdiction, you may have rights regarding your
            personal data, including the right to access, correct, delete, or
            export your data. To exercise these rights, please contact us at{" "}
            <a
              href="mailto:admin@nime-nime.web.id"
              className="text-hn-primary hover:underline"
            >
              admin@nime-nime.web.id
            </a>
            .
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            10. Children&rsquo;s Privacy
          </h2>
          <p>
            The Service is not directed to individuals under the age of 13.
            We do not knowingly collect personal information from children. If
            you believe a child has provided us with personal data, please
            contact us so we can take appropriate action.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            11. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will
            notify you of any changes by updating the &ldquo;Last
            updated&rdquo; date at the top of this page. Your continued use
            of the Service after any modifications constitutes your
            acknowledgment and acceptance of the updated policy.
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            12. Contact Us
          </h2>
          <p>
            If you have any questions or concerns about this Privacy Policy,
            please contact us at{" "}
            <a
              href="mailto:admin@nime-nime.web.id"
              className="text-hn-primary hover:underline"
            >
              admin@nime-nime.web.id
            </a>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
