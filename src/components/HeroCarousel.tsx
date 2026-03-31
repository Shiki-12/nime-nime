"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════
   Slide Data
   ═══════════════════════════════════════════════════════════════════ */
const slides = [
  {
    id: "create-account",
    title: "Join NimeNime Today!",
    synopsis:
      "Create an account to unlock exclusive features, save your favorite anime, track your watch history, and get personalized recommendations based on your taste. Your journey starts here.",
    image: "/images/banner_account.png",
    primaryLabel: "Sign Up / Log In",
    primaryHref: "/login",
    secondaryLabel: "Learn More",
    secondaryHref: "/terms",
    mediaType: "Platform",
    duration: null,
    releaseDate: "2025",
    quality: "HD",
    hasCC: true,
    hasDub: false,
    ccCount: null,
    dubCount: null,
  },
  {
    id: "public-discuss",
    title: (
      <>
        Join the Global{" "}
        <span className="bg-gradient-to-r from-hn-primary to-hn-secondary bg-clip-text text-transparent">
          Discussion
        </span>
      </>
    ),
    synopsis:
      "Connect with others in real-time! Share your top 5 anime recommendations, join the live chat, and discover what everyone is watching.",
    image: "/images/banner_public.png",
    primaryLabel: "Enter Community Hub",
    primaryHref: "/discuss",
    secondaryLabel: "Read Rules",
    secondaryHref: "/rules",
    tag: "New Feature",
    icon: (
      <svg
        className="h-4 w-4 transition-transform group-hover:-translate-y-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    mediaType: "Community",
    duration: null,
    releaseDate: "2025",
    quality: null,
    hasCC: false,
    hasDub: false,
    ccCount: null,
    dubCount: null,
  },
  {
    id: "adblock-tip",
    title: "Watch Without Interruptions",
    synopsis:
      "For a safer, ad-free streaming experience, we recommend using Brave Browser or installing uBlock Origin. Protect yourself from malicious ads and enjoy your anime without distractions.",
    image: "/images/banner_adblock.jpg",
    primaryLabel: "Get uBlock Origin",
    primaryHref: "https://ublockorigin.com/",
    secondaryLabel: "Detail",
    secondaryHref: "/terms",
    mediaType: "Tip",
    duration: null,
    releaseDate: null,
    quality: null,
    hasCC: false,
    hasDub: false,
    ccCount: null,
    dubCount: null,
  },
  {
    id: "default",
    title: "Watch the Best Anime in HD",
    synopsis:
      "Stream thousands of episodes — from legendary series to the latest seasonal hits. No ads, no interruptions. Enjoy premium anime streaming with subtitles in multiple languages, all in high definition quality.",
    image: "/images/banner.png",
    primaryLabel: "Watch Now",
    primaryHref: "/popular",
    secondaryLabel: "Browse Genres",
    secondaryHref: "/genres",
    mediaType: "TV",
    duration: "24m",
    releaseDate: "2025",
    quality: "HD",
    hasCC: true,
    hasDub: true,
    ccCount: 1155,
    dubCount: 1155,
  },
  {
    id: "apk",
    title: "NimeNime is Now on Android!",
    synopsis:
      "Experience faster streaming, smart watch history, and a sleek mobile UI. Take your favorite anime anywhere you go with our dedicated Android application. Download now and never miss an episode.",
    image: "/images/banner_download.png",
    primaryLabel: "Download APK",
    primaryHref: "/download",
    secondaryLabel: "Detail",
    secondaryHref: "/download",
    mediaType: "App",
    duration: null,
    releaseDate: "2025",
    quality: null,
    hasCC: false,
    hasDub: false,
    ccCount: null,
    dubCount: null,
  },
];

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */
export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [isTransitioning]
  );

  const nextSlide = useCallback(
    () => goToSlide((currentSlide + 1) % slides.length),
    [currentSlide, goToSlide]
  );

  const prevSlide = useCallback(
    () => goToSlide((currentSlide - 1 + slides.length) % slides.length),
    [currentSlide, goToSlide]
  );

  // Auto-play every 6s — resets on manual navigation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured Anime Spotlight"
    >
      {/* ── Slide container ── */}
      <div className="relative w-full min-h-[55vh] sm:min-h-[60vh] md:min-h-[65vh] lg:min-h-[70vh]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}
            aria-hidden={index !== currentSlide}
            className={`absolute inset-0 transition-all duration-[800ms] ease-in-out ${index === currentSlide
              ? "opacity-100 z-10 scale-100"
              : "opacity-0 z-0 scale-[1.03] pointer-events-none"
              }`}
          >
            {/* Background image */}
            <Image
              src={slide.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center"
            />

            {/* ── Multi-layer gradient overlays ── */}
            {/* Heavy left-to-right gradient for text legibility */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(
                  90deg,
                  var(--hn-dark) 0%,
                  rgba(0,0,0,0.85) 15%,
                  rgba(0,0,0,0.6) 40%,
                  rgba(0,0,0,0.2) 65%,
                  transparent 85%
                )`,
              }}
            />

            {/* Bottom fade into body color */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(
                  0deg,
                  var(--hn-body) 0%,
                  var(--hn-body) 2%,
                  rgba(0,0,0,0.4) 20%,
                  transparent 50%
                )`,
              }}
            />

            {/* Subtle top vignette */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%)",
              }}
            />

            {/* Ambient glow */}
            <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-hn-primary/8 blur-[120px] pointer-events-none" />

            {/* ── Content overlay ── */}
            <div className="absolute inset-0 flex items-end pb-16 sm:pb-20 md:items-center md:pb-0">
              <div className="w-full max-w-3xl px-6 sm:px-10 md:px-14 lg:px-20">
                {/* Spotlight label */}
                <div
                  className={`mb-3 transition-all duration-700 ${index === currentSlide
                    ? "opacity-100 translate-y-0 delay-200"
                    : "opacity-0 translate-y-3"
                    }`}
                >
                  <span className="text-sm font-bold tracking-wide text-hn-primary">
                    #{index + 1} Spotlight
                  </span>
                </div>

                {/* Title */}
                <h2
                  className={`text-3xl font-extrabold leading-[1.1] text-white sm:text-4xl md:text-5xl lg:text-6xl transition-all duration-700 ${index === currentSlide
                    ? "opacity-100 translate-y-0 delay-300"
                    : "opacity-0 translate-y-4"
                    }`}
                >
                  {slide.title}
                </h2>

                {/* Metadata badges */}
                <div
                  className={`mt-4 flex flex-wrap items-center gap-2 text-sm text-white/70 transition-all duration-700 ${index === currentSlide
                    ? "opacity-100 translate-y-0 delay-[400ms]"
                    : "opacity-0 translate-y-4"
                    }`}
                >
                  {slide.mediaType && (
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className="h-3.5 w-3.5 text-white/50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      {slide.mediaType}
                    </span>
                  )}

                  {slide.duration && (
                    <>
                      <span className="dot-sep" />
                      <span className="inline-flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5 text-white/50"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {slide.duration}
                      </span>
                    </>
                  )}

                  {slide.releaseDate && (
                    <>
                      <span className="dot-sep" />
                      <span className="inline-flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5 text-white/50"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {slide.releaseDate}
                      </span>
                    </>
                  )}

                  {/* Quality badge */}
                  {slide.quality && (
                    <>
                      <span className="dot-sep" />
                      <span className="rounded-[3px] border border-hn-primary/60 bg-hn-primary/15 px-2 py-0.5 text-[11px] font-bold text-hn-primary">
                        {slide.quality}
                      </span>
                    </>
                  )}

                  {/* CC badge */}
                  {slide.hasCC && (
                    <span className="rounded-[3px] border border-hn-secondary/60 bg-hn-secondary/15 px-2 py-0.5 text-[11px] font-bold text-hn-secondary">
                      {slide.ccCount ? `CC ${slide.ccCount}` : "CC"}
                    </span>
                  )}

                  {/* Dub badge */}
                  {slide.hasDub && (
                    <span className="rounded-[3px] border border-hn-blue/60 bg-hn-blue/15 px-2 py-0.5 text-[11px] font-bold text-hn-blue">
                      {slide.dubCount ? `MIC ${slide.dubCount}` : "DUB"}
                    </span>
                  )}
                </div>

                {/* Synopsis */}
                <p
                  className={`mt-4 max-w-2xl text-sm leading-relaxed text-white/50 line-clamp-3 md:text-[15px] md:line-clamp-4 transition-all duration-700 ${index === currentSlide
                    ? "opacity-100 translate-y-0 delay-500"
                    : "opacity-0 translate-y-4"
                    }`}
                >
                  {slide.synopsis}
                </p>

                {/* CTA Buttons */}
                <div
                  className={`mt-6 flex items-center gap-3 transition-all duration-700 ${index === currentSlide
                    ? "opacity-100 translate-y-0 delay-[600ms]"
                    : "opacity-0 translate-y-4"
                    }`}
                >
                  {/* Primary button — Watch Now */}
                  <Link
                    href={slide.primaryHref}
                    target={
                      slide.primaryHref.startsWith("http")
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      slide.primaryHref.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="hero-btn-primary group inline-flex items-center gap-2 rounded-full bg-hn-primary px-6 py-2.5 text-sm font-bold text-hn-dark shadow-lg shadow-hn-primary/20 transition-all duration-300 hover:brightness-110 hover:shadow-hn-primary/30 hover:scale-[1.03] active:scale-[0.98]"
                  >
                    {/* Play icon */}
                    <svg
                      className="h-4 w-4 transition-transform duration-300 group-hover:scale-110"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                    </svg>
                    {slide.primaryLabel}
                  </Link>

                  {/* Secondary button — Detail */}
                  <Link
                    href={slide.secondaryHref}
                    className="hero-btn-secondary group inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-6 py-2.5 text-sm font-semibold text-white/80 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.14] hover:text-white hover:ring-white/20 active:scale-[0.98]"
                  >
                    {slide.secondaryLabel}
                    {/* Chevron right */}
                    <svg
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Right-side vertical navigation ── */}
      <div className="absolute right-4 sm:right-6 lg:right-10 top-1/2 z-20 -translate-y-1/2 flex flex-col gap-1">
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          className="hero-nav-btn flex h-10 w-10 items-center justify-center rounded-md bg-black/40 text-white/70 backdrop-blur-md transition-all duration-300 hover:bg-black/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous slide"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          disabled={isTransitioning}
          className="hero-nav-btn flex h-10 w-10 items-center justify-center rounded-md bg-black/40 text-white/70 backdrop-blur-md transition-all duration-300 hover:bg-black/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next slide"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* ── Bottom seamless transition line ── */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-hn-primary/20 to-transparent z-20 pointer-events-none" />
    </section>
  );
}
