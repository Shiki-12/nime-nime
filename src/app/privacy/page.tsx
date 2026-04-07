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
        <p className="mt-3 text-sm text-hn-text-muted/60">
          Last updated: March 18, 2026
        </p>
      </header>

      {/* ── Body ────────────────────────────────────────────────── */}
      <article className="space-y-10 text-[15px] leading-relaxed text-hn-text/75">
        {/* 1 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            1. Introduction
          </h2>
          <p>
            This Privacy Policy describes how{" "}
            <strong className="text-hn-text">NimeNime</strong> (
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
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            2. Information We Collect
          </h2>

          <h3 className="mb-2 mt-4 text-base font-semibold text-hn-text">
            2.1 Information You Provide
          </h3>
          <p>
            When you create an account, you may provide personal information
            such as your name, email address, profile picture, and password.
            If you sign in through a third-party OAuth provider (e.g., Google
            or Discord), we receive your display name, email, and avatar URL
            from that provider.
          </p>

          <h3 className="mb-2 mt-4 text-base font-semibold text-hn-text">
            2.2 Automatically Collected Information
          </h3>
          <ul className="list-inside list-disc space-y-1.5 pl-2 text-hn-text/65">
            <li>
              <strong className="text-hn-text-muted/90">IP Address:</strong> Your IP
              address may be collected by our server infrastructure and
              third-party services (e.g., video hosts, analytics) for security
              and operational purposes.
            </li>
            <li>
              <strong className="text-hn-text-muted/90">Device &amp; Browser Info:</strong>{" "}
              We may collect information about the device and browser you use
              to access NimeNime, including browser type, operating system,
              and screen resolution.
            </li>
            <li>
              <strong className="text-hn-text-muted/90">Usage Information:</strong> We
              automatically collect information about your interactions with our
              Service. This includes the content you view, your watch history,
              the items you save to your lists, and your general activity
              patterns on the platform.
            </li>
            <li>
              <strong className="text-hn-text-muted/90">Usage Data:</strong> Pages
              visited, time spent on the site, referral URLs, and interaction
              data may be collected for analytics purposes.
            </li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            3. Cookies &amp; Local Storage
          </h2>
          <p className="mb-3">NimeNime uses the following technologies:</p>
          <ul className="list-inside list-disc space-y-1.5 pl-2 text-hn-text/65">
            <li>
              <strong className="text-hn-text-muted/90">Cookies:</strong> We use
              cookies to manage user sessions (authentication), remember your
              preferences, and support analytics. Some cookies are essential
              for the Service to function; others help us understand usage
              patterns.
            </li>
            <li>
              <strong className="text-hn-text-muted/90">Local Storage:</strong> We use
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
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            4. Third-Party Services
          </h2>
          <p className="mb-3">
            NimeNime integrates with or links to external third-party
            services, including but not limited to:
          </p>
          <ul className="list-inside list-disc space-y-1.5 pl-2 text-hn-text/65">
            <li>
              <strong className="text-hn-text-muted/90">Video Hosting Providers:</strong>{" "}
              Embedded video players from third-party hosts (e.g., Vidhide,
              Doodstream, StreamWish) may collect your IP address, set
              cookies, and track viewing data according to their own privacy
              policies.
            </li>
            <li>
              <strong className="text-hn-text-muted/90">Analytics Services:</strong>{" "}
              We may use third-party analytics tools (e.g., Google Analytics)
              to understand how users interact with our Service. These tools
              may collect IP addresses and usage data.
            </li>
            <li>
              <strong className="text-hn-text-muted/90">OAuth Providers:</strong> If
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
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            5. How We Use Your Information
          </h2>
          <p className="mb-3 text-hn-text/75">We use the collected information to:</p>
          <ul className="list-inside list-disc space-y-1.5 pl-2 text-hn-text/65">
            <li>
              Provide, maintain, and personalize your experience on our platform
              (such as recommending content).
            </li>
            <li>
              Analyze how users interact with our Service to improve our features,
              user interface, and overall performance.
            </li>
            <li>
              Generate aggregated, non-identifying statistical data to understand
              market trends, optimize our operations, and support business
              development.
            </li>
            <li>Authenticate and manage user accounts.</li>
            <li>Communicate with you regarding your account or changes to the Service.</li>
            <li>Detect, prevent, and address technical issues and abuse.</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            6. Data Sharing &amp; Disclosure
          </h2>
          <p>
            We do not sell, trade, or rent your personal data to third
            parties. We may share information only in the following
            circumstances:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2 text-hn-text/65">
            <li>
              <strong className="text-hn-text-muted/90">Legal Compliance:</strong>{" "}
              When required by law, subpoena, or other legal process.
            </li>
            <li>
              <strong className="text-hn-text-muted/90">Protection of Rights:</strong>{" "}
              To enforce our Terms of Service or protect the rights, property,
              or safety of NimeNime, our users, or others.
            </li>
            <li>
              <strong className="text-hn-text-muted/90">Service Providers:</strong>{" "}
              With trusted third-party service providers who assist us in
              operating the Service, subject to confidentiality obligations.
            </li>
          </ul>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
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
          <h2 className="mb-3 text-xl font-bold text-hn-text">
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
          <h2 className="mb-3 text-xl font-bold text-hn-text">
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
          <h2 className="mb-3 text-xl font-bold text-hn-text">
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
          <h2 className="mb-3 text-xl font-bold text-hn-text">
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
          <h2 className="mb-3 text-xl font-bold text-hn-text">
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
