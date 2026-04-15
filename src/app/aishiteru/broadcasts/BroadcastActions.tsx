"use client";

import { useTransition } from "react";
import { toggleBroadcast, deleteBroadcast } from "./actions";
import { swalDestructive, swalToast } from "@/lib/swal";

// ── Toggle Active Button ────────────────────────────────────────────
export function ToggleButton({
    broadcastId,
    isActive,
}: {
    broadcastId: string;
    isActive: boolean;
}) {
    const [isPending, startTransition] = useTransition();

    function handleToggle() {
        startTransition(async () => {
            const result = await toggleBroadcast(broadcastId);
            if (!result.success) {
                swalToast({
                    icon: "error",
                    title: result.error ?? "Failed to toggle",
                });
            } else {
                swalToast({
                    icon: "success",
                    title: isActive ? "Broadcast deactivated" : "Broadcast activated",
                });
            }
        });
    }

    return (
        <button
            type="button"
            disabled={isPending}
            onClick={handleToggle}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 transition-all duration-200 disabled:opacity-50 ${
                isActive
                    ? "text-amber-400 ring-amber-500/20 hover:bg-amber-500/10 hover:ring-amber-500/40"
                    : "text-emerald-400 ring-emerald-500/20 hover:bg-emerald-500/10 hover:ring-emerald-500/40"
            }`}
        >
            {isPending ? (
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" className="opacity-75" />
                </svg>
            ) : isActive ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                    <path d="M4.5 2A2.5 2.5 0 0 0 2 4.5v2.879a2.5 2.5 0 0 0 .732 1.767l4.5 4.5a2.5 2.5 0 0 0 3.536 0l2.878-2.878a2.5 2.5 0 0 0 0-3.536l-4.5-4.5A2.5 2.5 0 0 0 7.38 2H4.5Z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                    <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.844-8.791a.75.75 0 0 0-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.15-.043l4.25-5.5Z" clipRule="evenodd" />
                </svg>
            )}
            {isActive ? "Pause" : "Activate"}
        </button>
    );
}

// ── Delete Button ───────────────────────────────────────────────────
export function DeleteButton({
    broadcastId,
    preview,
}: {
    broadcastId: string;
    preview: string;
}) {
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        swalDestructive
            .fire({
                title: "Delete Broadcast?",
                html: `This will permanently remove:<br/><strong class="text-white/70">"${preview.slice(0, 60)}${preview.length > 60 ? "…" : ""}"</strong>`,
                confirmButtonText: "Yes, delete",
            })
            .then((result) => {
                if (result.isConfirmed) {
                    startTransition(async () => {
                        const res = await deleteBroadcast(broadcastId);
                        if (!res.success) {
                            swalToast({
                                icon: "error",
                                title: res.error ?? "Failed to delete",
                            });
                        } else {
                            swalToast({
                                icon: "success",
                                title: "Broadcast deleted",
                            });
                        }
                    });
                }
            });
    }

    return (
        <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 ring-1 ring-red-500/20 transition-all duration-200 hover:bg-red-500/10 hover:ring-red-500/40 disabled:opacity-50"
        >
            {isPending ? (
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" className="opacity-75" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                </svg>
            )}
            Delete
        </button>
    );
}
