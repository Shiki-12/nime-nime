"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    id: "create-account",
    title: (
      <>
        Join NimeNime{" "}
        <span className="bg-gradient-to-r from-hn-primary to-hn-secondary bg-clip-text text-transparent">
          Today!
        </span>
      </>
    ),
    subtitle:
      "Create an account to unlock exclusive features, save your favorite anime, track your watch history, and access the premium 18+ section.",
    image: "/images/banner_account.png",
    buttonLabel: "Sign Up / Log In",
    buttonHref: "/login",
    tag: "Get Started",
    icon: (
      <svg
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "adblock-tip",
    title: (
      <>
        Watch Without{" "}
        <span className="bg-gradient-to-r from-hn-primary to-hn-secondary bg-clip-text text-transparent">
          Interruptions
        </span>
      </>
    ),
    subtitle:
      "For a safer, ad-free experience, we recommend Brave Browser or uBlock Origin.",
    image: "/images/banner_adblock.jpg",
    buttonLabel: "Get uBlock Origin",
    buttonHref: "https://ublockorigin.com/",
    tag: "Pro Tip",
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: "default",
    title: (
      <>
        Watch the Best{" "}
        <span className="bg-gradient-to-r from-hn-primary to-hn-secondary bg-clip-text text-transparent">
          Anime
        </span>{" "}
        in HD
      </>
    ),
    subtitle:
      "Stream thousands of episodes — from legendary series to the latest seasonal hits. No ads, no interruptions.",
    image: "/images/banner.png",
    buttonLabel: "Explore Now",
    buttonHref: "/popular",
    tag: "Streaming Now",
    icon: (
      <svg
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
      </svg>
    ),
  },
  {
    id: "apk",
    title: (
      <>
        NimeNime is now on{" "}
        <span className="bg-gradient-to-r from-hn-primary to-hn-secondary bg-clip-text text-transparent">
          Android!
        </span>
      </>
    ),
    subtitle:
      "Experience faster streaming, smart watch history, and a sleek mobile UI. Take your favorite anime anywhere you go.",
    image: "/images/banner_download.png",
    buttonLabel: "Download APK",
    buttonHref: "/download",
    tag: "Available Now",
    icon: (
      <svg
        className="h-4 w-4 transition-transform group-hover:-translate-y-0.5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.4158.4158 0 0 0-.1521-.5676.416.416 0 0 0-.5676.1521l-2.0223 3.503C15.5902 8.244 13.8533 7.8546 12 7.8546c-1.8533 0-3.5902.3894-5.1368 1.0954L4.841 5.4468a.417.417 0 0 0-.5676-.1521.4157.4157 0 0 0-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
      </svg>
    ),
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play switch every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]); // resetting the timer when currentSlide changes

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative mx-auto mb-12 max-w-[1440px] overflow-hidden rounded-none px-0 sm:rounded-2xl sm:px-4 lg:px-6">
      <div className="relative overflow-hidden rounded-none shadow-[0_0_40px_var(--hn-border)] ring-1 ring-hn-primary/10 sm:rounded-2xl h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-hn-dark/95 via-hn-dark/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-hn-body via-transparent to-hn-dark/30" />
            <div className="absolute -left-20 top-1/2 h-60 w-60 -translate-y-1/2 rounded-full bg-hn-primary/10 blur-[100px]" />

            <div className="absolute inset-0 flex items-center">
              <div className="w-full max-w-xl px-8 sm:px-12 lg:px-14">
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-hn-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-hn-primary ring-1 ring-hn-primary/20 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-hn-primary animate-pulse" />
                  {slide.tag}
                </span>

                <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl md:text-4xl lg:text-[42px]">
                  {slide.title}
                </h2>

                <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-white/50 sm:text-sm">
                  {slide.subtitle}
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <Link
                    href={slide.buttonHref}
                    target={slide.buttonHref.startsWith("http") ? "_blank" : undefined}
                    rel={slide.buttonHref.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group inline-flex items-center gap-2 rounded-full bg-hn-primary px-6 py-2.5 text-sm font-bold text-hn-dark shadow-lg shadow-hn-primary/25 transition-all hover:bg-hn-secondary hover:shadow-hn-primary/30"
                  >
                    {slide.icon}
                    {slide.buttonLabel}
                  </Link>
                  {slide.id === "default" && (
                    <Link
                      href="/genres"
                      className="hidden sm:inline-flex rounded-full bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/70 ring-1 ring-white/10 transition-all hover:bg-white/10 hover:text-white"
                    >
                      Browse Genres
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-hn-primary hover:text-hn-dark hover:scale-110"
          aria-label="Previous Slide"
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
          className="absolute right-2 sm:right-4 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-hn-primary hover:text-hn-dark hover:scale-110"
          aria-label="Next Slide"
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

        {/* Dot Indicators */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all ${
                currentSlide === index
                  ? "w-6 bg-hn-primary"
                  : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-hn-primary/40 to-transparent z-20 pointer-events-none" />
      </div>
    </section>
  );
}
