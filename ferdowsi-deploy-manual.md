# Ferdowsi VPS Deploy Manual — Next.js 16 + Prisma 7 + Bun + better-auth + PostgreSQL

**Stack:** Next.js 16.3 (Turbopack) · Bun (install) + Node 22 (build/run) · Prisma 7
(driver adapters, custom client output) · better-auth (phone OTP) · PostgreSQL 17 ·
nginx · GitHub Actions → ghcr.io → Ferdowsi Cloud VPS · GitHub Release / git-branch
image seeding as fallback.

This manual is the successor of `vps-deploy-manual.md` (written for the
kosar-localized stack). It documents everything that bit us on THIS stack —
follow it in order and you will not repeat our two-day debugging session.

## 0. Architecture (same as before, one addition)

```
Visitors → CDN → Ferdowsi VPS (port 80 only)
                 ├── nginx  → /uploads/* from disk, else → http://app:3000
                 ├── app    → Next.js standalone (node server.js)
                 ├── postgres (internal)
                 └── migrate (one-shot, ops profile)

GitHub (private repo) → Actions builds runner+migrator → ghcr.io
VPS pulls images (authenticated) → migrate → up
```

**Iranian-network reliability table (measured, Sept 2026):**

| Path | From home PC | From Ferdowsi VPS |
|---|---|---|
| github.com / api.github.com | ✅ fast | ✅ ~250 KB/s, stable |
| ghcr.io registry API | ⚠️ via proxy only | ✅ reachable, needs auth |
| ghcr.io pulls (authenticated) | ✅ via proxy | ✅ works (per-layer resume!) |
| npm registry | ⚠️ flaky, retries fix it | n/a (never install on VPS) |
| binaries.prisma.sh | ⚠️ flaky | ❌ effectively unreachable |
| release-assets / objects.githubusercontent.com | ✅ | ❌ **fully blocked (timeout)** |
| scp home→VPS | 46 KB/s — unusable for images | — |
| VPS git fetch from github.com | — | ✅ ~500 KB/s parallel |

Consequences that shape this manual:
1. **Never depend on release-asset downloads from the VPS** (§5.2 of the old
   manual is dead on this network — the CDN hosts time out).
2. **ghcr.io + authenticated pull is the primary image transport** — it works
   from the VPS and Docker resumes per layer.
3. **The Docker build must survive with almost no network** — pre-seed
   everything flaky, retry everything else.

## 1. One-Time: VPS Setup (Ferdowsi)

Identical to the old manual §1: swap (2 GB), SSH hardening (file MUST be
named `00-...` to beat cloud-init), UFW (22/80/443), Docker via get.docker.com.
Key different from last time: this VPS had **3.8 GB RAM** — still add swap.

```bash
# swap
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
echo 'vm.swappiness=20' | sudo tee /etc/sysctl.d/99-swap.conf && sudo sysctl -p /etc/sysctl.d/99-swap.conf

# ssh hardening (/etc/ssh/sshd_config.d/00-hardening.conf, then reload;
# verify with a NEW session before closing the old one)
# PasswordAuthentication no / KbdInteractiveAuthentication no /
# PermitRootLogin no / LoginGraceTime 15 / MaxStartups 30:30:200

# ufw: allow OpenSSH, 80/tcp, 443/tcp; enable
# docker: curl -fsSL https://get.docker.com | sudo sh; usermod -aG docker ubuntu
```

Passwordless deploy key (passphrase-less ed25519, from your Windows PC):

```powershell
ssh-keygen -t ed25519 -f "$HOME\.ssh\id_ed25519_deploy" -N '' -C "deploy"
# then append the .pub to the VPS ~/.ssh/authorized_keys (ONE password prompt,
# or paste it directly if you already have a VPS shell open)
```

> Windows gotcha: bare `ssh` may resolve to a broken
> `C:\Windows\System32\ssh` stub. Always call
> `C:\Windows\System32\OpenSSH\ssh.exe` (and `scp.exe`) by full path in scripts.

## 2. Server Directory Layout (`/srv/<app>/`, NOT a git clone)

