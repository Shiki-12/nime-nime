"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * Runs once after detecting an authenticated session.
 * Reads localStorage, sends data to /api/sync, and clears localStorage on success.
 */
export function useSyncOnLogin() {
    const { status } = useSession();

    useEffect(() => {
        // Only run when authenticated
        if (status !== "authenticated") return;

        // Check sessionStorage flag to avoid re-syncing on every page navigation
        try {
            const syncFlag = sessionStorage.getItem("nimenime-synced");
            if (syncFlag === "true") return;
        } catch {
            // sessionStorage not available (SSR edge case)
            return;
        }

        // Mark as syncing immediately to prevent duplicate calls
        sessionStorage.setItem("nimenime-synced", "true");

        const doSync = async () => {
            try {
                // Read localStorage data
                const savedRaw = localStorage.getItem("nimenime-saved");
                const historyRaw = localStorage.getItem("nimenime-watch-history");

                const saved = savedRaw ? JSON.parse(savedRaw) : [];
                const history = historyRaw ? JSON.parse(historyRaw) : {};

                // Only sync if there's actually data
                const hasData =
                    (Array.isArray(saved) && saved.length > 0) ||
                    Object.keys(history).length > 0;

                if (!hasData) return;

                const res = await fetch("/api/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ saved, history }),
                });

                if (res.ok) {
                    // Clear localStorage after successful sync
                    localStorage.removeItem("nimenime-saved");
                    localStorage.removeItem("nimenime-watch-history");
                } else {
                    // Sync failed, allow retry on next navigation
                    sessionStorage.removeItem("nimenime-synced");
                }
            } catch (error) {
                console.warn("Sync failed:", error);
                // Allow retry on next navigation
                sessionStorage.removeItem("nimenime-synced");
            }
        };

        doSync();
    }, [status]);
}
