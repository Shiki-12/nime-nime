# NimeNime QA Roadmap to Production-Ready

**Document status:** Working QA roadmap  
**Version:** 1.0  
**Prepared for:** NimeNime development and QA team  
**Primary source:** `PROJECT_DISCOVERY_AND_AUDIT.md`, audit dated 20 June 2026  
**Current maturity:** Early Production  
**Target:** Production-ready release with repeatable QA controls, release gates, monitoring, and defined ownership

---

## 1. Purpose of This Document

This roadmap explains how NimeNime should move from an actively deployed early-production product to a production-ready platform. It is written so that a new QA engineer, developer, product owner, or maintainer can understand the product boundary, test priorities, release risks, and acceptance criteria without first reading the entire codebase.

This is not only a list of features to build. It is a quality plan. Every phase defines what must be checked, why it matters, what evidence is required, and when a release must be blocked.

---

## 2. Product Context for New QA Members

### 2.1 What NimeNime Is

NimeNime is an anime discovery, catalog, community, and streaming gateway platform. The application provides anime browsing, search, filters, anime detail pages, episode navigation, saved anime, watch history, comments, public discussions, user notifications, recommendations, administration, and a Telegram broadcast bot.

The platform uses Next.js, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma, and NextAuth. It depends on external anime data and streaming providers for much of its catalog, episode data, and embed URLs.

### 2.2 Critical Product Boundary

NimeNime does **not** own or host the embedded video players. It receives an external embed or streaming URL and places it inside an iframe or player wrapper.

This limitation changes how QA must evaluate the watch experience:

- QA can validate whether the watch page loads correctly.
- QA can validate whether the selected server URL resolves and the iframe is rendered.
- QA can validate navigation, previous/next episode actions, server switching, comments, manual watch status, and error messaging.
- QA cannot reliably read the internal player state from a third-party iframe.
- QA cannot guarantee that a video started, paused, buffered, ended, or resumed at a specific second unless the provider exposes a documented player API.
- QA must not approve a feature that claims accurate timestamp resume without verified provider support.

For NimeNime, the reliable product concept is **episode activity tracking**, not automatic video telemetry.

### 2.3 What the Platform Owns

| Area | NimeNime Control Level | QA Responsibility |
|---|---:|---|
| UI, layout, navigation, themes | Full | Full functional, visual, responsive, and accessibility testing |
| Authentication and user roles | Full | Full security and authorization testing |
| Saved anime and watch history | Full | Full CRUD, data integrity, sync, and permission testing |
| Comments, discussion, notifications | Full | Full validation, abuse prevention, ownership, and moderation testing |
| Admin dashboard and moderation | Full | Role, access, destructive-action, and auditability testing |
| Anime catalog payloads | Partial | Validate API contracts, fallbacks, caching, and user-facing failure states |
| Streaming sources and embedded players | Limited | Validate resolver, iframe rendering, fallback UX, reports, and graceful failure |
| Email, OAuth, Telegram, contact form | Partial | Validate integration outcomes and degraded behavior when provider fails |

---

## 3. Current Baseline and Important Audit Notes

The existing audit identifies a solid base: authentication, database-backed user features, an admin panel, CI/CD deployment, a multi-theme UI system, ISR caching, and multiple external integrations.

The same audit identifies readiness gaps that must be addressed before a production-ready declaration:

1. No automated tests are currently present.
2. Some core components are too large and difficult to maintain.
3. Public banner assets are very large and can hurt mobile performance.
4. Rate limiting is memory-based and can reset after a restart or deployment.
5. Error feedback is inconsistent across the user interface.
6. User-facing logic treats opening an episode as watch history activity. This is useful as a recent-activity signal, but it must not be presented as proof that an episode was completed.
7. External APIs and embedded streaming providers are critical dependencies with limited operational control.
8. The audit summary and database inventory use different model counts. Before locking QA coverage, QA must inspect the current Prisma schema and produce a verified schema baseline.

### 3.1 Production-Ready Definition for NimeNime

NimeNime may be considered production-ready only when all of the following are true:

