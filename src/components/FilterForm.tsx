"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ─── Config arrays (shortened – add more options as needed) ────────

const GENRES = [
    { value: "aksi", label: "Action" },
    { value: "anak-anak", label: "Kids" },
    { value: "antariksa", label: "Space" },
    { value: "avant-garde", label: "Avant Garde" },
    { value: "dimensia", label: "Dementia" },
    { value: "donghua", label: "Donghua" },
    { value: "drama", label: "Drama" },
    { value: "ecchi", label: "Ecchi" },
    { value: "fantasi", label: "Fantasy" },
    { value: "fantasi-urban", label: "Urban Fantasy" },
    { value: "game", label: "Game" },
    { value: "gourmet", label: "Gourmet" },
    { value: "harem", label: "Harem" },
    { value: "horror", label: "Horror" },
    { value: "iblis", label: "Demons" },
    { value: "isekai", label: "Isekai" },
    { value: "josei", label: "Josei" },
    { value: "ketegangan", label: "Suspense" },
    { value: "komedi", label: "Comedy" },
    { value: "live-action", label: "Live Action" },
    { value: "makanan", label: "Food" },
    { value: "martial-arts", label: "Martial Arts" },
    { value: "medis", label: "Medical" },
    { value: "militer", label: "Military" },
    { value: "misteri", label: "Mystery" },
    { value: "mobil", label: "Cars" },
    { value: "musik", label: "Music" },
    { value: "olahraga", label: "Sports" },
    { value: "parodi", label: "Parody" },
    { value: "perang", label: "War" },
    { value: "petualangan", label: "Adventure" },
    { value: "polisi", label: "Police" },
    { value: "politik", label: "Political" },
    { value: "psikologis", label: "Psychological" },
    { value: "reinkarnasi", label: "Reincarnation" },
    { value: "robot", label: "Mecha" },
    { value: "romansa", label: "Romance" },
    { value: "samurai", label: "Samurai" },
    { value: "sci-fi", label: "Sci-Fi" },
    { value: "seinen", label: "Seinen" },
    { value: "sejarah", label: "Historical" },
    { value: "sekolahan", label: "School" },
    { value: "shoujo", label: "Shoujo" },
    { value: "shoujo-ai", label: "Shoujo Ai" },
    { value: "shounen", label: "Shounen" },
    { value: "shounen-ai", label: "Shounen Ai" },
    { value: "sihir", label: "Magic" },
    { value: "slice-of-life", label: "Slice of Life" },
    { value: "super-power", label: "Super Power" },
    { value: "supranatural", label: "Supernatural" },
    { value: "thriller", label: "Thriller" },
    { value: "time-travel", label: "Time Travel" },
    { value: "vampir", label: "Vampire" },
    { value: "wuxia", label: "Wuxia" },
    { value: "yaoi", label: "Yaoi" }
];

