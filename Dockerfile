# ============================================
# Base image shared across build targets
# ============================================

ARG BUN_VERSION=1.2-slim

FROM oven/bun:${BUN_VERSION} AS base

WORKDIR /app

# Prisma needs OpenSSL at both build and runtime. Retry loop because
# Debian mirrors are flaky on Iranian networks.
RUN for i in 1 2 3 4 5; do \
        apt-get update && break || sleep 10; done \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# ============================================
# Stage 1: Install dependencies
# ============================================

FROM base AS dependencies

COPY package.json bun.lock ./

# Install without --frozen-lockfile: the repo carries a package-lock.json too,
# which can drift from bun.lock. Retries because npm registry manifests flake
# on Iranian networks. The trailing `test` is load-bearing — without it a
# fully-failed loop would exit 0 (from `sleep`) and mask the failure.
RUN --mount=type=cache,target=/root/.bun/install/cache \
    ok=0; for i in 1 2 3 4 5 6 7 8; do \
        if bun install; then ok=1; break; fi; \
        echo "RETRY_$i"; sleep 10; \
    done; test "$ok" = "1"

# ============================================
# Stage 2: Build Next.js application
# ============================================

FROM base AS builder

ARG DEPLOYMENT_VERSION=local-build
ARG PUBLIC_BASE_URL=http://94.183.176.101

# Next.js 16 Turbopack builds crash under Bun's runtime shim
# ("Expected CommonJS module to have a function wrapper" in
# next-server app-page-turbo.runtime.prod.js), and Debian's nodejs is
# too old for Prisma 7 (ERR_REQUIRE_ESM on Node 18). Borrow a modern
# node binary from the official image — no network needed.
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
ENV PATH="/usr/local/bin:${PATH}"

# Pre-seeded Prisma schema engine (binaries.prisma.sh is unreachable from
# Iranian networks). The .gz is committed to the repo (9 MB); decompress
# with node's built-in zlib — zero network at build time. Also benefits CI.
COPY docker-engines/schema-engine.gz /tmp/schema-engine.gz
RUN node -e "require('fs').writeFileSync('/usr/local/bin/schema-engine', require('zlib').gunzipSync(require('fs').readFileSync('/tmp/schema-engine.gz')))" \
    && chmod +x /usr/local/bin/schema-engine && rm /tmp/schema-engine.gz
ENV PRISMA_SCHEMA_ENGINE_BINARY=/usr/local/bin/schema-engine

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Generate Prisma client before the Next.js build so the standalone output
# can trace it correctly. Placeholder envs only exist so the build completes;
# real runtime values come from the VPS .env when containers start.
# Retry loop: binaries.prisma.sh DNS flakes on Iranian networks.
# NOTE: the trailing `test` is load-bearing — without it a fully-failed
# loop would exit 0 (from `sleep`) and mask the failure.
RUN export DATABASE_URL="postgresql://placeholder:placeholder@postgres:5432/placeholder?schema=public" \
    && ok=0; for i in 1 2 3 4 5 6 7 8; do \
        if ./node_modules/.bin/prisma generate; then ok=1; break; fi; \
        echo "RETRY_$i"; sleep 15; \
    done; test "$ok" = "1"

RUN export NODE_ENV=production \
    DATABASE_URL="postgresql://placeholder:placeholder@postgres:5432/placeholder?schema=public" \
    BETTER_AUTH_SECRET="build-placeholder-secret-build-placeholder-secret" \
    BETTER_AUTH_URL="http://94.183.176.101" \
    NEXT_PUBLIC_BETTER_AUTH_URL="${PUBLIC_BASE_URL}" \
    NEXT_PUBLIC_APP_URL="${PUBLIC_BASE_URL}" \
    ZARINPAL_KEY="placeholder" \
    CRON_SECRET="placeholder" \
    DEPLOYMENT_VERSION="${DEPLOYMENT_VERSION}" \
    && ./node_modules/.bin/next build

# ============================================
# Stage 3: Migration image
# ============================================

FROM base AS migrator

# node 22 + pre-seeded schema engine (same reasoning as builder stage).
# Without the node binary the CMD below would fail: bun base has no `node`.
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

# ============================================
# Stage 4: Run Next.js application
# ============================================

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# node binary is needed to run the Next.js standalone server.js. Borrow
# it from the official Node image — zero network, no flaky apt.
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node

COPY --from=builder --chown=bun:bun /app/public ./public

# Next.js cache directory (named volume mounts over this at runtime).
RUN mkdir -p .next/cache && chown -R bun:bun .next

# Uploads directory — replaced by a named volume in production. The app
# writes into public/uploads (see localUpload.ts), so the volume mounts there.
RUN mkdir -p public/uploads && chown -R bun:bun public/uploads

COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static

# Custom generated Prisma client (Prisma 7 output = ./lib/generated/prisma,
# NOT node_modules/.prisma). Tracing alone doesn't reliably include it, so
# copy it explicitly — proven necessary on this stack.
COPY --from=builder --chown=bun:bun /app/lib/generated/prisma ./lib/generated/prisma

USER bun

EXPOSE 3000

CMD ["node", "server.js"]