- Core user journeys pass in staging and production smoke testing.
- No unresolved blocker or critical defect exists.
- Authentication, authorization, admin access, and ownership rules are tested.
- API failures from external providers produce safe, understandable, recoverable user states.
- External embed limitations are communicated honestly in the product behavior.
- The release pipeline includes automated checks and a rollback process.
- Monitoring can detect server, database, external API, and client error regressions.
- Data migration, backup, and restore procedures have been rehearsed.
- The product is usable on current desktop and mobile targets.
- The team has documented release evidence, known risks, and an on-call response procedure.

---

## 4. QA Principles and Test Strategy

### 4.1 Quality Principles

1. **Verify behavior, not assumptions.** Every claim must be supported by a test result, log, screenshot, trace, or reproducible steps.
2. **Treat external providers as unreliable.** All external APIs and embeds require fallback and failure testing.
3. **Protect user data first.** Authentication, authorization, saved data, history, comments, and account settings are higher priority than cosmetic improvements.
4. **Do not mark watching as completion automatically.** Opening an episode means last opened. Completion requires a manual action or a verified provider event.
5. **Production readiness is a gate, not a feeling.** A release is approved only after measurable criteria pass.
6. **Every defect must have reproducible evidence.** Include environment, user role, route, inputs, expected result, actual result, severity, screenshot or recording, and logs where available.

### 4.2 Test Layers

| Test Layer | Purpose | Initial Scope |
|---|---|---|
| Static checks | Catch code quality issues early | TypeScript, lint, formatting, dependency audit |
| Unit tests | Validate pure functions and business rules | validators, role checks, rate limit logic, utilities, API payload mappers |
| Integration tests | Validate API routes with database and auth behavior | register, verify, saved, history, comments, discussion, notifications |
| Component tests | Validate UI behavior in isolation | buttons, forms, search, empty states, server selector, episode state |
| Browser E2E tests | Validate real user journeys | auth, browse, save, history, comments, admin access, mobile navigation |
| Manual exploratory tests | Find edge cases and UX failures | third-party embeds, slow network, mobile devices, provider outages |
| Non-functional tests | Validate performance, security, resilience, accessibility | load, assets, error handling, dependency failures, keyboard use |

### 4.3 Test Environments Required

| Environment | Purpose | Minimum Requirement |
|---|---|---|
| Local | Fast developer checks | Local database, mock external responses, seeded users |
| Staging | Pre-release verification | Production-like configuration, separate database, controlled test credentials |
| Production | Smoke checks and monitoring | Read-only or low-risk checks only, no destructive testing |

**Rule:** Do not use real user accounts or real production data for routine destructive testing.

### 4.4 Required QA Accounts

| Account | Role | Required Use |
|---|---|---|
| `qa-user-verified` | Verified USER | Normal authenticated flows |
| `qa-user-unverified` | Unverified USER | Verification and restriction flows |
| `qa-admin` | ADMIN | Moderation and admin checks |
| `qa-owner` | OWNER | Owner-only controls and regression checks |
| `qa-user-b` | Verified USER | Ownership and cross-user permission checks |
| `qa-anonymous` | No login | localStorage, browse, search, and guest flows |

---

## 5. Risk-Based Priority Model

### 5.1 Severity Definitions

| Severity | Definition | Release Decision |
|---|---|---|
| Blocker | Application unavailable, data loss, universal login failure, privilege escalation, destructive error | Release blocked |
| Critical | Core user flow broken, security vulnerability, persistent corruption, admin bypass | Release blocked |
| High | Major feature broken with workaround, serious performance regression, incorrect permission behavior | Fix before production unless explicitly accepted by product owner and QA lead |
| Medium | Limited feature failure, inconsistent UI, recoverable API error, edge-case defect | May ship only with documented mitigation |
| Low | Cosmetic defect, minor copy issue, non-blocking visual inconsistency | Can be scheduled after release |

### 5.2 Highest-Risk Areas

