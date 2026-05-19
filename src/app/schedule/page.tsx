import { getAnimeSchedule } from "@/lib/api";
import ScheduleTabs from "./ScheduleTabs";
import Link from "next/link";

// Tier 3: Frequently Updated — schedule changes daily/hourly
export const revalidate = 3600; // 1 hour
export const dynamic = "force-dynamic";

// Indonesian → English day name mapping (for display)
const DAY_LABELS: Record<string, string> = {
    senin: "Monday",
    selasa: "Tuesday",
    rabu: "Wednesday",
    kamis: "Thursday",
    jumat: "Friday",
    sabtu: "Saturday",
    minggu: "Sunday",
};

// Preferred display order
const DAY_ORDER = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"];

export const metadata = {
    title: "Release Schedule — NimeNime",
    description:
        "Check which anime are airing on each day of the week. Stay updated with the latest release schedule.",
};

export default async function SchedulePage() {
    let days: {
        key: string;
        label: string;
        animes: Awaited<ReturnType<typeof getAnimeSchedule>>["schedule"][string];
    }[] = [];
    let fetchError: string | null = null;

    try {
        const data = await getAnimeSchedule();

        // Build ordered schedule entries
        days = DAY_ORDER
            .filter((key) => key in data.schedule)
            .map((key) => ({
                key,
                label: DAY_LABELS[key] ?? key,
                animes: data.schedule[key],
            }));
    } catch (error) {
        console.error("[SchedulePage] Failed to fetch schedule:", error);
        fetchError =
            "The schedule API is currently unreachable. Please try again later.";
    }

    // Detect current day (Asia/Jakarta)
    const todayIdx = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    ).getDay();
    // JS getDay(): 0=Sun … 6=Sat  →  DAY_ORDER: 0=Mon … 6=Sun
    const defaultKey = DAY_ORDER[todayIdx === 0 ? 6 : todayIdx - 1];

    return (
        <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-24 lg:px-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-hn-text sm:text-3xl">
                    <span className="text-hn-primary">📅</span> Estimated Release
                    Schedule
                </h1>
                <p className="mt-1.5 text-sm text-hn-text-muted/70">
                    Browse the weekly airing schedule for ongoing anime.
                </p>
            </div>

            {fetchError ? (
                <div className="mx-auto max-w-xl rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                    <h2 className="text-xl font-bold text-hn-text">
                        Schedule unavailable
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-hn-text-muted/70">
                        {fetchError}
                    </p>
                    <Link
                        href="/schedule"
                        className="mt-5 inline-flex rounded-full bg-hn-primary px-5 py-2 text-sm font-semibold text-hn-dark transition-opacity hover:opacity-90"
                    >
                        Try again
                    </Link>
                </div>
            ) : (
                <ScheduleTabs days={days} defaultDay={defaultKey} />
            )}
        </main>
    );
}
