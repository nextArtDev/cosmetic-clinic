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
# which can drift from bun.lock. GitHub Actions has a clean network and resolves
# dependencies fine; a frozen check here breaks on that drift.
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install

# ============================================
# Stage 2: Build Next.js application
# ============================================

FROM base AS builder

ARG DEPLOYMENT_VERSION=local-build
ARG PUBLIC_BASE_URL=http://94.183.176.101

# Next.js 16 Turbopack builds crash under Bun's runtime shim
# ("Expected CommonJS module to have a function wrapper" in
# next-server app-page-turbo.runtime.prod.js). Install deps with Bun,
# but run prisma generate + next build with real Node.
RUN for i in 1 2 3 4 5; do \
        apt-get update && break || sleep 10; done \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Generate Prisma client before the Next.js build so the standalone output
# can trace it correctly. Placeholder envs only exist so the build completes;
# real runtime values come from the VPS .env when containers start.
RUN DATABASE_URL="postgresql://placeholder:placeholder@postgres:5432/placeholder?schema=public" \
    npx prisma generate

RUN export NODE_ENV=production \
    DATABASE_URL="postgresql://placeholder:placeholder@postgres:5432/placeholder?schema=public" \
    BETTER_AUTH_SECRET="build-placeholder-secret-build-placeholder-secret" \
    BETTER_AUTH_URL="http://94.183.176.101" \
    NEXT_PUBLIC_BETTER_AUTH_URL="${PUBLIC_BASE_URL}" \
    NEXT_PUBLIC_APP_URL="${PUBLIC_BASE_URL}" \
    ZARINPAL_KEY="placeholder" \
    CRON_SECRET="placeholder" \
    DEPLOYMENT_VERSION="${DEPLOYMENT_VERSION}" \
    && npx next build

# ============================================
# Stage 3: Migration image
# ============================================

FROM base AS migrator

COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json prisma.config.ts ./
COPY prisma ./prisma

CMD ["npx", "prisma", "migrate", "deploy"]

# ============================================
# Stage 4: Run Next.js application
# ============================================

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# node binary is needed to run the Next.js standalone server.js.
# Retry loop because Debian mirrors are flaky on Iranian networks.
RUN for i in 1 2 3 4 5; do \
        apt-get update && break || sleep 10; done \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

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
