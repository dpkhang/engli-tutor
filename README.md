# LandingCraft frontend

Frontend is a pnpm workspace containing two Next.js applications and three shared packages.

## Workspaces

| Workspace | Package name | Purpose |
| --- | --- | --- |
| `apps/web` | `landing-page-generator-fe` | Authenticated workspace dashboard |
| `apps/landing-page-web` | `landing-page-web` | Public marketing and checkout site |
| `packages/api-client` | `@landing-page-generator/api-client` | Base Fetch client and interceptors |
| `packages/auth` | `@landing-page-generator/auth` | Better Auth client factory |
| `packages/ui` | `@landing-page-generator/ui` | Shared components and design tokens |

## Install

```bash
corepack enable
pnpm install:landing-page
```

Targeted installs:

```bash
pnpm install:web
pnpm install:landing
pnpm install:packages
```

Add an external dependency to both applications:

```bash
pnpm module:add date-fns
pnpm module:add vitest @testing-library/react --dev
```

## Development

```bash
pnpm dev:web       # http://localhost:3000
pnpm dev:landing   # http://localhost:3002
```

Environment files:

```bash
cp apps/web/.env.local.example apps/web/.env.local
cp apps/landing-page-web/.env.local.example apps/landing-page-web/.env.local
```

### Workspace environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend API origin |
| `NEXT_PUBLIC_MARKETING_URL` | Marketing site origin |

On Vercel, `apps/web/next.config.ts` enables same-origin `/api/:path*` rewrites to the backend.

### Marketing environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend API origin |
| `NEXT_PUBLIC_APP_URL` | Workspace origin |
| `NEXT_PUBLIC_SITE_URL` | Marketing origin |

### Production domain mapping

Use the following values for the `pagecraft-ai.site` deployment:

```text
# Workspace
NEXT_PUBLIC_API_URL=https://landing-generator-be.onrender.com
NEXT_PUBLIC_MARKETING_URL=https://pagecraft-ai.site

# Marketing
NEXT_PUBLIC_API_URL=https://landing-generator-be.onrender.com
NEXT_PUBLIC_APP_URL=https://app.pagecraft-ai.site
NEXT_PUBLIC_SITE_URL=https://pagecraft-ai.site
```

Both Vercel apps proxy `/api/*` to `NEXT_PUBLIC_API_URL`, allowing the browser to keep the shared
cookie first-party on `pagecraft-ai.site`. The backend must use matching `WEB_ORIGIN`,
`LANDING_ORIGIN`, and `AUTH_COOKIE_DOMAIN=.pagecraft-ai.site` values. Set `APP_URL` to
`https://app.pagecraft-ai.site` so Better Auth callbacks also return through the first-party proxy.

## API client architecture

```text
@landing-page-generator/api-client
  └── ApiClient
      ├── WorkspaceApiClient
      └── MarketingApiClient
```

`ApiClient` provides typed `get`, `post`, `put`, `patch`, `delete`, JSON serialization and request/response/error interceptors.

`WorkspaceApiClient` adds credentials, client identification and a `401` interceptor that redirects to `/login?returnTo=...`.

## Workspace routes

| Route | Feature |
| --- | --- |
| `/` | Dashboard overview |
| `/landing-pages` | Landing page management |
| `/landing-pages/new` | Detailed creation flow |
| `/pages/:id` | Landing page detail |
| `/templates` | Template CRUD |
| `/media` | Media metadata CRUD |
| `/leads` | Lead management |
| `/statistics` | Workspace statistics |
| `/domains` | Custom domains |
| `/payments` | Billing UI |
| `/accounts` | Account UI |
| `/settings` | Workspace settings |

## Commands

| Command | Description |
| --- | --- |
| `pnpm build:pkg` | Build all shared packages |
| `pnpm build` | Build packages and both apps |
| `pnpm lint` | Typecheck apps and packages |
| `pnpm ci:web` | Package build + workspace lint/build |
| `pnpm ci:landing` | Package build + marketing lint/build |
| `pnpm ci:packages` | Typecheck/build packages |
| `pnpm deploy:web:prod` | Deploy workspace to Vercel |
| `pnpm deploy:landing:prod` | Deploy marketing to Vercel |

## Formatting

```bash
pnpm exec oxfmt --write apps packages
pnpm exec oxfmt --check apps packages
```

Configuration: `.oxfmtrc.json`.

## Vercel setup

Create two Vercel projects from this workspace:

| Project | Root Directory |
| --- | --- |
| Workspace | `apps/web` |
| Marketing | `apps/landing-page-web` |

Required CI variables:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID_WEB
VERCEL_PROJECT_ID_LANDING
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_MARKETING_URL
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SITE_URL
```

The token, org ID and project IDs must belong to the same Vercel scope.
