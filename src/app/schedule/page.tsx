import { getAnimeSchedule } from "@/lib/api";
import ScheduleTabs from "./ScheduleTabs";

// Tier 3: Frequently Updated — schedule changes daily/hourly
export const revalidate = 3600; // 1 hour

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
    const data = await getAnimeSchedule();

    // Build ordered schedule entries
    const days = DAY_ORDER
        .filter((key) => key in data.schedule)
        .map((key) => ({
            key,
            label: DAY_LABELS[key] ?? key,
            animes: data.schedule[key],
        }));

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

            <ScheduleTabs days={days} defaultDay={defaultKey} />
        </main>
    );
}
