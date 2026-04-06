"use client";

import { useTransition } from "react";
import { deleteAdminComment } from "./actions";
import { swalDestructive, swalToast } from "@/lib/swal";

interface DeleteCommentButtonProps {
    commentId: string;
    userName: string;
}

export default function DeleteCommentButton({
    commentId,
    userName,
}: DeleteCommentButtonProps) {
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        swalDestructive
            .fire({
                title: "Delete this comment?",
                html: `This will permanently remove <strong>${userName}</strong>'s comment. This action cannot be undone.`,
                confirmButtonText: "Yes, delete",
            })
            .then((result) => {
                if (result.isConfirmed) {
                    startTransition(async () => {
                        const res = await deleteAdminComment(commentId);
                        if (!res.success) {
                            swalToast({
                                icon: "error",
                                title: res.error ?? "Failed to delete comment",
                            });
                        } else {
                            swalToast({
                                icon: "success",
                                title: "Comment deleted",
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
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-red-400 ring-1 ring-red-500/20 transition-all duration-200 hover:bg-red-500/10 hover:ring-red-500/40 disabled:opacity-50"
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
