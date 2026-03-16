"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

/**
 * Runs once after detecting an authenticated session.
 * Reads localStorage, sends data to /api/sync, and clears localStorage on success.
 */
export function useSyncOnLogin() {
    const { data: session, status } = useSession();
    const hasSynced = useRef(false);

    useEffect(() => {
        // Only run when authenticated and not already synced this session
        if (status !== "authenticated" || !session?.user?.id) return;
        if (hasSynced.current) return;

        // Check sessionStorage flag to avoid re-syncing on every page navigation
        const syncFlag = sessionStorage.getItem("nimenime-synced");
        if (syncFlag === "true") {
            hasSynced.current = true;
            return;
        }

        hasSynced.current = true;

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

                if (hasData) {
                    const res = await fetch("/api/sync", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ saved, history }),
                    });

                    if (res.ok) {
                        // Clear localStorage after successful sync
                        localStorage.removeItem("nimenime-saved");
                        localStorage.removeItem("nimenime-watch-history");
                    }
                }

                // Set flag regardless (even if no data, to avoid re-checking)
                sessionStorage.setItem("nimenime-synced", "true");
            } catch (error) {
                console.warn("Sync failed:", error);
                // Don't set flag so it retries on next navigation
                hasSynced.current = false;
            }
        };

        doSync();
    }, [status, session]);
}
