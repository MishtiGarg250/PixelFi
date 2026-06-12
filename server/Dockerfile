# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

# Copy Prisma config BEFORE generate
COPY prisma.config.ts ./

RUN npm ci

COPY prisma ./prisma

RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

RUN npm run build


# Final Image
FROM node:22-alpine AS runner

WORKDIR /app

USER node

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/prisma ./prisma

# Copy Prisma config to runtime image too
COPY --from=builder --chown=node:node /app/prisma.config.ts ./prisma.config.ts

EXPOSE 5005

CMD ["node", "dist/index.js"]