const SEASONS = [
    // Fall
    { value: "fall-1984", label: "Fall 1984" },
    { value: "fall-1986", label: "Fall 1986" },
    { value: "fall-1989", label: "Fall 1989" },
    { value: "fall-1992", label: "Fall 1992" },
    { value: "fall-1993", label: "Fall 1993" },
    { value: "fall-1995", label: "Fall 1995" },
    { value: "fall-1997", label: "Fall 1997" },
    { value: "fall-1999", label: "Fall 1999" },
    { value: "fall-2000", label: "Fall 2000" },
    { value: "fall-2001", label: "Fall 2001" },
    { value: "fall-2002", label: "Fall 2002" },
    { value: "fall-2003", label: "Fall 2003" },
    { value: "fall-2004", label: "Fall 2004" },
    { value: "fall-2005", label: "Fall 2005" },
    { value: "fall-2006", label: "Fall 2006" },
    { value: "fall-2007", label: "Fall 2007" },
    { value: "fall-2008", label: "Fall 2008" },
    { value: "fall-2009", label: "Fall 2009" },
    { value: "fall-2010", label: "Fall 2010" },
    { value: "fall-2011", label: "Fall 2011" },
    { value: "fall-2012", label: "Fall 2012" },
    { value: "fall-2013", label: "Fall 2013" },
    { value: "fall-2014", label: "Fall 2014" },
    { value: "fall-2015", label: "Fall 2015" },
    { value: "fall-2016", label: "Fall 2016" },
    { value: "fall-2017", label: "Fall 2017" },
    { value: "fall-2018", label: "Fall 2018" },
    { value: "fall-2019", label: "Fall 2019" },
    { value: "fall-2020", label: "Fall 2020" },
    { value: "fall-2021", label: "Fall 2021" },
    { value: "fall-2022", label: "Fall 2022" },
    { value: "fall-2023", label: "Fall 2023" },
    { value: "fall-2024", label: "Fall 2024" },
    { value: "fall-2025", label: "Fall 2025" },
    { value: "fall-2026", label: "Fall 2026" },

    // Spring
    { value: "spring-1981", label: "Spring 1981" },
    { value: "spring-1985", label: "Spring 1985" },
    { value: "spring-1986", label: "Spring 1986" },
    { value: "spring-1987", label: "Spring 1987" },
    { value: "spring-1988", label: "Spring 1988" },
    { value: "spring-1989", label: "Spring 1989" },
    { value: "spring-1991", label: "Spring 1991" },
    { value: "spring-1992", label: "Spring 1992" },
    { value: "spring-1995", label: "Spring 1995" },
    { value: "spring-1996", label: "Spring 1996" },
    { value: "spring-1997", label: "Spring 1997" },
    { value: "spring-1998", label: "Spring 1998" },
    { value: "spring-1999", label: "Spring 1999" },
    { value: "spring-2000", label: "Spring 2000" },
    { value: "spring-2001", label: "Spring 2001" },
    { value: "spring-2002", label: "Spring 2002" },
    { value: "spring-2003", label: "Spring 2003" },
    { value: "spring-2004", label: "Spring 2004" },
    { value: "spring-2005", label: "Spring 2005" },
    { value: "spring-2006", label: "Spring 2006" },
    { value: "spring-2007", label: "Spring 2007" },
    { value: "spring-2008", label: "Spring 2008" },
    { value: "spring-2009", label: "Spring 2009" },
    { value: "spring-2010", label: "Spring 2010" },
    { value: "spring-2011", label: "Spring 2011" },
    { value: "spring-2012", label: "Spring 2012" },
    { value: "spring-2013", label: "Spring 2013" },
    { value: "spring-2014", label: "Spring 2014" },
    { value: "spring-2015", label: "Spring 2015" },
    { value: "spring-2016", label: "Spring 2016" },
    { value: "spring-2017", label: "Spring 2017" },
    { value: "spring-2018", label: "Spring 2018" },
    { value: "spring-2019", label: "Spring 2019" },
    { value: "spring-2020", label: "Spring 2020" },
    { value: "spring-2021", label: "Spring 2021" },
    { value: "spring-2022", label: "Spring 2022" },
    { value: "spring-2023", label: "Spring 2023" },
    { value: "spring-2024", label: "Spring 2024" },
    { value: "spring-2025", label: "Spring 2025" },
    { value: "spring-2026", label: "Spring 2026" },

    // Summer
    { value: "summer-1999", label: "Summer 1999" },
    { value: "summer-2000", label: "Summer 2000" },
    { value: "summer-2001", label: "Summer 2001" },
    { value: "summer-2002", label: "Summer 2002" },
    { value: "summer-2003", label: "Summer 2003" },
    { value: "summer-2004", label: "Summer 2004" },
    { value: "summer-2005", label: "Summer 2005" },
    { value: "summer-2006", label: "Summer 2006" },
    { value: "summer-2007", label: "Summer 2007" },
    { value: "summer-2008", label: "Summer 2008" },
    { value: "summer-2009", label: "Summer 2009" },
    { value: "summer-2010", label: "Summer 2010" },
    { value: "summer-2011", label: "Summer 2011" },
    { value: "summer-2012", label: "Summer 2012" },
    { value: "summer-2013", label: "Summer 2013" },
    { value: "summer-2014", label: "Summer 2014" },
    { value: "summer-2015", label: "Summer 2015" },
    { value: "summer-2016", label: "Summer 2016" },
    { value: "summer-2017", label: "Summer 2017" },
    { value: "summer-2018", label: "Summer 2018" },
    { value: "summer-2019", label: "Summer 2019" },
    { value: "summer-2020", label: "Summer 2020" },
    { value: "summer-2021", label: "Summer 2021" },
    { value: "summer-2022", label: "Summer 2022" },
    { value: "summer-2023", label: "Summer 2023" },
    { value: "summer-2024", label: "Summer 2024" },
    { value: "summer-2025", label: "Summer 2025" },
    { value: "summer-2026", label: "Summer 2026" },

    // Winter
    { value: "winter-1986", label: "Winter 1986" },
    { value: "winter-1995", label: "Winter 1995" },
    { value: "winter-1996", label: "Winter 1996" },
    { value: "winter-1997", label: "Winter 1997" },
    { value: "winter-1998", label: "Winter 1998" },
    { value: "winter-1999", label: "Winter 1999" },
    { value: "winter-2001", label: "Winter 2001" },
    { value: "winter-2002", label: "Winter 2002" },
    { value: "winter-2003", label: "Winter 2003" },
    { value: "winter-2004", label: "Winter 2004" },
    { value: "winter-2005", label: "Winter 2005" },
    { value: "winter-2006", label: "Winter 2006" },
    { value: "winter-2007", label: "Winter 2007" },
    { value: "winter-2008", label: "Winter 2008" },
    { value: "winter-2009", label: "Winter 2009" },
    { value: "winter-2010", label: "Winter 2010" },
    { value: "winter-2011", label: "Winter 2011" },
    { value: "winter-2012", label: "Winter 2012" },
    { value: "winter-2013", label: "Winter 2013" },
    { value: "winter-2014", label: "Winter 2014" },
    { value: "winter-2015", label: "Winter 2015" },
    { value: "winter-2016", label: "Winter 2016" },
    { value: "winter-2017", label: "Winter 2017" },
    { value: "winter-2018", label: "Winter 2018" },
    { value: "winter-2019", label: "Winter 2019" },
    { value: "winter-2020", label: "Winter 2020" },
    { value: "winter-2021", label: "Winter 2021" },
    { value: "winter-2022", label: "Winter 2022" },
    { value: "winter-2023", label: "Winter 2023" },
    { value: "winter-2024", label: "Winter 2024" },
    { value: "winter-2025", label: "Winter 2025" },
    { value: "winter-2026", label: "Winter 2026" },
];