```
docker-compose.prod.yml   # server-side compose
.env                      # RUNTIME secrets (chmod 600, never committed)
.deploy.env               # APP_IMAGE= / MIGRATION_IMAGE= tags to run
nginx.conf                # mounted into nginx container
```

`.env` for this stack (better-auth, NOT Auth.js — different var names!):

```
DATABASE_URL=postgresql://<user>:<pass>@postgres:5432/<db>?schema=public
POSTGRES_DB=<db>
POSTGRES_USER=<user>
POSTGRES_PASSWORD=<pass>          # generate: 24 random alphanumerics

BETTER_AUTH_SECRET=<64 hex chars>
BETTER_AUTH_URL=http://<VPS-IP>            # or https://domain when you have one
NEXT_PUBLIC_BETTER_AUTH_URL=http://<VPS-IP>  # BAKED at build — rebuild to change!
NEXT_PUBLIC_APP_URL=http://<VPS-IP>          # BAKED at build — rebuild to change!

APP_TIMEZONE=Asia/Tehran
ZARINPAL_KEY=<merchant uuid>
GATEWAY_AMOUNT_MULTIPLIER=1
CRON_SECRET=<anything>
MELI_PAYAMAK_USERNAME= / MELI_PAYAMAK_PASSWORD= / MELI_PAYAMAK_FROM=
OPENAI_API_KEY= / OPENAI_BASE_URL= / OPENAI_MODEL=
```

`.deploy.env`:

```
APP_IMAGE=<app>:latest
MIGRATION_IMAGE=<app>:migrate-latest
```

`docker-compose.prod.yml` and `nginx.conf` — same shape as the old manual,
with two differences for this stack:
- uploads volume mounts at **`/app/public/uploads`** (see §3.5), nginx
  `alias /data/uploads/` for `/uploads/`.
- `env_file: [.env]` on app AND migrate (missing it = 500s, same as before).

## 3. Repository Requirements (THIS is where the new stack bites)

### 3.1 `next.config.mjs` — standalone output is NOT default

```js
const nextConfig = {
  output: 'standalone',   // REQUIRED: produces .next/standalone/server.js
  ...
}
```

Without it the Docker build fails at `COPY --from=builder /app/.next/standalone`
("not found") — and the failure only shows up AFTER the 5-minute build.

### 3.2 Dockerfile — the full recipe

Four stages: `dependencies` (bun install) → `builder` (Node: generate+build)
→ `migrator` (Node: migrate deploy) → `runner` (Node: server.js).
**Zero `apt-get` anywhere** — Debian mirrors are unusable from here.

