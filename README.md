# Bifrost

Bifrost is an event networking ecosystem for instant contact exchange, attendee proximity, and organizer analytics.

## Monorepo layout

- `apps/attendee`: mobile-first attendee PWA for QR exchange, check-in, radar, and offline sync.
- `apps/organizer`: organizer workspace for venue setup, event heartbeat, network graphs, and analytics.
- `packages/shared-types`: shared TypeScript contracts for events, attendees, and connections.

## Getting started

```bash
pnpm install
pnpm dev:attendee
pnpm dev:organizer
```

The apps use Vite + React + TypeScript. Supabase will provide authentication, PostgreSQL/PostGIS storage, and realtime channels as the backend layer is implemented.

## Product principles

- Offline-first attendee flows for crowded venues and unreliable connectivity.
- Fast, mutual contact exchange with downloadable `.vcf` contact cards.
- Privacy-aware proximity presence scoped to an active event.
- Organizer metrics that turn networking activity into actionable event insight.