| Area | Why It Is Risky | QA Focus |
|---|---|---|
| Authentication | User accounts, roles, password handling, OAuth, verification | Login, logout, session expiry, enumeration, RBAC |
| Admin routes | High-impact destructive actions | Role bypass, direct URL access, delete actions, confirmations |
| Sync localStorage to database | Duplicate, missing, or cross-account data risks | Merge, retry, idempotency, user isolation |
| External anime APIs | Response shape and availability can change without notice | Contract validation, fallbacks, timeouts, error UI |
| Embedded server sources | NimeNime cannot control player internals | Resolver, iframe render, source switch, broken server report |
| Comments and public discussion | Abuse, spam, XSS, ownership, moderation | Validation, rate limit, delete permission, safe rendering |
| NSFW routes | Age and preference handling | Gate behavior, session update, direct-link behavior |
| Deployment and migrations | Runtime outage or schema mismatch | Build, migrate, restart, rollback, backup restore |

---

## 6. Roadmap Overview

| Phase | Focus | Target Outcome | Suggested Duration |
|---|---|---|---:|
| 0 | QA foundation | Repeatable test setup and release evidence | 2 to 4 days |
| 1 | Stabilize P0 defects | Core app can build, load, and fail safely | 1 week |
| 2 | Security and data integrity | Accounts, roles, and user data are protected | 1 to 2 weeks |
| 3 | Core functional coverage | Main user journeys are verified end-to-end | 1 to 2 weeks |
| 4 | UX, responsive, accessibility | Product is usable and understandable on target devices | 1 week |
| 5 | Reliability and performance | External dependency failures and load behavior are controlled | 1 to 2 weeks |
| 6 | Automated quality gates | CI blocks regressions before deployment | 1 to 2 weeks |
| 7 | Release candidate certification | Formal production-readiness approval | 3 to 5 days |

The duration is an estimate. It depends on team size, defect count, third-party provider stability, and whether a staging environment already exists.

---

# Phase 0. QA Foundation and Baseline Freeze

## Objective

Create a verified baseline so every future defect, fix, test result, and release decision has a shared reference.

## Work Items

| ID | QA Task | Owner | Evidence Required | Exit Criteria |
|---|---|---|---|---|
| QA-001 | Confirm current repository commit and deployment version | QA + DevOps | Commit SHA, build ID, deployed URL | Baseline version recorded |
| QA-002 | Verify the live Prisma schema and database entities | QA + Backend | Schema export, migration list, entity count | Schema inventory approved |
| QA-003 | Build route inventory from current code | QA | Route matrix with auth requirement | All public, protected, and admin routes listed |
| QA-004 | Create QA accounts for USER, ADMIN, OWNER, anonymous, and second user | QA + Backend | Secure account register | Accounts work in staging |
| QA-005 | Create test data reset process | QA + Backend | Seed script or documented manual cleanup steps | Test state can be restored |
| QA-006 | Create defect template and severity definitions in issue tracker | QA Lead | Issue template screenshot or link | Team uses one defect format |
| QA-007 | Define release checklist and evidence folder | QA Lead | Checklist committed to repository | Every release can be audited |
| QA-008 | Capture baseline screenshots for primary routes | QA | Desktop and mobile screenshots | Visual regression reference exists |

## Baseline Deliverables

- `QA_TEST_PLAN.md`
- `QA_ROUTE_MATRIX.md`
- `QA_TEST_DATA_GUIDE.md`
- `QA_RELEASE_CHECKLIST.md`
- `QA_KNOWN_RISKS.md`
- Baseline screenshot folder for desktop and mobile layouts

## Phase 0 Exit Gate

Do not begin production-readiness certification until the current application state, environment, test accounts, route map, and schema baseline are documented.

---

# Phase 1. Stabilize P0 Runtime and User-Facing Failures

## Objective

Ensure the platform can build, deploy, load its core routes, and recover gracefully from expected failures.

## Priority Work Items

