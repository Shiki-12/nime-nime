"use client";

import { useTransition } from "react";
import { updateUserRole, deleteUser } from "./actions";
import { swalDestructive, swalToast } from "@/lib/swal";
import type { Role } from "@/generated/prisma/client";

interface UserActionsProps {
    targetUserId: string;
    targetName: string;
    targetRole: Role;
    requesterRole: "ADMIN" | "OWNER";
    isSelf: boolean;
}

export function RoleSelect({
    targetUserId,
    targetRole,
    requesterRole,
    isSelf,
}: UserActionsProps) {
    const [isPending, startTransition] = useTransition();

    // Determine which roles this requester can assign
    const canEdit =
        !isSelf &&
        (requesterRole === "OWNER" ||
            (requesterRole === "ADMIN" &&
                targetRole !== "ADMIN" &&
                targetRole !== "OWNER"));

    const roleOptions: Role[] = ["USER", "ADMIN"];

    function handleChange(newRole: Role) {
        startTransition(async () => {
            const result = await updateUserRole(targetUserId, newRole);
            if (!result.success) {
                swalToast({
                    icon: "error",
                    title: result.error ?? "Failed to update role",
                });
            } else {
                swalToast({
                    icon: "success",
                    title: `Role updated to ${newRole}`,
                });
            }
        });
    }

    if (!canEdit) {
        return (
            <span className="text-xs text-hn-text-muted italic">
                {isSelf ? "You" : "—"}
            </span>
        );
    }

    return (
        <select
            value={targetRole}
            disabled={isPending}
            onChange={(e) => handleChange(e.target.value as Role)}
            className="rounded-lg border border-white/[0.08] bg-hn-card px-2.5 py-1.5 text-xs font-medium text-hn-text outline-none ring-0 transition-all duration-200 hover:border-hn-primary/30 focus:border-hn-primary/40 focus:ring-1 focus:ring-hn-primary/20 disabled:opacity-50"
        >
            {roleOptions.map((r) => (
                <option key={r} value={r} className="bg-hn-dark text-hn-text">
                    {r}
                </option>
            ))}
        </select>
    );
}

export function DeleteButton({
    targetUserId,
    targetName,
    targetRole,
    requesterRole,
    isSelf,
}: UserActionsProps) {
    const [isPending, startTransition] = useTransition();

    // ADMIN cannot delete ADMIN/OWNER; no one deletes themselves
    const canDelete =
        !isSelf &&
        (requesterRole === "OWNER" ||
            (requesterRole === "ADMIN" &&
                targetRole !== "ADMIN" &&
                targetRole !== "OWNER"));

    if (!canDelete) return null;

    function handleDelete() {
        swalDestructive
            .fire({
                title: `Delete ${targetName}?`,
                html: `This will permanently remove <strong>${targetName}</strong> and all their data. This action cannot be undone.`,
                confirmButtonText: "Yes, delete",
            })
            .then((result) => {
                if (result.isConfirmed) {
                    startTransition(async () => {
                        const res = await deleteUser(targetUserId);
                        if (!res.success) {
                            swalToast({
                                icon: "error",
                                title: res.error ?? "Failed to delete user",
                            });
                        } else {
                            swalToast({
                                icon: "success",
                                title: `${targetName} has been deleted`,
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
                <svg
                    className="h-3 w-3 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                    />
                    <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                        className="opacity-75"
                    />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3 w-3"
                >
                    <path
                        fillRule="evenodd"
                        d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z"
                        clipRule="evenodd"
                    />
                </svg>
            )}
            Delete
        </button>
    );
}
