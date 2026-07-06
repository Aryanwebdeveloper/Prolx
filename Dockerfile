# ─────────────────────────────────────────────────────────────
# Multi-stage Dockerfile — ensures production build + start
# Coolify will detect this file and use it automatically.
# ─────────────────────────────────────────────────────────────

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node --max-old-space-size=2048 node_modules/next/dist/bin/next build --webpack

# Stage 3: Production runner (smallest possible image)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy only what's needed to run
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/supabase ./supabase
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000

# IMPORTANT: this runs `next start` (production) — never `next dev`
CMD ["npm", "run", "start"]
