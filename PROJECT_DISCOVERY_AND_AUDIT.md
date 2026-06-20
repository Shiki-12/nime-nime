# Project Discovery and Audit

**Project:** NimeNime — Anime Streaming & Community Platform  
**Repository:** `Nime-nime`  
**Live URL:** [https://nime-nime.web.id](https://nime-nime.web.id)  
**Audit Date:** 2026-06-20  
**Auditor:** AI Architect — Full-Stack, UI/UX, Database, API, Security Review  
**Status:** Active Development (since March 2026)

---

## 1. Executive Summary

NimeNime is a **full-stack anime streaming and community platform** built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, PostgreSQL (Prisma ORM), and NextAuth v5. The project aggregates anime content from multiple external APIs (Animasu, Otakudesu/Sanka Vollerei, Jikan/MyAnimeList, HentaiOcean) and provides user features including watchlists, watch history, episode comments, public discussion, notifications, and a Telegram broadcast bot.

### Maturity Assessment: **Early Production**

The project is well beyond prototype/MVP stage with a complete authentication system, role-based admin panel, database-backed user features, CI/CD deployment to GCP, and a polished multi-theme design system. However, it lacks automated testing, has several large monolithic components, and has security gaps typical of indie projects.

### Key Metrics

| Metric | Value |
|--------|-------|
| Total source files (src/) | ~80+ TypeScript/TSX files |
| React components | 26 (25 main + 1 admin) |
| API endpoints | 20+ route handlers |
| Database models | 9 (+ 1 enum, 1 enum) |
| Custom hooks | 5 |
| Library modules | 14 |
| Themes | 10 (6 dark + 4 light) |
| Prisma migrations | 5 |
| External API integrations | 5 (Animasu, Otakudesu, Jikan, HentaiOcean, Resend) |
| Test files | 0 |

---

## 2. Repository Overview

### 2.1 Repository Map

| Area | Location | Purpose | Status |
|------|----------|---------|--------|
| Root config | `package.json`, `tsconfig.json`, `next.config.ts` | Project config & dependencies | ✅ Verified |
| Frontend app | `src/app/` | Next.js App Router pages (24 route dirs) | ✅ Verified |
| Components | `src/components/` | 25 React components + 1 admin | ✅ Verified |
| Admin components | `src/components/admin/` | CSV export button | ✅ Verified |
| API routes | `src/app/api/` | 14 API route directories (20+ handlers) | ✅ Verified |
| Library | `src/lib/` | 14 utility modules (auth, API, mail, etc.) | ✅ Verified |
| Custom hooks | `src/hooks/` | 5 hooks (debounce, storage, sync, theme, history) | ✅ Verified |
| Type definitions | `src/types/` | 3 type files (anime, hentai, next-auth) | ✅ Verified |
| Database schema | `prisma/schema.prisma` | 9 models, PostgreSQL | ✅ Verified |
| Migrations | `prisma/migrations/` | 5 migration folders | ✅ Verified |
| Generated client | `src/generated/prisma/` | Auto-generated Prisma client | ✅ Verified |
| Middleware | `src/proxy.ts` | Maintenance mode + login rate limiting | ✅ Verified |
| Telegram bot | `bot/` | PM2-managed broadcast bot (Telegraf) | ✅ Verified |
| Scripts | `scripts/` | Color refactor migration script | ✅ Verified |
| Public assets | `public/images/` | 7 banner images (6MB+ total) | ✅ Verified |
| CI/CD | `.github/workflows/deploy.yml` | GCP SSH deployment via GitHub Actions | ✅ Verified |
| Styling | `src/app/globals.css` | 442 lines, 10-theme CSS variable system | ✅ Verified |
| Environment | `.env.example` | 20 environment variables | ✅ Verified |
| SEO | `src/app/robots.ts`, `src/app/sitemap.ts` | Dynamic robots + sitemap | ✅ Verified |

### 2.2 File Size Analysis (Noteworthy Large Files)

| File | Size | Concern |
|------|------|---------|
| `Navbar.tsx` | 38.9KB (730 lines) | ⚠️ Extremely large — needs decomposition |
| `EpisodeComments.tsx` | 26.2KB (503 lines) | ⚠️ Monolithic — needs splitting |
| `HeroCarousel.tsx` | 21.8KB (533 lines) | ⚠️ Hardcoded slide data |
| `FilterForm.tsx` | 19.6KB (475 lines) | ⚠️ ~200 lines of hardcoded seasons |
| `SearchBar.tsx` | 16.5KB (370 lines) | Moderate — manageable |
| `globals.css` | 14.4KB (442 lines) | Acceptable for 10-theme system |
| `admin/users/page.tsx` | 27.0KB | Large admin page |
| `admin/page.tsx (dashboard)` | 22.2KB | Large admin dashboard |

---

## 3. Technology Stack

### 3.1 Verified Technologies

| Technology | Version | Purpose | Evidence |
|------------|---------|---------|----------|
| **Next.js** | 16.1.6 | Full-stack React framework (App Router, SSR, ISR) | [package.json](file:///c:/laragon/www/Nime-nime/package.json) L22 |
| **React** | 19.2.3 | UI component library | [package.json](file:///c:/laragon/www/Nime-nime/package.json) L24 |
| **TypeScript** | ^5 | Static typing | [package.json](file:///c:/laragon/www/Nime-nime/package.json) L44 |
| **Tailwind CSS** | ^4 | Utility-first styling with CSS variables | [package.json](file:///c:/laragon/www/Nime-nime/package.json) L43 |
| **PostgreSQL** | — | Primary database | [prisma/schema.prisma](file:///c:/laragon/www/Nime-nime/prisma/schema.prisma) L7 |
| **Prisma** | ^7.8.0 | ORM / database client | [package.json](file:///c:/laragon/www/Nime-nime/package.json) L18, L42 |
| **NextAuth** | ^5.0.0-beta.30 | Authentication (JWT + Google OAuth + Credentials) | [package.json](file:///c:/laragon/www/Nime-nime/package.json) L23 |
| **bcryptjs** | ^3.0.3 | Password hashing (12 rounds) | [src/lib/auth.ts](file:///c:/laragon/www/Nime-nime/src/lib/auth.ts) L5 |
| **Cheerio** | ^1.2.0 | Server-side HTML scraping | [package.json](file:///c:/laragon/www/Nime-nime/package.json) L20 |
| **Resend** | ^6.9.3 | Transactional email (verification) | [package.json](file:///c:/laragon/www/Nime-nime/package.json) L26 |
| **SweetAlert2** | ^11.26.24 | UI notification dialogs | [package.json](file:///c:/laragon/www/Nime-nime/package.json) L28 |
| **Telegraf** | ^4.16.3 | Telegram bot framework | [package.json](file:///c:/laragon/www/Nime-nime/package.json) L29 |
| **Zod** | ^4.3.6 | Schema validation (API request bodies) | [package.json](file:///c:/laragon/www/Nime-nime/package.json) L30 |
| **Sharp** | ^0.34.5 | Image processing | [package.json](file:///c:/laragon/www/Nime-nime/package.json) L27 |
| **React Compiler** | 1.0.0 | Automated render optimization (babel plugin) | [package.json](file:///c:/laragon/www/Nime-nime/package.json) L39 |
| **ESLint** | ^9 | Linting (Next.js core-web-vitals + TypeScript) | [eslint.config.mjs](file:///c:/laragon/www/Nime-nime/eslint.config.mjs) |
| **PostCSS** | — | CSS processing (`@tailwindcss/postcss`) | [postcss.config.mjs](file:///c:/laragon/www/Nime-nime/postcss.config.mjs) |
| **PM2** | — | Process manager (production + bot) | [deploy.yml](file:///c:/laragon/www/Nime-nime/.github/workflows/deploy.yml) L27 |
| **Google Fonts** | Inter | Typography (300–900 weights) | [globals.css](file:///c:/laragon/www/Nime-nime/src/app/globals.css) L1 |

### 3.2 Missing / Not Found

| Technology | Status | Notes |
|------------|--------|-------|
| Testing framework | ❌ NOT IMPLEMENTED | No Jest, Vitest, Playwright, or Cypress |
| Prettier | ❌ NOT IMPLEMENTED | No .prettierrc or prettier dependency |
| Docker | ❌ NOT IMPLEMENTED | No Dockerfile or docker-compose.yml |
| Redis | ❌ NOT IMPLEMENTED | Rate limiting is in-memory only |
| WebSocket/SSE | ❌ NOT IMPLEMENTED | Notification polling uses 30s interval fetch |
| i18n | ❌ NOT IMPLEMENTED | UI text is hardcoded Indonesian |
| Storybook | ❌ NOT IMPLEMENTED | No component documentation |
| Monitoring/APM | ❌ NOT IMPLEMENTED | No Sentry, DataDog, etc. |

### 3.3 Environment Variables

Documented from [.env.example](file:///c:/laragon/www/Nime-nime/.env.example):

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Critical |
| `NEXTAUTH_SECRET` | NextAuth JWT signing secret | ✅ Critical |
| `NEXTAUTH_URL` | Application base URL | ✅ Critical |
| `AUTH_SECRET` | Auth.js secret (alias) | ✅ Critical |
| `AUTH_URL` | Auth.js URL (alias) | ✅ Critical |
| `AUTH_TRUST_HOST` | Trust proxy headers | ✅ Required |
| `AUTH_GOOGLE_ID` | Google OAuth client ID | Optional (for Google login) |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | Optional (for Google login) |
| `RESEND_API_KEY` | Resend email API key | Optional (for email verification) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | Optional (for bot) |
| `TELEGRAM_CHANNEL_ID` | Telegram channel to broadcast to | Optional (for bot) |
| `OWNER_ID` | Telegram admin user ID | Optional (for bot) |
| `MASTER_OWNER_EMAIL` | Immortal owner email override | ✅ Security-critical |
| `ANIME_API_URL` | Primary anime JSON API | Has fallback default |
| `ANIME_HTML_URL` | Anime HTML scraping URL | Has fallback default |
| `CRON_SECRET` | Secret for cron endpoint auth | Optional |
| `MAINTENANCE_MODE` | Enable/disable maintenance | Optional (default: false) |
| `MAINTENANCE_MESSAGE` | Maintenance page message | Optional |
| `MAINTENANCE_BYPASS_SECRET` | Bypass maintenance via URL param | Optional |

---

## 4. Application Runtime Status

### 4.1 Build & Run Commands

| Command | Script | Purpose |
|---------|--------|---------|
| `npm run dev` | `prisma generate && next dev` | Development server |
| `npm run build` | `prisma generate && next build` | Production build |
| `npm run start` | `next start` | Production server |
| `npm run lint` | `eslint` | Linting |
| `npm run bot` | `node bot/telegram-bot.js` | Run Telegram bot |
| `npm run bot:pm2` | `pm2 start bot/ecosystem.config.js` | Start bot with PM2 |

### 4.2 Prerequisites

| Prerequisite | Required | Evidence |
|--------------|----------|----------|
| Node.js 18.17+ | ✅ | README.md specifies |
| PostgreSQL database | ✅ | Prisma schema uses `postgresql` provider |
| npm | ✅ | package-lock.json present |
| PM2 (production) | Optional | Used in deploy script and bot |

### 4.3 Runtime Status Check

| Check | Expected Result | Evidence | Notes |
|-------|----------------|----------|-------|
| `npm install` | Pass | `node_modules` exists in repo | Dependencies already installed |
| `prisma generate` | Pass | `src/generated/prisma/` exists | Client already generated |
| `npm run dev` | Requires PostgreSQL | DATABASE_URL needed | Will fail without valid DB connection |
| `npm run build` | Requires PostgreSQL | Prisma queries run at build time (ISR) | Server components need DB |
| `npm run lint` | Pass | ESLint configured | Standard Next.js rules |

### 4.4 Known Blocking Dependencies

1. **PostgreSQL** — Required for all user features (auth, saved, history, comments, notifications)
2. **ANIME_API_URL** — Required for anime content (has fallback to sankavollerei.com)
3. **Google OAuth credentials** — Required only for Google sign-in
4. **Resend API key** — Required only for email verification
5. **Telegram bot token** — Required only for broadcast bot

### 4.5 Deployment

- **Platform:** Google Cloud Platform (Compute Engine)
- **CI/CD:** GitHub Actions on push to `main` branch
- **Process:** SSH → git pull → npm ci → npm run build → prisma migrate → pm2 restart
- **Evidence:** [deploy.yml](file:///c:/laragon/www/Nime-nime/.github/workflows/deploy.yml)
- **Server path:** `/var/www/Nime-nime`
- **PM2 processes:** `nime-nime` (Next.js) + `nimenime-bot` (Telegram)

---

## 5. Route and Page Inventory

### 5.1 Complete Route Map

| Route | Page File | Type | Auth Required | Purpose | Status |
|-------|-----------|------|---------------|---------|--------|
| `/` | `src/app/page.tsx` | Server | No | Home — hero carousel, ongoing anime, movies, community | ✅ Verified |
| `/login` | `src/app/(auth)/login/page.tsx` | Client | No | Email/password + Google OAuth login | ✅ Verified |
| `/register` | `src/app/(auth)/register/page.tsx` | Client | No | User registration with email verification | ✅ Verified |
| `/verify` | `src/app/(auth)/verify/page.tsx` | Client | No | Email verification token handler | ✅ Verified |
| `/anime/[slug]` | `src/app/anime/[slug]/page.tsx` | Server | No | Anime detail — header, episodes, characters, MAL rating | ✅ Verified |
| `/anime/watch` | `src/app/anime/watch/page.tsx` | Server | No | Episode streaming — video player, sidebar, comments | ✅ Verified |
| `/search` | `src/app/search/page.tsx` | Server | No | Search results with pagination | ✅ Verified |
| `/filter` | `src/app/filter/page.tsx` | Server | No | Advanced filter (genre, type, status, sort) | ✅ Verified |
| `/genres` | `src/app/genres/page.tsx` | Server | No | Genre listing page | ✅ Verified |
| `/genres/[slug]` | `src/app/genres/[slug]/page.tsx` | Server | No | Anime by genre with pagination | ✅ Verified |
| `/movies` | `src/app/movies/page.tsx` | Server | No | Movie listing with pagination | ✅ Verified |
| `/popular` | `src/app/popular/page.tsx` | Server | No | Popular anime listing with pagination | ✅ Verified |
| `/serial` | `src/app/serial/page.tsx` | Server | No | TV series listing with pagination | ✅ Verified |
| `/schedule` | `src/app/schedule/page.tsx` | Server | No | Weekly release schedule matrix | ✅ Verified |
| `/saved` | `src/app/saved/page.tsx` | Client | Yes | User watchlist (saved anime) | ✅ Verified |
| `/history` | `src/app/history/page.tsx` | Client | Yes | Watch history with episodes | ✅ Verified |
| `/inbox` | `src/app/inbox/page.tsx` | Client | Yes | Notification inbox | ✅ Verified |
| `/settings` | `src/app/settings/page.tsx` | Client | Yes | Profile settings (name, password, avatar, NSFW, theme) | ✅ Verified |
| `/discuss` | `src/app/discuss/page.tsx` | Client | Partial | Public discussion board (read: public, write: auth) | ✅ Verified |
| `/recommendations` | `src/app/recommendations/page.tsx` | Client | Partial | Community anime recommendations | ✅ Verified |
| `/contact` | `src/app/contact/page.tsx` | Client | No | Contact form (Web3Forms API) | ✅ Verified |
| `/download` | `src/app/download/page.tsx` | Server | No | Episode download links | ✅ Verified |
| `/hentai` | `src/app/hentai/page.tsx` | Server | NSFW toggle | 18+ content section | ✅ Verified |
| `/hentai/[slug]` | `src/app/hentai/[slug]/page.tsx` | Server | NSFW toggle | Hentai detail page | ✅ Verified |
| `/dmca` | `src/app/dmca/page.tsx` | Server | No | DMCA policy (static) | ✅ Verified |
| `/privacy` | `src/app/privacy/page.tsx` | Server | No | Privacy policy (static) | ✅ Verified |
| `/terms` | `src/app/terms/page.tsx` | Server | No | Terms of service (static) | ✅ Verified |
| `/maintenance` | `src/app/maintenance/page.tsx` | Server | No | Maintenance mode page | ✅ Verified |
| `/aishiteru` | `src/app/aishiteru/page.tsx` | Server | ADMIN/OWNER | Admin dashboard | ✅ Verified |
| `/aishiteru/users` | `src/app/aishiteru/users/page.tsx` | Server | ADMIN/OWNER | User management | ✅ Verified |
| `/aishiteru/users/[id]` | `src/app/aishiteru/users/[id]/` | Server | ADMIN/OWNER | User detail/activity | ✅ Verified |
| `/aishiteru/comments` | `src/app/aishiteru/comments/page.tsx` | Server | ADMIN/OWNER | Comment moderation | ✅ Verified |
| `/aishiteru/broadcasts` | `src/app/aishiteru/broadcasts/page.tsx` | Server | ADMIN/OWNER | Broadcast/announcement CRUD | ✅ Verified |
| `/aishiteru/bot` | `src/app/aishiteru/bot/page.tsx` | Server | ADMIN/OWNER | Telegram bot control | ✅ Verified |
| `/aishiteru/anime-statistic` | `src/app/aishiteru/anime-statistic/page.tsx` | Server | ADMIN/OWNER | Anime engagement stats | ✅ Verified |

### 5.2 Special Route Files

| File | Route | Purpose | Status |
|------|-------|---------|--------|
| `src/app/layout.tsx` | All | Root layout (AppShell, Inter font, metadata) | ✅ Verified |
| `src/app/error.tsx` | All | Global error boundary | ✅ Verified |
| `src/app/loading.tsx` | `/` | Root loading animation | ✅ Verified |
| `src/app/not-found.tsx` | 404 | Custom 404 page with anime ghost SVG | ✅ Verified |
| `src/app/robots.ts` | `/robots.txt` | SEO crawler rules | ✅ Verified |
| `src/app/sitemap.ts` | `/sitemap.xml` | Dynamic sitemap with anime slugs | ✅ Verified |
| `src/app/(auth)/layout.tsx` | Auth routes | Minimal auth layout wrapper | ✅ Verified |
| `src/app/aishiteru/layout.tsx` | Admin routes | Admin sidebar layout with role check | ✅ Verified |
| `src/app/aishiteru/loading.tsx` | Admin routes | Admin loading skeleton | ✅ Verified |

---

## 6. Frontend Architecture

### 6.1 Application Shell

The app uses a provider-based shell architecture defined in [AppShell.tsx](file:///c:/laragon/www/Nime-nime/src/components/AppShell.tsx):

```
RootLayout
└── AppShell (client wrapper)
    ├── SessionProvider (NextAuth)
    ├── ThemeProvider (useTheme context)
    ├── SyncOnLogin (localStorage → DB sync)
    ├── AnnouncementBar (active broadcasts)
    ├── Navbar (navigation + search + notifications)
    ├── {children} (page content)
    └── Footer (links, social, legal)
```

### 6.2 Data Fetching Strategy

| Strategy | Used For | Evidence |
|----------|----------|----------|
| **ISR (Incremental Static Regeneration)** | Anime lists, details, genres, schedule | `revalidate` values in `api.ts` (300s–86400s) |
| **Server Components** | Most pages (home, detail, genre, schedule) | No `"use client"` directive |
| **Client-side fetch** | Search, comments, notifications, saved, history | `fetch()` in `useEffect` or event handlers |
| **unstable_cache** | Otakudesu API, pagination scraping | `unstable_cache` with TTL in `otakudesu.ts`, `pagination-scraper.ts` |
| **In-memory Map cache** | Search results (SearchBar), fetcher | `Map<string, ...>` in component refs |
| **localStorage** | Watch history (anonymous), saved anime (anonymous), theme | `useLocalStorage` hook |

### 6.3 ISR Caching Tiers

| Tier | Duration | Endpoints |
|------|----------|-----------|
| Tier 1 (24h) | 86,400s | Genres, movies |
| Tier 2 (3h) | 10,800s | Detail, episodes, popular, advanced search |
| Tier 3 (30min–1h) | 1,800–3,600s | Home, ongoing, completed, schedule |
| Tier 4 (5min) | 300s | Search |

### 6.4 State Management

The project uses **no centralized state management** (no Redux, Zustand, Jotai). State is managed through:

1. **React Context** — `ThemeProvider` for theme state
2. **NextAuth Session** — User authentication state via `useSession()`
3. **Custom hooks** — `useSavedAnime()`, `useWatchHistory()`, `useLocalStorage()`
4. **localStorage** — Anonymous user data, theme preference, dismissed announcements
5. **URL state** — Search params for filter, search, pagination

This is an appropriate choice for the project's scale but may need Zustand/Jotai as features grow.

---

## 7. UI/UX Audit

### 7.1 Design System Evaluation

| Category | Score (1-10) | Reasoning |
|----------|:---:|-----------|
| **Visual hierarchy** | 8 | Strong use of gradient overlays, blurred backgrounds, and card-based layout. Hero carousel provides clear focal point. Type scale is well-defined with Inter font weights 300–900. |
| **Typography** | 8 | Inter font loaded with full weight range. Responsive sizing (2xl→4xl headings). Good line-clamp utilities. Could improve with explicit type scale tokens. |
| **Color consistency** | 9 | Excellent `hn-*` CSS variable system with 10 themes. All components use the token system consistently. Evidence of systematic migration via `scripts/refactor_colors.js`. |
| **Contrast and readability** | 7 | Dark themes generally good. Some muted text (`hn-text-muted`) may fail WCAG AA on dark backgrounds. Light themes need testing. The `rgba(255,255,255,0.04)` border may be invisible. |
| **Button consistency** | 6 | No shared Button component. Buttons are styled inline with varying patterns across components. Inconsistent padding/radius/hover states. |
| **Navigation clarity** | 8 | Comprehensive navbar with clear active states. Mobile hamburger drawer. Social links in footer. Admin sidebar is well-organized. |
| **Search usability** | 7 | Good debounced autocomplete with caching. Missing ARIA combobox pattern. No keyboard arrow navigation in results. Max 8 results limit. |
| **Anime card layout** | 8 | Clean, responsive grid with poster images, title, type badge, episode count. Hover overlay with play icon. Proper `sizes` attribute for responsive images. |
| **Empty states** | 5 | Some components handle empty data (ContinueWatching returns null, search "No results"). Many pages lack designed empty states. No illustrations for empty watchlist/history. |
| **Error states** | 5 | Global error.tsx exists. VideoPlayerWrapper has retry on error. Most API errors are silently swallowed or show generic SweetAlert. No inline error recovery UI. |
| **Loading skeletons** | 7 | Custom `shimmer` animation in CSS. `AnimeDetailHeaderSkeleton` exported. Admin pages have loading.tsx. Some components lack loading states (AnimeCard grid). |
| **Mobile responsiveness** | 7 | Tailwind responsive classes used throughout. Mobile hamburger nav. Horizontal scroll with snap for characters. Some components may overflow on very small screens. |
| **Keyboard navigation** | 4 | SearchBar has Escape key support. HeroCarousel lacks arrow key navigation. No visible focus indicators on most interactive elements. No skip-to-content link. |
| **Accessibility labels** | 5 | HeroCarousel has excellent ARIA (`aria-roledescription="carousel"`, `role="group"`). Navbar has `aria-label` on nav elements. Many buttons across other components lack `aria-label`. SearchBar missing combobox role. |
| **Image loading behavior** | 6 | Next.js `<Image>` used in AnimeCard with responsive `sizes`. Many images use `unoptimized` flag bypassing optimization. SafeImage uses raw `<img>`. No blur placeholder. |
| **User feedback after actions** | 7 | SweetAlert2 used for confirmations, errors, and success messages. Theme-aware dialogs. Missing subtle toast notifications for minor actions. |
| **Saved/watchlist experience** | 7 | Real database-backed feature with API sync. Heart/bookmark toggle. Paginated list. Supports anonymous (localStorage) and authenticated modes. Lacks drag-to-reorder, categories. |
| **Watch history experience** | 8 | Hybrid localStorage/API storage. "Continue Watching" section on homepage. Episode progress tracking. Smart "Watch Now" / "Continue Watching" button labels. |
| **Community/discussion usability** | 6 | Public chat + episode comments with threading. Role badges. Reply notifications. No emoji reactions, no formatting, no user mentions. Rate limiting for spam. |
| **Overall product polish** | 7 | Polished design with glassmorphism, gradients, and multi-theme support. The 10-theme system is impressive. Weakened by inconsistent component patterns, missing empty states, and monolithic components. |

**Average UI/UX Score: 6.7 / 10**

### 7.2 Theme System Deep Dive

The theme system in [globals.css](file:///c:/laragon/www/Nime-nime/src/app/globals.css) is one of the project's standout features:

**Dark Themes (6):**
1. Purple/Sakura (default) — `#201f31` body, `#ffbade` primary
2. Blue — `#0b1121` body, `#3b82f6` primary
3. Green/Emerald — `#0a0f0d` body, `#00ff88` primary
4. Orange/Sunset — `#1a1311` body, `#ff7300` primary
5. Red/Phantom — `#0f0a0a` body, `#e60012` primary
6. White/Eclipse — `#0c0c0c` body, `#f8fafc` primary

**Light Themes (4):**
1. Amethyst — `#fcfcfd` body, `#a182ab` primary
2. Maroon — `#fdfcfc` body, `#591d1d` primary
3. Frost — `#fbfcfd` body, `#95a5b8` primary
4. Matcha — `#fafffe` body, `#14b8a6` primary

Each theme defines 19 CSS variables covering body, dark, card, card-hover, primary, secondary, green, orange, blue, text, text-muted, border, nsfw, scrollbar, glass, and hero gradient values. The architecture uses `:root` variables referenced through Tailwind's `@theme inline` directive.

---

## 8. Component and Design System Review

### 8.1 Component Inventory

| Component | File | Lines | Reusability | Key Props | Status |
|-----------|------|:-----:|:----------:|-----------|--------|
| **Navbar** | [Navbar.tsx](file:///c:/laragon/www/Nime-nime/src/components/Navbar.tsx) | 730 | ⭐ | None (self-contained) | ⚠️ Needs decomposition |
| **HeroCarousel** | [HeroCarousel.tsx](file:///c:/laragon/www/Nime-nime/src/components/HeroCarousel.tsx) | 533 | ⭐⭐ | None (hardcoded slides) | ⚠️ Hardcoded data |
| **EpisodeComments** | [EpisodeComments.tsx](file:///c:/laragon/www/Nime-nime/src/components/EpisodeComments.tsx) | 503 | ⭐⭐ | episodeSlug, animeSlug? | ⚠️ Monolithic |
| **FilterForm** | [FilterForm.tsx](file:///c:/laragon/www/Nime-nime/src/components/FilterForm.tsx) | 475 | ⭐⭐ | None (URL-driven) | ⚠️ Hardcoded seasons |
| **SearchBar** | [SearchBar.tsx](file:///c:/laragon/www/Nime-nime/src/components/SearchBar.tsx) | 370 | ⭐⭐⭐ | None | Good |
| **VideoPlayerWrapper** | [VideoPlayerWrapper.tsx](file:///c:/laragon/www/Nime-nime/src/components/VideoPlayerWrapper.tsx) | 365 | ⭐⭐⭐⭐ | iframeSrc, title | Good |
| **AnimeCharacters** | [AnimeCharacters.tsx](file:///c:/laragon/www/Nime-nime/src/components/AnimeCharacters.tsx) | 270 | ⭐⭐⭐ | animeTitle | Good |
| **DetailEpisodeList** | [DetailEpisodeList.tsx](file:///c:/laragon/www/Nime-nime/src/components/DetailEpisodeList.tsx) | 227 | ⭐⭐⭐ | episodes[], animeSlug, etc. | Good |
| **AnimeDetailHeader** | [AnimeDetailHeader.tsx](file:///c:/laragon/www/Nime-nime/src/components/AnimeDetailHeader.tsx) | 214 | ⭐⭐ | title, posterUrl, genres, etc. | Good |
| **AnnouncementBar** | [AnnouncementBar.tsx](file:///c:/laragon/www/Nime-nime/src/components/AnnouncementBar.tsx) | 196 | ⭐⭐⭐⭐ | None (self-contained) | Good |
| **ContinueWatching** | [ContinueWatching.tsx](file:///c:/laragon/www/Nime-nime/src/components/ContinueWatching.tsx) | 191 | ⭐⭐⭐⭐ | history[] | Good |
| **PaginationNav** | [PaginationNav.tsx](file:///c:/laragon/www/Nime-nime/src/components/PaginationNav.tsx) | 164 | ⭐⭐⭐⭐⭐ | currentPage, totalPages, etc. | Excellent |
| **EpisodeList** | [EpisodeList.tsx](file:///c:/laragon/www/Nime-nime/src/components/EpisodeList.tsx) | 154 | ⭐⭐⭐ | episodes[], currentEpisodeSlug | ⚠️ Duplicated logic |
| **VideoPlayer** | [VideoPlayer.tsx](file:///c:/laragon/www/Nime-nime/src/components/VideoPlayer.tsx) | 147 | ⭐⭐⭐ | streams[], title | Good |
| **MalRatingCard** | [MalRatingCard.tsx](file:///c:/laragon/www/Nime-nime/src/components/MalRatingCard.tsx) | 135 | ⭐⭐⭐⭐ | malId?, fallbackTitle | Good |
| **Footer** | [Footer.tsx](file:///c:/laragon/www/Nime-nime/src/components/Footer.tsx) | 117 | ⭐⭐⭐ | None | Good |
| **SidebarEpisodeList** | [SidebarEpisodeList.tsx](file:///c:/laragon/www/Nime-nime/src/components/SidebarEpisodeList.tsx) | 105 | ⭐⭐ | episodes[], currentSlug | ⚠️ Duplicated with EpisodeList |
| **WatchNowButton** | [WatchNowButton.tsx](file:///c:/laragon/www/Nime-nime/src/components/WatchNowButton.tsx) | 92 | ⭐⭐⭐ | animeSlug, episodes[] | Good |
| **AnimeCard** | [AnimeCard.tsx](file:///c:/laragon/www/Nime-nime/src/components/AnimeCard.tsx) | 84 | ⭐⭐⭐⭐⭐ | anime: OngoingAnime | Excellent |
| **AnimeActions** | [AnimeActions.tsx](file:///c:/laragon/www/Nime-nime/src/components/AnimeActions.tsx) | 81 | ⭐⭐⭐ | anime (slug, title, poster, type) | Good |
| **ExportCsvButton** | [admin/ExportCsvButton.tsx](file:///c:/laragon/www/Nime-nime/src/components/admin/ExportCsvButton.tsx) | 59 | ⭐⭐⭐⭐ | stats[] | Good |
| **ThemeModeToggle** | [ThemeModeToggle.tsx](file:///c:/laragon/www/Nime-nime/src/components/ThemeModeToggle.tsx) | 58 | ⭐⭐⭐⭐⭐ | None | Excellent |
| **WatchHistoryTracker** | [WatchHistoryTracker.tsx](file:///c:/laragon/www/Nime-nime/src/components/WatchHistoryTracker.tsx) | 50 | ⭐⭐⭐⭐ | animeSlug, episodeSlug, etc. | Good |
| **AppShell** | [AppShell.tsx](file:///c:/laragon/www/Nime-nime/src/components/AppShell.tsx) | 31 | ⭐⭐ | children | Good |
| **SafeImage** | [SafeImage.tsx](file:///c:/laragon/www/Nime-nime/src/components/SafeImage.tsx) | 27 | ⭐⭐⭐⭐⭐ | img attrs + fallback? | Good — but uses raw `<img>` |
| **SyncOnLogin** | [SyncOnLogin.tsx](file:///c:/laragon/www/Nime-nime/src/components/SyncOnLogin.tsx) | 13 | ⭐⭐⭐ | None | Good |

### 8.2 Missing Generic Components

The project has **no shared component library**. These generic components are recreated inline:

| Missing Component | Where It's Duplicated | Recommendation |
|-------------------|----------------------|----------------|
| **Button** | Every page/component styles buttons differently | Create `<Button variant="primary|secondary|ghost|danger">` |
| **Modal** | SweetAlert2 used instead | Consider headless modal for complex UIs |
| **Input** | Inline in login, register, settings, filter | Create `<Input>`, `<Textarea>`, `<Select>` |
| **Badge** | Genre badges, role badges, type badges inline | Create `<Badge variant="genre|role|status">` |
| **Tooltip** | Not used anywhere | Add for icon-only buttons |
| **Dropdown** | User menu, server selector inline | Create `<Dropdown>` component |
| **Icon library** | SVGs duplicated across 10+ components | Extract to `<Icon name="play|heart|check">` |
| **Skeleton** | `.skeleton` CSS class + inline divs | Create `<Skeleton variant="card|text|circle">` |
| **ErrorBoundary** | Only root `error.tsx` | Create reusable `<ErrorBoundary>` for sections |

### 8.3 Code Duplication Issues

| Duplicated Logic | Files Affected | Fix |
|-----------------|----------------|-----|
| Watched episode toggle | `DetailEpisodeList`, `EpisodeList`, `SidebarEpisodeList` | Extract `<EpisodeItem>` sub-component |
| Inline SVG icons | 10+ components | Create `icons/` directory or use icon library |
| Comment/message form | `EpisodeComments`, `discuss/page.tsx` | Extract `<MessageComposer>` |
| Pagination rendering | `PaginationNav`, admin pages | Already reusable — admin should use it too |

---

## 9. Database Review

### 9.1 Database Technology

- **Engine:** PostgreSQL
- **ORM:** Prisma ^7.8.0 with `@prisma/adapter-pg`
- **Client generation:** Output to `src/generated/prisma/`
- **Connection:** Via `DATABASE_URL` environment variable
- **Schema:** [prisma/schema.prisma](file:///c:/laragon/www/Nime-nime/prisma/schema.prisma) (200 lines, 9 models)

### 9.2 Database Models

| Entity | Table Name | Fields | Primary Key | Relationships | Status |
|--------|------------|--------|-------------|---------------|--------|
| **User** | `users` | id, name, email, emailVerified, image, password, role, isVerified, nsfwEnabled, verifyToken, verifyTokenExpiry, createdAt, updatedAt | cuid() | → Account[], Session[], SavedAnime[], WatchHistory[], Comment[], PublicMessage[], Recommendation[], Notification[] | ✅ Active |
| **Account** | `accounts` | id, userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state | cuid() | → User (Cascade) | ✅ Active |
| **Session** | `sessions` | id, sessionToken, userId, expires | cuid() | → User (Cascade) | ✅ Active (JWT strategy — table may be unused) |
| **VerificationToken** | `verification_tokens` | identifier, token, expires | Composite (identifier+token) | None | ✅ Active |
| **SavedAnime** | `saved_anime` | id, userId, animeId, title, image, type, createdAt | cuid() | → User (Cascade) | ✅ Active |
| **WatchHistory** | `watch_history` | id, userId, animeId, title, image, type, episodeId, episodeName, watchedAt, progress | cuid() | → User (Cascade) | ✅ Active |
| **Comment** | `comments` | id, userId, text, episodeSlug, animeSlug?, parentId?, createdAt | cuid() | → User (Cascade), self-referential CommentReplies | ✅ Active |
| **PublicMessage** | `public_messages` | id, userId, message, parentId?, createdAt | cuid() | → User (Cascade), self-referential MessageReplies | ✅ Active |
| **Recommendation** | `recommendations` | id, userId, animeSlug, animeTitle, coverImage, createdAt | cuid() | → User (Cascade) | ✅ Active |
| **Notification** | `notifications` | id, userId, type, title, message, link?, isRead, createdAt | cuid() | → User (Cascade) | ✅ Active |
| **Broadcast** | `broadcasts` | id, message, type (enum), startDate, endDate, isActive, createdAt | cuid() | None (global) | ✅ Active |

### 9.3 Enums

| Enum | Values | Used By |
|------|--------|---------|
| `Role` | USER, ADMIN, OWNER | User.role |
| `BroadcastType` | INFO, WARNING, DANGER, SUCCESS | Broadcast.type |

### 9.4 Indexes

| Table | Index | Type |
|-------|-------|------|
| `users` | email | Unique |
| `accounts` | provider + providerAccountId | Composite unique |
| `sessions` | sessionToken | Unique |
| `verification_tokens` | token | Unique |
| `verification_tokens` | identifier + token | Composite unique |
| `saved_anime` | userId + animeId | Composite unique |
| `watch_history` | userId + animeId + episodeId | Composite unique |
| `comments` | createdAt | Index |
| `public_messages` | createdAt | Index |
| `recommendations` | createdAt | Index |
| `notifications` | userId + isRead | Composite index |
| `notifications` | createdAt | Index |
| `broadcasts` | isActive + startDate + endDate | Composite index |

### 9.5 Migration History

| Migration | Date | Purpose |
|-----------|------|---------|
| `20260315175215_init` | 2026-03-15 | Initial schema (User, Account, Session, VerificationToken, Comment, PublicMessage, Recommendation, Notification) |
| `20260316041051_add_saved_history` | 2026-03-16 | Add SavedAnime and WatchHistory models |
| `20260317065802_add_google_oauth` | 2026-03-17 | Google OAuth account support |
| `20260406160716_add_rbac_role` | 2026-04-06 | Add Role enum and RBAC |
| `20260415143649_add_broadcast_model` | 2026-04-15 | Add Broadcast model |

### 9.6 Database Architecture Observations

**Strengths:**
- ✅ Proper foreign keys with `onDelete: Cascade` on all user-related models
- ✅ Composite unique constraints prevent duplicate saves and history entries
- ✅ Strategic indexes on frequently queried fields (createdAt, userId+isRead)
- ✅ Self-referential relations for comment/message threading
- ✅ Clean separation: anime data is NOT stored in DB (fetched from external APIs)

**Weaknesses & Risks:**
- ⚠️ **No soft delete** — All deletes are hard. No `deletedAt` column anywhere. If a user is deleted, all their content is cascade-deleted permanently
- ⚠️ **Session table exists but JWT strategy used** — The Session model may be dead code since auth.ts uses `strategy: "jwt"`
- ⚠️ **No updatedAt on most models** — Only User has `@updatedAt`. SavedAnime, WatchHistory, Comment, etc. lack modification timestamps
- ⚠️ **Denormalized anime data** — SavedAnime and WatchHistory store `title`, `image`, `type` directly. If anime metadata changes externally, saved data becomes stale
- ⚠️ **Missing index on userId** — Comments and PublicMessages have index on `createdAt` but not `userId` (admin user detail queries may be slow)
- ⚠️ **No text search index** — Comment `text` and PublicMessage `message` have no full-text search capability
- ⚠️ **progress field** — WatchHistory.progress is Float but unused in most code (always defaults to 0)

### 9.7 Missing Data Structures

| Data Need | Status | Impact |
|-----------|--------|--------|
| User ratings/reviews | ❌ NOT IMPLEMENTED (localStorage only for like/dislike) | Cannot aggregate community ratings |
| Episode progress (timestamp) | ⚠️ PARTIAL (progress Float exists but not populated) | Cannot resume at exact timestamp |
| Search history | ❌ MISSING | Cannot show recent searches |
| User preferences (beyond NSFW/theme) | ❌ MISSING | Limited personalization |
| Content reports/moderation queue | ❌ MISSING | No report system |
| Follower/following | ❌ MISSING | No social graph |
| Admin audit log | ❌ MISSING | No action tracking |
| Anime metadata cache | ❌ MISSING (by design — fetched from API) | Depends on external API availability |

---

## 10. API and Data Flow Review

### 10.1 API Endpoint Inventory

| Endpoint | Method(s) | Purpose | Auth | Rate Limit | DB | External API | Status |
|----------|-----------|---------|:----:|:----------:|:--:|:------------:|--------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handler | Internal | Via middleware | ✅ | Google OAuth | ✅ |
| `/api/auth/register` | POST | User registration | No | 5/60s | ✅ | Resend email | ✅ |
| `/api/auth/verify` | GET | Email verification | No (token) | 10/60s | ✅ | — | ✅ |
| `/api/broadcasts` | GET | Active announcements | No | — | ✅ | — | ✅ |
| `/api/comments` | GET, POST, DELETE | Episode comments | Yes | — | ✅ | — | ✅ |
| `/api/cron/cleanup-unverified` | GET | Delete stale accounts | CRON_SECRET | — | ✅ | — | ✅ |
| `/api/discuss/chat` | GET, POST, DELETE | Public chat | Yes | 5msg/5s | ✅ | — | ✅ |
| `/api/discuss/comments` | GET | Recent global comments | Yes | — | ✅ | — | ✅ |
| `/api/hentai/search` | GET | Hentai search | No | — | — | HentaiOcean | ✅ |
| `/api/inbox` | GET | User notifications | Yes | — | ✅ | — | ✅ |
| `/api/inbox/read` | PATCH | Mark notifications read | Yes | — | ✅ | — | ✅ |
| `/api/og` | GET | OpenGraph image generation | No | — | — | — | ✅ |
| `/api/otakudesu-server/[id]` | GET | Stream URL resolver | No | — | — | Otakudesu API | ✅ |
| `/api/random` | GET | Random anime redirect | No | — | — | Animasu API | ✅ |
| `/api/recommendations` | GET, POST, DELETE | Community recs (max 2/user) | Yes | — | ✅ | — | ✅ |
| `/api/search` | GET | Anime search proxy | No | — | — | Animasu API | ✅ |
| `/api/sync` | POST | localStorage → DB sync | Yes | 5/60s | ✅ | — | ✅ |
| `/api/user/history` | GET, POST, DELETE | Watch history CRUD | Yes | — | ✅ | — | ✅ |
| `/api/user/saved` | GET, POST, DELETE | Saved anime CRUD | Yes | — | ✅ | — | ✅ |
| `/api/user/settings` | PUT, PATCH | Profile + NSFW toggle | Yes | 10/60s | ✅ | — | ✅ |

### 10.2 External API Dependencies

| API | Base URL | Purpose | Failure Impact | Fallback |
|-----|----------|---------|----------------|----------|
| **Animasu JSON API** | `sankavollerei.com/anime/animasu` | Primary anime data (lists, detail, search, schedule) | Site non-functional for anime content | None — critical dependency |
| **Animasu HTML** | `v1.animasu.app` | Pagination scraping, serial detection | Missing pagination info, serial links | Graceful degradation (returns null) |
| **Otakudesu/Sanka Vollerei** | `sankavollerei.com/anime` | Secondary streaming servers | Fewer streaming options | `Promise.allSettled` — primary still works |
| **Jikan v4** | `api.jikan.moe/v4` | MAL ratings, character data | No MAL scores, no character list | Components hide themselves on failure |
| **HentaiOcean** | `hentaiocean.com` | NSFW content RSS + API | 18+ section non-functional | Section hides on error |
| **Resend** | `api.resend.com` | Verification emails | Registration works but no email sent | User cannot verify — **blocking** |
| **Google OAuth** | `accounts.google.com` | Social login | Google login unavailable | Credentials login still works |
| **Web3Forms** | External | Contact form submission | Contact form non-functional | None |

### 10.3 Key Data Flows

#### Flow 1: Home Page Loading
```
User visits / → Server component renders
  → getOngoingAnime(page) via nimeFetch → Animasu API (ISR 30min)
  → getMovies() via nimeFetch → Animasu API (ISR 24h)
  → fetchPageCount() via Cheerio scraper → Animasu HTML (cached 6h)
  → Renders: HeroCarousel (hardcoded), AnimeCard grid, movies, ContinueWatching (client)
  → Client hydration: ContinueWatching reads watch history hook
```

#### Flow 2: Search Flow
```
User types in SearchBar → useDebounce(500ms)
  → Client fetch GET /api/search?q=...&page=1
  → API route proxies to Animasu API with browser-spoofing headers
  → Results cached in SearchBar's Map ref
  → Displays max 8 dropdown results
  → Form submit → navigates to /search?q=...
  → Server component: searchAnime(q, page) → Animasu API (ISR 5min)
  → Renders AnimeCard grid + PaginationNav
```

#### Flow 3: Authentication Flow
```
Registration:
  POST /api/auth/register → Zod validate → bcryptjs hash(12) → prisma.user.create
  → sendVerificationEmail via Resend → SHA-256 token stored
  → User clicks email link → GET /api/auth/verify?token=... → isVerified=true

Login (Credentials):
  NextAuth authorize() → prisma.user.findUnique → bcryptjs.compare → JWT issued
  → JWT callback: fetch user from DB, attach role, nsfwEnabled, hasPassword
  → Session callback: expose to client

Login (Google):
  NextAuth Google provider → PrismaAdapter auto-creates User + Account
  → JWT callback: same as above

Post-Login Sync:
  useSyncOnLogin hook → POST /api/sync → localStorage data → DB (createMany skipDuplicates)
```

#### Flow 4: Save Anime Flow
```
User clicks bookmark icon on AnimeActions
  If logged in:
    → POST /api/user/saved with animeId, title, image, type
    → DB upsert (savedAnime) with composite unique (userId, animeId)
    → Optimistic UI update
  If anonymous:
    → Save to localStorage (nimenime-saved)
    → On future login: useSyncOnLogin → POST /api/sync → bulk create
```

#### Flow 5: Watch History Flow
```
User loads watch page (/anime/watch?id=...) 
  → WatchHistoryTracker component mounts → useWatchHistory().markWatched()
    If logged in: POST /api/user/history → DB upsert
    If anonymous: localStorage update
  → Home page: ContinueWatching reads history → shows resume cards
  → Detail page: DetailEpisodeList highlights watched episodes
  → WatchNowButton: shows "Continue Watching" with correct episode
```

---

## 11. Authentication and Security Review

### 11.1 Authentication Architecture

| Aspect | Implementation | Evidence |
|--------|---------------|----------|
| **Framework** | NextAuth v5 (Auth.js beta.30) | [auth.ts](file:///c:/laragon/www/Nime-nime/src/lib/auth.ts) |
| **Strategy** | JWT (stateless) | `session: { strategy: "jwt" }` |
| **Providers** | Google OAuth + Credentials (email/password) | Auth.ts providers array |
| **Adapter** | PrismaAdapter (PostgreSQL) | `PrismaAdapter(prisma)` |
| **Password hashing** | bcryptjs (12 rounds) | Used in register route and authorize() |
| **Session storage** | JWT in httpOnly cookie (managed by NextAuth) | Default NextAuth behavior |
| **Role system** | USER / ADMIN / OWNER (Prisma enum) | Schema enum + JWT callback |
| **Email verification** | SHA-256 hashed token, 24h expiry, Resend email | Register route + verify route |
| **NSFW gate** | User.nsfwEnabled flag, exposed in session | Settings page toggle |

### 11.2 Security Findings

| # | Finding | Severity | Location | Risk | Recommendation |
|:-:|---------|:--------:|----------|------|----------------|
| 1 | **In-memory rate limiting** — Lost on server restart, no distributed protection | **Medium** | [rate-limit.ts](file:///c:/laragon/www/Nime-nime/src/lib/rate-limit.ts) | Brute-force attacks during deploy/restart windows | Migrate to Redis-backed rate limiting |
| 2 | **Immortal Owner Override** — `MASTER_OWNER_EMAIL` forced to OWNER on every JWT evaluation | **Informational** | [auth.ts](file:///c:/laragon/www/Nime-nime/src/lib/auth.ts) L119-121 | Intentional security feature but creates single point of compromise if env is leaked | Document clearly; consider time-bound admin sessions |
| 3 | **Avatar upload: file stored in public/** — `public/uploads/avatars/` is web-accessible | **Medium** | `api/user/settings` PUT handler | Uploaded files directly served by Next.js; path enumeration possible | Use external storage (S3/GCS) or serve via API route with auth check |
| 4 | **Avatar magic number validation** is good | **✅ Good** | `api/user/settings` | MIME type + magic byte signature validation (JPEG/PNG/WebP/GIF), 5MB limit | Already well-implemented |
| 5 | **No CSRF token** — NextAuth handles CSRF for its routes, but custom API routes don't check | **Low** | Custom API routes | SameSite cookies provide partial protection | Rely on NextAuth session token validation (already checked) |
| 6 | **Browser-spoofing headers** — `nimeFetch` spoofs User-Agent/Referer | **Informational** | [fetcher.ts](file:///c:/laragon/www/Nime-nime/src/lib/fetcher.ts) | Necessary to bypass WAF blocking GCP IPs; technically ToS violation of scraped sites | Accept risk — necessary for operation |
| 7 | **Zod validation on API inputs** | **✅ Good** | `api-wrapper.ts` + individual routes | All POST endpoints validate via Zod schemas | Well-implemented |
| 8 | **Rate limiting on auth endpoints** | **✅ Good** | Middleware (proxy.ts) + authLimiter | 5 login attempts per 60s per IP | Good — but in-memory (see #1) |
| 9 | **Comment/message rate limiting** — Chat has 5msg/5s with 5-min lockout | **✅ Good** | `/api/discuss/chat` POST | Custom in-memory per-user rate limit; ADMIN/OWNER exempt | Good spam prevention |
| 10 | **No input sanitization for XSS** — Comment text and public messages stored as-is | **Medium** | Comment and PublicMessage creation | React auto-escapes in JSX, but if data is used in `dangerouslySetInnerHTML` or non-React contexts, XSS risk | Add server-side HTML sanitization (DOMPurify) |
| 11 | **Error messages may leak info** — "No account found with this email" vs "Invalid password" | **Low** | [auth.ts](file:///c:/laragon/www/Nime-nime/src/lib/auth.ts) L32-34, L54-56 | Allows email enumeration | Use generic "Invalid credentials" message |
| 12 | **CRON endpoint auth** — Uses shared secret (CRON_SECRET) via query param or Bearer token | **Low** | `/api/cron/cleanup-unverified` | Secret in URL could be logged | Prefer header-only auth |
| 13 | **No account lockout** — Rate limit resets after 60s; no progressive lockout | **Low** | Auth flow | Persistent attacker can try 5 passwords/minute indefinitely | Add exponential backoff or account-level lockout |
| 14 | **Maintenance mode bypass** — Secret in URL param sets httpOnly cookie (24h) | **Low** | [proxy.ts](file:///c:/laragon/www/Nime-nime/src/proxy.ts) | Bypass secret could be shared/leaked via URL sharing | Acceptable for admin use |
| 15 | **Ownership checks on delete operations** | **✅ Good** | Comment, PublicMessage, Recommendation delete handlers | Owner or ADMIN/OWNER role required for deletion | Well-implemented |
| 16 | **lang="en"** on HTML while content is Indonesian | **Low** | [layout.tsx](file:///c:/laragon/www/Nime-nime/src/app/layout.tsx) L35 | SEO/accessibility mismatch | Change to `lang="id"` |

### 11.3 Protected Routes

| Route Pattern | Protection Method | Evidence |
|---------------|------------------|----------|
| `/aishiteru/*` | Server-side session check + role (ADMIN/OWNER) | `aishiteru/layout.tsx` |
| `/api/user/*` | `withAuthAndValidation` wrapper | API route handlers |
| `/api/sync` | `withAuthAndValidation` wrapper | sync route handler |
| `/api/comments` POST/DELETE | `withAuthAndValidation` wrapper | comments route handler |
| `/api/discuss/chat` all methods | `withAuthAndValidation` wrapper | discuss route handler |
| `/api/inbox` | `withAuthAndValidation` wrapper | inbox route handler |
| `/api/recommendations` POST/DELETE | `withAuthAndValidation` wrapper | recommendations route handler |
| `/saved`, `/history`, `/inbox`, `/settings` | Client-side session check (redirect) | Page components |

---

## 12. Performance and Code Quality Review

### 12.1 Performance Analysis

| Area | Status | Details |
|------|--------|---------|
| **ISR Caching** | ✅ Excellent | Tiered revalidation (5min–24h) with good defaults |
| **In-memory API cache** | ✅ Good | SearchBar Map cache, fetcher.ts cache |
| **`unstable_cache`** | ✅ Good | Used for Otakudesu and pagination scraping with TTL |
| **Image optimization** | ⚠️ Mixed | Next.js `<Image>` used in AnimeCard but many images use `unoptimized` flag. SafeImage uses raw `<img>`. No blur placeholder. |
| **Bundle size** | ⚠️ Concern | SweetAlert2 (large), Cheerio (server-only — OK), Telegraf bundled in bot only |
| **Lazy loading** | ⚠️ Partial | No `React.lazy()` or `next/dynamic` imports for heavy components |
| **Infinite scroll** | ❌ Not implemented | Uses pagination instead (acceptable for SEO) |
| **Large public images** | ⚠️ High | `banner.png` is 6MB, `banner_account.png` is 5.3MB — should be compressed/WebP |
| **N+1 queries** | ✅ Fixed | Sync route explicitly batches DB queries; comment/message fetches include relations |
| **Jikan API calls** | ⚠️ Concern | AnimeCharacters makes 2 sequential API calls per detail page render. MalRatingCard makes 1 call per render. No server-side caching. |

### 12.2 SEO Analysis

| Check | Status | Evidence |
|-------|--------|----------|
| **Title tags** | ✅ | Root metadata + per-page `generateMetadata` on anime detail pages |
| **Meta description** | ✅ | Set in root layout, dynamic on detail pages |
| **OpenGraph** | ✅ | Root OG tags + dynamic `opengraph-image` route for anime pages |
| **Twitter card** | ✅ | `summary_large_image` in root metadata |
| **robots.txt** | ✅ | Allows all, disallows `/aishiteru/` |
| **sitemap.xml** | ✅ | Dynamic with static routes + DB anime slugs |
| **Structured data** | ❌ NOT IMPLEMENTED | No JSON-LD schema markup |
| **Canonical URLs** | ❌ NOT IMPLEMENTED | No canonical meta tags |
| **Language** | ⚠️ | `lang="en"` but content is Indonesian |
| **Heading hierarchy** | ⚠️ | Not verified across all pages |

### 12.3 Technical Debt Register

| # | Debt | Impact | Effort | Priority |
|:-:|------|--------|:------:|:--------:|
| 1 | **No automated tests** — Zero test files, no test dependencies | High — regressions undetectable | High | 🔴 High |
| 2 | **Navbar.tsx is 730 lines** — Contains UserMenu, NotificationBell, mobile nav inline | Medium — hard to maintain | Medium | 🟡 Medium |
| 3 | **EpisodeComments.tsx is 503 lines** — Full CRUD + threading in one file | Medium — hard to extend | Medium | 🟡 Medium |
| 4 | **HeroCarousel hardcoded slides** — Slide data is inline, not configurable | Low — requires code change for updates | Low | 🟢 Low |
| 5 | **FilterForm hardcoded seasons** — ~200 lines of season arrays | Low — should be generated | Low | 🟢 Low |
| 6 | **Episode list code duplication** — 3 components share watched toggle logic | Medium — bugs must be fixed in 3 places | Medium | 🟡 Medium |
| 7 | **Inline SVG duplication** — Same icons recreated in 10+ components | Low — maintenance burden | Low | 🟢 Low |
| 8 | **No shared UI components** — No Button, Input, Modal, Badge components | Medium — inconsistent styling | Medium | 🟡 Medium |
| 9 | **`unoptimized` images** — Bypass Next.js image optimization | Medium — larger payloads | Low | 🟡 Medium |
| 10 | **6MB+ banner images** — Public images not compressed | High — slow initial load | Low | 🔴 High |
| 11 | **In-memory rate limiting** — Lost on restart | Medium — security gap | Medium | 🟡 Medium |
| 12 | **Session model unused** — JWT strategy doesn't use sessions table | Low — dead code | Low | 🟢 Low |
| 13 | **Progress field unused** — WatchHistory.progress always 0 | Low — wasted potential | Low | 🟢 Low |
| 14 | **No error boundaries** — Only root error.tsx | Medium — page-level crashes | Low | 🟡 Medium |
| 15 | **Notification polling** — 30s interval fetch instead of SSE/WebSocket | Low — unnecessary requests | Medium | 🟢 Low |

---

## 13. Feature Gap Analysis

### 13.1 Feature Status Matrix

| Feature | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Browse ongoing anime | ✅ Implemented | Home page, `/popular`, `/movies`, `/serial` | Full pagination |
| Anime detail view | ✅ Implemented | `/anime/[slug]` | With MAL rating, characters, episodes |
| Episode streaming | ✅ Implemented | `/anime/watch` | Multi-server, fullscreen, lights-off |
| Real-time search | ✅ Implemented | SearchBar + `/search` | Debounced, cached |
| Advanced filter | ✅ Implemented | `/filter` + FilterForm | Genre, type, status, sort |
| Genre browsing | ✅ Implemented | `/genres`, `/genres/[slug]` | With pagination |
| Release schedule | ✅ Implemented | `/schedule` | Day-by-day matrix |
| Anime watchlist | ✅ Implemented | `/saved` | DB-backed with localStorage fallback |
| Watch history | ✅ Implemented | `/history` | DB-backed with localStorage fallback |
| Continue watching | ✅ Implemented | Home page ContinueWatching | Collapsible, persistent preference |
| Episode comments | ✅ Implemented | Watch page EpisodeComments | Threading, moderation, notifications |
| Public discussion | ✅ Implemented | `/discuss` | Live chat-style, rate limited |
| User auth (credentials) | ✅ Implemented | Login + Register | Email verification via Resend |
| User auth (Google) | ✅ Implemented | Google OAuth | PrismaAdapter integration |
| Notification system | ✅ Implemented | `/inbox` + bell icon | Reply notifications |
| Theme system | ✅ Implemented | 10 themes | localStorage persisted |
| Admin dashboard | ✅ Implemented | `/aishiteru` | Stats, user mgmt, moderation |
| Admin user management | ✅ Implemented | `/aishiteru/users` | Role assignment, deletion, detail view |
| Admin comment moderation | ✅ Implemented | `/aishiteru/comments` | Delete comments |
| Admin broadcasts | ✅ Implemented | `/aishiteru/broadcasts` | CRUD with date range + type |
| Admin bot control | ✅ Implemented | `/aishiteru/bot` | Start/stop/status |
| Admin anime statistics | ✅ Implemented | `/aishiteru/anime-statistic` | Most watched/saved analytics |
| Telegram broadcast bot | ✅ Implemented | `bot/telegram-bot.js` | Auto-broadcasts new episodes |
| Anime recommendations | ✅ Implemented | `/recommendations` | Max 2 per user |
| Contact form | ✅ Implemented | `/contact` | Web3Forms integration |
| NSFW content section | ✅ Implemented | `/hentai` | Isolated routing, user toggle |
| SEO (robots + sitemap) | ✅ Implemented | Dynamic generation | DB-powered sitemap |
| Dynamic OG images | ✅ Implemented | `/api/og` + per-anime OG | Edge runtime |
| Maintenance mode | ✅ Implemented | Middleware + env toggle | Bypass via secret |
| Cron cleanup | ✅ Implemented | `/api/cron/cleanup-unverified` | Removes unverified accounts |
| Random anime | ✅ Implemented | Navbar button + `/api/random` | Redirect to random slug |
| Download links | ✅ Implemented | `/download` | Episode download page |
| Legal pages | ✅ Implemented | DMCA, Privacy, Terms | Static content |
| Episode progress tracking | ⚠️ Partial | DB field exists (progress: Float) | Always 0 — NOT POPULATED |
| User ratings/reviews | ⚠️ Partial | localStorage like/dislike only | NOT database-backed |
| Smart watch button | ✅ Implemented | WatchNowButton | "Watch Now" / "Continue" / "Completed" |
| CSV export | ✅ Implemented | Admin anime stats | Client-side generation |

### 13.2 Recommended Features (Prioritized)

| Feature | User Value | Dev Complexity | Tech Dependency | Priority |
|---------|:----------:|:--------------:|:---------------:|:--------:|
| Episode progress tracking (resume at timestamp) | 5 | 3 | iframe postMessage API | **High** |
| Database-backed ratings/reviews | 5 | 3 | New Prisma model | **High** |
| User profile page (public) | 4 | 3 | New route + query | **High** |
| Trending anime section | 4 | 2 | Jikan API or internal analytics | **High** |
| Seasonal anime calendar | 4 | 3 | Jikan API seasons endpoint | **High** |
| Dark/light theme toggle (simplified) | 3 | 1 | Already implemented (10 themes) | ✅ Done |
| Anime comparison (side-by-side) | 3 | 3 | Client-side UI | Medium |
| Spoiler-safe comment tagging | 3 | 2 | CSS + toggle | Medium |
| Upcoming episode reminders | 4 | 4 | Push notifications / email | Medium |
| Follow other users | 3 | 4 | New DB models + feed | Medium |
| User activity feed | 3 | 4 | New queries + components | Medium |
| User badges/achievements | 3 | 3 | New DB model + logic | Medium |
| Shareable anime collections | 3 | 4 | New DB models + sharing | Medium |
| Trailer integration | 4 | 2 | YouTube embed from API data | Medium |
| Studio pages | 3 | 2 | API data exists in detail | Medium |
| Character profiles | 3 | 3 | Jikan character endpoint | Medium |
| Multi-language support (i18n) | 4 | 5 | next-intl or similar | Low |
| PWA support | 3 | 3 | next-pwa + service worker | Low |
| Offline saved list | 3 | 4 | Service worker + IndexedDB | Low |
| AI anime recommendations | 4 | 5 | External LLM API | Low |
| Anime quiz | 2 | 3 | New feature area | Low |
| Community ranking system | 2 | 4 | New DB models + algorithm | Low |
| Voice actor pages | 2 | 3 | Jikan VA endpoint | Low |
| Report content feature | 4 | 2 | New DB model + admin page | **High** |
| Admin audit log | 3 | 2 | New DB model + middleware | Medium |

---

## 14. Design Improvement Recommendations

### 14.1 Quick Visual Improvements

1. **Compress banner images** — Convert `banner.png` (6MB) and `banner_account.png` (5.3MB) to WebP at ~200KB. This alone could save 10MB+ on first load.
2. **Add blur placeholder to anime posters** — Use Next.js `placeholder="blur"` with `blurDataURL` for smoother image loading.
3. **Add loading skeletons to anime card grids** — Currently cards just pop in; add shimmer skeleton grid matching the card layout.
4. **Remove `unoptimized` from Next.js Images** — Several components bypass optimization, increasing payload sizes.

### 14.2 Navigation Improvements

5. **Add breadcrumb navigation** — On detail pages: `Home > Genre > Anime Title` for orientation and SEO.
6. **Add mobile bottom tab bar** — Fixed bottom nav with 5 icons (Home, Search, Saved, History, Profile) for faster mobile navigation than the hamburger menu.
7. **Add skip-to-content link** — `<a href="#main-content" class="sr-only focus:not-sr-only">` for keyboard accessibility.

### 14.3 Anime Card Improvements

8. **Add rating badge to anime cards** — Show MAL score as a small overlay on the poster corner.
9. **Add "saved" indicator on cards** — Show a filled heart icon if the anime is in the user's watchlist.
10. **Add fallback poster** — When poster URL fails, show a branded placeholder image instead of a broken image.

### 14.4 Home Page Improvements

11. **Make HeroCarousel data-driven** — Load featured anime from the API or admin-managed CMS instead of hardcoded slides.
12. **Add "Trending This Week" section** — Between carousel and ongoing, show top trending anime based on community activity.
13. **Add "Recommended For You" section** — Based on watch history genres for logged-in users.

### 14.5 Search and Filter Improvements

14. **Add ARIA combobox pattern to SearchBar** — `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` for screen readers.
15. **Add keyboard arrow navigation to search results** — Arrow up/down to navigate, Enter to select.
16. **Generate season options programmatically** — Instead of 200 lines of hardcoded seasons in FilterForm.

### 14.6 Detail Page Improvements

17. **Add JSON-LD structured data** — `VideoObject` or `TVSeries` schema for SEO on anime detail pages.
18. **Add trailer embed** — The API returns `trailer` field; embed YouTube player on the detail page.
19. **Add "Related Anime" section** — Use Jikan recommendations endpoint or genre-based suggestions.

### 14.7 Watchlist/History Improvements

20. **Add empty state illustrations** — When saved list or history is empty, show an anime-themed illustration with a CTA to browse anime.
21. **Add sorting/filtering to watchlist** — Sort by date saved, alphabetical; filter by type (TV, Movie, OVA).
22. **Add "Remove All" confirmation** — For bulk delete operations on history/saved pages.

### 14.8 Community Feature Improvements

23. **Add emoji reactions to comments/chat** — Quick reaction buttons (👍 ❤️ 😂 😮 😢) instead of text-only engagement.
24. **Add markdown support in comments** — Allow bold, italic, spoiler tags in discussion.
25. **Add user @mentions** — Tag other users in comments/chat with notifications.

### 14.9 Mobile Experience Improvements

26. **Add swipe gestures to HeroCarousel** — Touch/swipe support for mobile users (currently buttons only).
27. **Add pull-to-refresh on list pages** — Native mobile feel for refreshing content.
28. **Optimize touch targets** — Ensure all interactive elements are at least 44x44px per WCAG.

### 14.10 Accessibility Improvements

29. **Add `lang="id"` to HTML** — Content is Indonesian; the HTML lang attribute says "en".
30. **Add visible focus indicators** — Custom `outline` or `ring` styles for keyboard navigation.
31. **Add `aria-label` to icon-only buttons** — Many buttons (save, delete, scroll) lack labels.

### 14.11 Empty/Loading/Error State Improvements

32. **Create consistent empty state pattern** — Reusable `<EmptyState icon={...} title="..." action={...}>` component.
33. **Add section-level error boundaries** — Wrap major sections (characters, comments, history) in error boundaries so one failure doesn't crash the page.
34. **Add retry buttons on API failures** — Instead of silently failing, show inline retry with "Something went wrong. Try again."

### 14.12 Brand Consistency

35. **Create favicon in multiple sizes** — Currently only `favicon.ico`; add `apple-touch-icon`, `favicon-32x32.png`, etc.
36. **Add splash screen for PWA** — If PWA is added, include branded splash screens.
37. **Standardize the `hn-` design token naming** — Well-implemented already; document the token system in a design guide.

---

## 15. Prioritized Product Roadmap

### Phase A: Critical Fixes

| Priority | Task | Why It Matters | Complexity | Main Files/Areas |
|:--------:|------|----------------|:----------:|-----------------|
| P0 | Compress public images (6MB banner!) | Blocks fast page load | Low | `public/images/*.png` → WebP |
| P0 | Fix `lang="en"` → `lang="id"` | SEO/accessibility mismatch | Trivial | `src/app/layout.tsx` |
| P0 | Add generic error messages for auth | Prevents email enumeration | Low | `src/lib/auth.ts` |
| P1 | Add basic unit tests for API routes | Prevent regressions | High | New `__tests__/` directory |
| P1 | Remove `unoptimized` from Next.js Images | Performance gain | Low | Multiple components |
| P1 | Add content report feature | User safety, moderation | Medium | New DB model, API, admin page |
| P2 | Migrate rate limiting to Redis | Survive restarts, scale | Medium | `src/lib/rate-limit.ts` |
| P2 | Add server-side HTML sanitization | XSS prevention | Low | Comment/message creation routes |

### Phase B: Product Quality Improvements

| Priority | Task | Why It Matters | Complexity | Main Files/Areas |
|:--------:|------|----------------|:----------:|-----------------|
| P1 | Decompose Navbar.tsx (730 lines) | Maintainability | Medium | Split to UserMenu, NotificationBell, MobileNav files |
| P1 | Decompose EpisodeComments.tsx (503 lines) | Maintainability | Medium | Split to CommentItem, CommentForm, CommentThread |
| P1 | Extract shared EpisodeItem component | Remove 3-way duplication | Medium | DetailEpisodeList, EpisodeList, SidebarEpisodeList |
| P1 | Create shared Button, Input, Badge components | UI consistency | Medium | New `src/components/ui/` directory |
| P2 | Add empty state illustrations | Better UX for new users | Low | Saved, History, Search pages |
| P2 | Implement episode progress tracking | Resume at exact timestamp | Medium | VideoPlayerWrapper + WatchHistory |
| P2 | Database-backed anime ratings | Community engagement | Medium | New Rating model, API, UI |
| P2 | Add JSON-LD structured data | SEO improvement | Low | Anime detail page |
| P3 | Make HeroCarousel data-driven | Easier content updates | Medium | HeroCarousel + admin CMS |
| P3 | Add mobile bottom tab bar | Mobile UX improvement | Medium | New BottomNav component |
| P3 | Add keyboard navigation to search | Accessibility | Low | SearchBar.tsx |
| P3 | Generate FilterForm seasons programmatically | Code quality | Low | FilterForm.tsx |

### Phase C: Advanced Features

| Priority | Task | Why It Matters | Complexity | Main Files/Areas |
|:--------:|------|----------------|:----------:|-----------------|
| P1 | User profile page (public) | Community building | Medium | New route, query, component |
| P2 | Trending anime section | Content discovery | Medium | Analytics + home page |
| P2 | Seasonal anime calendar | Anime fan essential | Medium | Jikan API + new page |
| P2 | Trailer integration on detail page | Content richness | Low | AnimeDetailHeader + YouTube embed |
| P3 | Emoji reactions on comments | Engagement boost | Medium | New DB model + UI |
| P3 | Markdown/spoiler support in comments | Community quality | Medium | Parser + CSS |
| P3 | Follow other users | Social features | High | New DB models + notification |
| P3 | Push notifications / WebSocket | Real-time experience | High | Infra changes |
| P3 | PWA support | Mobile install experience | Medium | Service worker + manifest |
| P4 | AI anime recommendations | Personalization | High | External LLM integration |
| P4 | Multi-language (i18n) | International audience | High | next-intl + translation files |

---

## 16. Critical Issues

| # | Issue | Severity | Impact | Location |
|:-:|-------|:--------:|--------|----------|
| 1 | **6MB+ banner images in public/** | 🔴 Critical (Performance) | First page load is 10MB+ heavier than necessary | `public/images/banner.png` (6MB), `banner_account.png` (5.3MB) |
| 2 | **Zero automated tests** | 🔴 Critical (Quality) | No regression detection; any change could break features | No `__tests__/`, no test dependencies |
| 3 | **In-memory rate limiting lost on restart** | 🟡 High (Security) | Attack window during every deployment/restart | `src/lib/rate-limit.ts` |
| 4 | **Auth error messages enable email enumeration** | 🟡 High (Security) | Attacker can discover registered emails | `src/lib/auth.ts` L32-34 |
| 5 | **No content reporting system** | 🟡 High (Safety) | Users cannot report inappropriate content | Not implemented |
| 6 | **HTML lang="en" for Indonesian content** | 🟡 Medium (SEO/A11y) | Screen readers and search engines misinterpret language | `src/app/layout.tsx` L35 |

---

## 17. Technical Debt Register

| # | Debt Item | Category | Impact | Effort to Fix | Files Affected |
|:-:|-----------|----------|--------|:-------------:|----------------|
| 1 | Zero automated tests | Testing | High | High | Entire codebase |
| 2 | Navbar.tsx 730 lines | Architecture | Medium | Medium | `src/components/Navbar.tsx` |
| 3 | EpisodeComments.tsx 503 lines | Architecture | Medium | Medium | `src/components/EpisodeComments.tsx` |
| 4 | 3-way episode list duplication | DRY | Medium | Medium | DetailEpisodeList, EpisodeList, SidebarEpisodeList |
| 5 | No shared UI primitives | Design System | Medium | Medium | All components |
| 6 | HeroCarousel hardcoded data | Flexibility | Low | Medium | `src/components/HeroCarousel.tsx` |
| 7 | FilterForm hardcoded seasons | Maintainability | Low | Low | `src/components/FilterForm.tsx` |
| 8 | Inline SVG duplication (10+ files) | DRY | Low | Low | Multiple components |
| 9 | `unoptimized` on Next.js Images | Performance | Medium | Low | Multiple components |
| 10 | 6MB+ uncompressed banner images | Performance | High | Low | `public/images/` |
| 11 | In-memory rate limiting | Security | Medium | Medium | `src/lib/rate-limit.ts` |
| 12 | Session table unused (JWT strategy) | Dead code | Low | Trivial | `prisma/schema.prisma` |
| 13 | WatchHistory.progress unused | Wasted potential | Low | Medium | Multiple files |
| 14 | No error boundaries (section-level) | Reliability | Medium | Low | New ErrorBoundary component |
| 15 | Notification polling (30s fetch) | Performance | Low | Medium | Navbar.tsx NotificationBell |

---

## 18. Recommended Next Feature

### 🎯 Episode Progress Tracking (Resume at Timestamp)

**Why this feature first:**
1. The `WatchHistory.progress` field already exists in the database (Float, defaults to 0)
2. The `WatchHistoryTracker` component already runs on every episode page
3. The `ContinueWatching` component on the homepage already shows recent history
4. The `WatchNowButton` already has "Continue Watching" state detection
5. This feature would complete the core streaming experience loop

**Implementation outline:**
1. Use `iframe.contentWindow.postMessage` or the Video.js/player SDK to get playback position
2. Update `WatchHistoryTracker` to periodically save progress (every 30s)
3. Modify `POST /api/user/history` to accept and store `progress` value
4. Update `WatchNowButton` to include `?t=<seconds>` in the watch URL
5. VideoPlayerWrapper loads with `t` parameter to seek on play

**Estimated effort:** 2-3 days  
**Files affected:** WatchHistoryTracker, VideoPlayerWrapper, api/user/history, WatchNowButton, ContinueWatching

---

## 19. Final Verdict

### 19.1 Current Project Maturity Level

**🟢 Early Production**

The project is deployed and running at [nime-nime.web.id](https://nime-nime.web.id) with real users. It has authentication, database-backed features, CI/CD, and a mature frontend. However, the lack of automated tests, some security gaps, and architectural debt (monolithic components) place it below "Production Ready."

### 19.2 Strongest Parts of the Project

1. **10-theme design system** — Exceptional CSS variable architecture with dark/light themes
2. **Hybrid data strategy** — localStorage for anonymous + DB sync on login is clever and user-friendly
3. **ISR caching tiers** — Well-thought-out caching strategy per data freshness need
4. **Admin panel** — Full dashboard with user management, moderation, broadcasts, bot control, analytics
5. **Multi-source streaming** — Aggregates servers from Animasu + Otakudesu with `Promise.allSettled` fallback
6. **Authentication** — Solid NextAuth v5 setup with Google OAuth, credentials, email verification, RBAC
7. **Type safety** — Comprehensive TypeScript interfaces for all API responses

### 19.3 Biggest Weaknesses

1. **Zero automated tests** — The single biggest risk to the project's stability
2. **Monolithic components** — Navbar (730 lines), EpisodeComments (503 lines) are maintenance hazards
3. **No shared UI primitives** — Every component reinvents buttons, inputs, badges
4. **6MB+ uncompressed banner images** — Direct impact on page load performance
5. **In-memory rate limiting** — Security gap during restarts

### 19.4 Highest-Priority Next Steps

1. Compress public images (10 minutes, massive performance gain)
2. Fix `lang="en"` → `lang="id"` (1 minute)
3. Genericize auth error messages (10 minutes)
4. Set up Vitest + first API route tests (2 hours)
5. Decompose Navbar into sub-components (2 hours)

### 19.5 Suggested First Feature to Build

**Episode progress tracking** — The database field exists, the components are in place, and it completes the core streaming loop.

### 19.6 Suggested First UI/UX Improvement

**Mobile bottom tab bar** — A fixed bottom nav with Home, Search, Saved, History, and Profile icons would dramatically improve mobile usability compared to the current hamburger menu.

### 19.7 Suggested First Backend/Database Improvement

**Content reporting system** — Add a `Report` model (userId, contentType, contentId, reason, status, createdAt) with an admin moderation queue. Critical for community safety.

### 19.8 Suggested First Security Improvement

**Migrate rate limiting to Redis** — Replace in-memory Map-based rate limiting with a Redis-backed solution (e.g., `@upstash/ratelimit`) that survives server restarts and scales across instances.

### 19.9 Suggested First Performance Improvement

**Compress banner images** — Converting `public/images/banner.png` (6MB) and `banner_account.png` (5.3MB) to WebP would save ~10MB per page load. This is the single highest-impact, lowest-effort performance fix.

### 19.10 Final Architecture Summary

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT LAYER                      │
│  Next.js App Router (React 19 + TypeScript)         │
│  Tailwind CSS v4 (10 themes via CSS variables)      │
│  26 React components + 5 custom hooks               │
│  SweetAlert2 for notifications                      │
│  localStorage for anonymous user data               │
├─────────────────────────────────────────────────────┤
│                   MIDDLEWARE LAYER                    │
│  src/proxy.ts (maintenance mode + login rate limit) │
│  api-wrapper.ts (auth + Zod validation)             │
│  rate-limit.ts (in-memory sliding window)           │
├─────────────────────────────────────────────────────┤
│                    API LAYER                         │
│  20+ Next.js API routes (src/app/api/)              │
│  NextAuth v5 (JWT + Google OAuth + Credentials)     │
│  Server Components with ISR caching (5min–24h)      │
├─────────────────────────────────────────────────────┤
│                  DATA LAYER                          │
│  PostgreSQL (Prisma ORM, 9 models, 5 migrations)   │
│  External: Animasu API, Otakudesu, Jikan, Hentai   │
│  Cheerio scraping (pagination, serial detection)    │
│  nimeFetch (browser-spoofing WAF bypass)            │
├─────────────────────────────────────────────────────┤
│                INFRASTRUCTURE                        │
│  GCP Compute Engine + PM2                           │
│  GitHub Actions CI/CD (SSH deploy on main push)     │
│  Telegram broadcast bot (Telegraf + PM2)            │
│  Resend (email verification)                        │
└─────────────────────────────────────────────────────┘
```

---

## 20. Appendix: Evidence and Files Inspected

### Configuration Files Read
- [package.json](file:///c:/laragon/www/Nime-nime/package.json)
- [tsconfig.json](file:///c:/laragon/www/Nime-nime/tsconfig.json)
- [next.config.ts](file:///c:/laragon/www/Nime-nime/next.config.ts)
- [postcss.config.mjs](file:///c:/laragon/www/Nime-nime/postcss.config.mjs)
- [eslint.config.mjs](file:///c:/laragon/www/Nime-nime/eslint.config.mjs)
- [prisma.config.ts](file:///c:/laragon/www/Nime-nime/prisma.config.ts)
- [.env.example](file:///c:/laragon/www/Nime-nime/.env.example)
- [.github/workflows/deploy.yml](file:///c:/laragon/www/Nime-nime/.github/workflows/deploy.yml)

### Database Files Read
- [prisma/schema.prisma](file:///c:/laragon/www/Nime-nime/prisma/schema.prisma) (200 lines, all 9 models)
- `prisma/migrations/` (5 migration directories inspected)

### Source Files Read (All)
- [src/app/layout.tsx](file:///c:/laragon/www/Nime-nime/src/app/layout.tsx)
- [src/app/page.tsx](file:///c:/laragon/www/Nime-nime/src/app/page.tsx) (14,049 bytes)
- [src/app/globals.css](file:///c:/laragon/www/Nime-nime/src/app/globals.css) (442 lines)
- [src/app/error.tsx](file:///c:/laragon/www/Nime-nime/src/app/error.tsx)
- [src/app/loading.tsx](file:///c:/laragon/www/Nime-nime/src/app/loading.tsx)
- [src/app/not-found.tsx](file:///c:/laragon/www/Nime-nime/src/app/not-found.tsx)
- [src/app/robots.ts](file:///c:/laragon/www/Nime-nime/src/app/robots.ts)
- [src/app/sitemap.ts](file:///c:/laragon/www/Nime-nime/src/app/sitemap.ts)
- All 24 route directories inspected
- All 25 component files read
- All 14 library files read
- All 5 hook files read
- All 3 type definition files read
- [src/proxy.ts](file:///c:/laragon/www/Nime-nime/src/proxy.ts) (middleware)

### Library Files Read
- [src/lib/auth.ts](file:///c:/laragon/www/Nime-nime/src/lib/auth.ts) (139 lines)
- [src/lib/api.ts](file:///c:/laragon/www/Nime-nime/src/lib/api.ts) (171 lines)
- [src/lib/api-wrapper.ts](file:///c:/laragon/www/Nime-nime/src/lib/api-wrapper.ts)
- [src/lib/config.ts](file:///c:/laragon/www/Nime-nime/src/lib/config.ts) (31 lines)
- [src/lib/fetcher.ts](file:///c:/laragon/www/Nime-nime/src/lib/fetcher.ts) (67 lines)
- [src/lib/rate-limit.ts](file:///c:/laragon/www/Nime-nime/src/lib/rate-limit.ts) (99 lines)
- [src/lib/prisma.ts](file:///c:/laragon/www/Nime-nime/src/lib/prisma.ts)
- [src/lib/mail.ts](file:///c:/laragon/www/Nime-nime/src/lib/mail.ts)
- [src/lib/otakudesu.ts](file:///c:/laragon/www/Nime-nime/src/lib/otakudesu.ts) (326 lines)
- [src/lib/jikanFetch.ts](file:///c:/laragon/www/Nime-nime/src/lib/jikanFetch.ts)
- [src/lib/hentaiApi.ts](file:///c:/laragon/www/Nime-nime/src/lib/hentaiApi.ts)
- [src/lib/pagination-scraper.ts](file:///c:/laragon/www/Nime-nime/src/lib/pagination-scraper.ts)
- [src/lib/fetchSerialSlug.ts](file:///c:/laragon/www/Nime-nime/src/lib/fetchSerialSlug.ts)
- [src/lib/swal.ts](file:///c:/laragon/www/Nime-nime/src/lib/swal.ts)

### Type Definition Files Read
- [src/types/anime.ts](file:///c:/laragon/www/Nime-nime/src/types/anime.ts) (150 lines)
- [src/types/hentai.ts](file:///c:/laragon/www/Nime-nime/src/types/hentai.ts)
- [src/types/next-auth.d.ts](file:///c:/laragon/www/Nime-nime/src/types/next-auth.d.ts)

### Bot Files Read
- [bot/telegram-bot.js](file:///c:/laragon/www/Nime-nime/bot/telegram-bot.js) (381 lines)
- [bot/ecosystem.config.js](file:///c:/laragon/www/Nime-nime/bot/ecosystem.config.js)

### Scripts Read
- [scripts/refactor_colors.js](file:///c:/laragon/www/Nime-nime/scripts/refactor_colors.js) (69 lines)

### Other Files Read
- [README.md](file:///c:/laragon/www/Nime-nime/README.md) (118 lines)

### Directories Inspected
- Root (`/`)
- `src/`, `src/app/`, `src/components/`, `src/lib/`, `src/hooks/`, `src/types/`, `src/generated/`
- `src/app/api/` (14 subdirectories)
- `src/app/(auth)/` (login, register, verify)
- `src/app/aishiteru/` (dashboard, users, comments, broadcasts, bot, anime-statistic)
- `src/app/anime/` ([slug], watch)
- `prisma/`, `prisma/migrations/`
- `public/`, `public/images/`, `public/uploads/`
- `bot/`, `scripts/`, `.github/workflows/`
- `src/components/admin/`

---

*This audit was conducted by deeply reading every source file, configuration file, database schema, API route, component, hook, and library module in the repository. All findings are based on verified evidence from the actual codebase. Items that could not be verified are labeled accordingly.*
