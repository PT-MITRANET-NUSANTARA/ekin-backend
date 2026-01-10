# Multi-stage Dockerfile for NestJS (production)
FROM node:22-slim AS builder

WORKDIR /app

# Install dependencies first (cached)
COPY package*.json ./
RUN npm ci

# Copy sources and build
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src
# COPY gema-ai-899a0-firebase-adminsdk-fbsvc-662366d8ba.json ./firebase-admin.json
# COPY gema-ai-899a0-firebase-adminsdk-fbsvc-662366d8ba.json ./gema-ai-899a0-firebase-adminsdk-fbsvc-662366d8ba.json
COPY README.md ./
RUN npm run build

# Prune dev dependencies to keep production small
RUN npm prune --production

FROM node:22-slim AS runner
LABEL org.opencontainers.image.title="ekin-backend"
LABEL org.opencontainers.image.description="Ekin backend"
ENV NODE_ENV=production
WORKDIR /app

# Copy only what we need to run
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/firebase-admin.json ./firebase-admin.json
# COPY --from=builder /app/gema-ai-899a0-firebase-adminsdk-fbsvc-662366d8ba.json ./gema-ai-899a0-firebase-adminsdk-fbsvc-662366d8ba.json
COPY package*.json ./

# Expose HTTP app and microservice ports
EXPOSE 3000
EXPOSE 3001

# Start the NestJS app
CMD ["node", "dist/main.js"]
