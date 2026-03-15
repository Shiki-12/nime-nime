"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="w-full max-w-md rounded-2xl bg-hn-card p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-extrabold text-hn-primary">NimeNime 🎌</h1>
                <p className="mt-1 text-sm text-white/40">Sign in to your account</p>
            </div>

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
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-lg border border-white/5 bg-hn-dark px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-hn-primary/40"
                        disabled={loading}
                    />
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
