"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function AuthError() {
    const searchParams = useSearchParams();
    const urlError = searchParams.get("error");
    
    if (urlError === "OAuthAccountNotLinked") {
        return (
            <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
                An account with this email already exists. Please log in using your password instead.
            </div>
        );
    }
    return null;
}

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Email and password are required.");
            return;
        }

        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email: email.trim().toLowerCase(),
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
                return;
            }

            router.push("/");
            router.refresh();
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        await signIn("google", { callbackUrl: "/" });
    };

    return (
        <div className="w-full max-w-md rounded-2xl bg-hn-card p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-extrabold text-hn-primary">NimeNime 🎌</h1>
                <p className="mt-1 text-sm text-white/40">Sign in to your account</p>
            </div>

            <Suspense fallback={null}>
                <AuthError />
            </Suspense>

            {/* Error */}
            {error && (
                <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                    <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/30">
                        Email
                    </label>
                    <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-white/5 bg-hn-dark px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-hn-primary/40"
                        disabled={loading}
                    />
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/30">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full rounded-lg border border-white/5 bg-hn-dark px-4 py-3 pr-10 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-hn-primary/40"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-hn-primary py-3 text-sm font-bold text-hn-dark shadow-lg shadow-hn-primary/20 transition-all hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                            </svg>
                            Signing in…
                        </>
                    ) : (
                        "Sign In"
                    )}
                </button>
            </form>

            {/* ── Divider ────────────────────────────────────────── */}
            <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-medium text-white/30">or continue with</span>
                <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* ── Google Sign-In ──────────────────────────────────── */}
            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="group flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:shadow-lg hover:shadow-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {googleLoading ? (
                    <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                        </svg>
                        Redirecting…
                    </>
                ) : (
                    <>
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </>
                )}
            </button>

            {/* Footer link */}
            <p className="mt-6 text-center text-sm text-white/40">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-hn-primary transition-colors hover:text-hn-primary/80">
                    Create one
                </Link>
            </p>
        </div>
    );
}

