'use client';

import dynamic from 'next/dynamic';

const DisqusComments = dynamic(() => import('./DisqusComments'), {
  ssr: false,
  loading: () => (
    <div className="mt-8 h-96 animate-pulse rounded-xl border border-white/5 bg-hn-dark/50 p-4 md:p-6">
      <div className="h-6 w-24 rounded bg-white/10"></div>
    </div>
  ),
});

interface DisqusWrapperProps {
  animeSlug: string;
  episodeSlug: string;
  episodeTitle: string;
}

export default function DisqusWrapper({
  animeSlug,
  episodeSlug,
  episodeTitle,
}: DisqusWrapperProps) {
  return (
    <DisqusComments
      animeSlug={animeSlug}
      episodeSlug={episodeSlug}
      title={episodeTitle}
    />
  );
}
