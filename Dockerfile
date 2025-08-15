# Stage 1: Builder
FROM node:20-slim AS builder
WORKDIR /app

# First, copy only package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Then, copy the rest of the application source code
COPY . .

# Run the build
RUN npm run build

# Stage 2: Runner
FROM node:20-slim AS runner
WORKDIR /app

# This ARG receives the group ID from docker-compose.yml
ARG DOCKER_GROUP_ID

# Create user and groups
RUN addgroup --system --gid ${DOCKER_GROUP_ID:-999} docker && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs --ingroup docker nextjs

# Set the new user
USER nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy built assets from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# This new line copies the config directory into the final image as a fallback
COPY --chown=nextjs:nodejs ./config ./config

ENV HOSTNAME "0.0.0.0"
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]