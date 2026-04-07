import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — NimeNime",
  description:
    "Read the Terms of Service for NimeNime, including user conduct, intellectual property, and limitation of liability.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* ── Page Title ──────────────────────────────────────────── */}
      <header className="mb-10 text-center">
        <h1 className="bg-gradient-to-r from-hn-primary via-pink-300 to-hn-primary bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-hn-text-muted/60">
          Last updated: March 18, 2026
        </p>
      </header>

      {/* ── Body ────────────────────────────────────────────────── */}
      <article className="space-y-10 text-[15px] leading-relaxed text-hn-text/75">
        {/* 1 – Introduction */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            1. Introduction
          </h2>
          <p>
            Welcome to <strong className="text-hn-text">NimeNime</strong> (
            <Link
              href="https://nime-nime.web.id"
              className="text-hn-primary hover:underline"
            >
              nime-nime.web.id
            </Link>
            ). By accessing or using our website (the &ldquo;Service&rdquo;),
            you agree to be bound by these Terms of Service
            (&ldquo;Terms&rdquo;). If you do not agree with any part of these
            Terms, you must not use the Service.
          </p>
        </section>

        {/* 2 – Description of Service */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            2. Description of Service
          </h2>
          <p>
            NimeNime is an entertainment platform that operates as a search
            engine and link aggregator. We index freely available links from
            third-party websites. NimeNime does not host, upload, or store
            any video, media, or media files on its own servers.
          </p>
        </section>

        {/* 3 – Eligibility */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            3. Eligibility
          </h2>
          <p>
            You must be at least 13 years of age to use the Service. By using
            NimeNime, you represent and warrant that you meet this age
            requirement. If you are under 18, you should use NimeNime only
            under the supervision of a parent or legal guardian.
          </p>
        </section>

        {/* 4 – User Accounts */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            4. User Accounts
          </h2>
          <p>
            Certain features of NimeNime — including watch history, saved
            anime lists, and preferences — require you to create an account.
            You are responsible for safeguarding your account credentials and
            for all activities that occur under your account. You agree to
            notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        {/* 5 – User Conduct */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            5. User Conduct
          </h2>
          <p className="mb-3">
            When using NimeNime, you agree <strong className="text-hn-text">not</strong> to:
          </p>
          <ul className="list-inside list-disc space-y-1.5 pl-2 text-hn-text/65">
            <li>
              Use the Service for any unlawful purpose or in violation of any
              applicable laws or regulations.
            </li>
            <li>
              Attempt to gain unauthorized access to any portion of the
              Service, other users&rsquo; accounts, or related computer systems
              or networks.
            </li>
            <li>
              Interfere with or disrupt the Service, servers, or networks
              connected to the Service, including by transmitting any viruses,
              worms, or malicious code.
            </li>
            <li>
              Harvest or scrape data from the Service by automated means
              (bots, scrapers, spiders) without our prior written consent.
            </li>
            <li>
              Upload, post, or transmit any content that is defamatory,
              obscene, abusive, harassing, or otherwise objectionable.
            </li>
            <li>
              Impersonate any person or entity, or falsely represent your
              affiliation with any person or entity.
            </li>
          </ul>
        </section>

        {/* 6 – Intellectual Property */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            6. Intellectual Property
          </h2>
          <p className="mb-3">
            All anime titles, characters, artwork, logos, and related media
            displayed on NimeNime are the property of their respective owners,
            creators, and licensors. NimeNime does <strong className="text-hn-text">not</strong>{" "}
            claim ownership of any third-party intellectual property.
          </p>
          <p>
            The NimeNime name, logo, website design, and original content
            (such as page layouts, UI components, and editorial text) are the
            property of NimeNime and are protected by applicable intellectual
            property laws. You may not reproduce, distribute, or create
            derivative works from any part of the Service without our prior
            written consent.
          </p>
        </section>

        {/* 7 – Third-Party Links & Content */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            7. Third-Party Links &amp; Content
          </h2>
          <p>
            NimeNime indexes and links to content hosted on third-party
            websites. We have no control over, and assume no responsibility
            for, the content, privacy policies, or practices of any
            third-party websites. You access third-party content entirely at
            your own risk.
          </p>
        </section>

        {/* 8 – Disclaimer of Warranties */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            8. Disclaimer of Warranties
          </h2>
          <p>
            THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND
            &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND,
            WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED
            WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
            AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
            UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL
            COMPONENTS.
          </p>
        </section>

        {/* 9 – Limitation of Liability */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            9. Limitation of Liability
          </h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NIMENIME AND
            ITS OPERATORS, OFFICERS, EMPLOYEES, AND AFFILIATES SHALL NOT BE
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
            PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, USE, GOODWILL,
            OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR ACCESS TO OR
            USE OF, OR INABILITY TO ACCESS OR USE, THE SERVICE; (B) ANY
            CONDUCT OR CONTENT OF ANY THIRD PARTY ON OR ACCESSED THROUGH THE
            SERVICE; OR (C) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR
            TRANSMISSIONS OR CONTENT.
          </p>
        </section>

        {/* 10 – Indemnification */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            10. Indemnification
          </h2>
          <p>
            You agree to indemnify and hold harmless NimeNime and its
            operators from and against any loss, liability, claim, demand,
            damages, costs, and expenses (including legal fees) arising out of
            or in connection with your use of the Service, your violation of
            these Terms, or your violation of any rights of a third party.
          </p>
        </section>

        {/* 11 – Modifications */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            11. Modifications to Terms
          </h2>
          <p>
            We reserve the right to modify or replace these Terms at any time.
            We will provide reasonable notice of material changes by updating
            the &ldquo;Last updated&rdquo; date at the top of this page.
            Your continued use of the Service after any such changes
            constitutes your acceptance of the new Terms.
          </p>
        </section>

        {/* 12 – Governing Law */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            12. Governing Law
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of the Republic of Indonesia, without regard to its
            conflict-of-law provisions.
          </p>
        </section>

        {/* 13 – Contact */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            13. Contact Us
          </h2>
          <p>
            If you have any questions about these Terms, please contact us at{" "}
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
