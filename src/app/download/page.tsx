import Link from "next/link";

export default function DownloadPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-hn-dark -mb-16">
      {/* Background elements */}
      <div className="absolute inset-0 bg-hn-dark" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-300 ring-1 ring-blue-400/20 backdrop-blur-sm">
          New Release
        </span>

        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-hn-text sm:text-5xl md:text-6xl">
          Get <span className="text-hn-primary">NimeNime</span> on Android
        </h1>

        <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-hn-text-muted/80 sm:text-lg">
          Watch your favorite anime on the go, no ads, fast streaming, and smart
          watch history!
        </p>

        <Link
          href="https://github.com/Shiki-12/Nime-nime/releases/download/v1.0-release/nime-nime.apk"
          className="group inline-flex items-center gap-3 rounded-full bg-hn-primary px-8 py-4 text-sm font-bold text-hn-text shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all hover:bg-blue-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.4158.4158 0 0 0-.1521-.5676.416.416 0 0 0-.5676.1521l-2.0223 3.503C15.5902 8.244 13.8533 7.8546 12 7.8546c-1.8533 0-3.5902.3894-5.1368 1.0954L4.841 5.4468a.417.417 0 0 0-.5676-.1521.4157.4157 0 0 0-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
          </svg>
          Download APK for Android
        </Link>

        <p className="mt-8 text-[11px] text-hn-text-muted/50 uppercase tracking-widest">
          Version 1.0.0 • Requires Android 7.0+
        </p>
      </div>
    </div>
  );
}
