import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DMCA & Copyright Policy — NimeNime",
  description:
    "NimeNime's DMCA and Copyright Policy. NimeNime does not host any media files. Learn how to submit takedown requests for indexed links.",
};

export default function DmcaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* ── Page Title ──────────────────────────────────────────── */}
      <header className="mb-10 text-center">
        <h1 className="bg-gradient-to-r from-hn-primary via-pink-300 to-hn-primary bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          DMCA &amp; Copyright Policy
        </h1>
        <p className="mt-3 text-sm text-hn-text-muted/60">
          Last updated: March 18, 2026
        </p>
      </header>

      {/* ── Body ────────────────────────────────────────────────── */}
      <article className="space-y-10 text-[15px] leading-relaxed text-hn-text/75">
        {/* Critical Disclaimer */}
        <section className="rounded-xl border border-hn-primary/20 bg-hn-primary/5 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-hn-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Important Disclaimer
          </h2>
          <p className="text-hn-text-muted/90">
            <strong className="text-hn-text">
              NimeNime does NOT host, store, upload, or distribute any video,
              media, or media files (such as .mp4, .mkv, .avi, or any other
              format) on its servers.
            </strong>{" "}
            NimeNime functions solely as an index and search engine
            (aggregator) of links that are freely and publicly available on
            the internet. All indexed content is hosted by non-affiliated
            third-party websites and services.
          </p>
        </section>

        {/* 1 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            1. Nature of the Service
          </h2>
          <p>
            NimeNime operates similarly to a search engine. Our automated
            systems crawl and index links to anime content that are already
            publicly accessible on the internet. We do not upload, modify,
            encode, re-host, or otherwise reproduce any copyrighted material.
            The actual media files reside on third-party servers operated by
            entities such as (but not limited to) Vidhide, Doodstream,
            StreamWish, FileLions, and other video hosting platforms.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            2. Third-Party Content Hosts
          </h2>
          <p className="mb-3">
            Since all video and media content is hosted and served by
            third-party platforms, any copyright infringement concerns
            relating to the actual video files <strong className="text-hn-text">must</strong>{" "}
            be directed to the respective third-party host. Below are common
            hosts whose content may appear in our index:
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              "Vidhide",
              "Doodstream",
              "StreamWish",
              "FileLions",
              "Mp4Upload",
              "StreamTape",
            ].map((host) => (
              <div
                key={host}
                className="rounded-lg border border-hn-border/50 bg-hn-card px-4 py-2.5 text-center text-sm font-medium text-hn-text-muted/90"
              >
                {host}
              </div>
            ))}
          </div>
          <p className="mt-3 text-hn-text-muted/70 text-sm">
            Each of these platforms has its own DMCA / abuse contact. Please
            direct content removal requests to the platform that actually
            hosts the material.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            3. Link Removal from Our Index
          </h2>
          <p className="mb-3">
            While NimeNime does not host copyrighted material, we understand
            that copyright holders may wish to have specific links removed
            from our index. If you are a copyright owner (or an authorized
            agent) and would like to request the removal of links from
            NimeNime&rsquo;s index, please submit a written notice to:
          </p>
          <div className="rounded-xl border border-hn-border/50 bg-hn-card p-5">
            <p className="text-sm text-hn-text-muted/70">
              Email for Link Removal Requests:
            </p>
            <a
              href="mailto:legal@nime-nime.web.id"
              className="mt-1 inline-block text-lg font-semibold text-hn-primary hover:underline"
            >
              legal@nime-nime.web.id
            </a>
          </div>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            4. Requirements for a Valid Takedown Request
          </h2>
          <p className="mb-3">
            To process your link removal request efficiently, please include
            the following information in your notice:
          </p>
          <ol className="list-inside list-decimal space-y-2 pl-2 text-hn-text/65">
            <li>
              <strong className="text-hn-text-muted/90">Identification of the copyrighted work</strong>{" "}
              — A description or link to the original copyrighted work that
              you claim is being infringed.
            </li>
            <li>
              <strong className="text-hn-text-muted/90">Identification of the infringing links</strong>{" "}
              — The specific NimeNime URLs that index the allegedly infringing
              content. Provide exact page URLs wherever possible.
            </li>
            <li>
              <strong className="text-hn-text-muted/90">Your contact information</strong>{" "}
              — Full legal name, email address, phone number, and physical
              address.
            </li>
            <li>
              <strong className="text-hn-text-muted/90">Statement of good faith</strong>{" "}
              — A statement that you have a good faith belief that the use of
              the material is not authorized by the copyright owner, its
              agent, or the law.
            </li>
            <li>
              <strong className="text-hn-text-muted/90">Statement of accuracy</strong>{" "}
              — A statement, made under penalty of perjury, that the
              information in your notice is accurate and that you are the
              copyright owner or authorized to act on behalf of the copyright
              owner.
            </li>
            <li>
              <strong className="text-hn-text-muted/90">Signature</strong> — A
              physical or electronic signature of the copyright owner or
              authorized representative.
            </li>
          </ol>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            5. Processing Time
          </h2>
          <div className="rounded-xl border border-hn-secondary/20 bg-hn-secondary/5 p-5">
            <p className="text-hn-text-muted/90">
              Upon receipt of a valid and complete takedown request, NimeNime
              will review and process the removal of the identified links from
              our index within{" "}
              <strong className="text-hn-text">3 – 5 business days</strong>.
              You will receive a confirmation email once the links have been
              removed.
            </p>
          </div>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            6. Counter-Notification
          </h2>
          <p>
            If you believe that a link was removed from our index in error or
            due to misidentification, you may submit a counter-notification to{" "}
            <a
              href="mailto:legal@nime-nime.web.id"
              className="text-hn-primary hover:underline"
            >
              legal@nime-nime.web.id
            </a>{" "}
            with: (a) identification of the removed link(s), (b) a statement
            under penalty of perjury that you have a good faith belief that
            the link was removed as a result of mistake or misidentification,
            (c) your name, address, and phone number, and (d) a statement
            that you consent to the jurisdiction of the courts in your
            district.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            7. Repeat Infringers
          </h2>
          <p>
            NimeNime respects intellectual property rights and will, in
            appropriate circumstances, disable and/or terminate access to
            users who are repeat infringers.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-hn-text">
            8. Contact
          </h2>
          <p>
            For all DMCA and copyright-related inquiries, please contact:{" "}
            <a
              href="mailto:legal@nime-nime.web.id"
              className="text-hn-primary hover:underline"
            >
              legal@nime-nime.web.id
            </a>
          </p>
          <p className="mt-2">
            For general inquiries, please email{" "}
            <a
              href="mailto:admin@nime-nime.web.id"
              className="text-hn-primary hover:underline"
            >
              admin@nime-nime.web.id
            </a>{" "}
            or visit our{" "}
            <Link href="/contact" className="text-hn-primary hover:underline">
              Contact page
            </Link>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
