# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/scripts run seed` — seed the database (products, categories, reviews, plans, admin users, coupons)

## Aamras Storefront + Admin Console

- **Storefront**: `artifacts/mango-shop` — mobile-first React+Vite shop at `/` (mango-yellow theme).
- **Admin Console**: `artifacts/mango-shop/src/admin/*` mounted at `/admin/*` (emerald-green theme, dark mode).
  - Login: `admin@aamras.com` / `admin123` (super_admin) or `staff@aamras.com` / `staff123` (staff).
  - Pages: Dashboard, Products, Orders, Customers, Coupons, Analytics.
  - Auth: HMAC-signed HttpOnly cookie session (`aamras_admin`) backed by `admin_users` table; `requireAdmin` middleware on all `/api/admin/*` routes.
- **API admin routes** (`artifacts/api-server/src/routes/admin-*.ts`): products CRUD, orders + status updates, customers (aggregated from orders), coupons CRUD, analytics overview (revenue series, top products, low stock, recent orders, payment breakdown).
- **DB additions**: `admin_users`, `coupons`, plus `products.tags` and `products.isActive`.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
