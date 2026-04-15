"use client";

import { useState, useEffect, useCallback } from "react";

interface BroadcastItem {
    id: string;
    message: string;
    type: "INFO" | "WARNING" | "DANGER" | "SUCCESS";
}

const DISMISSED_KEY = "dismissed-broadcasts";

function getDismissedIds(): Set<string> {
    if (typeof window === "undefined") return new Set();
    try {
        const raw = localStorage.getItem(DISMISSED_KEY);
        if (!raw) return new Set();
        return new Set(JSON.parse(raw) as string[]);
    } catch {
        return new Set();
    }
}

function saveDismissedId(id: string) {
    try {
        const ids = getDismissedIds();
        ids.add(id);
        localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
    } catch {
        /* silent */
    }
}

// ── Style map per type ──────────────────────────────────────────────
function getTypeStyles(type: BroadcastItem["type"]) {
    switch (type) {
        case "INFO":
            return {
                bg: "bg-[var(--hn-primary)]/[0.08]",
                border: "border-[var(--hn-primary)]/[0.15]",
                text: "text-[var(--hn-primary)]",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
                    </svg>
                ),
                closeHover: "hover:bg-[var(--hn-primary)]/20",
            };
        case "WARNING":
            return {
                bg: "bg-amber-500/[0.08]",
                border: "border-amber-500/[0.15]",
                text: "text-amber-400",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                    </svg>
                ),
                closeHover: "hover:bg-amber-500/20",
            };
        case "DANGER":
            return {
                bg: "bg-red-500/[0.08]",
                border: "border-red-500/[0.15]",
                text: "text-red-400",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                    </svg>
                ),
                closeHover: "hover:bg-red-500/20",
            };
        case "SUCCESS":
            return {
                bg: "bg-emerald-500/[0.08]",
                border: "border-emerald-500/[0.15]",
                text: "text-emerald-400",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                ),
                closeHover: "hover:bg-emerald-500/20",
            };
    }
}

export default function AnnouncementBar() {
    const [broadcast, setBroadcast] = useState<BroadcastItem | null>(null);
    const [visible, setVisible] = useState(false);

    // Fetch active broadcasts
    useEffect(() => {
        let cancelled = false;

        async function fetchBroadcasts() {
            try {
                const res = await fetch("/api/broadcasts");
                if (!res.ok) return;
                const data: BroadcastItem[] = await res.json();
                if (cancelled) return;

                const dismissed = getDismissedIds();
                const active = data.find((b) => !dismissed.has(b.id));

                if (active) {
                    setBroadcast(active);
                    // Small delay for smooth entrance animation
                    requestAnimationFrame(() => {
                        if (!cancelled) setVisible(true);
                    });
                }
            } catch {
                /* silent */
            }
        }

        fetchBroadcasts();
        return () => {
            cancelled = true;
        };
    }, []);

    // Update CSS variable for layout offset
    useEffect(() => {
        if (visible && broadcast) {
            document.documentElement.style.setProperty(
                "--announcement-height",
                "40px"
            );
        } else {
            document.documentElement.style.setProperty(
                "--announcement-height",
                "0px"
            );
        }

        return () => {
            document.documentElement.style.setProperty(
                "--announcement-height",
                "0px"
            );
        };
    }, [visible, broadcast]);

    const handleDismiss = useCallback(() => {
        if (!broadcast) return;
        saveDismissedId(broadcast.id);
        setVisible(false);
        // After transition, clear the broadcast
        setTimeout(() => setBroadcast(null), 300);
    }, [broadcast]);

    if (!broadcast) return null;

    const styles = getTypeStyles(broadcast.type);

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ease-out ${
                visible
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-full opacity-0"
            }`}
        >
            <div
                className={`flex h-10 items-center justify-center gap-2 border-b px-4 backdrop-blur-xl ${styles.bg} ${styles.border} ${styles.text}`}
            >
                {/* Icon */}
                {styles.icon}

                {/* Message */}
                <p className="truncate text-xs font-medium sm:text-sm">
                    {broadcast.message}
                </p>

                {/* Dismiss */}
                <button
                    onClick={handleDismiss}
                    className={`ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors ${styles.closeHover}`}
                    aria-label="Dismiss announcement"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                    >
                        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
