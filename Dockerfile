# ===================================================
# Dockerfile for TT-talking-twice (现经管回声)
# ===================================================

FROM node:20-alpine AS base

# Install dumb-init & curl for proper signal handling and health check
RUN apk add --no-cache dumb-init curl tzdata

ENV NODE_ENV=production \
    PORT=6999 \
    TZ=Asia/Shanghai

WORKDIR /app

# Copy dependency manifests first for build layer caching
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --only=production --ignore-scripts || npm install --production

# Copy application sources
COPY . .

# Ensure data directory exists and set permissions
RUN mkdir -p server/data/class-uploads && \
    chown -R node:node /app

# Use non-root node user for container security
USER node

# Expose server listening port
EXPOSE 6999

# Container healthcheck using Node built-in or curl
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://127.0.0.1:${PORT}/ || exit 1

# dumb-init handles PID 1 signal forwarding (SIGINT/SIGTERM) gracefully
ENTRYPOINT ["dumb-init", "--"]

# Default start command runs app (which automatically handles database migration)
CMD ["node", "server/app.js"]