| ID | Task | Type | Acceptance Criteria |
|---|---|---|---|
| P0-001 | Verify `npm run build`, lint, Prisma generation, and production start | Runtime | All commands pass in clean environment |
| P0-002 | Add a staging smoke test checklist | QA | Home, search, detail, watch, login, saved, history, discussion, admin checks pass |
| P0-003 | Compress oversized public assets | Performance | Large banner assets are converted to optimized formats and verified visually |
| P0-004 | Review all `unoptimized` image uses | Performance | Each use is justified or replaced with optimized image handling |
| P0-005 | Standardize API error states | UX/Reliability | Every user-facing API call has loading, empty, error, and retry behavior where feasible |
| P0-006 | Add fallback poster behavior | UX | Broken poster URLs show a branded fallback, not a broken image |
| P0-007 | Change HTML language to Indonesian if product content remains Indonesian | Accessibility | Root `lang` attribute matches content language |
| P0-008 | Review watch-history wording | Product Integrity | UI distinguishes “last opened” from “completed” episode state |
| P0-009 | Add manual “Mark as Watched” action | Product Integrity | User can mark/unmark an episode without relying on iframe telemetry |

## Watch Page Rules for This Phase

The following must be true before release:

- The currently selected server is visually clear.
- The user can switch to another available server.
- A resolver failure has a visible fallback message.
- The iframe container has a loading state and a fallback action.
- The user can navigate previous and next episodes.
- The episode list highlights the active episode.
- A user can manually mark the episode as watched.
- A broken external player cannot crash the surrounding NimeNime page.
- The product does not falsely state that the user completed a video merely because the page was opened.

## Phase 1 Exit Gate

- Core smoke routes pass on staging.
- No blocker or critical runtime defect remains open.
- Broken image, no-data, loading, and API error states are visible and understandable.
- Large assets no longer create an obvious first-load regression.

---

# Phase 2. Security, Authorization, and Data Integrity

## Objective

Protect accounts, roles, personal data, moderation actions, and local-to-server synchronization.

## Security Test Matrix

| ID | Scenario | Expected Result | Priority |
|---|---|---|---:|
| SEC-001 | Register with invalid input | Server rejects malformed data without creating user | P0 |
| SEC-002 | Register with existing email | Safe response without exposing unnecessary account details | P0 |
| SEC-003 | Login with invalid email/password | Generic error, no email enumeration | P0 |
| SEC-004 | Login rate limit | Repeated invalid login attempts are limited and logged safely | P0 |
| SEC-005 | Access `/aishiteru/*` as anonymous user | Redirect or deny access | P0 |
| SEC-006 | Access admin route as USER | Deny access | P0 |
| SEC-007 | Access owner-only action as ADMIN | Deny access unless explicitly permitted | P0 |
| SEC-008 | Delete another user’s comment | Deny action | P0 |
| SEC-009 | Delete another user’s recommendation | Deny action | P0 |
| SEC-010 | Upload invalid avatar file | Reject invalid type, size, or malformed file | P1 |
| SEC-011 | Render comment containing HTML/script-like text | Text is safely displayed and not executed | P0 |
| SEC-012 | Call protected API without valid session | Return consistent unauthorized response | P0 |
| SEC-013 | Verify email token twice or after expiry | Reject safely and explain next action | P1 |
| SEC-014 | Trigger maintenance bypass with invalid secret | Do not bypass maintenance | P1 |
| SEC-015 | Call cron endpoint without valid secret | Deny request | P0 |

## Required Improvements

1. Replace memory-only rate limiting with a persistent or distributed solution before scale-out or multi-instance deployment.
2. Use generic login failures to reduce email enumeration risk.
3. Add server-side sanitization or a strict plain-text policy for comments and public messages.
4. Store all high-impact admin actions in an audit log, including actor, action, target, timestamp, and outcome.
5. Define avatar storage retention and access rules.
6. Confirm secrets never appear in logs, client bundles, browser URLs, screenshots, or error messages.

## Data Integrity Tests

