# Despotify

Minimal fullstack monorepo scaffold for reviewing the app setup before adding
product code.

## Stack

- pnpm workspace + Turbo task orchestration
- React 19, Vite, TypeScript, TanStack Router, Goober
- Fastify 5, TypeScript, Zod, `fastify-type-provider-zod`
- Postgres 16 in Docker Compose for local infrastructure
- Oxlint + Oxfmt

## Apps

- `apps/api`: Fastify API with `GET /health`
- `apps/web`: Vite React app with a single page that checks API health

## Getting Started

```sh
pnpm install
cp .env.example .env
pnpm dev
```

Open `http://localhost:3000`.

For Docker Compose:

```sh
cp .env.example .env
docker compose up
```

The API is available at `http://localhost:5000`, and the web app is available at
`http://localhost:3000`.

## Useful Commands

```sh
pnpm lint
pnpm format
pnpm typecheck
pnpm build
```

## Environment

```sh
WEB_PORT=3000
VITE_API_URL=http://localhost:5000

API_PORT=5000
API_ALLOWED_WEB_ORIGIN=http://localhost:3000

DB_NAME=despotify
DB_USER=despotify
DB_PASSWORD=despotify
DB_HOST=localhost
DB_PORT=5432
```

- `WEB_PORT`: port used by the Vite frontend dev server.
- `VITE_API_URL`: API URL compiled into the Vite frontend.
- `API_PORT`: port used by the Fastify API.
- `API_ALLOWED_WEB_ORIGIN`: frontend origin allowed by API CORS.
- `DB_*`: local Postgres connection settings.
