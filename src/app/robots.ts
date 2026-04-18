import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nime-nime.web.id";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/aishiteru/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
