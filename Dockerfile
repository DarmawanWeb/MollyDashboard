# syntax=docker/dockerfile:1.7
# Molly Dashboard as a small standalone Next.js image (docker-compose.yml, deploy/deploy.sh).
# NEXT_PUBLIC_* are inlined at build time: they are build arguments, not runtime variables.
ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1 LEFTHOOK=0
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

FROM base AS builder
ARG NEXT_PUBLIC_ROSBRIDGE_URL=ws://localhost:9090
ARG NEXT_PUBLIC_VIDEO_SERVER_URL=http://localhost:8080
ARG NEXT_PUBLIC_USE_MOCKS=false
ENV NEXT_PUBLIC_ROSBRIDGE_URL=$NEXT_PUBLIC_ROSBRIDGE_URL \
    NEXT_PUBLIC_VIDEO_SERVER_URL=$NEXT_PUBLIC_VIDEO_SERVER_URL \
    NEXT_PUBLIC_USE_MOCKS=$NEXT_PUBLIC_USE_MOCKS
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build

FROM node:${NODE_VERSION} AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:3000/monitor || exit 1
CMD ["node", "server.js"]
