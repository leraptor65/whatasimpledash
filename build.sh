#!/bin/bash

# Configuration
IMAGE_NAME="leraptor65/whatasimpledash"

echo "🚀 Building WhatASimpleDash for local testing..."

# Build the image using Docker Compose (leverages build cache and settings)
docker compose build --build-arg BUILDKIT_INLINE_CACHE=1

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "You can start the dashboard with: docker compose up -d"
else
    echo "❌ Build failed. Please check the logs above."
    exit 1
fi
