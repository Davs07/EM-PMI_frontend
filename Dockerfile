# ========================================
# Dockerfile para EM-PMI Frontend (Next.js)
# Multi-stage build optimizado para producción
# ========================================

# ----------------------------------------
# Stage 1: Dependencias
# ----------------------------------------
FROM node:20-alpine AS deps

# Instalar libc6-compat para compatibilidad con Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# ----------------------------------------
# Stage 2: Builder
# ----------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para el build
# Estas pueden ser sobrescritas en tiempo de build con --build-arg
ARG NEXT_PUBLIC_API_URL="http://localhost:8080"

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Deshabilitar telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Build de producción
RUN pnpm build

# ----------------------------------------
# Stage 3: Runner (Producción)
# ----------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Variables de entorno de producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copiar archivos necesarios para producción
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Configurar permisos para el directorio de cache de Next.js
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar el build de Next.js con los permisos correctos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar al usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Comando de inicio
CMD ["node", "server.js"]
