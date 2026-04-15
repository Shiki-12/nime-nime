"use client";

import { useTransition, useRef } from "react";
import { createBroadcast } from "./actions";
import { swalToast } from "@/lib/swal";

export default function BroadcastForm() {
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await createBroadcast(formData);
            if (!result.success) {
                swalToast({
                    icon: "error",
                    title: result.error ?? "Failed to create broadcast",
                });
            } else {
                swalToast({
                    icon: "success",
                    title: "Broadcast created!",
                });
                formRef.current?.reset();
            }
        });
    }

    return (
        <form
            ref={formRef}
            action={handleSubmit}
            className="overflow-hidden rounded-xl border border-hn-border/50 bg-hn-card backdrop-blur-sm"
        >
            <div className="border-b border-hn-border/50 px-5 py-3.5">
                <h2 className="text-sm font-semibold text-hn-text">
                    Create New Broadcast
                </h2>
                <p className="mt-0.5 text-[11px] text-hn-text-muted">
                    Schedule a global announcement visible to all users.
                </p>
            </div>

            <div className="space-y-4 p-5">
                {/* Message */}
                <div>
                    <label
                        htmlFor="broadcast-message"
                        className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted"
                    >
                        Message
                    </label>
                    <textarea
                        id="broadcast-message"
                        name="message"
                        required
                        maxLength={500}
                        rows={3}
                        placeholder="Enter your announcement message..."
                        className="w-full rounded-lg border border-hn-border/60 bg-hn-dark px-3 py-2.5 text-sm text-hn-text placeholder:text-hn-text-muted/40 outline-none transition-all duration-200 focus:border-hn-primary/40 focus:ring-1 focus:ring-hn-primary/20 resize-none"
                    />
                </div>

                {/* Type + Dates row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Type */}
                    <div>
                        <label
                            htmlFor="broadcast-type"
                            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted"
                        >
                            Type
                        </label>
                        <select
                            id="broadcast-type"
                            name="type"
                            defaultValue="INFO"
                            className="w-full rounded-lg border border-hn-border/60 bg-hn-dark px-3 py-2.5 text-sm font-medium text-hn-text outline-none transition-all duration-200 focus:border-hn-primary/40 focus:ring-1 focus:ring-hn-primary/20"
                        >
                            <option value="INFO" className="bg-hn-dark text-hn-text">ℹ️ Info</option>
                            <option value="WARNING" className="bg-hn-dark text-hn-text">⚠️ Warning</option>
                            <option value="DANGER" className="bg-hn-dark text-hn-text">🚨 Danger</option>
                            <option value="SUCCESS" className="bg-hn-dark text-hn-text">✅ Success</option>
                        </select>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label
                            htmlFor="broadcast-start"
                            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted"
                        >
                            Start Date
                        </label>
                        <input
                            id="broadcast-start"
                            type="datetime-local"
                            name="startDate"
                            required
                            className="w-full rounded-lg border border-hn-border/60 bg-hn-dark px-3 py-2.5 text-sm text-hn-text outline-none transition-all duration-200 focus:border-hn-primary/40 focus:ring-1 focus:ring-hn-primary/20 [color-scheme:dark]"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label
                            htmlFor="broadcast-end"
                            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted"
                        >
                            End Date
                        </label>
                        <input
                            id="broadcast-end"
                            type="datetime-local"
                            name="endDate"
                            required
                            className="w-full rounded-lg border border-hn-border/60 bg-hn-dark px-3 py-2.5 text-sm text-hn-text outline-none transition-all duration-200 focus:border-hn-primary/40 focus:ring-1 focus:ring-hn-primary/20 [color-scheme:dark]"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-1">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center gap-2 rounded-lg bg-hn-primary/15 px-4 py-2 text-xs font-semibold text-hn-primary ring-1 ring-hn-primary/25 transition-all duration-200 hover:bg-hn-primary/25 hover:ring-hn-primary/40 hover:shadow-[0_0_20px_rgba(var(--hn-primary),0.15)] disabled:opacity-50"
                    >
                        {isPending ? (
                            <>
                                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                                    <path fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" className="opacity-75" />
                                </svg>
                                Creating…
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                                    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                                </svg>
                                Create Broadcast
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
