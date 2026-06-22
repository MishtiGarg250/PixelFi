# =========================
# Build Stage
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma.config.ts ./

RUN npm ci

COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Verify Prisma output exists
RUN ls -R dist/generated/prisma

# =========================
# Runtime Stage
# =========================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled app
COPY --from=builder /app/dist ./dist

# Copy prisma schema
COPY --from=builder /app/prisma ./prisma

# Copy prisma config
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# IMPORTANT:
# Copy generated Prisma client separately
COPY --from=builder /app/dist/generated ./dist/generated

EXPOSE 5005

CMD ["node", "dist/index.js"]