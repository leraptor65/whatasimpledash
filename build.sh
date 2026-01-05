#!/bin/bash

# Clear the terminal before running.
clear

# This script stops and rebuilds the 'whatasimpledash' project using Docker Compose,
# and performs a clean build to ensure no cache issues.

# --- Step 1: Stop and remove the project's containers, networks, and volumes ---
echo "--- Stopping and removing old containers, networks, and volumes... ---"
sudo docker compose -f docker-compose.dev.yml down --volumes --remove-orphans

# --- Step 2: Build the project from a completely clean state ---
echo "--- Building fresh images without using cache... ---"
# --no-cache: ensures that Docker does not use any cache layers from previous builds
sudo docker compose -f docker-compose.dev.yml build --no-cache

if [ $? -ne 0 ]; then
    echo "Error: Docker build failed."
    exit 1
fi

# --- Step 3: Start the new containers in detached mode ---
echo "--- Starting the new containers... ---"
sudo docker compose -f docker-compose.dev.yml up -d

echo "--- Build complete. Access the app at http://localhost:3000 ---"
echo "--- To view logs, run: sudo docker compose -f docker-compose.dev.yml logs -f ---"

