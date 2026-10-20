# Deploy frontend lên VPS

Hai app Next.js (`workspace`, `marketing`) chạy bằng Docker Compose trên cùng VPS với API, deploy tự động bởi GitLab CI khi merge `develop` vào `main`. HTTPS do Nginx Proxy Manager (NPM) đảm nhận. Phần API, Postgres và chuẩn bị VPS xem [`../../be/docs/DEPLOY_VPS.md`](../../be/docs/DEPLOY_VPS.md).

## Kiến trúc

```text
Internet
  │ HTTPS (Let's Encrypt)
  ▼
Nginx Proxy Manager ── network: nginx-proxy-manager_default ──────────┐
  │ app.harrybox.cloud            → engli-tutor-workspace:3000         │
  │ harrybox.cloud, www.…         → engli-tutor-marketing:3002         │
  ▼                                                                    │
engli-tutor-workspace / engli-tutor-marketing (fe/docker-compose.yml)  │
  │ /api/* (route handler proxy cùng origin)                           │
  ▼                                                                    │
https://api.harrybox.cloud → engli-tutor-api (stack be/) ──────────────┘
```

| Container | Service | Port trên host | Ghi chú |
| --- | --- | --- | --- |
| `engli-tutor-workspace` | `workspace` | `127.0.0.1:3000` | App học, PWA |
| `engli-tutor-marketing` | `marketing` | `127.0.0.1:3002` | Landing page |

Mọi port chỉ bind `127.0.0.1`; truy cập từ ngoài đi qua NPM. Cả hai container join network `nginx-proxy-manager_default` để NPM gọi bằng **container name**.

Mỗi app là một image riêng, build từ cùng `Dockerfile` với `--build-arg APP=workspace|marketing` (Next.js `output: "standalone"`, chạy `node apps/<app>/server.js` bằng user `nextjs`).

## 1. Chuẩn bị VPS (một lần)

