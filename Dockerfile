# Dependencias
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app/f1-telemetry
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
COPY .npmrc* ./
RUN pnpm install --frozen-lockfile

# Build
FROM node:20-alpine AS builder
WORKDIR /app/f1-telemetry
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=deps /app/f1-telemetry/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API
ARG NEXT_PUBLIC_WS
ARG NEXT_PUBLIC_LINKEDIN_URL
ARG NEXT_PUBLIC_GITHUB_URL
ARG NEXT_PUBLIC_DISCORD_INVITE_URL
ENV NEXT_PUBLIC_API=$NEXT_PUBLIC_API
ENV NEXT_PUBLIC_WS=$NEXT_PUBLIC_WS
ENV NEXT_PUBLIC_LINKEDIN_URL=$NEXT_PUBLIC_LINKEDIN_URL
ENV NEXT_PUBLIC_GITHUB_URL=$NEXT_PUBLIC_GITHUB_URL
ENV NEXT_PUBLIC_DISCORD_INVITE_URL=$NEXT_PUBLIC_DISCORD_INVITE_URL
RUN pnpm run build

# Prod
FROM node:20-alpine AS runner
WORKDIR /app/f1-telemetry
ENV NODE_ENV production
ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1
COPY --from=builder /app/f1-telemetry/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/f1-telemetry/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/f1-telemetry/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]