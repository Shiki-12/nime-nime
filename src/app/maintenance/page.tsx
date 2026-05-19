import type { Metadata } from "next";

const DEFAULT_MAINTENANCE_MESSAGE = "Admin belum bayar tagihan, jadi yaudah.";

export const metadata: Metadata = {
  title: "Maintenance Mode - NimeNime",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  const message = process.env.MAINTENANCE_MESSAGE || DEFAULT_MAINTENANCE_MESSAGE;

  return (
    <div className="fixed inset-0 z-[100000] flex min-h-screen items-center justify-center overflow-hidden bg-hn-body px-5 py-10 text-hn-text">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,186,222,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(202,233,98,0.12),transparent_32%),linear-gradient(135deg,rgba(25,24,38,0.98),rgba(32,31,49,0.96))]" />
      <div className="absolute left-8 top-8 h-28 w-28 rounded-full border border-hn-primary/20 bg-hn-primary/5 blur-sm" />
      <div className="absolute bottom-10 right-8 h-36 w-36 rounded-full border border-hn-secondary/10 bg-hn-secondary/5 blur-sm" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <section className="relative w-full max-w-2xl rounded-lg border border-hn-border bg-hn-dark/80 p-7 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-hn-primary/15 text-lg font-black text-hn-primary ring-1 ring-hn-primary/25">
            N
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-hn-secondary">
              NimeNime
            </p>
            <p className="text-sm text-hn-text-muted">temporary shutdown</p>
          </div>
        </div>

        <div className="space-y-5">
          <h1 className="text-4xl font-black tracking-normal text-hn-text sm:text-6xl">
            Maintenance Mode
          </h1>
          <p className="max-w-xl text-lg leading-8 text-hn-text/85 sm:text-xl">{message}</p>
          <p className="text-base text-hn-text-muted">nanti di fix kalau ada duit.</p>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-3 border-t border-hn-border pt-6">
          <span className="h-2.5 w-2.5 rounded-full bg-hn-secondary shadow-[0_0_18px_rgba(202,233,98,0.85)]" />
          <p className="text-sm font-medium text-hn-text-muted">NimeNime will be back soon.</p>
        </div>
      </section>
    </div>
  );
}
