# Despotify

Paste a public Spotify playlist URL and build a queue for finding Bandcamp,
YouTube, and SoundCloud alternatives, preferring paid/downloadable sources.

## Stack

- pnpm workspace + Turbo task orchestration
- React 19, Vite, TypeScript, TanStack Router, TanStack Query, Goober
- Fastify 5, TypeScript, Zod, `fastify-type-provider-zod`
- Postgres 16, Drizzle ORM + Drizzle Kit migrations
- Oxlint + Oxfmt
- Docker Compose for local Postgres/API/web

## Getting Started

```sh
pnpm install
cp .env.example .env
pnpm --filter @despotify/api db:migrate
pnpm dev
```

Open `http://localhost:5173`.

For Docker Compose:

```sh
cp .env.example .env
docker compose up
```

The API is available at `http://localhost:3000`, and the web app is available
at `http://localhost:5173`.

## Useful Commands

```sh
pnpm lint
pnpm format
pnpm typecheck
pnpm build
pnpm --filter @despotify/api db:generate
pnpm --filter @despotify/api db:migrate
```

## Spotify Setup

Public playlist fetching uses Spotify's Client Credentials flow. Add these to
`.env` before resolving real playlists:

```sh
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
```

Private playlists should not be an MVP blocker. Add Spotify OAuth later with a
short-lived session only for importing private playlist metadata, then keep the
core matching flow unauthenticated.

## MVP Plan

1. Public playlist import
   - Parse Spotify playlist URLs.
   - Fetch playlist tracks through Spotify Client Credentials.
   - Store imported tracks, ISRCs, and source metadata in Postgres.

2. Alternative matching
   - Prefer Bandcamp matches because paid artist-supporting links are the
     strongest product signal.
   - Use ISRC where possible, then normalized artist/title search.
   - Add YouTube and SoundCloud as fallbacks, tagged as `free_download`,
     `stream_only`, or `unknown`.

3. Reviewable results
   - Show track-by-track confidence, source kind, pricing kind, and match URL.
   - Let users copy/export the resolved playlist as CSV or JSON.

4. Async jobs
   - The current endpoint writes a job and imports tracks synchronously.
   - Add a small worker queue before doing provider searches so slow external
     lookups do not block HTTP requests.

## Things Still Missing

- Provider API choices: Bandcamp has no official public search API, so matching
  needs either a search provider, careful scraping policy, or manual search link
  fallback.
- Abuse controls: even without auth, add rate limiting before exposing this.
- Observability: add request IDs and structured job logs once workers exist.
- Tests: add route tests for URL validation/import behavior and matching
  normalization tests before implementing provider search.
