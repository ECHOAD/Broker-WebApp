# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Run production build
```

There are no lint or test scripts configured.

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Architecture

**Carlos Realto** is a premium real estate broker webapp for the Dominican Republic market. UI language is Spanish throughout.

### Stack
- Next.js 16 App Router, React 19, TypeScript 6
- Tailwind CSS v4 (configured via `postcss.config.mjs`, tokens in `globals.css` `@theme inline` block)
- Supabase (PostgreSQL + Auth + Storage)

### Route Map
| Route | Role | Description |
|-------|------|-------------|
| `/` | Public | Editorial homepage |
| `/catalogo` | Public | Property catalog with filters |
| `/propiedades/[slug]` | Public | Property detail page |
| `/favoritos` | Authenticated | Saved properties |
| `/login` | Public | Magic link auth |
| `/admin` | `broker_admin` | CRM + inventory management |
| `/auth/confirm` | System | OTP/code exchange callback |
| `/api/public-leads` | Public API | Lead capture POST endpoint |

### Supabase Client Patterns

Two client factories — use the correct one:

- **`lib/supabase/public.ts`** → `createPublicClient()`: For public-facing reads (catalog, property detail, lead submission). Uses anon key, no session.
- **`lib/supabase/server.ts`** → `createClient()`: For server components and Server Actions that need the authenticated user's session (cookies-based).
- **`lib/supabase/proxy.ts`** → `updateSession()`: Used in middleware to refresh auth cookies on each request.

### Data Layer

`lib/properties.ts` is the central data access module for properties. It fetches raw DB rows and transforms them into `PropertyCardData` / `PropertyDetailData` shapes — resolving project relationships, property types, cover images (from Supabase Storage), price labels, and area strings. All formatting is locale `"es-DO"`.

`lib/site-data.ts` contains static seed/mock data (legacy from before Supabase was wired up).

### Admin Panel

`/admin` is a single Server Component page (`app/admin/page.tsx`) that:
1. Guards with `broker_admin` role check (redirects to `/login` if unauthenticated)
2. Fetches all data in parallel (`Promise.all`)
3. Computes derived state (pipeline counts, selected items from URL `?lead=`, `?project=`, `?property=` params)
4. Renders three panels: lead pipeline, lead detail, and inventory editor (projects + properties)

All mutations are Server Actions in `app/admin/actions.ts`:
- `updateLeadStatus`, `upsertProject`, `archiveProject`, `upsertProperty`, `hideProperty`
- Each calls `requireBrokerAdmin()` before touching the DB
- After mutation: `revalidatePath("/admin")` + `redirect(...)` back to admin with preserved URL params

### Lead Capture Flow

`POST /api/public-leads` (Route Handler, no auth required):
1. Validates form fields
2. Inserts a `leads` row (source: `"public_form"`, status: `"new"`)
3. Inserts a `lead_property_interests` row linking lead to property
4. Returns `{ ok: true, redirectUrl }` where `redirectUrl` is a `wa.me` deep link

### Database Schema Summary

Key tables: `properties`, `projects`, `property_types`, `property_media`, `profiles`, `leads`, `lead_property_interests`, `lead_status_history`, `favorites`

Key enums: `app_role` (`broker_admin` | `client_user`), `lead_status` (9 pipeline stages), `listing_mode` (`sale` | `rent` | `sale_rent`), `property_status` (`available` | `reserved` | `sold` | `rented` | `hidden`), `project_status` (`draft` | `published` | `archived`)

Database migrations are in `supabase/migrations/`.

### Component Structure

- `components/ui/` — base primitives (shadcn-style): Badge, Button, Card, Input, Label, NativeSelect, Textarea
- `components/shared/` — reusable app-level: EmptyState, FormField, PageIntro, SelectionLink, SnapshotGrid
- `components/admin/` — admin-only: AdminPrimitives, LeadDetailPanel, ProjectEditor, PropertyEditor
- `components/catalog/` — catalog page components
- `components/layout/site-page.tsx` — `<SitePage>` wraps every page with `<SiteHeader>`, `<main>`, `<SiteFooter>`

### CSS Conventions

Tailwind v4 with CSS custom properties. Semantic layout classes are defined directly in `globals.css` (e.g., `.section`, `.eyebrow`, `.admin-grid`, `.admin-card`, `.page-shell`). Prefer these over ad-hoc Tailwind utilities for structural layout. Component variants use `class-variance-authority`.

### Slug Generation

Admin actions auto-generate slugs from name/title using NFD normalization + ASCII reduction. The `slugify()` helper lives in `app/admin/actions.ts`.
