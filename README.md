# EngliTutor frontend (`fe`)

pnpm workspace: hai app Next.js + ba package dùng chung. Marketing site định vị EngliTutor (AI English tutor); workspace vẫn là dashboard tạo/xuất bản landing page.

## Workspaces

| Workspace | Package name | Purpose |
| --- | --- | --- |
| `apps/workspace` | `engli-tutor-fe` | Workspace dashboard (auth) |
| `apps/marketing` | `engli-tutor-web` | Marketing + checkout |
| `packages/api-client` | `@engli-tutor/api-client` | Fetch client + interceptors |
| `packages/auth` | `@engli-tutor/auth` | Better Auth client factory |
| `packages/ui` | `@engli-tutor/ui` | Shared components / tokens |

## Install

```bash
corepack enable
pnpm install:landing-page
```

Targeted:

```bash
pnpm install:workspace
pnpm install:marketing
pnpm install:packages
```

Thêm dependency cho cả hai app:

```bash
pnpm module:add date-fns
pnpm module:add vitest @testing-library/react --dev
```

## Development

```bash
pnpm dev:workspace   # http://localhost:3000
pnpm dev:marketing   # http://localhost:3002
```

Env:

```bash
cp apps/workspace/.env.local.example apps/workspace/.env.local
cp apps/marketing/.env.local.example apps/marketing/.env.local
```

### Workspace (`apps/workspace`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend origin |
| `NEXT_PUBLIC_MARKETING_URL` | Marketing site origin |
| `GOOGLE_MAPS_API_KEY` | Server-only key for Google Places address autocomplete |

Browser gọi `/api/*` same-origin; Next proxy/route forward tới `NEXT_PUBLIC_API_URL` để cookie first-party.

### Marketing (`apps/marketing`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend origin |
| `NEXT_PUBLIC_APP_URL` | Workspace origin |
| `NEXT_PUBLIC_SITE_URL` | Marketing origin |

### Production (`pagecraft-ai.site`)

```text
# Workspace + Marketing (GitLab CI / Vercel)
NEXT_PUBLIC_API_URL=https://api.harrybox.cloud
NEXT_PUBLIC_MARKETING_URL=https://pagecraft-ai.site
NEXT_PUBLIC_APP_URL=https://app.pagecraft-ai.site
NEXT_PUBLIC_SITE_URL=https://pagecraft-ai.site
```

Backend (Fly) cần khớp `WEB_ORIGIN`, `LANDING_ORIGIN`, `AUTH_COOKIE_DOMAIN=.pagecraft-ai.site`.  
Ưu tiên `APP_URL=https://app.pagecraft-ai.site` khi auth đi qua first-party FE proxy.

## AI landing + hero image

Wizard `/landing-pages/new`:

1. Brief + frame → `POST /api/landing-pages/generate`
2. BE tạo copy + (nếu `imageGeneration`) banner R2
3. Redirect `/demo/:slug` — hero dùng `content.media.heroImageUrl`
4. Asset cũng xuất hiện trong **Thư viện media** (`/media`)

UI đọc `GET /api/meta/integrations`:

| Flag | Ý nghĩa |
| --- | --- |
| `openai` | Đủ key generate copy |
| `imageGeneration` | OpenAI + R2 + public URL — hero banner |
| `r2` | R2 credentials có mặt |

Thiếu R2 write permission → generate vẫn ra page, không có ảnh (xem [be/README.md](../be/README.md)).

## API client

```text
@engli-tutor/api-client
  └── ApiClient
      ├── WorkspaceApiClient   # credentials + 401 → /login
      └── MarketingApiClient
```

## Workspace routes

| Route | Feature |
| --- | --- |
| `/` | Dashboard |
| `/landing-pages` | Danh sách |
| `/landing-pages/new` | Wizard AI / manual |
| `/demo/:slug` | Preview AI landing |
| `/pages/:id` | Chi tiết / editor |
| `/templates` | Templates |
| `/media` | Media library (gồm hero AI) |
| `/leads` | Leads |
| `/statistics` | Stats |
| `/domains` | Domains |
| `/payments` | Billing |
| `/accounts` | Account |
| `/settings` | Settings |

## Commands

| Command | Description |
| --- | --- |
| `pnpm build:pkg` | Build packages |
| `pnpm build` | Packages + cả hai apps |
| `pnpm lint` | Typecheck |
| `pnpm ci:workspace` | Workspace lint/build |
| `pnpm ci:marketing` | Marketing lint/build |
| `pnpm deploy:workspace:prod` | Deploy workspace → Vercel |
| `pnpm deploy:marketing:prod` | Deploy marketing → Vercel |

## Formatting

```bash
pnpm exec oxfmt --write apps packages
pnpm exec oxfmt --check apps packages
```

Config: `.oxfmtrc.json`.

## Docs

- Layout variants: [`../be/docs/AI_LANDING_LAYOUT_VARIANTS.md`](../be/docs/AI_LANDING_LAYOUT_VARIANTS.md)
- Backend / R2: [`../be/README.md`](../be/README.md)
- Monorepo overview: [`../README.md`](../README.md)

## Vercel

Hai project từ repo `fe`:

| Project | Root Directory |
| --- | --- |
| Workspace | `apps/workspace` |
| Marketing | `apps/marketing` |

CI variables: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_WEB`, `VERCEL_PROJECT_ID_LANDING`, cùng các `NEXT_PUBLIC_*` ở trên.

> Cloudflare Workers: monorepo cần **Root directory** = `apps/workspace` hoặc `apps/marketing` (không để `/`). Repo hiện deploy chính qua Vercel; OpenNext/Workers cần adapter riêng.
