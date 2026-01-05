#!/bin/bash

# This script builds, tags, and pushes your dashboard image to Docker Hub,
# and also creates a corresponding Git tag.

# --- Configuration ---
DOCKERHUB_USERNAME="leraptor65"
IMAGE_NAME="whatasimpledash"
# ---------------------

# Check for 'testing' argument
if [ "$1" = "testing" ]; then
    echo "--- Building and tagging for testing (WITHOUT CACHE) ---"
    sudo docker build --no-cache -t $DOCKERHUB_USERNAME/$IMAGE_NAME:testing .

    if [ $? -ne 0 ]; then
        echo "Docker build failed. Aborting."
        exit 1
    fi

    echo "--- Logging in to Docker Hub... ---"
    sudo docker login

    echo "--- Pushing 'testing' tag to Docker Hub... ---"
    sudo docker push $DOCKERHUB_USERNAME/$IMAGE_NAME:testing

    echo "--- Testing publish complete! ---"
    exit 0
fi

# --- Standard Version Workflow ---

# Grab version from package.json using grep/cut to avoid node dependency on host
VERSION=$(grep -m1 '"version":' package.json | cut -d '"' -f 4)

if [ -z "$VERSION" ]; then
    echo "Could not detect version from package.json. Aborting."
    exit 1
fi

echo "Detected version: $VERSION"
read -p "Do you want to publish version $VERSION? (y/n) " -n 1 -r
echo    # move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 1
fi

echo "--- Building and tagging image as $DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION and :latest (WITHOUT CACHE) ---"

# Build the image and apply both the version tag and the 'latest' tag
sudo docker build --no-cache -t $DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION -t $DOCKERHUB_USERNAME/$IMAGE_NAME:latest .

# Check if the build was successful
if [ $? -ne 0 ]; then
    echo "Docker build failed. Aborting."
    exit 1
fi

echo "--- Logging in to Docker Hub... ---"
sudo docker login

echo "--- Pushing version $VERSION to Docker Hub... ---"
sudo docker push $DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION

echo "--- Pushing 'latest' tag to Docker Hub... ---"
sudo docker push $DOCKERHUB_USERNAME/$IMAGE_NAME:latest

echo "--- Creating and pushing Git tag v$VERSION... ---"
# Check if tag already exists
if git rev-parse "v$VERSION" >/dev/null 2>&1; then
    echo "Tag v$VERSION already exists. Skipping git tag creation."
else
    git tag "v$VERSION"
    git push origin "v$VERSION"
fi

echo "--- Publish complete! ---"