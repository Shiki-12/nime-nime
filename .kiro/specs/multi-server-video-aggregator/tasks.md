# Implementation Plan: Multi-Server Video Aggregator

## Overview

This plan implements a secondary anime streaming API integration (Otakudesu via Sanka Vollerei) alongside the existing Animasu API. The implementation uses concurrent fetching with `Promise.allSettled`, aggressive caching via `unstable_cache` (1-hour TTL), and fault-tolerant error handling. The VideoPlayer component is updated to display provider + quality labels for all available servers.

## Tasks

- [x] 1. Define types and configuration
  - [x] 1.1 Create VideoServer type and Otakudesu API response types
    - Add `VideoServer` interface to `src/types/anime.ts` with `provider`, `quality`, and `url` fields
    - Create Otakudesu response types: `OtakudesuSearchResult`, `OtakudesuSearchResponse`, `OtakudesuEpisodeEntry`, `OtakudesuDetailResponse`, `OtakudesuQuality`, `OtakudesuEpisodeResponse`
    - _Requirements: 5.1, 5.3, 5.4_

  - [x] 1.2 Add Otakudesu API configuration constants
    - Add `OTAKUDESU_API_URL` and `OTAKUDESU_CACHE_TTL` constants to `src/lib/config.ts`
    - Use the base URL `https://www.sankavollerei.com/anime` (read from env var with fallback)
    - Set cache TTL to 3600 seconds minimum
    - _Requirements: 3.1, 3.3_

- [x] 2. Implement Otakudesu cached fetchers
  - [x] 2.1 Implement `searchOtakudesu` cached function
    - Create `src/lib/otakudesu.ts` with the `searchOtakudesu` function wrapped in `unstable_cache`
    - Apply `encodeURIComponent` to the title parameter before constructing the URL
    - Validate input length (reject > 200 characters, return null)
    - Return the first search result or `null` on any error
    - Use cache key prefix `["otakudesu-search"]` with `revalidate: 3600`
    - Never throw — catch all errors and return `null`
    - _Requirements: 2.1, 2.4, 3.1, 3.3, 8.1, 8.3_

  - [x] 2.2 Implement `getOtakudesuDetail` cached function
    - Add to `src/lib/otakudesu.ts`, wrapped in `unstable_cache`
    - Apply `encodeURIComponent` to the slug parameter
    - Return the episode list array or empty array on error
    - Use cache key prefix `["otakudesu-detail"]` with `revalidate: 3600`
    - Never throw — catch all errors and return `[]`
    - _Requirements: 2.2, 3.1, 3.3, 8.2_

  - [x] 2.3 Implement `getOtakudesuEpisode` cached function
    - Add to `src/lib/otakudesu.ts`, wrapped in `unstable_cache`
    - Apply `encodeURIComponent` to the episodeId parameter
    - Parse `defaultStreamingUrl` as a VideoServer with quality "Default" (if non-empty)
    - Parse `server.qualities` array entries as individual VideoServers
    - Exclude entries with empty/null/whitespace-only URLs
    - Set provider to "Otakudesu" for all servers
    - Never throw — catch all errors and return `[]`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 3.1, 8.2_