Làm theo mục 1 của [`be/docs/DEPLOY_VPS.md`](../../be/docs/DEPLOY_VPS.md#1-chuẩn-bị-vps-một-lần) (Docker, NPM, SSH key). Thêm cho frontend:

- Trỏ DNS `app.harrybox.cloud`, `harrybox.cloud`, `www.harrybox.cloud` (A record) về IP VPS.
- VPS đủ RAM cho `next build` (khuyến nghị ≥ 2 GB, hoặc thêm swap) — build chạy trực tiếp trên VPS.

## 2. GitLab CI Variables

| Variable | Notes |
| --- | --- |
| `SSH_PRIVATE_KEY_BASE64` | Private key deploy, base64 (`base64 -i ~/.ssh/id_ed25519`) |
| `VPS_USER`, `VPS_IP` | SSH target |
| `VPS_PATH` | Path tương đối với home, bắt đầu bằng `/` — ví dụ `/engli-tutor/fe` → `/home/<user>/engli-tutor/fe` |
| `ENV_WORKSPACE_BASE64` | `base64 -i apps/workspace/.env.production` (Masked + Protected) |
| `ENV_MARKETING_BASE64` | `base64 -i apps/marketing/.env.production` (Masked + Protected) |
| `DEPLOY_APPS` | **Không đặt cố định.** Chỉ truyền khi Run pipeline thủ công (mục 4) |

## 3. `.env.production`

Mỗi app một file (gitignored), tạo từ `apps/<app>/.env.local.example`. `Dockerfile` bắt buộc file này tồn tại lúc build; `docker-compose.yml` cũng nạp nó qua `env_file` lúc chạy.

> `NEXT_PUBLIC_*` được **bake vào bundle lúc `next build`**. Đổi biến này phải build lại image, restart không đủ.

`apps/workspace/.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://api.harrybox.cloud
NEXT_PUBLIC_SITE_URL=https://app.harrybox.cloud
NEXT_PUBLIC_MARKETING_URL=https://harrybox.cloud
GOOGLE_MAPS_API_KEY=<key>        # server-only, Places API (New)
```

`apps/marketing/.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://api.harrybox.cloud
NEXT_PUBLIC_APP_URL=https://app.harrybox.cloud   # build fail nếu là localhost
NEXT_PUBLIC_SITE_URL=https://harrybox.cloud
```

`NEXT_PUBLIC_AUTH_SAME_ORIGIN` không cần đặt — `next.config.ts` luôn bật (`true`). Bảng biến đầy đủ: phần Biến môi trường trong [`../README.md`](../README.md#biến-môi-trường). Backend phải có các origin trên trong `WEB_ORIGIN` / `LANDING_ORIGIN`.

Cập nhật biến môi trường:

```bash
base64 -i apps/workspace/.env.production | pbcopy   # dán vào ENV_WORKSPACE_BASE64
base64 -i apps/marketing/.env.production | pbcopy   # dán vào ENV_MARKETING_BASE64
```

rồi Run pipeline thủ công với `DEPLOY_APPS` (mục 4) — pipeline tự động không thấy thay đổi env.

## 4. Pipeline (`.gitlab-ci.yml`)

Pipeline chạy khi:

- **Tự động:** push lên `main` với commit title `Merge branch 'develop' …` (merge `develop` → `main`). Push thẳng lên `main` không kích hoạt.
- **Thủ công:** CI → Pipelines → Run pipeline trên `main`.

Job `deploy:vps`:

1. Xác định app cần deploy (xem bảng dưới); không có app nào → job xanh, in `No app changes — skip deploy`.
2. `rsync --delete` source lên `/home/$VPS_USER$VPS_PATH` (bỏ qua `.git`, `node_modules`, `.next`, `.env*`).
3. Ghi `apps/workspace/.env.production` và `apps/marketing/.env.production` từ biến base64 (`chmod 600`).
4. `docker compose up -d --build --no-deps --remove-orphans <apps>` + `docker image prune -f`. App không đổi vẫn chạy, không restart.
5. Poll `http://127.0.0.1:<port>/en` (3000 / 3002) tối đa 10 lần × 3s, chỉ cho app vừa deploy; fail → in 100 dòng log cuối và job đỏ.

### Chọn app cần build

So sánh `git diff --name-only HEAD^1 HEAD` (merge commit với commit trước đó trên `main`):

| File thay đổi | Build lại |
| --- | --- |
| `apps/workspace/**` | `workspace` |
| `apps/marketing/**` | `marketing` |
| `packages/**`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`, `Dockerfile`, `.dockerignore`, `docker-compose.yml` | cả hai |
| Chỉ docs, `README.md`, `.gitlab-ci.yml` | không deploy |
| Không lấy được diff | cả hai (an toàn) |

Ép deploy bằng tay (sau khi đổi env, hoặc build lại sau sự cố): Run pipeline, thêm variable `DEPLOY_APPS` = `workspace`, `marketing` hoặc `workspace marketing`.

## 5. Nginx Proxy Manager

| Field | Workspace | Marketing |
| --- | --- | --- |
| Domain Names | `app.harrybox.cloud` | `harrybox.cloud`, `www.harrybox.cloud` |
| Scheme | `http` | `http` |
| Forward Hostname / IP | `engli-tutor-workspace` | `engli-tutor-marketing` |
| Forward Port | `3000` | `3002` |
| Websockets Support | bật | bật |
| Block Common Exploits | bật | bật |
| SSL | Let's Encrypt, Force SSL, HTTP/2 | Let's Encrypt, Force SSL, HTTP/2 |

Kiểm tra:

```bash
curl -fsSI https://app.harrybox.cloud/en
curl -fsSI https://harrybox.cloud/en
```

## 6. Vận hành

```bash
cd ~/engli-tutor/fe                              # = /home/$VPS_USER$VPS_PATH

docker compose ps                                # trạng thái
docker compose logs -f --tail=200 workspace      # log (hoặc marketing)
docker compose restart workspace                 # restart, không build lại (env runtime như GOOGLE_MAPS_API_KEY)
docker compose up -d --build --no-deps workspace # build + chạy lại một app
docker compose up -d --build                     # build lại cả hai
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/en
```

Dọn dung lượng khi build cache phình to:

```bash
docker builder prune -f
docker image prune -af
```

### Rollback

Pipeline deploy theo source (không lưu image tag), nên rollback = `git revert` commit lỗi trên `develop` rồi merge `develop` → `main` lại. Thư mục trên VPS không có `.git` (rsync bỏ qua), nên không checkout bản cũ tại chỗ được; cần gấp thì rsync source đúng phiên bản từ máy local lên `/home/$VPS_USER$VPS_PATH` rồi `docker compose up -d --build --no-deps <app>`.

## Troubleshooting

| Triệu chứng | Nguyên nhân thường gặp |
| --- | --- |
| Pipeline không chạy sau khi push `main` | Không phải merge commit từ `develop` — merge qua MR hoặc Run pipeline thủ công |
| Job xanh nhưng site không đổi | Diff không chạm app nào (`No app changes — skip deploy`) — dùng `DEPLOY_APPS` |
| `Missing GitLab variable ENV_*_BASE64` | Chưa khai báo biến, hoặc biến Protected mà branch không protected |
| Build fail `Missing apps/<app>/.env.production` | Ghi env thất bại / sai `VPS_PATH` |
| Build fail `NEXT_PUBLIC_APP_URL must not be localhost` | `apps/marketing/.env.production` thiếu hoặc sai `NEXT_PUBLIC_APP_URL` |
| Build bị kill / `exit code 137` | VPS hết RAM khi `next build` — thêm swap hoặc RAM |
| Đổi `NEXT_PUBLIC_*` nhưng site vẫn giá trị cũ | Biến bake lúc build — build lại bằng `DEPLOY_APPS` |
| `network nginx-proxy-manager_default not found` | NPM chưa chạy / sai project name |
| `502 Bad Gateway` từ NPM | Forward hostname/port sai hoặc container đang build/restart |
| Lỗi CORS / không giữ được đăng nhập | Origin chưa có trong `WEB_ORIGIN` / `LANDING_ORIGIN` của API |
| PWA vẫn chạy bản cũ | Service worker cache — `sw.js` đã `no-cache`, đóng hết tab hoặc reload cứng |
