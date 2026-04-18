import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nime-nime.web.id";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/popular`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/genres`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/history`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/saved`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/recommendations`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/schedule`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    // Fetch unique slugs from user interactions in the database
    // This allows us to index anime pages that users have engaged with
    const [savedAnimes, historyAnimes, recommendations] = await Promise.all([
      prisma.savedAnime.findMany({ select: { animeId: true, createdAt: true } }),
      prisma.watchHistory.findMany({ select: { animeId: true, watchedAt: true } }),
      prisma.recommendation.findMany({ select: { animeSlug: true, createdAt: true } }),
    ]);

    const animeDataMap = new Map<string, Date>();

    savedAnimes.forEach((item) => {
      if (!animeDataMap.has(item.animeId) || animeDataMap.get(item.animeId)! < item.createdAt) {
        animeDataMap.set(item.animeId, item.createdAt);
      }
    });

    historyAnimes.forEach((item) => {
      if (!animeDataMap.has(item.animeId) || animeDataMap.get(item.animeId)! < item.watchedAt) {
        animeDataMap.set(item.animeId, item.watchedAt);
      }
    });

    recommendations.forEach((item) => {
      if (!animeDataMap.has(item.animeSlug) || animeDataMap.get(item.animeSlug)! < item.createdAt) {
        animeDataMap.set(item.animeSlug, item.createdAt);
      }
    });

    dynamicRoutes = Array.from(animeDataMap.entries()).map(([slug, lastModified]) => ({
      url: `${baseUrl}/anime/${slug}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Failed to fetch anime slugs for sitemap:", error);
    // Graceful fallback: return empty array for dynamic routes if DB query fails
    dynamicRoutes = [];
  }

  return [...staticRoutes, ...dynamicRoutes];
}
