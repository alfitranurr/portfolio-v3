# ==================== Stage 1: Base ====================
FROM node:20-alpine AS base
WORKDIR /app

# ==================== Stage 2: Dependencies ====================
# Install ALL deps (including dev) — builder needs typescript, tailwindcss, eslint, etc.
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm install --ignore-scripts

# ==================== Stage 3: Builder ====================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are inlined at BUILD time, not runtime.
# Pass them as build args so Supabase client works in the image.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ==================== Stage 4: Runner ====================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Buat user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output dari builder (hanya production deps, ~150MB)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
