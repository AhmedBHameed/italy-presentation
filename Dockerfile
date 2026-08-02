# syntax=docker/dockerfile:1

###############################################################################
# Stage 1 — install production dependencies only
###############################################################################
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund

###############################################################################
# Stage 2 — runtime image
###############################################################################
FROM node:20-alpine AS runtime

# wget (busybox) is used by HEALTHCHECK; tini reaps zombies and forwards signals.
RUN apk add --no-cache tini

ENV NODE_ENV=production \
    PORT=4041 \
    HOST=0.0.0.0

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY server.js ./
COPY src ./src
COPY scripts ./scripts
COPY public ./public

# Run unprivileged. The `node` user ships with the official image.
USER node

EXPOSE 4041

HEALTHCHECK --interval=30s --timeout=4s --start-period=5s --retries=3 \
  CMD wget -q -O- http://127.0.0.1:4041/healthz > /dev/null || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