const STATUS_OPTIONS = [
    { value: "", label: "All" },
    { value: "sedang-tayang", label: "Ongoing" },
    { value: "selesai", label: "Completed" },
];

const TYPE_OPTIONS = [
    { value: "", label: "All" },
    { value: "TV", label: "TV" },
    { value: "Movie", label: "Movie" },
    { value: "OVA", label: "OVA" },
    { value: "ONA", label: "ONA" },
    { value: "Special", label: "Special" },
];

const SORT_OPTIONS = [
    { value: "", label: "Default" },
    { value: "a-z", label: "A → Z" },
    { value: "z-a", label: "Z → A" },
    { value: "terbaru", label: "Latest" },
    { value: "rating", label: "Rating" },
];

// ─── Component ─────────────────────────────────────────────────────

export default function FilterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize from URL params
    const [genres, setGenres] = useState<string[]>(
        searchParams.getAll("genre[]")
    );
    const [seasons, setSeasons] = useState<string[]>(
        searchParams.getAll("season[]")
    );
    const [status, setStatus] = useState(searchParams.get("status") ?? "");
    const [type, setType] = useState(searchParams.get("tipe") ?? "");
    const [sort, setSort] = useState(searchParams.get("urutan") ?? "");

    const toggleArray = (
        arr: string[],
        val: string,
        setter: (v: string[]) => void
    ) => {
        setter(
            arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
        );
    };

    const handleSubmit = () => {
        const isEmpty =
            genres.length === 0 &&
            seasons.length === 0 &&
            !status &&
            !type &&
            !sort;

        if (isEmpty) {
            router.push("/filter?status=&tipe=&urutan=default");
            return;
        }

        const params = new URLSearchParams();
        genres.forEach((g) => params.append("genre[]", g));
        seasons.forEach((s) => params.append("season[]", s));
        if (status) params.set("status", status);
        if (type) params.set("tipe", type);
        if (sort) params.set("urutan", sort);
        params.set("page", "1");
        router.push(`/filter?${params.toString()}`);
    };

    const handleReset = () => {
        setGenres([]);
        setSeasons([]);
        setStatus("");
        setType("");
        setSort("");
        router.push("/filter");
    };

    const activeCount =
        genres.length +
        seasons.length +
        (status ? 1 : 0) +
        (type ? 1 : 0) +
        (sort ? 1 : 0);

    return (
        <div className="mb-8 rounded-xl bg-hn-card p-4 sm:p-5">
            {/* Dropdowns Row */}
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <SelectField
                    label="Status"
                    value={status}
                    options={STATUS_OPTIONS}
                    onChange={setStatus}
                />
                <SelectField
                    label="Type"
                    value={type}
                    options={TYPE_OPTIONS}
                    onChange={setType}
                />
                <SelectField
                    label="Sort By"
                    value={sort}
                    options={SORT_OPTIONS}
                    onChange={setSort}
                />
            </div>

            {/* Genres */}
            <CheckboxGroup
                title="Genres"
                items={GENRES}
                selected={genres}
                onToggle={(v) => toggleArray(genres, v, setGenres)}
            />

            {/* Seasons */}
            <CheckboxGroup
                title="Seasons"
                items={SEASONS}
                selected={seasons}
                onToggle={(v) => toggleArray(seasons, v, setSeasons)}
            />

            {/* Action buttons */}
            <div className="mt-5 flex items-center gap-3">
                <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 rounded-full bg-hn-primary px-6 py-2.5 text-sm font-bold text-hn-dark transition-all hover:shadow-lg hover:shadow-hn-primary/25"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    Search Criteria
                </button>
                {activeCount > 0 && (
                    <button
                        onClick={handleReset}
                        className="rounded-full bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/[0.1] hover:text-white"
                    >
                        Reset ({activeCount})
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Sub-components ────────────────────────────────────────────────

function SelectField({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-white/30">
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full cursor-pointer rounded-lg border border-white/5 bg-hn-body px-3 py-2 text-sm text-white outline-none transition-colors focus:border-hn-primary/40"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function CheckboxGroup({
    title,
    items,
    selected,
    onToggle,
}: {
    title: string;
    items: { value: string; label: string }[];
    selected: string[];
    onToggle: (value: string) => void;
}) {
    const [expanded, setExpanded] = useState(selected.length > 0);

    return (
        <div className="mb-4">
            <button
                onClick={() => setExpanded(!expanded)}
                className="mb-2 flex w-full items-center justify-between text-left"
            >
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/30">
                    {title}
                    {selected.length > 0 && (
                        <span className="rounded bg-hn-primary/15 px-1.5 py-0.5 text-[10px] font-bold normal-case text-hn-primary">
                            {selected.length}
                        </span>
                    )}
                </span>
                <svg
                    className={`h-3.5 w-3.5 text-white/20 transition-transform ${expanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
            {expanded && (
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {items.map((item) => {
                        const isChecked = selected.includes(item.value);
                        return (
                            <label
                                key={item.value}
                                className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-all ${
                                    isChecked
                                        ? "bg-hn-primary/15 text-hn-primary ring-1 ring-hn-primary/25"
                                        : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white/70"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => onToggle(item.value)}
                                    className="sr-only"
                                />
                                <div
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                        isChecked
                                            ? "border-hn-primary bg-hn-primary"
                                            : "border-white/15 bg-transparent"
                                    }`}
                                >
                                    {isChecked && (
                                        <svg className="h-3 w-3 text-hn-dark" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    )}
                                </div>
                                {item.label}
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
