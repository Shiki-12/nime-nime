# Requirements Document

## Introduction

This document specifies the requirements for the Multi-Server Video Aggregator feature. The feature integrates a secondary anime streaming API (Otakudesu via Sanka Vollerei) alongside the existing primary API (Animasu) to provide users with multiple video server options per episode. The system fetches from both APIs concurrently, caches secondary API responses aggressively to respect rate limits, and ensures fault tolerance so that secondary API failures never degrade the primary viewing experience.

## Glossary

- **Aggregator**: The server-side function that orchestrates concurrent fetching from both APIs and merges results into a unified array
- **Primary_API**: The existing Animasu streaming API that provides the current video servers
- **Secondary_API**: The Otakudesu API accessed via the Sanka Vollerei proxy at `https://www.sankavollerei.com/anime`
- **VideoServer**: A unified type representing a streaming server from any provider, containing provider name, quality label, and URL
- **StreamSource**: The existing type from the Primary_API containing name and URL fields
- **VideoPlayer**: The client-side component that renders the video iframe and server selection dropdown
- **Cache_Layer**: The Next.js `unstable_cache` mechanism used to store Secondary_API responses with a minimum 1-hour TTL
- **Episode_Slug**: A URL-friendly identifier for a specific episode in either API

## Requirements

### Requirement 1: Concurrent Multi-API Fetching

**User Story:** As a user, I want the system to fetch video servers from multiple providers simultaneously, so that I get the maximum number of streaming options without additional page load delay.

#### Acceptance Criteria

1. WHEN an episode page loads, THE Aggregator SHALL fetch from Primary_API and Secondary_API concurrently using Promise.allSettled with a maximum timeout of 10 seconds per API call
2. WHEN both API fetches complete successfully, THE Aggregator SHALL return a merged VideoServer array containing servers from both providers
3. WHEN the Aggregator returns results, THE Aggregator SHALL place Primary_API servers before Secondary_API servers in the array, regardless of which API responded first
4. THE Aggregator SHALL never throw an exception — it SHALL always return a VideoServer array (possibly empty), including when one or both API calls time out or reject
5. IF only one API fetch completes successfully, THEN THE Aggregator SHALL return a VideoServer array containing only the servers from the successful provider

### Requirement 2: Secondary API Integration Pipeline

**User Story:** As a user, I want the system to find matching episodes on the secondary provider automatically, so that I get additional server options without manual intervention.

#### Acceptance Criteria

1. WHEN fetching secondary servers, THE Aggregator SHALL search the Secondary_API using the anime title and select the first result returned as the matching anime entry
2. WHEN a matching anime is found on Secondary_API, THE Aggregator SHALL retrieve the episode list and find the episode whose episode number string equals the current episode number
3. WHEN a matching episode is found, THE Aggregator SHALL fetch the streaming URLs for that episode using the matched episode's identifier
4. IF the anime title search returns no results on Secondary_API, THEN THE Aggregator SHALL return an empty array for secondary servers
5. IF the episode number has no match on Secondary_API (OVA/special mismatch), THEN THE Aggregator SHALL return an empty array for secondary servers
6. IF the Secondary_API returns a successful response with empty or malformed data at any step in the pipeline (search, detail, or episode fetch), THEN THE Aggregator SHALL treat it as no match and return an empty array for secondary servers

### Requirement 3: Aggressive Caching for Rate Limit Protection

**User Story:** As a system operator, I want all secondary API calls to be aggressively cached, so that the system stays well under the 50 requests/minute rate limit.

#### Acceptance Criteria

1. WHEN the Secondary_API returns a successful response (HTTP 2xx), THE Cache_Layer SHALL cache that response for a minimum of 3600 seconds (1 hour) before considering it stale
2. WHEN a cached response exists for a Secondary_API request and the cache entry has not exceeded its TTL, THE Cache_Layer SHALL serve the cached response without making a network call
3. THE Cache_Layer SHALL use distinct cache keys composed of the request type combined with the unique parameter (search term and page number, anime slug, or episode ID) to avoid collisions between different queries
4. IF the Secondary_API returns an error response (HTTP 4xx or 5xx), THEN THE Cache_Layer SHALL NOT cache that response and SHALL allow a subsequent request for the same key to attempt a fresh network call
5. WHILE multiple concurrent requests arrive for the same uncached Secondary_API key, THE Cache_Layer SHALL issue only one network call and serve the resulting response to all waiting requests

### Requirement 4: Fault Tolerance and Error Isolation

**User Story:** As a user, I want the primary video servers to always be available even when the secondary provider is down, so that my viewing experience is never degraded by third-party failures.

#### Acceptance Criteria

