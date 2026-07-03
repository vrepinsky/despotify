# AGENTS.md

## Global Code Style And Requirements

- Keep code minimal and avoid repeating functionality.
- Keep imports in one sorted block.
- Run format, lint, and build checks before committing code.

## Web

- Keep UI code small and colocated until reuse is clear.

## API

- Keep database access inside repositories.
- For DB structure changes, update the Drizzle schema first, then generate migrations.
- Hand-write migrations only for data backfills or other cases Drizzle cannot express safely.
- Routes and services should use repositories instead of calling the database directly.