```dockerfile
ARG BUN_VERSION=1.2-slim
FROM oven/bun:${BUN_VERSION} AS base
WORKDIR /app
# NOTE: no apt. Prisma 7 (adapter-pg + WASM compiler) needs no libssl,
# and node is borrowed below instead of apt-installed.

FROM base AS dependencies
COPY package.json bun.lock ./
# No --frozen-lockfile if the repo also carries package-lock.json (they drift).
# Honest retry loop: the trailing `test` is LOAD-BEARING — without it a
# fully-failed loop exits 0 (from `sleep`) and masks the failure.
RUN --mount=type=cache,target=/root/.bun/install/cache \
    ok=0; for i in 1 2 3 4 5 6 7 8; do \
        if bun install; then ok=1; break; fi; \
        echo "RETRY_$i"; sleep 10; \
    done; test "$ok" = "1"

FROM base AS builder
ARG DEPLOYMENT_VERSION=local-build
ARG PUBLIC_BASE_URL=http://<VPS-IP>
# WHY node, not bun, not Debian nodejs:
# - `bun run build` crashes Next 16 Turbopack builds
#   ("Expected CommonJS module to have a function wrapper" in
#   app-page-turbo.runtime.prod.js — a Bun shim bug).
# - Debian's nodejs is v18 → Prisma 7 dies with ERR_REQUIRE_ESM.
# Borrowing the binary needs no network at all:
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
ENV PATH="/usr/local/bin:${PATH}"

# Pre-seeded Prisma schema engine (binaries.prisma.sh is unreachable from
# Iranian networks). Commit ONLY the .gz (~9 MB); decompress with node's
# built-in zlib — zero network at build time. Helps CI too.
# Get it once on a good network:
#   https://binaries.prisma.sh/all_commits/<enginesVersion>/debian-openssl-3.0.x/schema-engine.gz
# (enginesVersion = commit hash in the generate error, or
# node_modules/@prisma/engines-version). Verify the .sha256!
COPY docker-engines/schema-engine.gz /tmp/schema-engine.gz
RUN node -e "require('fs').writeFileSync('/usr/local/bin/schema-engine', require('zlib').gunzipSync(require('fs').readFileSync('/tmp/schema-engine.gz')))" \
    && chmod +x /usr/local/bin/schema-engine && rm /tmp/schema-engine.gz
ENV PRISMA_SCHEMA_ENGINE_BINARY=/usr/local/bin/schema-engine

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
# export (not bare VAR=...) so the value reaches the child process;
# honest retry loop (see above for why `test` matters):
RUN export DATABASE_URL="postgresql://placeholder:placeholder@postgres:5432/placeholder?schema=public" \
    && ok=0; for i in 1 2 3 4 5 6 7 8; do \
        if ./node_modules/.bin/prisma generate; then ok=1; break; fi; \
        echo "RETRY_$i"; sleep 15; \
    done; test "$ok" = "1"

# Placeholder envs only so the build completes; real values come from VPS .env.
# NEXT_PUBLIC_* are BAKED into client bundles — changing them = rebuild.
RUN export NODE_ENV=production \
    DATABASE_URL="postgresql://placeholder:placeholder@postgres:5432/placeholder?schema=public" \
    BETTER_AUTH_SECRET="build-placeholder-secret-build-placeholder-secret" \
    BETTER_AUTH_URL="http://<VPS-IP>" \
    NEXT_PUBLIC_BETTER_AUTH_URL="${PUBLIC_BASE_URL}" \
    NEXT_PUBLIC_APP_URL="${PUBLIC_BASE_URL}" \
    ZARINPAL_KEY="placeholder" \
    CRON_SECRET="placeholder" \
    DEPLOYMENT_VERSION="${DEPLOYMENT_VERSION}" \
    && ./node_modules/.bin/next build

FROM base AS migrator
# Same node + engine seeding (bun base has no `node`, and CMD needs it):
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
ENV PATH="/usr/local/bin:${PATH}"
COPY docker-engines/schema-engine.gz /tmp/schema-engine.gz
RUN node -e "require('fs').writeFileSync('/usr/local/bin/schema-engine', require('zlib').gunzipSync(require('fs').readFileSync('/tmp/schema-engine.gz')))" \
    && chmod +x /usr/local/bin/schema-engine && rm /tmp/schema-engine.gz
ENV PRISMA_SCHEMA_ENGINE_BINARY=/usr/local/bin/schema-engine
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json prisma.config.ts ./
COPY prisma ./prisma
CMD ["node", "./node_modules/.bin/prisma", "migrate", "deploy"]

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=builder --chown=bun:bun /app/public ./public
RUN mkdir -p .next/cache public/uploads && chown -R bun:bun .next public/uploads
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static
# Prisma 7 custom output (schema `output = "../lib/generated/prisma"`),
# NOT node_modules/.prisma — copy explicitly, tracing alone misses it:
COPY --from=builder --chown=bun:bun /app/lib/generated/prisma ./lib/generated/prisma
USER bun
EXPOSE 3000
CMD ["node", "server.js"]
```

### 3.3 `.dockerignore` — mandatory (same as before, plus generated paths)

```
node_modules
.next
.git
.env
.env.*
!.env.example
public/uploads
uploads
*.md
*.tar
*.tgz
.DS_Store
generated
lib/generated
app/generated
tsconfig.tsbuildinfo
```

(~10 MB context instead of 1.6 GB.)

### 3.4 `.gitignore` additions for this stack

```
/lib/generated/        # regenerated by `prisma generate` (also in Docker)
/.screenshots/
*.tar
*.tgz
```

Never commit: generated Prisma client, screenshots, image archives.
(Rationale: the 4.7 MB `query_compiler_fast_bg.wasm-base64.js` alone was
pushing packs over the HTTP-408 cliff — see §6.)