| ID | Scenario | Expected Result |
|---|---|---|
| DATA-001 | Save same anime twice | Single saved record only |
| DATA-002 | Save anime as anonymous, then log in | Data syncs once to correct account |
| DATA-003 | Log in as another account on same browser | Local data does not leak across accounts |
| DATA-004 | Mark history on same episode repeatedly | Single record updates safely or remains idempotent |
| DATA-005 | Remove saved item then refresh | Item remains removed after reload |
| DATA-006 | Delete account or user data action | Behavior follows documented retention policy |
| DATA-007 | Failed sync request | Local data remains intact and user can retry |
| DATA-008 | Database unavailable during action | User gets safe failure message, no false success UI |

## Phase 2 Exit Gate

- All P0 security tests pass.
- Protected routes and APIs are verified for anonymous, USER, ADMIN, and OWNER roles.
- Cross-user ownership tests pass.
- Sync behavior is idempotent and does not leak user data.
- No critical security issue remains unresolved.

---

# Phase 3. Core Functional Coverage

## Objective

Prove that the product’s main user journeys work from start to finish across realistic states.

## Core User Journeys

| Journey | Minimum Acceptance Criteria | Priority |
|---|---|---:|
| Browse home | Hero, anime cards, navigation, and core sections render or fail gracefully | P0 |
| Search | Debounced search returns relevant results, submit opens full results, empty/error states work | P0 |
| Filter | Genre, type, status, sort, and pagination produce correct URL state and results | P1 |
| Anime detail | Metadata, episodes, buttons, related UI, and empty states work | P0 |
| Watch episode | Resolver response, iframe container, server switching, prev/next navigation, manual completion, comments | P0 |
| Anonymous saved/history | localStorage behavior persists correctly | P1 |
| Logged-in saved/history | Database behavior persists correctly across sessions | P0 |
| Login/register/verify | Registration, verification, login, logout, and redirect flows work | P0 |
| Discussion | Read public messages, post as user, rate limit, delete own content, admin moderation | P0 |
| Notifications | Reply notification appears, mark as read works, unread count is accurate | P1 |
| Recommendations | Post, list, delete own, admin moderation if applicable | P1 |
| Settings | Update profile, password, avatar, NSFW preference, theme preference | P0 |
| Admin | Dashboard loads, users visible, moderation actions enforce permissions, broadcasts work | P0 |
| Maintenance mode | Public routes show maintenance state, authorized bypass behavior works | P1 |

## Browser and Device Coverage

| Target | Minimum Coverage |
|---|---|
| Desktop Chromium | Full functional suite |
| Desktop Firefox | Smoke suite and visual checks |
| Desktop Safari | Smoke suite where available |
| Android Chrome | Full primary journey suite |
| iOS Safari | Full primary journey suite |
| Narrow mobile width | Navigation, search, cards, episode list, admin denial checks |
| Tablet width | Layout, sidebar behavior, touch targets |

## External Provider Contract Tests

For each provider, QA should save representative successful and failure fixtures.

| Provider Type | Minimum Checks |
|---|---|
| Anime catalog API | Required fields, empty result, malformed field, timeout, rate-limit response |
| Anime detail API | Slug, title, poster, episodes, genres, missing optional data |
| Search API | Empty query, special characters, no results, slow response |
| Stream resolver | Valid server, no server, failed resolver, malformed embed URL |
| Jikan or metadata API | Missing rating, missing character image, rate limit, error fallback |
| Email provider | Delivery success, delivery failure, token generated, user guidance shown |
| OAuth provider | Success, denial, callback failure, existing-email account behavior |

## Phase 3 Exit Gate

- All P0 user journeys pass on desktop and mobile.
- P1 journeys have no unresolved high-severity defects.
- All core external provider failures show safe and understandable product behavior.
- Test evidence exists for both anonymous and authenticated flows.

---

# Phase 4. UI, UX, Responsive, and Accessibility Quality

## Objective

Make NimeNime reliable and comfortable to use across devices, themes, navigation methods, and accessibility needs.

## UI and UX Work Items

