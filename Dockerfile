# ── 빌드 ─────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_PATH=/tmp/build.db
RUN npm run build

# ── 실행 ─────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
ENV DATABASE_PATH=/app/data/petfoodlab.db
RUN mkdir -p /app/data && chown -R node:node /app
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/drizzle ./drizzle
COPY --from=builder --chown=node:node /app/scripts ./scripts
USER node
EXPOSE 3000
VOLUME ["/app/data"]
CMD ["node", "server.js"]