### 3.5 Uploads live in `public/uploads` — mount the volume THERE

`localUpload.ts` writes to `process.cwd()/public/uploads` and serves
`/uploads/<file>` URLs. So the compose volume MUST be
`uploads_data:/app/public/uploads` (NOT `/app/uploads` like kosar), and
nginx aliases `/uploads/` → `/data/uploads/`.

### 3.6 Kill build-time database access

Any page that queries Prisma during `next build` fails the build (the DB
only exists on the VPS). Two rules:
- Layouts of DB-backed sections get `export const dynamic = 'force-dynamic'`
  (dashboard is auto-dynamic via `headers()` in auth; add it to home/chrome
  and v1 layouts).
- `generateStaticParams` must never throw at build time — wrap in
  try/catch returning `[]` (with force-dynamic, slugs render on demand anyway).

### 3.7 Do NOT use Git LFS for site assets

98 LFS-tracked images/fonts broke CI (`actions/checkout` doesn't fetch LFS
objects by default → build saw pointer text → image decode errors).
Site assets totalled ~20 MB — plain git handles that fine.
Fix if inherited: `git lfs migrate export --everything` then remove the
filter lines from `.gitattributes`.

### 3.8 Workflow (`.github/workflows/deploy.yml`)

Build `runner` → `:latest`+`:sha`, build `migrator` → `:migrate-latest`
(lowercase image path, `packages: write`), plus an active `deploy:` job
(`needs: build`) that SSHes into the VPS and releases (rollback tag → pull
with retries → tag → `run --rm migrate` → `up -d` → smoke `curl`).
Full CI/CD: every push to `main` goes live with zero terminal work.

### 3.9 Auto-deploy secrets debugging (read when the deploy job fails)

Secrets live at repo → **Settings → Secrets and variables → Actions**:
`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` (a dedicated automation private key
whose public half is in the VPS `authorized_keys`).

Hard-won lessons:

1. **Secret values are write-only.** GitHub never shows them again — opening
   a secret for edit shows an empty box. That proves NOTHING about whether
   the value is correct. Verify by behavior (re-run), never by looking.
2. **`attempted methods [none]` = the key arrived EMPTY.** The SSH action never
   even tried auth. Cause is always on the GitHub side: secret name mismatch
   (exact, case-sensitive, no trailing spaces) or an empty/whitespace value.
   Fix: delete + recreate the secret, then **Re-run failed jobs** (no push needed).
