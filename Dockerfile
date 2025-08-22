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

# The config directory will be created by the volume mount
RUN mkdir -p /app/config

# Copy the entrypoint script and the sample config
COPY entrypoint.sh /app/entrypoint.sh
COPY config.sample.yml /app/config.sample.yml

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# The entrypoint will handle creating a sample config if needed
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