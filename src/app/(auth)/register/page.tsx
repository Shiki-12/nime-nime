"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Client-side validation
        if (!name.trim() || !email.trim() || !password) {
            setError("All fields are required.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed.");
                return;
            }

            setSuccess(true);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── Success state ──────────────────────────────────────────
    if (success) {
        return (
            <div className="w-full max-w-md rounded-2xl bg-hn-card p-8 text-center shadow-2xl">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-hn-green/10">
                    <svg className="h-8 w-8 text-hn-green" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                </div>
                <h2 className="mb-2 text-xl font-bold text-white">Check your email</h2>
                <p className="mb-6 text-sm text-white/50">
                    We&apos;ve sent a verification link to <strong className="text-white">{email}</strong>. Click the link to activate your account.
                </p>
                <Link
                    href="/login"
                    className="inline-block rounded-full bg-hn-primary px-6 py-2.5 text-sm font-bold text-hn-dark transition-all hover:scale-105 hover:brightness-110"
                >
                    Go to Login
                </Link>
            </div>
        );
    }

    // ── Form state ─────────────────────────────────────────────
    return (
        <div className="w-full max-w-md rounded-2xl bg-hn-card p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-extrabold text-hn-primary">NimeNime</h1>
                <p className="mt-1 text-sm text-white/40">Create your account</p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/30">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-lg border border-white/5 bg-hn-dark px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-hn-primary/40"
                        disabled={loading}
                    />
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/30">
                        Email
                    </label>
                    <input
                        id="email"
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
                    <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/30">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full rounded-lg border border-white/5 bg-hn-dark px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-hn-primary/40"
                        disabled={loading}
                    />
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/30">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
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
                            Creating account…
                        </>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>

            {/* Footer link */}
            <p className="mt-6 text-center text-sm text-white/40">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-hn-primary transition-colors hover:text-hn-primary/80">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
