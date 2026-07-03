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

Open `http://localhost:5173`.

For Docker Compose:

```sh
cp .env.example .env
docker compose up
```

The API is available at `http://localhost:3000`, and the web app is available at
`http://localhost:5173`.

## Useful Commands

```sh
pnpm lint
pnpm format
pnpm typecheck
pnpm build
```

## Environment

```sh
API_PORT=3000
API_ALLOWED_WEB_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3000

DB_NAME=despotify
DB_USER=despotify
DB_PASSWORD=despotify
```

- `API_PORT`: port used by the Fastify API.
- `API_ALLOWED_WEB_ORIGIN`: frontend origin allowed by API CORS.
- `VITE_API_URL`: API URL compiled into the Vite frontend.
- `DB_*`: local Postgres container settings.
