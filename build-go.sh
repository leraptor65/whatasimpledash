#!/bin/bash

# Clear the terminal
clear

echo "--- Building Go Version (leraptor65/whatasimpledash:go-dev) ---"
# Build using the Dockerfile (which is now the Go multistage one)
# We avoid sudo here; run the script with sudo if needed.
docker build -t leraptor65/whatasimpledash:go-dev .

if [ $? -ne 0 ]; then
    echo "ERROR: Docker build failed!"
    exit 1
fi

echo "--- Cleaning up old dev container ---"
docker stop whatasimpledash-go-dev 2>/dev/null
docker rm whatasimpledash-go-dev 2>/dev/null

echo "--- Starting Container on Port 8081 ---"
# Map host 8081 to container 3000 to avoid conflicts with main dev instance
docker run -d \
  --name whatasimpledash-go-dev \
  -p 8081:3000 \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/public/icons:/app/public/icons \
  -v $(pwd)/public/uploads:/app/public/uploads \
  leraptor65/whatasimpledash:go-dev

echo "--- Build Success! ---"
echo "Access the app at: http://localhost:8081"
echo ""
echo "Streaming logs (Ctrl+C to stop logs, container remains running)..."
docker logs -f whatasimpledash-go-dev
