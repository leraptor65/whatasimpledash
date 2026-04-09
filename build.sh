#!/bin/bash

# Configuration
IMAGE_NAME="leraptor65/whatasimpledash"

echo "🚀 Building WhatASimpleDash for local testing..."

# Build the image using Docker Compose (leverages build cache and settings)
docker compose -f docker-compose.dev.yml build --build-arg BUILDKIT_INLINE_CACHE=1

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Starting the dashboard..."
    docker compose -f docker-compose.dev.yml up -d
    
    if [ $? -eq 0 ]; then
        echo "✨ Dashboard is running at http://localhost:3000"
    else
        echo "❌ Failed to start the dashboard."
        exit 1
    fi
else
    echo "❌ Build failed. Please check the logs above."
    exit 1
fi
