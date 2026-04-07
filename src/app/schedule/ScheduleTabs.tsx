"use client";

import { useState } from "react";
import AnimeCard from "@/components/AnimeCard";
import type { OngoingAnime } from "@/types/anime";

interface DayEntry {
  key: string;
  label: string;
  animes: OngoingAnime[];
}

interface ScheduleTabsProps {
  days: DayEntry[];
  defaultDay: string;
}

export default function ScheduleTabs({ days, defaultDay }: ScheduleTabsProps) {
  const [activeDay, setActiveDay] = useState(
    days.find((d) => d.key === defaultDay)?.key ?? days[0]?.key ?? "",
  );

  const current = days.find((d) => d.key === activeDay);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* ── Sidebar / Tab strip ─────────────────────────────── */}
      <aside className="shrink-0 lg:w-52">
        <nav className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-x-visible lg:pb-0">
          {days.map((day) => {
            const isActive = day.key === activeDay;
            return (
              <button
                key={day.key}
                onClick={() => setActiveDay(day.key)}
                className={`group flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-hn-primary/15 text-hn-primary shadow-sm shadow-hn-primary/10"
                    : "text-hn-text-muted/70 hover:bg-white/5 hover:text-hn-text-muted/90"
                }`}
              >
                {/* Day dot indicator */}
                <span
                  className={`hidden h-1.5 w-1.5 rounded-full transition-colors lg:block ${
                    isActive
                      ? "bg-hn-primary"
                      : "bg-white/20 group-hover:bg-white/40"
                  }`}
                />
                {day.label}
                {/* Anime count badge */}
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isActive
                      ? "bg-hn-primary/20 text-hn-primary"
                      : "bg-white/5 text-hn-text-muted/50"
                  }`}
                >
                  {day.animes.length}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Content grid ────────────────────────────────────── */}
      <section className="flex-1">
        {current && current.animes.length > 0 ? (
          <>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-semibold text-hn-text">
                {current.label}
              </h2>
              <span className="rounded-md bg-hn-primary/10 px-2 py-0.5 text-xs font-medium text-hn-primary">
                {current.animes.length} anime
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {current.animes.map((anime) => (
                <AnimeCard key={anime.slug} anime={anime} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-xl border border-white/5 bg-hn-card/50">
            <p className="text-sm text-hn-text-muted/60">
              No anime scheduled for this day.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
