# --- STAGE 1: Base image ---
FROM node:24-alpine AS base
WORKDIR /app

# --- STAGE 2: Install dependencies ---
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# --- STAGE 3: Build the application ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG BUILD_SECRET
RUN echo "$BUILD_SECRET" > /app/.env

RUN npm run build

# --- STAGE 4: Production runner ---
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]