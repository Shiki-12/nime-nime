# Nime 🎌 - Anime Streaming Platform

A modern, responsive anime streaming platform built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS**. Browse, search, and watch your favorite anime with an elegant user interface.

**Live Demo**: [https://nime-nime.web.id](https://nime-nime.web.id)

---

## 📋 Project Overview

**Nime** is a full-featured anime streaming frontend application that aggregates anime content from external APIs. It provides users with a seamless experience to discover, search, and watch anime series with an intuitive, premium interface.

### Key Highlights
- ⚡ **High Performance**: Built with Next.js 16 with React Compiler enabled for optimized rendering.
- 🎨 **Modern UI**: Tailwind CSS v4 with glassmorphism, responsive design, and immersive blurred headers.
- 🌐 **Real-time Data**: Fetches anime data with Next.js revalidation caching and in-memory client-side caching.
- 🎯 **Type-Safe**: Full TypeScript support for robust development.
- 💾 **Local Storage**: Save your favorite anime and track your watch history automatically.
- 🚀 **Automated CI/CD**: Automated deployment to Google Cloud Platform (GCP) using GitHub Actions.

---

## ✨ Features

- **Browse Anime**
  - Immersive hero headers with dynamic blurred backgrounds and gradient overlays.
  - View ongoing/airing anime with pagination.
  - Popular anime listings and Movie catalog.
  - Character & Voice Actor (Seiyuu) integration powered by the Jikan API.
  
- **Search & Filter**
  - Real-time search bar with custom debouncing and in-memory caching to respect API rate limits.
  - Advanced filtering page with multiple options (genres, types, status).
  - Browse by genres with curated selections.

- **Watch Anime**
  - Premium Custom Video Player Wrapper with thumbnail overlays, loading states, and error handling.
  - Smart "Watch Now" / "Continue Watching" CTA that dynamically resumes from your highest watched episode.
  - Detailed episode list with quick-scroll navigation (First/Latest episode).
  - Server and resolution selector for optimal streaming quality.

- **User Features**
  - Save/bookmark your favorite anime.
  - Watch history tracking with timestamps (stored persistently via `localStorage`).
  - Clear entire watch history or view sorted history.
  - Responsive design optimized for both desktop and mobile devices.

- **Android App Integration**
  - Dedicated APK download page with promotional hero carousels.

- **Release Schedule**
  - View anime release schedule by day of the week.
  - Automatic detection of the current day.

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.1.6 | React framework with SSR/SSG |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Styling, responsive design, and custom themes (`hn-*`) |
| **React Compiler** | 1.0.0 | Optimized render performance |
| **ESLint** | 9.x | Code linting |

---

## 📁 Project Structure

```
Nime-nime/
├── .github/workflows/          # GitHub Actions (CI/CD to GCP)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── anime/[slug]/       # Anime detail pages with immersive headers
│   │   ├── anime/watch/        # Episode watch pages & premium video player
│   │   ├── download/           # Android APK download promotional page
│   │   ├── search/[query]/     # Real-time search results
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home/Ongoing anime with HeroCarousel
│   │   └── globals.css         # Global styles & custom utility classes like scrollbar-hide
│   ├── components/             # React components
│   │   ├── AnimeDetailHeader.tsx # Immersive blurred poster backgrounds
│   │   ├── AnimeCharacters.tsx   # Fetches cast from Jikan API
│   │   ├── DetailEpisodeList.tsx # List with quick-scroll actions
│   │   ├── SearchBar.tsx         # Real-time search with caching
│   │   ├── VideoPlayerWrapper.tsx# Premium player with idle/loading/error states
│   │   ├── WatchNowButton.tsx    # Dynamic CTA reading from local storage
│   │   └── ...                 
│   ├── hooks/                  # Custom hooks (useDebounce, useWatchHistory, etc.)
│   ├── lib/                    # Utility functions & API clients
│   └── types/                  # TypeScript interfaces
├── public/                     # Static assets (images, banners)
└── ...
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** 18.17+ or later
- **npm** 8.0+, **yarn**, **pnpm**, or **bun**
- **Git**
- **PostgreSQL** database (running locally or remotely)

### Installation Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd Nime-nime
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy the `.env.example` file to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and fill in your details:
   - `DATABASE_URL`: Your PostgreSQL connection string (e.g., `postgresql://[USER]:[PASSWORD]@localhost:5432/[NAMA_DATABASE]`).
   - `NEXTAUTH_SECRET`: A secret string used for session encryption.
   - `NEXTAUTH_URL`: Your website URL (e.g., `http://localhost:3000` for local development).
   - `RESEND_API_KEY`: API key for the Resend email service (used for sending verification emails).

4. **Database Setup**
   Push the Prisma schema to your PostgreSQL database to create the required tables:
   ```bash
   npx prisma db push
   ```
   Generate the Prisma Client:
   ```bash
   npx prisma generate
   ```

---

## 💻 Running Locally

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at:
- **Local**: [http://localhost:3000](http://localhost:3000)

**Hot Module Replacement (HMR)** is enabled—your changes will reflect in the browser instantly.

---

## 🌐 API Integration

The app fetches anime data from external APIs:

1. **Primary Streaming API**: `https://www.sankavollerei.com/anime/animasu`
   - Handles ongoing lists, details, streaming URLs, genres, and schedules.
   - Cached via Next.js ISR (1-hour revalidation) and client-side memory caching.

2. **Jikan API (v4)**: `https://api.jikan.moe/v4`
   - Used for enriching detail pages with character and voice actor (Seiyuu) data.
   - Endpoint: `/anime/{mal_id}/characters`

---

## 🚢 Deployment

The project is configured for automated deployment to **Google Cloud Platform (GCP)**.

- **Workflow**: `.github/workflows/deploy.yml`
- **Trigger**: Pushes to the `main` branch.
- **Action**: Connects to the GCP instance via SSH, pulls the latest code, installs dependencies, builds the production bundle, and restarts the PM2 process.

**Production Domain**: [https://nime-nime.web.id](https://nime-nime.web.id)

---

## 📝 Notes & Best Practices Implemented

- **Performance**: Client-side API caching (in-memory Map) used in SearchBar to prevent redundant network calls and respect API rate limits. 
- **Image Optimization**: External images prone to upstream timeouts bypass Next.js image optimization (`unoptimized={true}`) to guarantee fast loads.
- **Hydration Safety**: Custom hooks accessing `localStorage` (like `useWatchHistory`) strictly read data post-mount to avoid React SSR hydration mismatches.
- **UX/UI**: Skeleton loaders are used throughout the application to provide smooth perceived performance while data is fetching.

---

## 📄 License

This project is provided as-is for personal and educational use.

---

**Last Updated**: March 15, 2026  
**Status**: Active Development  
**Version**: 0.3.0