- [x] 3. Implement aggregator function
  - [x] 3.1 Implement `mapStreamSourcesToVideoServers` utility
    - Create in `src/lib/otakudesu.ts` (or a shared location)
    - Map each `StreamSource` to `VideoServer` with `provider: "Animasu"`, `quality: stream.name`, `url: stream.url`
    - Exclude entries with empty/whitespace-only `name` or invalid URLs (not starting with http:// or https://)
    - Pure function with no side effects
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6_

  - [x] 3.2 Implement `fetchOtakudesuServers` pipeline function
    - Add to `src/lib/otakudesu.ts`
    - Orchestrate the sequential pipeline: search → detail → find episode → fetch streams
    - Match episode by comparing `eps` field (as string) to current episode number
    - Return empty array at any step if no match found
    - Never throw — wrap entire pipeline in try/catch
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.3 Implement `getAggregatedVideoServers` main aggregator
    - Add to `src/lib/otakudesu.ts` (exported)
    - Use `Promise.allSettled` to run primary and secondary fetches concurrently
    - Place primary servers before secondary servers in the merged array
    - Return empty array if both fail — never throw
    - Handle timeout scenarios gracefully (AbortController with 10s for primary, 5s for secondary)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.6_

- [x] 4. Checkpoint - Ensure aggregator logic is correct
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update VideoPlayer component and episode page
  - [x] 5.1 Update VideoPlayer to accept `VideoServer[]` and display provider labels
    - Change `VideoPlayerProps.streams` type from `StreamSource[]` to `VideoServer[]`
    - Update dropdown option labels to display `{provider} - {quality}` format
    - Keep existing behavior: hide dropdown when only 1 server, show "No streaming source available" when empty
    - Update the `key` and `activeStream` references to use `VideoServer.url`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 5.2 Update episode watch page to use aggregator
    - Modify `src/app/anime/watch/[episodeSlug]/page.tsx` to call `getAggregatedVideoServers` instead of passing `episode.streams` directly
    - Extract episode number from the episode title or slug for the aggregator call
    - Pass the anime title and episode slug to the aggregator
    - Ensure all API calls remain server-side (RSC)
    - _Requirements: 1.1, 8.4_

- [x] 6. Checkpoint - Ensure end-to-end integration works
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 7. Property-based and unit tests
  - [ ]* 7.1 Write property test: Aggregator Never Throws
    - **Property 1: Aggregator Never Throws**
    - For any combination of inputs and API success/failure states, `getAggregatedVideoServers` always returns a `VideoServer[]` and never throws
    - Use fast-check to generate arbitrary strings for title, episode number, and slug, with mocked API responses (success, error, timeout)
    - **Validates: Requirement 1.4**

  - [ ]* 7.2 Write property test: Merge Completeness and Ordering
    - **Property 2: Merge Completeness and Ordering**
    - For any pair of successful primary and secondary server arrays, the merged result contains all servers with primary first, secondary last
    - **Validates: Requirements 1.2, 1.3**

  - [ ]* 7.3 Write property test: Fault Isolation — Secondary Failure
    - **Property 3: Fault Isolation — Secondary Failure**
    - For any successful primary response and any secondary failure, the result contains exactly the primary servers unmodified
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [ ]* 7.4 Write property test: Fault Isolation — Primary Failure
    - **Property 4: Fault Isolation — Primary Failure**
    - For any successful secondary response and a primary failure, the result contains the secondary servers
    - **Validates: Requirement 4.4**

  - [ ]* 7.5 Write property test: Bijective StreamSource Mapping
    - **Property 5: Bijective StreamSource Mapping**
    - For any `StreamSource[]`, `mapStreamSourcesToVideoServers` produces a `VideoServer[]` where each element has `provider: "Animasu"`, matching quality and url
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 7.6 Write property test: VideoServer Field Validation
    - **Property 6: VideoServer Field Validation**
    - For any `VideoServer` in the aggregated result, provider is from {"Animasu", "Otakudesu"}, quality is non-empty, and url starts with "http"
    - **Validates: Requirements 5.3, 5.4**

  - [ ]* 7.7 Write property test: Secondary Response Extraction Completeness
    - **Property 7: Secondary Response Extraction Completeness**
    - For any valid Otakudesu episode response, the parser includes defaultStreamingUrl as "Default" quality (when present) plus one VideoServer per valid quality entry
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 7.8 Write property test: Invalid URL Filtering
    - **Property 8: Invalid URL Filtering**
    - For any Otakudesu response with quality entries having empty/missing URLs, those entries are excluded from results
    - **Validates: Requirement 7.3**

  - [ ]* 7.9 Write property test: Episode Number Matching
    - **Property 9: Episode Number Matching**
    - For any episode list where no entry's `eps` field matches the target, the pipeline returns an empty array
    - **Validates: Requirement 2.5**

  - [ ]* 7.10 Write property test: Input Encoding Safety
    - **Property 10: Input Encoding Safety**
    - For any anime title with special characters, the constructed URL contains the `encodeURIComponent`-encoded version
    - **Validates: Requirement 8.1**

  - [ ]* 7.11 Write property test: Display Label Format
    - **Property 11: Display Label Format**
    - For any VideoServer rendered in the dropdown, the option text follows "{provider} - {quality}" format
    - **Validates: Requirement 6.1**

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All implementation uses TypeScript with Next.js 16 patterns (RSC, `unstable_cache`)
- No new npm packages are required for core implementation; `fast-check` is needed only for optional property tests
- The existing `nimeFetch` wrapper is reused for all API calls

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "3.1"] },
    { "id": 2, "tasks": ["3.2"] },
    { "id": 3, "tasks": ["3.3"] },
    { "id": 4, "tasks": ["5.1", "5.2"] },
    { "id": 5, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10", "7.11"] }
  ]
}
```
