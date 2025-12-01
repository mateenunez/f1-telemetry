FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app/f1-telemetry
COPY package.json pnpm-lock.yaml ./
COPY .npmrc* ./
COPY .env* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
FROM node:20-alpine
WORKDIR /app/f1-telemetry
COPY package.json pnpm-lock.yaml ./
COPY .npmrc* ./
RUN npm install -g pnpm && pnpm install
COPY --from=builder /app/f1-telemetry/.next ./.next
COPY --from=builder /app/f1-telemetry/public ./public
ENV PORT 3000
# Expone el puerto que usa el front
EXPOSE 3000

# Producción
CMD ["pnpm", "run", "start"] 

# Desarrollo
# CMD ["pnpm", "run", "dev"]