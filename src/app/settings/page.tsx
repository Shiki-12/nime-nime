"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { swalDestructive, swalToast } from "@/lib/swal";

export default function SettingsPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [name, setName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [isNsfwEnabled, setIsNsfwEnabled] = useState(
        !!session?.user?.nsfwEnabled
    );
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Pre-fill form fields when session loads (NSFW state is NOT synced here)
    useEffect(() => {
        if (session?.user) {
            setName(session.user.name ?? "");
            setAvatarPreview(session.user.image ?? null);
        }
    }, [session]);

    // Redirect if not authenticated
    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-hn-primary border-t-transparent" />
            </div>
        );
    }

    if (!session?.user) {
        router.push("/login");
        return null;
    }

    const hasPassword = session.user.hasPassword;
    const initials = (session.user.name ?? session.user.email ?? "U")
        .charAt(0)
        .toUpperCase();

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: "error", text: "File size must be under 5 MB." });
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);

            if (newPassword) {
                if (newPassword.length < 8) {
                    setMessage({
                        type: "error",
                        text: "Password must be at least 8 characters.",
                    });
                    setLoading(false);
                    return;
                }
                if (hasPassword) {
                    formData.append("currentPassword", currentPassword);
                }
                formData.append("newPassword", newPassword);
            }

            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const res = await fetch("/api/user/settings", {
                method: "PUT",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: "error", text: data.error });
                return;
            }

            // Refresh the session to pick up new data
            await update({ name: data.user.name, image: data.user.image });

            // Update avatar preview from the saved path if uploaded
            if (data.user?.image) {
                setAvatarPreview(data.user.image);
            }

            setMessage({ type: "success", text: "Settings saved!" });
            setCurrentPassword("");
            setNewPassword("");
            setAvatarFile(null);

            // Force navbar to re-render with new session
            router.refresh();
        } catch {
            setMessage({
                type: "error",
                text: "Network error. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    // ── NSFW Toggle Handler (Strict Optimistic UI) ────────────────
    const handleNsfwToggle = async () => {
        const intendedState = !isNsfwEnabled;

        // 1. Optimistic flip — visually instant
        setIsNsfwEnabled(intendedState);

        // 2. If turning ON, confirm with themed SweetAlert
        if (intendedState) {
            const result = await swalDestructive.fire({
                title: "Warning: 18+ Content",
                text: "This section contains explicit adult material. You must be at least 18 years old to proceed. By confirming, you acknowledge that you are of legal age.",
                icon: "warning",
                confirmButtonText: "I am 18 or older",
                cancelButtonText: "Cancel",
            });

            if (!result.isConfirmed) {
                // Cancelled → revert instantly
                setIsNsfwEnabled(false);
                return;
            }
        }

        // 3. Persist to database
        try {
            const res = await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nsfwEnabled: intendedState }),
            });

            if (!res.ok) {
                // API failed → revert
                setIsNsfwEnabled(!intendedState);
                swalToast({ title: "Failed to update setting.", icon: "error" });
                return;
            }

            // 4. Sync JWT + server components (Navbar)
            await update({ nsfwEnabled: intendedState });
            router.refresh();

            swalToast({
                title: intendedState ? "18+ Content Enabled" : "18+ Content Disabled",
                icon: intendedState ? "success" : "info",
            });
        } catch {
            // Network error → revert
            setIsNsfwEnabled(!intendedState);
            swalToast({ title: "Network error. Please try again.", icon: "error" });
        }
    };

    return (
        <div className="mx-auto max-w-xl px-4 pb-16 pt-24">
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">
                    Account Settings
                </h1>
                <p className="mt-1 text-sm text-white/40">
                    Manage your profile and security
                </p>
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${
                        message.type === "success"
                            ? "bg-hn-green/10 text-hn-green"
                            : "bg-red-500/10 text-red-400"
                    }`}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* ── Avatar Section ─────────────────────────────── */}
                <div className="rounded-2xl border border-white/[0.06] bg-hn-card p-6">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/30">
                        Profile Picture
                    </h2>
                    <div className="flex items-center gap-5">
                        {/* Preview */}
                        <div className="relative h-20 w-20 shrink-0">
                            {avatarPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="h-20 w-20 rounded-full border-2 border-white/10 object-cover"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/10 bg-hn-primary/15 text-2xl font-bold text-hn-primary">
                                    {initials}
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/10"
                            >
                                Choose Image
                            </button>
                            <p className="mt-2 text-xs text-white/30">
                                JPG, PNG, WebP, or GIF. Max 5 MB.
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Profile Info ────────────────────────────────── */}
                <div className="rounded-2xl border border-white/[0.06] bg-hn-card p-6">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/30">
                        Profile
                    </h2>
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label
                                htmlFor="settings-name"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/30"
                            >
                                Name
                            </label>
                            <input
                                id="settings-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-lg border border-white/5 bg-hn-dark px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-hn-primary/40"
                                disabled={loading}
                            />
                        </div>

                        {/* Email (read-only) */}
                        <div>
                            <label
                                htmlFor="settings-email"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/30"
                            >
                                Email
                            </label>
                            <input
                                id="settings-email"
                                type="email"
                                value={session.user.email ?? ""}
                                disabled
                                className="w-full cursor-not-allowed rounded-lg border border-white/5 bg-hn-dark/50 px-4 py-3 text-sm text-white/40 outline-none"
                            />
                            <p className="mt-1 text-xs text-white/20">
                                Email cannot be changed.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Password Section ────────────────────────────── */}
                <div className="rounded-2xl border border-white/[0.06] bg-hn-card p-6">
                    <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-white/30">
                        Password
                    </h2>
                    {!hasPassword ? (
                        <p className="mt-2 text-sm text-white/40">
                            You are logged in with Google. Password management is handled by your Google account.
                        </p>
                    ) : (
                        <>
                            <p className="mb-4 text-xs text-white/20">
                                Enter your current password to set a new one.
                            </p>
                            <div className="space-y-4">
                                {/* Current Password */}
                                <div className="relative">
                                    <input
                                        id="settings-current-pw"
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) =>
                                            setCurrentPassword(e.target.value)
                                        }
                                        placeholder="Enter current password"
                                        className="w-full rounded-lg border border-white/5 bg-hn-dark px-4 py-3 pr-10 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-hn-primary/40"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                                    >
                                        {showCurrentPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                                        )}
                                    </button>
                                </div>

                                {/* New Password */}
                                <div className="relative">
                                    <input
                                        id="settings-new-pw"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        className="w-full rounded-lg border border-white/5 bg-hn-dark px-4 py-3 pr-10 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-hn-primary/40"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                                    >
                                        {showNewPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ── Content Preferences (NSFW Toggle) ──────────── */}
                <div className="rounded-2xl border border-white/[0.06] bg-hn-card p-6">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/30">
                        Content Preferences
                    </h2>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white/80">
                                Enable 18+ Content
                            </p>
                            <p className="mt-0.5 text-xs text-white/30">
                                Unlock the adult anime section. You must be 18 years or older.
                            </p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={isNsfwEnabled}
                            aria-label="Toggle 18+ content"
                            onClick={handleNsfwToggle}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-hn-dark ${
                                isNsfwEnabled
                                    ? "bg-red-500 focus:ring-red-500"
                                    : "bg-white/10 focus:ring-white/20"
                            }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                    isNsfwEnabled ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>
                    {isNsfwEnabled && (
                        <div className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400/80">
                            The 18+ section is accessible from your profile dropdown menu.
                        </div>
                    )}
                </div>

                {/* ── Submit ──────────────────────────────────────── */}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-hn-primary py-3 text-sm font-bold text-hn-dark shadow-lg shadow-hn-primary/20 transition-all hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <svg
                                className="h-4 w-4 animate-spin"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
                                />
                            </svg>
                            Saving…
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </button>
            </form>
        </div>
    );
}
