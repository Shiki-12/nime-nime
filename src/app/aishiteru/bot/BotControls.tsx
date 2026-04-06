"use client";

import { useTransition } from "react";
import { restartTelegramBot } from "./actions";
import { swalConfirm, swalToast } from "@/lib/swal";

export default function BotControls() {
    const [isPending, startTransition] = useTransition();

    function handleRestart() {
        swalConfirm
            .fire({
                title: "Restart Bot Engine?",
                html: "This will send a <strong>pm2 restart</strong> command to the Telegram bot process.",
                confirmButtonText: "Restart Now",
            })
            .then((result) => {
                if (result.isConfirmed) {
                    startTransition(async () => {
                        const res = await restartTelegramBot();
                        if (!res.success) {
                            swalToast({
                                icon: "error",
                                title: res.error ?? "Failed to restart bot",
                            });
                        } else {
                            swalToast({
                                icon: "success",
                                title: "Bot Engine restarted successfully!",
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
            onClick={handleRestart}
            className="group inline-flex items-center gap-2.5 rounded-xl bg-hn-primary/10 px-5 py-3 text-sm font-semibold text-hn-primary ring-1 ring-hn-primary/25 transition-all duration-300 hover:bg-hn-primary/20 hover:shadow-lg hover:shadow-hn-primary/10 hover:ring-hn-primary/40 disabled:opacity-50"
        >
            {isPending ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" className="opacity-75" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.012 4.356v4.992" />
                </svg>
            )}
            {isPending ? "Restarting..." : "Restart Bot Engine"}
        </button>
    );
}
