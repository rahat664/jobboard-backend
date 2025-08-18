# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps (clean, reproducible)
COPY package*.json ./
RUN npm ci

# Build
COPY . .
RUN npm run build

# Reinstall runtime deps only (drop dev deps)
RUN npm ci --omit=dev && npm cache clean --force

# ---- Runtime ----
FROM node:20-alpine
WORKDIR /app

# TLS certs (for MongoDB Atlas) + wget for healthcheck
RUN apk add --no-cache ca-certificates wget && update-ca-certificates

# Non-root user
RUN addgroup -S app && adduser -S app -G app

ENV NODE_ENV=production \
    PORT=8080

# Copy only what we need
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Healthcheck (expects GET /api/healthz)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/api/healthz || exit 1

EXPOSE 8080
USER app
CMD ["node", "dist/main.js"]
