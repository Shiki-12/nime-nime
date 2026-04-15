import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BroadcastForm from "./BroadcastForm";
import { ToggleButton, DeleteButton } from "./BroadcastActions";

// ── Helpers ─────────────────────────────────────────────────────────
function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function typeBadgeClass(type: string): string {
    switch (type) {
        case "INFO":
            return "bg-sky-500/15 text-sky-400 ring-sky-500/30";
        case "WARNING":
            return "bg-amber-500/15 text-amber-400 ring-amber-500/30";
        case "DANGER":
            return "bg-red-500/15 text-red-400 ring-red-500/30";
        case "SUCCESS":
            return "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30";
        default:
            return "bg-white/5 text-hn-text-muted ring-white/10";
    }
}

function typeIcon(type: string): string {
    switch (type) {
        case "INFO":
            return "ℹ️";
        case "WARNING":
            return "⚠️";
        case "DANGER":
            return "🚨";
        case "SUCCESS":
            return "✅";
        default:
            return "📢";
    }
}

type StatusInfo = {
    label: string;
    className: string;
    pulse?: boolean;
};

function getStatus(
    isActive: boolean,
    startDate: Date,
    endDate: Date
): StatusInfo {
    const now = new Date();

    if (!isActive) {
        return {
            label: "Paused",
            className: "bg-white/5 text-hn-text-muted ring-white/10",
        };
    }

    if (now < startDate) {
        return {
            label: "Scheduled",
            className: "bg-blue-500/15 text-blue-400 ring-blue-500/30",
        };
    }

    if (now >= startDate && now <= endDate) {
        return {
            label: "Live",
            className: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
            pulse: true,
        };
    }

    return {
        label: "Expired",
        className: "bg-white/5 text-hn-text-muted/60 ring-white/5",
    };
}

export default async function BroadcastsPage() {
    // ── Auth Guard ──────────────────────────────────────────────────
    const session = await auth();
    const role = session?.user?.role;

    if (!session || (role !== "ADMIN" && role !== "OWNER")) {
        notFound();
    }

    // ── Fetch all broadcasts ────────────────────────────────────────
    const broadcasts = await prisma.broadcast.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-20 md:pb-0">
            {/* ── Page Header ────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-hn-text">
                        Broadcasts
                    </h1>
                    <p className="mt-1 text-sm text-hn-text-muted">
                        {broadcasts.length} total broadcast
                        {broadcasts.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* ── Create Form ────────────────────────────────────────── */}
            <BroadcastForm />

            {/* ── Broadcasts List ─────────────────────────────────────── */}
            <div className="overflow-hidden rounded-xl border border-hn-border/50 bg-hn-card backdrop-blur-sm">
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-hn-border/50">
                                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                    Message
                                </th>
                                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                    Type
                                </th>
                                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                    Schedule
                                </th>
                                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {broadcasts.map((b) => {
                                const status = getStatus(
                                    b.isActive,
                                    b.startDate,
                                    b.endDate
                                );
                                return (
                                    <tr
                                        key={b.id}
                                        className="transition-colors duration-200 hover:bg-white/[0.02]"
                                    >
                                        {/* Status */}
                                        <td className="px-6 py-3.5">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${status.className}`}
                                            >
                                                {status.pulse && (
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                                                    </span>
                                                )}
                                                {status.label}
                                            </span>
                                        </td>

                                        {/* Message */}
                                        <td className="max-w-xs px-6 py-3.5">
                                            <p className="truncate text-sm text-hn-text">
                                                {b.message}
                                            </p>
                                        </td>

                                        {/* Type */}
                                        <td className="px-6 py-3.5">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${typeBadgeClass(b.type)}`}
                                            >
                                                {typeIcon(b.type)} {b.type}
                                            </span>
                                        </td>

                                        {/* Schedule */}
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <div className="text-xs text-hn-text-muted">
                                                <p>
                                                    <span className="text-hn-text-muted/50">
                                                        From:{" "}
                                                    </span>
                                                    {formatDate(b.startDate)}
                                                </p>
                                                <p>
                                                    <span className="text-hn-text-muted/50">
                                                        To:{" "}
                                                    </span>
                                                    {formatDate(b.endDate)}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <ToggleButton
                                                    broadcastId={b.id}
                                                    isActive={b.isActive}
                                                />
                                                <DeleteButton
                                                    broadcastId={b.id}
                                                    preview={b.message}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden divide-y divide-white/[0.04]">
                    {broadcasts.map((b) => {
                        const status = getStatus(
                            b.isActive,
                            b.startDate,
                            b.endDate
                        );
                        return (
                            <div
                                key={b.id}
                                className="flex flex-col gap-3 p-4"
                            >
                                {/* Top: status + type */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ring-inset ${status.className}`}
                                    >
                                        {status.pulse && (
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            </span>
                                        )}
                                        {status.label}
                                    </span>
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ring-inset ${typeBadgeClass(b.type)}`}
                                    >
                                        {typeIcon(b.type)} {b.type}
                                    </span>
                                </div>

                                {/* Message */}
                                <p className="text-sm text-hn-text line-clamp-3">
                                    {b.message}
                                </p>

                                {/* Schedule */}
                                <div className="text-[10px] text-hn-text-muted/60 space-y-0.5">
                                    <p>From: {formatDate(b.startDate)}</p>
                                    <p>To: {formatDate(b.endDate)}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <ToggleButton
                                        broadcastId={b.id}
                                        isActive={b.isActive}
                                    />
                                    <DeleteButton
                                        broadcastId={b.id}
                                        preview={b.message}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty state */}
                {broadcasts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-sm text-hn-text-muted">
                        <span className="mb-2 text-3xl">📢</span>
                        No broadcasts yet. Create one above.
                    </div>
                )}
            </div>
        </div>
    );
}
