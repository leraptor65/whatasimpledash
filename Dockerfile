# Stage 1: Builder
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:20-slim AS runner
WORKDIR /app

# Install 'gosu' for easy user privilege dropping
RUN apt-get update && apt-get install -y gosu && rm -rf /var/lib/apt/lists/*

# Create the config directory within the image first
RUN mkdir -p /app/config

# Create a simple non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the entrypoint script and the sample config
COPY entrypoint.sh /app/entrypoint.sh
COPY config.sample.yml /app/config.sample.yml

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# The entrypoint will handle permissions and user switching
ENTRYPOINT ["/app/entrypoint.sh"]

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy built assets from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV HOSTNAME "0.0.0.0"
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]