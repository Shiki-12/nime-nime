import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "404 - Page Not Found | NimeNime",
    description: "Waduh! Sepertinya halaman yang kamu cari sudah ber-Isekai ke dunia lain.",
};

export default function NotFound() {
    return (
        <div className="relative flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Giant 404 */}
                <h1 className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent text-7xl md:text-9xl font-extrabold tracking-tighter drop-shadow-sm">
                    404
                </h1>

                {/* Title */}
                <h2 className="mt-4 text-2xl md:text-3xl font-bold text-white tracking-tight">
                    Page Not Found
                </h2>

                {/* Anime-themed description */}
                <p className="mt-4 max-w-md text-base md:text-lg text-white/50 leading-relaxed">
                    Waduh! Sepertinya halaman yang kamu cari sudah ber-Isekai ke dunia lain, atau link-nya memang rusak.
                </p>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {/* Primary Button: Home */}
                    <Link
                        href="/"
                        className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-hn-primary px-6 py-3 font-semibold text-hn-dark transition-all duration-300 hover:bg-[#ff9ec2] hover:shadow-[0_0_20px_rgba(255,186,222,0.4)] hover:-translate-y-0.5"
                    >
                        <svg
                            className="h-5 w-5 transition-transform group-hover:scale-110"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                        <span>Kembali ke Beranda</span>
                    </Link>

                    {/* Secondary Button: Report */}
                    <Link
                        href="/contact"
                        className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white/[0.05] px-6 py-3 font-medium text-white/80 ring-1 ring-white/15 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white hover:ring-white/30"
                    >
                        <svg
                            className="h-5 w-5 opacity-70 transition-opacity group-hover:opacity-100"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <span>Lapor Halaman Rusak</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