1. IF the Secondary_API returns an HTTP 429 (rate limited) response, THEN THE Aggregator SHALL return an empty array for secondary servers and SHALL return the Primary_API results unchanged
2. IF the Secondary_API returns any non-2xx HTTP response, THEN THE Aggregator SHALL return an empty array for secondary servers and SHALL return the Primary_API results unchanged
3. IF the Secondary_API does not respond within 5 seconds, THEN THE Aggregator SHALL abort the Secondary_API request and return an empty array for secondary servers without affecting primary results
4. IF the Primary_API returns any non-2xx HTTP response or does not respond within 10 seconds, THEN THE Aggregator SHALL return an empty array for primary servers and SHALL still return Secondary_API servers if they resolved successfully
5. WHEN the Aggregator encounters a Secondary_API error, THE Aggregator SHALL NOT cache the error response, so that subsequent requests can retry the Secondary_API after the cache TTL would otherwise have served the failed result
6. THE Aggregator SHALL complete the full aggregation (both API calls resolved or timed out) within 12 seconds of the initial request

### Requirement 5: StreamSource to VideoServer Mapping

**User Story:** As a developer, I want a consistent type for all video servers regardless of provider, so that the UI can render them uniformly.

#### Acceptance Criteria

1. THE Aggregator SHALL map each Primary_API StreamSource to a VideoServer with provider set to "Animasu", quality set to the StreamSource name, and url set to the StreamSource url
2. THE Aggregator SHALL produce a VideoServer array of the same length as the valid input StreamSource entries when mapping primary results
3. THE Aggregator SHALL set the provider field to "Otakudesu" for all servers originating from the Secondary_API
4. THE Aggregator SHALL ensure every VideoServer has a non-empty provider (at least 1 character), non-empty quality (at least 1 character), and a url starting with "http://" or "https://"
5. IF a StreamSource has an empty or whitespace-only name, THEN THE Aggregator SHALL exclude that entry from the resulting VideoServer array
6. IF a StreamSource has a url that does not start with "http://" or "https://", THEN THE Aggregator SHALL exclude that entry from the resulting VideoServer array

### Requirement 6: VideoPlayer Multi-Provider Display

**User Story:** As a user, I want to see which provider and quality each server option offers, so that I can make an informed choice about which stream to watch.

#### Acceptance Criteria

1. WHEN rendering the server selector dropdown, THE VideoPlayer SHALL display each server option using its `name` property as the label text in the format "{provider} - {quality}" (e.g., "Kuramanime - 720p")
2. WHEN multiple servers are available, THE VideoPlayer SHALL render a dropdown (`<select>` element) listing all available servers and SHALL switch the active stream to the selected server within 1 second of user selection
3. WHEN exactly one server is available, THE VideoPlayer SHALL render the video player without displaying the server selector dropdown
4. WHEN only primary servers are available (secondary provider returned an empty array or a network error), THE VideoPlayer SHALL display the available primary servers in the dropdown without any error message or warning indication
5. WHEN no servers are available from any provider (the streams array is empty), THE VideoPlayer SHALL display a "No streaming source available" message in place of the video player and SHALL NOT render the server selector dropdown

### Requirement 7: Secondary API Response Parsing

**User Story:** As a developer, I want the system to correctly parse all response formats from the secondary API, so that users get the maximum number of server options.

#### Acceptance Criteria

1. WHEN the Secondary_API episode response contains a defaultStreamingUrl with a non-empty value (not null, undefined, or whitespace-only), THE Aggregator SHALL include it as a VideoServer with provider "Otakudesu", quality "Default", and url set to the defaultStreamingUrl value
2. WHEN the Secondary_API episode response contains entries in the server.qualities array, THE Aggregator SHALL include each valid entry as a separate VideoServer with provider "Otakudesu", quality set to the entry's quality label field, and url set to the entry's url field
3. IF a quality entry in the Secondary_API response has a url that is null, undefined, or a whitespace-only string, THEN THE Aggregator SHALL exclude that entry from the results
4. IF the defaultStreamingUrl in the Secondary_API response is null, undefined, or a whitespace-only string, THEN THE Aggregator SHALL omit the "Default" quality VideoServer from the results
5. IF the Secondary_API episode response has a missing or non-array server.qualities field, THEN THE Aggregator SHALL proceed with only the defaultStreamingUrl (if valid) and return no quality-specific VideoServers

### Requirement 8: Input Sanitization and Security

**User Story:** As a system operator, I want all user-derived inputs to be properly sanitized before constructing API URLs, so that the system is protected against injection attacks.

#### Acceptance Criteria

1. WHEN constructing Secondary_API search URLs, THE Aggregator SHALL apply encodeURIComponent to the anime title parameter before inserting it into the URL string
2. WHEN constructing Secondary_API episode or anime detail URLs, THE Aggregator SHALL apply encodeURIComponent to any user-derived path segment (including Episode_Slug and anime slug parameters)
3. IF a user-derived input exceeds 200 characters in length, THEN THE Aggregator SHALL truncate or reject the input and return an empty array for secondary servers without making an API call
4. THE Aggregator SHALL execute all API calls server-side within React Server Components, ensuring no API URLs, API keys, or internal endpoint paths are present in client-delivered JavaScript bundles or browser network requests to internal services
