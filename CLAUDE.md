# Viber Street

AI Vibe Coding documentation marketplace platform.

## Architecture

Monorepo with 4 apps:
- `apps/api` - Hono API on Cloudflare Workers (D1 + R2)
- `apps/web` - User storefront (React + Vite) → viberstreet.com
- `apps/dev-portal` - Developer portal (React + Vite) → dev.viberstreet.com
- `apps/admin` - Admin dashboard (React + Vite) → admin.viberstreet.com
- `packages/shared` - Shared TypeScript types

## Quick Start

```bash
# Install deps
cd apps/api && npm install
cd apps/web && npm install
cd apps/dev-portal && npm install
cd apps/admin && npm install

# Run API locally
cd apps/api && npm run dev

# Run frontends (each in separate terminal)
cd apps/web && npm run dev          # port 5173
cd apps/dev-portal && npm run dev   # port 5174
cd apps/admin && npm run dev        # port 5175
```

## Database

D1 SQLite. Schema in `apps/api/schema.sql`. Apply with:
```bash
cd apps/api && npx wrangler d1 execute viberstreet-db --local --file=./schema.sql
```

## Deployment (Cloudflare)

```bash
# API Worker
cd apps/api && npx wrangler deploy

# Frontend Pages
cd apps/web && npm run build && npx wrangler pages deploy dist --project-name=viberstreet-web
cd apps/dev-portal && npm run build && npx wrangler pages deploy dist --project-name=viberstreet-dev-portal
cd apps/admin && npm run build && npx wrangler pages deploy dist --project-name=viberstreet-admin
```

## Environment Variables

Set in `apps/api/wrangler.toml` or via Cloudflare dashboard:
- JWT_SECRET
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
- STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET
- RESEND_API_KEY

## Key Flows

1. **Developer submits product** → creates product + version (status: pending_review)
2. **Admin reviews** → approves or rejects with note
3. **Developer publishes** → product goes live (requires approved version)
4. **User downloads** → free: direct download + email; paid: Stripe checkout first
5. **Admin revokes** → product auto-unpublished
