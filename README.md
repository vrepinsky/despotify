# Despotify

Find non-Spotify alternatives for public Spotify playlist tracks.

## Getting Started

```sh
pnpm install
cp .env.example .env
pnpm db:up
pnpm --filter @despotify/api db:migrate
pnpm dev
```

Open `http://localhost:3000`.