3. **`VPS_SSH_KEY` must be the ENTIRE key file**, from
   `-----BEGIN OPENSSH PRIVATE KEY-----` through `-----END OPENSSH PRIVATE KEY-----`
   inclusive, no extra lines. Pasting only the middle gibberish = invalid key.
   Print it with `Get-Content $HOME\.ssh\id_ed25519_deploy` (PowerShell) or
   `type "%USERPROFILE%\.ssh\id_ed25519_deploy"` (CMD — `$HOME`/`Get-Content`
   don't exist in CMD).
4. **Re-run, don't re-push:** Actions tab → failed run → Re-run jobs →
   Re-run failed jobs. Green `build` is reused; only `deploy` re-runs.
5. **Read runs like this:** repo → Actions tab → run row per push → `build` +
   `deploy` jobs → per-step logs. `workflow_dispatch` on the workflow page
   triggers a manual run (handy for testing secrets without a code change).

## 4. ghcr.io Authentication (do this FIRST, before release day)

Private repo → package is born **private** → anonymous VPS pulls get
`denied`. Two options, either works:

**A. Make the package public** (profile → Packages → package → Package
settings → Danger Zone → Change visibility → Public; you MUST type the
package name to confirm — the change silently doesn't save otherwise).
Repo stays private; only the compiled image is pullable.

**B. PAT + docker login on the VPS** (what we used):
github.com/settings/tokens → classic token → tick ONLY `read:packages` →
on the VPS: `echo '<PAT>' | docker login ghcr.io -u <user> --password-stdin`.
Verify scope from any machine before release day:
`X-OAuth-Scopes` must list `read:packages` (empty = you forgot the checkbox;
GitHub answers 403 "You need at least read:packages scope").

Then on the VPS (ghcr is reachable; Docker resumes per layer):

```bash
cd /srv/<app>
docker pull ghcr.io/<owner>/<repo>:latest
docker pull ghcr.io/<owner>/<repo>:migrate-latest
docker tag ghcr.io/<owner>/<repo>:latest $(grep APP_IMAGE .deploy.env | cut -d= -f2)
docker tag ghcr.io/<owner>/<repo>:migrate-latest $(grep MIGRATION_IMAGE .deploy.env | cut -d= -f2)
```

## 5. Release Day Procedure

```bash
# 0. pre-flight: Actions green on main, previous image tagged :rollback
# 1. migrations (only when prisma/ changed):
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml run --rm migrate
# 2. release:
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml up -d
# 3. smoke test:
sleep 15 && curl -so /dev/null -w "%{http_code}\n" http://127.0.0.1/
docker logs <app>-app-1 --tail 15   # expect "Ready", no exceptions
```

## 6. When ghcr.io Is Hostile: Image-Seed Fallback Ladder

(In order of preference. All verified Sept 2026.)

1. **Retry the pull** — ghcr flakes ~50% (TLS timeouts); `for i in 1..5` loop.
2. **Authenticated pull** (§4.B) — fixes `denied`, survives visibility mistakes.
3. **Local build + git-branch seed** (used for this project's first release):
   build both targets locally → `docker save` → gzip → split into **≤16 MB**
   parts (larger blobs die with HTTP 408 on push) → one commit per part on an
   orphan `image-seed` branch (pushing one commit at a time; each ≤16 MB pack
   survives) → VPS `git fetch`es the branch (github.com does ~500 KB/s
   parallel from the VPS) → reassemble → md5 check → `tar -xzf` → `docker load`
   → tag → release as §5. Delete the branch + local archives afterwards.
   - Do NOT use GitHub Release assets for this: `release-assets` and
     `objects.githubusercontent.com` time out 100% from Ferdowsi IPs, while
     `api.github.com`/`github.com`/`codeload`/`raw` all work.
   - Do NOT scp images home→VPS (≈46 KB/s → hours for a 500 MB image).
4. **Emergency scp** (§5.3 old manual) — only for small images.

## 7. Failure Modes Seen on This Stack (additions to the old table)

| Symptom | Cause | Fix |
|---|---|---|
| `bun install --frozen-lockfile` fails in CI | repo has bun.lock + package-lock.json drift | plain `bun install` + honest retry loop |
| `next build` dies: Turbopack CJS wrapper error | built with Bun runtime | build with real Node 22 (§3.2) |
| `prisma generate` wants binaries.prisma.sh, EAI_AGAIN | engine download unreachable | pre-seeded engine + `PRISMA_SCHEMA_ENGINE_BINARY` |
| `ERR_REQUIRE_ESM` from prisma CLI | Debian nodejs v18 too old | borrowed node:22 binary |
| Next build: "Can't resolve '@/lib/generated/prisma'" | generate silently failed (masked by retry loop ending in `sleep`→exit 0) | honest loop with trailing `test` (§3.2) |
| Next build: image decode errors (RIFF/PNG-signature) | LFS pointer text checked out instead of images | remove LFS (§3.7) |
| "Failed to collect page data" at build | page queries DB with placeholder URL | force-dynamic + safe generateStaticParams (§3.6) |
| `COPY /app/.next/standalone: not found` | `output:'standalone'` missing | §3.1 |
| ghcr pull `denied` after `Login Succeeded` | PAT lacks `read:packages` | §4.B (check `X-OAuth-Scopes`) |
| ghcr pull `unauthorized` anonymously | package still private | §4.A (type the name to confirm!) |
| git push dies HTTP 408 | pack >~20 MB on this network | keep pushes small; never commit tars/engines-uncompressed |

## 8. Maintenance / Rollback / Backups

Same as old manual: `:rollback` tag before each release; nightly
`pg_dump` via cron + dashboard snapshots; `docker image prune -f`;
`compose logs -f app`. Pre-deploy checklist and "never do" list unchanged
(never build on the VPS, never apt on the VPS, never bind-mount code over images).