| ID | Task | Acceptance Criteria |
|---|---|---|
| UX-001 | Create shared UI primitives | Button, input, badge, dialog, dropdown, empty state, skeleton components exist or inline patterns are standardized |
| UX-002 | Add empty states | Saved, history, search, notifications, recommendations, comments, and failed data sections have clear empty states |
| UX-003 | Add section-level error handling | Failure in character, rating, comments, or external metadata section does not break entire page |
| UX-004 | Improve search keyboard support | Escape, arrow navigation, Enter selection, focus state, screen-reader labels |
| UX-005 | Improve focus visibility | Keyboard users can see current focus on all interactive controls |
| UX-006 | Verify touch target size | Primary mobile controls are easy to tap and do not overlap |
| UX-007 | Add mobile bottom navigation if approved | Home, Search, Saved, History, Profile are easy to access on mobile |
| UX-008 | Standardize destructive confirmations | Delete, role change, broadcast removal, and account-impacting actions require clear confirmation |
| UX-009 | Verify all 10 themes | Text, borders, icons, hover states, focus states, and alert dialogs remain readable |

## Accessibility Test Checklist

- Entire primary journey works with keyboard only.
- Icon-only buttons have accessible names.
- Search follows an accessible combobox behavior.
- Focus is never trapped unintentionally.
- Modal and dialog focus behavior is correct.
- Page language matches the primary content language.
- Color is not the only method used to communicate an error or active state.
- Error messages explain what happened and how to recover.
- Heading order is logical on key pages.
- Images that communicate information have useful alternative text.

## Phase 4 Exit Gate

- Critical paths pass keyboard-only testing.
- No known overlap, clipping, inaccessible control, or unusable small-screen issue remains in primary routes.
- All supported themes pass visual review for key pages.

---

# Phase 5. Performance, Reliability, and External Dependency Resilience

## Objective

Ensure NimeNime remains usable when the network is slow, assets are large, APIs fail, or external providers return unexpected results.

## Performance Work Items

| ID | Task | Acceptance Criteria |
|---|---|---|
| PERF-001 | Set a performance baseline | Record home, detail, search, and watch page metrics on mobile and desktop |
| PERF-002 | Optimize oversized images | No unnecessarily large hero or account image blocks first meaningful render |
| PERF-003 | Review image loading strategy | Poster and banner loading has responsive sizing, fallback, and no unjustified optimization bypass |
| PERF-004 | Reduce monolithic component risk | Navbar and comments areas are split or covered by focused tests before major changes |
| PERF-005 | Avoid duplicate client fetches | Browser network log shows intentional requests only |
| PERF-006 | Validate cache behavior | Cache expiration does not show stale critical data or cause unnecessary provider traffic |
| PERF-007 | Validate slow-network UX | Loading states remain usable and no UI appears frozen |

## Reliability Tests

| Scenario | Expected Product Behavior |
|---|---|
| Catalog API timeout | Show retryable message or cached content, page shell remains usable |
| Catalog API malformed response | Log error safely, avoid full-page crash, show fallback section |
| Stream resolver failure | Offer another server, clear explanation, broken-server reporting option |
| iframe fails internally | Surrounding page remains stable; user can switch server or return |
| Jikan metadata unavailable | Hide optional rating/character section without breaking anime detail page |
| Database unavailable | Do not claim action succeeded; show recoverable failure message |
| Email provider unavailable | Registration outcome is clearly explained with resend or support path |
| OAuth callback failure | Return user safely to login with clear message |
| Deployment restart | Health checks, main routes, auth, and database access recover after restart |

## Monitoring and Observability Requirements

Before production-ready approval, add or confirm:

- Server error logging with request context and correlation IDs where feasible.
- Client-side error reporting for unhandled UI crashes.
- Uptime and endpoint health checks for home, auth, database-dependent action, and stream resolver.
- Alerting for unusual error spikes, failed deployments, database connection failures, and external provider failure rates.
- Deployment logs retained long enough for incident investigation.
- A documented owner for every alert category.

## Phase 5 Exit Gate

- Core pages remain understandable under slow or failed external dependencies.
- Performance baseline exists and large avoidable asset issues are resolved.
- Monitoring can detect a failed deployment, application error spike, database problem, and major external API outage.

---

# Phase 6. Automated Regression Coverage and CI Quality Gates

## Objective

