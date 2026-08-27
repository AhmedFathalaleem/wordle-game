# Database

PostgreSQL schema managed with Prisma.

## Schema Overview

| Table | Purpose |
|-------|---------|
| `users` | Admin users with RBAC roles |
| `refresh_tokens` | HttpOnly refresh token store (hashed) |
| `categories` | Project categories |
| `projects` | Portfolio projects with publishing workflow |
| `project_images` | Project gallery images |
| `technologies` | Technology stack catalog |
| `project_technologies` | Many-to-many: projects ↔ technologies |
| `skill_categories` | Skill grouping (Frontend, Backend, etc.) |
| `skills` | Skills with proficiency levels |
| `certifications` | Professional certifications |
| `messages` | Contact form submissions |
| `social_links` | Social profile links |
| `site_settings` | Singleton site configuration |
| `audit_logs` | Admin mutation audit trail |

## Entity Relationships

```
users ──< refresh_tokens
users ──< projects (created_by, updated_by)
users ──< audit_logs
users ──< site_settings (updated_by)

categories ──< projects

projects ──< project_images
projects ──< project_technologies >── technologies

skill_categories ──< skills
```

## Local Setup

```bash
# Start PostgreSQL
npm run db:up

# Copy env and run migrations
cp apps/api/.env.example apps/api/.env
npm run db:migrate

# Seed sample data
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## Seed Credentials

| Field | Value |
|-------|-------|
| Email | `admin@portfolio.local` |
| Password | `Admin123!` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run db:up` | Start PostgreSQL via Docker Compose |
| `npm run db:down` | Stop PostgreSQL |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Apply migrations (dev) |
| `npm run db:seed` | Run seed script |
| `npm run db:studio` | Open Prisma Studio |

## Constraints

- **Partial unique indexes** on `users.email` and `projects.slug` where `deleted_at IS NULL` (allows slug/email reuse after soft delete)
- **One cover image per project** via partial unique index on `project_images(project_id)` where `is_cover = true`
- **Cascade deletes** on junction tables and child records
- **Restrict deletes** on project author FKs to preserve audit integrity
