# Portfolio staging image — multi-stage build for Next.js 13 (App Router)
# Build:  docker build -t portfolio-staging .
# Run:    see docs in scripts/staging-runner.sh or the run command in the repo wiki

# ---- deps (all, for build tools: typescript/tailwind/eslint) -------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- builder --------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Staging notes layer is baked in at build time (NEXT_PUBLIC_* is inlined)
ARG NEXT_PUBLIC_STAGING_NOTES=on
ENV NEXT_PUBLIC_STAGING_NOTES=$NEXT_PUBLIC_STAGING_NOTES
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx next build

# ---- runner (production deps only) ---------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package.json next.config.js middleware.ts next-env.d.ts tsconfig.json ./

# Notes store lives here (mount a host dir to persist across rebuilds)
RUN mkdir -p /app/.staging
ENV STAGING_NOTES_DIR=/app/.staging

EXPOSE 3000
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
