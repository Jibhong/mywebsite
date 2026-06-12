# syntax=docker/dockerfile:1.4

# --- STAGE 1: Base image ---
FROM node:22-alpine AS base
# RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- STAGE 2: Install dependencies ---
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# --- STAGE 3: Build the application ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Cloud Run injects environment variables at runtime, but Next.js bakes 
# NEXT_PUBLIC_ vars into the client-side bundle at BUILD time.
# If you have NEXT_PUBLIC_ variables, uncomment and define them here:
# ENV NEXT_PUBLIC_MY_VAR=value

ENV NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyDgRIf7dZbCcxUmL7RXrA04E-hRt9DeZ5E"
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="portfolio-website-db-2cf7d.firebaseapp.com"
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID="portfolio-website-db-2cf7d"
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="portfolio-website-db-2cf7d.firebasestorage.app"
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="983966396927"
ENV NEXT_PUBLIC_FIREBASE_APP_ID="1:983966396927:web:292d4ed3580faa4c0477ca"
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-X1WD5D720H"

RUN --mount=type=secret,id=firebase cat /run/secrets/firebase > .env

RUN npm run build

# --- STAGE 4: Production runner ---
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set permissions for the prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Leverage Next.js standalone output tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

# The standalone build outputs a 'server.js' file that launches the app
CMD ["node", "server.js"]