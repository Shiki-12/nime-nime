# Nime - Anime Streaming Platform

A responsive, high-performance anime streaming platform built with Next.js 16, React 19, TypeScript, and Tailwind CSS. The application aggregates anime content from external APIs to provide a seamless browsing, searching, and viewing experience.

**Live Demo**: [https://nime-nime.web.id](https://nime-nime.web.id)

---

## Project Overview

Nime is a full-featured frontend application designed to deliver anime content through an intuitive and premium interface. The platform utilizes advanced Next.js caching strategies and React 19 features to ensure optimal performance.

### Key Highlights
- **High Performance**: Built with Next.js 16 and React Compiler for optimized rendering.
- **Modern User Interface**: Responsive design powered by Tailwind CSS v4, featuring glassmorphism elements, custom CSS variables, and dynamic theme switching.
- **Real-time Data**: Fetches anime and metadata using Next.js Incremental Static Regeneration (ISR) and client-side memory caching.
- **Type-Safe**: Developed with extensive TypeScript interfaces.
- **Local Storage Integration**: Bookmark favorite series and automatically track watch history and timestamps.
- **Automated Deployment**: CI/CD pipeline integrated with GitHub Actions for automated deployment to Google Cloud Platform (GCP).

---

## Features

### Core Anime Experience
- **Content Discovery**: Browse ongoing, popular, and movie catalogs with pagination.
- **Immersive Headers**: Dynamic blurred background posters and gradient overlays on detail pages.
- **Character Integration**: Cast and voice actor metadata powered by the Jikan API.
- **Release Schedule**: Daily release schedule matrix for ongoing series.

### Search and Navigation
- **Real-Time Search**: Debounced, cached autocomplete search bar to minimize API requests and respect rate limits.
- **Advanced Filtering**: Browse by specific genres, types, or release status.

### Video Player
- **Custom Player Wrapper**: Premium video player interface with thumbnail overlays, loading states, and error handling.
- **Smart Resume**: "Continue Watching" functionality automatically reads from local storage to resume from the highest watched episode.
- **Navigation Controls**: Quick-scroll episode lists and direct server/resolution selection.

### 18+ Section Integration
- **Isolated Routing**: Protected, dedicated content section with conditional layout and isolated navigation.
- **Web Scraping**: Cheerio-powered server-side scraping to extract high-resolution cover images directly from source HTML meta tags.
- **Theme Inheritance**: Dynamic CSS variables seamlessly adapt the section's design language to match the user's active application theme.

### Integrations & Utilities
- **Telegram Broadcast Bot**: Standalone Node.js PM2 service using Telegraf that polls the API and automatically broadcasts new episode releases to the official Telegram channel, complete with admin remote control.
- **Serverless Contact Form**: An integrated interactive contact page using the Web3Forms API for a seamless, backend-free user feedback experience.

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16.1** | React framework for SSR, SSG, and ISR |
| **React 19.2** | UI component library |
| **TypeScript 5.x** | Static typing and interfaces |
| **Tailwind CSS 4.x** | Styling and responsive design system |
| **Cheerio** | Server-side HTML parsing and DOM manipulation |
| **React Compiler** | Automated render optimization |
| **Telegraf** | Telegram bot framework for Node.js |
| **Web3Forms** | Backend-less serverless form API |

---

## Getting Started

### Prerequisites
- Node.js 18.17+
- npm, yarn, pnpm, or bun
- PostgreSQL database

### Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables manually or by copying the example file:
   ```bash
   cp .env.example .env
   ```
   Provide your specific `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`, and `OWNER_ID`.

3. Synchronize the database schema with Prisma:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```
   Access the application at `http://localhost:3000`.

5. Start the Telegram broadcast bot (optional):
   ```bash
   npm run bot:pm2
   ```

---

## Architecture and Integration

### API Sources
- **Primary Streaming API**: Handles ongoing lists, stream URLs, genres, and metadata. Fully cached via Next.js ISR and client-side Map caching.
- **Jikan API (v4)**: Enriches detail pages with character and cast data.
- **HentaiOcean RSS/API**: Powers the specialized 18+ section, converting RSS feeds into a fully browsable component-driven directory.

### Deployment Strategy
The platform is deployed on a Google Cloud Platform Compute Engine instance. The `.github/workflows/deploy.yml` action automatically connects via SSH upon pushes to the `main` branch, pulls the latest code, installs dependencies, builds the production bundle, and restarts the Node.js PM2 process.

---

**Last Updated**: March 2026  
**Status**: Active Development
