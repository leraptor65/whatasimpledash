# Stage 1: Build the Next.js Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application (Static Export)
# Note: We need to ensure 'output: export' is set in next.config.mjs
# For now, we assume the user/code will update config shortly.
RUN npm run build

# Stage 2: Build the Go Backend
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app

# Copy Go module files
COPY go.mod ./

# Copy Go source (needed for go mod tidy)
COPY . .

# Download dependencies and generate go.sum
RUN go mod tidy

# Build the binary
# CGO_ENABLED=0 creates a statically linked binary suitable for scratch
RUN CGO_ENABLED=0 GOOS=linux go build -o whatasimpledash .

# Stage 3: Final Production Image
FROM alpine:latest
WORKDIR /app

# Install basic certificates for external API calls (Weather)
RUN apk --no-cache add ca-certificates

# Copy the binary from the backend builder
COPY --from=backend-builder /app/whatasimpledash .

# Copy the static frontend assets from the frontend builder
# Next.js 'output: export' writes to 'out' by default
COPY --from=frontend-builder /app/out ./public

# Copy the entrypoint script if needed, or other config defaults
COPY config.sample.yml ./config.sample.yml

# Create necessary directories
RUN mkdir -p config public/icons public/backgrounds public/uploads

# Expose port
EXPOSE 3000

# Run the binary
CMD ["./whatasimpledash"]