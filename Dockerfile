# 1) Base with pnpm
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# 2) Dependencies layer
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# 3) Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disable telemetry for CI
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# 4) Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# copy only what's needed to run
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
# If you have next.config.js / middleware / etc., copy them too:
# COPY --from=build /app/next.config.js ./next.config.js

EXPOSE 3000
CMD ["node","node_modules/next/dist/bin/next","start","-p","3000"]
