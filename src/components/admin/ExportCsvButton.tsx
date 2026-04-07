"use client";

import React from "react";

type AnimeStat = {
    animeId: string;
    title: string;
    _count: { animeId: number };
};

interface ExportCsvButtonProps {
    stats: AnimeStat[];
}

export default function ExportCsvButton({ stats }: ExportCsvButtonProps) {
    const handleDownload = () => {
        // Headers
        const headers = ["Rank", "Anime Title", "Slug", "Total Views"];
        
        // Rows
        const rows = stats.map((stat, index) => {
            const rank = index + 1;
            // Escape potential quotes in title and wrap in quotes to handle commas
            const title = `"${stat.title.replace(/"/g, '""')}"`;
            // Same for slug just in case
            const slug = `"${stat.animeId.replace(/"/g, '""')}"`;
            const views = stat._count.animeId;
            return [rank, title, slug, views].join(",");
        });

        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "NimeNime_Analytics_Report.csv");
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-hn-text transition-all hover:bg-white/10 hover:shadow-lg ring-1 ring-white/10 hover:ring-white/20"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v6.868l2.58-2.581a.75.75 0 1 1 1.061 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 1 1 1.06-1.06l2.58 2.581V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M18 13.5a.75.75 0 0 1 .75.75v1.5a2.25 2.25 0 0 1-2.25 2.25H3.5A2.25 2.25 0 0 1 1.25 15.75v-1.5a.75.75 0 0 1 1.5 0v1.5c0 .414.336.75.75.75h13a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            </svg>
            Download CSV
        </button>
    );
}
