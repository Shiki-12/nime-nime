"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type VerifyState = "loading" | "success" | "error";

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [state, setState] = useState<VerifyState>(() => token ? "loading" : "error");
    const [message, setMessage] = useState(() => token ? "" : "No verification token provided.");
    const hasRun = useRef(false);

    useEffect(() => {
        if (!token || hasRun.current) return;
        hasRun.current = true;

        let cancelled = false;

        (async () => {
            try {
                const res = await fetch(`/api/auth/verify?token=${token}`);
                const data = await res.json();
                if (cancelled) return;

                if (res.ok) {
                    setState("success");
                    setMessage(data.message || "Your email has been verified!");
                } else {
                    setState("error");
                    setMessage(data.error || "Verification failed.");
                }
            } catch {
                if (!cancelled) {
                    setState("error");
                    setMessage("Network error. Please try again.");
                }
            }
        })();

        return () => { cancelled = true; };
    }, [token]);

    return (
        <div className="w-full max-w-md rounded-2xl bg-hn-card p-8 text-center shadow-2xl">
            {/* Loading */}
            {state === "loading" && (
                <>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                        <svg className="h-10 w-10 animate-spin text-hn-primary" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-white">Verifying your email…</h2>
                    <p className="mt-2 text-sm text-white/40">Please wait a moment.</p>
                </>
            )}

            {/* Success */}
            {state === "success" && (
                <>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-hn-green/10">
                        <svg className="h-8 w-8 text-hn-green" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    </div>
                    <h2 className="mb-2 text-xl font-bold text-white">Email Verified!</h2>
                    <p className="mb-6 text-sm text-white/50">{message}</p>
                    <Link
                        href="/login"
                        className="inline-block rounded-full bg-hn-primary px-6 py-2.5 text-sm font-bold text-hn-dark transition-all hover:scale-105 hover:brightness-110"
                    >
                        Sign In Now
                    </Link>
                </>
            )}

            {/* Error */}
            {state === "error" && (
                <>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                        <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                    </div>
                    <h2 className="mb-2 text-xl font-bold text-white">Verification Failed</h2>
                    <p className="mb-6 text-sm text-white/50">{message}</p>
                    <Link
                        href="/register"
                        className="inline-block rounded-full bg-white/10 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
                    >
                        Back to Register
                    </Link>
                </>
            )}
        </div>
    );
}
