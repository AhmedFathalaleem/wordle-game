# Portfolio Platform

Production-ready cloud-native portfolio platform monorepo.

## Structure

```
apps/
  web/      Public portfolio site (React + Vite + Tailwind)
  admin/    Admin dashboard (React + Vite + Tailwind)
  api/      REST API (Node + Express + TypeScript)
packages/
  ui/              Shared React components
  api-client/      Typed API client
  shared-types/    Shared TypeScript types
  validation/      Shared Zod schemas
  eslint-config/   Shared ESLint configuration
```

## Prerequisites

- Node.js >= 20
- npm >= 10

## Setup

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/admin/.env.example apps/admin/.env
```

## Database

```bash
npm run db:up        # Start PostgreSQL (Docker)
npm run db:migrate   # Apply Prisma migrations
npm run db:seed      # Seed sample data
```

See [docs/database/README.md](docs/database/README.md) for schema details.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start web, admin, and API in parallel |
| `npm run dev:web` | Start public site (port 5173) |
| `npm run dev:admin` | Start admin dashboard (port 5174) |
| `npm run dev:api` | Start API server (port 3001) |
| `npm run build` | Build all packages and apps |
| `npm run typecheck` | Type-check all workspaces |
| `npm run lint` | Lint the monorepo |
| `npm run format` | Format with Prettier |

## Environment Variables

See `.env.example` files in each app:

- `apps/api/.env.example` — server port, CORS, logging
- `apps/web/.env.example` — API URL, app name
- `apps/admin/.env.example` — API URL, app name