Prevent known defects from returning after feature work, refactoring, provider changes, or deployment changes.

## Automation Priority

### Tier A. Must Automate Before Production-Ready

| Test Area | Example Coverage |
|---|---|
| Build and static checks | Type check, lint, production build, Prisma generate |
| Auth API | Register validation, login invalid credentials, verified/unverified behavior |
| Role control | USER denied admin, ADMIN and OWNER permissions |
| Saved anime | Add, duplicate prevention, delete, ownership |
| Watch history | Create/update, local-to-DB sync, user isolation |
| Comments/discussion | Create, delete own, deny delete other user, rate limit |
| Protected APIs | Unauthorized request returns expected response |
| Critical E2E | Login, browse, search, save, history, watch route, logout |

### Tier B. Automate After Tier A

| Test Area | Example Coverage |
|---|---|
| Filters and pagination | URL state, result state, edge query values |
| Theme persistence | Theme updates and remains after reload |
| Notifications | Mark read, unread count, update behavior |
| Admin moderation | Delete comment/message, user action confirmation |
| Visual regression | Home, anime detail, watch page, mobile navbar |
| External API adapter fixtures | Required fields, malformed responses, provider outage behavior |

## CI Pipeline Gates

Every pull request and deployment candidate should pass:

1. Dependency installation in a clean environment.
2. Prisma client generation.
3. Type check.
4. Lint.
5. Unit and integration test suite.
6. Browser smoke suite against staging or isolated test environment.
7. Migration validation.
8. Security scan for exposed secrets and vulnerable dependencies.
9. Build artifact generation.
10. Release checklist approval for production deployment.

## Pull Request Quality Rules

- No direct production deploy without a reviewable pull request or documented emergency process.
- Every bug fix includes a regression test when technically feasible.
- Every API change includes updated contract fixtures or tests.
- Every new protected route includes an authorization test.
- Every new destructive action includes confirmation and ownership or role test.
- Every UI component change on a core route includes desktop and mobile evidence.

## Phase 6 Exit Gate

- CI blocks a merge when build, type, lint, critical tests, or migration checks fail.
- Core P0 flows are automated.
- At least one browser E2E smoke suite passes before release.

---

# Phase 7. Release Candidate Certification and Production Go-Live

## Objective

Make the production release decision evidence-based and reversible.

## Pre-Release Checklist

### Functional

- [ ] Home, search, detail, watch, saved, history, comments, discussion, settings, and admin smoke tests pass.
- [ ] Anonymous, USER, ADMIN, and OWNER access is verified.
- [ ] External API failure states are tested.
- [ ] Watch-page server switching and manual episode completion behavior are tested.
- [ ] Email verification and OAuth fallback behavior are tested.

### Security and Data

- [ ] No open blocker or critical defect.
- [ ] All P0 security cases pass.
- [ ] Cross-user authorization tests pass.
- [ ] Secrets are not exposed in client code, logs, or deployment output.
- [ ] Database migration has been rehearsed on staging.
- [ ] Backup and restore test has been completed.

### Performance and Reliability

- [ ] Large assets are optimized.
- [ ] Core mobile and desktop performance baseline meets internal targets.
- [ ] Error monitoring and uptime alerts are active.
- [ ] Rollback steps are documented and tested.
- [ ] Deployment health check passes after restart.

### UX and Accessibility

- [ ] Primary user flow passes on desktop and mobile.
- [ ] Keyboard-only navigation works for core flows.
- [ ] Supported themes pass contrast and visual review.
- [ ] Empty, loading, and error states exist for core user actions.

### Operations

- [ ] Release notes are prepared.
- [ ] Known limitations are documented.
- [ ] Team knows who owns incident response.
- [ ] Admin has a documented procedure for reports, comments, and user moderation.
- [ ] External provider outage procedure is available.

## Go/No-Go Decision Rules

