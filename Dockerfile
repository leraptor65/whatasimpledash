# Stage 1: Builder - Installs dependencies and builds the application
FROM node:20-slim AS builder
WORKDIR /app

# Copy package files and install dependencies using npm
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source code and build the app
COPY . .
# The following line is needed if you're using Next.js 14+ with Turbopack in dev
# but building for production. If the build fails here, uncomment it.
# RUN npm install -g @turbo/codemod
RUN npm run build

# Stage 2: Runner - Runs the built application
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy only the necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000
ENV PORT=3000

# Command to run the app
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]