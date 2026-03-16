"use client";

import { DiscussionEmbed } from "disqus-react";

interface DisqusCommentsProps {
  animeSlug: string;
  episodeSlug: string;
  title: string;
}

export default function DisqusComments({
  animeSlug,
  episodeSlug,
  title,
}: DisqusCommentsProps) {
  const disqusConfig = {
    url: `https://nime-nime.web.id/anime/watch/${episodeSlug}?anime=${animeSlug}`,
    identifier: `${animeSlug}-${episodeSlug}`,
    title: title,
  };

  return (
    <div className="mt-8 rounded-xl border border-white/5 bg-hn-dark/50 p-4 shadow-lg md:p-6">
      <h3 className="mb-6 text-lg font-semibold text-white">Comments</h3>
      <div style={{ colorScheme: "normal", color: "#ffffff", backgroundColor: "transparent" }}>
        <DiscussionEmbed shortname="nimenime-21" config={disqusConfig} />
      </div>
    </div>
  );
}