| Condition | Decision |
|---|---|
| Any blocker or critical defect open | No-Go |
| Admin route can be accessed by USER or anonymous account | No-Go |
| User data can cross accounts | No-Go |
| Registration or login universally fails | No-Go |
| External provider outage crashes core pages | No-Go until graceful failure exists |
| CI checks fail | No-Go |
| Backup/rollback not documented | No-Go |
| Only low-severity cosmetic defects remain | Go with documented post-release plan |
| High-severity defect has clear workaround and product owner accepts risk | Conditional Go, documented exception required |

---

## 7. Recommended Initial QA Backlog

This sequence is recommended because it reduces the largest production risks first.

| Order | Ticket | Why First | Priority |
|---:|---|---|---:|
| 1 | Create QA route matrix and smoke checklist | Gives the whole team a shared baseline | P0 |
| 2 | Add test accounts and repeatable test-data reset | Makes QA repeatable | P0 |
| 3 | Verify build, Prisma generation, migration, and clean startup | Prevents basic deployment failures | P0 |
| 4 | Implement generic auth error behavior and test it | Reduces account enumeration risk | P0 |
| 5 | Test and harden admin route authorization | Prevents highest-impact access failure | P0 |
| 6 | Test localStorage to DB sync across two users | Prevents data leak and duplicate risks | P0 |
| 7 | Add manual episode completion and clarify “last opened” status | Fits external iframe limitation honestly | P0 |
| 8 | Add broken-stream report workflow | Provides actionable feedback for third-party servers | P1 |
| 9 | Compress banner and review image optimization | Fast performance win | P1 |
| 10 | Add core API integration tests | Protects saved/history/comments/auth | P0 |
| 11 | Add browser E2E smoke suite | Validates real user journeys | P0 |
| 12 | Add monitoring and release rollback runbook | Makes production supportable | P0 |
| 13 | Split Navbar and EpisodeComments after baseline tests exist | Reduces refactor risk | P1 |
| 14 | Build reusable UI states and accessibility improvements | Improves product consistency | P1 |

---

## 8. Defect Reporting Template

```md
## Title
[Area] Short, clear defect description

## Environment
- Environment: Local / Staging / Production
- Build or commit:
- Browser and version:
- Device and screen size:
- User role: Anonymous / USER / ADMIN / OWNER

## Preconditions
- Required account:
- Required test data:

## Steps to Reproduce
1.
2.
3.

## Expected Result

## Actual Result

## Severity
Blocker / Critical / High / Medium / Low

## Evidence
- Screenshot or recording:
- Console errors:
- Network request/response:
- Server log or correlation ID:

## Notes
- Is the issue reproducible?
- Does it happen with another account, browser, or network?
- Is there a workaround?
```

---

## 9. Handover Notes for a New QA Engineer

1. Start by reading the route matrix and the current Prisma schema. Do not rely only on old counts or summaries.
2. Test with at least two normal users. Most authorization and sync defects only appear when ownership is compared.
3. Treat the embedded player as external. Test the page around it, not unsupported internal telemetry.
4. When testing watch history, distinguish these states:
   - episode opened
   - episode manually marked watched
   - next episode suggested
   - anime completed
5. External anime APIs can fail, change payload shape, throttle, or return partial data. Every test plan must include degraded behavior.
6. Admin actions require special care because they may delete content or change roles.
7. Never perform destructive testing against production unless there is explicit approval and a safe test account.
8. Every production issue should result in one of these outcomes:
   - a regression test
   - an alert or monitoring improvement
   - a runbook update
   - a product limitation documented clearly

---

## 10. Final Production-Ready Target State

NimeNime is production-ready when it can provide a stable anime discovery and community experience even when a third-party catalog API, metadata API, or streaming embed is unstable.

The expected mature behavior is:

- Users can browse, search, save, discuss, and manage their accounts reliably.
- Admins can moderate safely and cannot be bypassed by normal users.
- The platform handles external provider failure without pretending that the service is fully controlled.
- Episode activity is tracked honestly through last-opened and manual-completion states.
- Releases are tested, monitored, reversible, and documented.
- Quality is repeatable through automation, release gates, and a maintained QA baseline.

**Recommended first production-ready milestone:** Complete Phases 0, 1, 2, and the Tier A items from Phase 6 before adding another major feature area.
