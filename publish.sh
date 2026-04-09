#!/bin/bash

# Configuration
REPO="leraptor65/whatasimpledash"

echo "📦 Docker Hub Publishing Script for $REPO"
echo "------------------------------------------------"

# Prompt for version or tag
read -p "Enter version number (x.x.x) or tag name (e.g. testing): " TAG_INPUT

if [[ -z "$TAG_INPUT" ]]; then
    echo "❌ Error: No tag provided. Exiting."
    exit 1
fi

# Determine if it's a version number (x.x.x)
VERSION_REGEX="^[0-9]+\.[0-9]+\.[0-9]+$"

TAGS_TO_PUSH=()

if [[ $TAG_INPUT =~ $VERSION_REGEX ]]; then
    echo "🔍 Detected version number format ($TAG_INPUT)"
    TAGS_TO_PUSH+=("$TAG_INPUT")
    TAGS_TO_PUSH+=("latest")
else
    echo "🔍 Detected custom tag format ($TAG_INPUT)"
    TAGS_TO_PUSH+=("$TAG_INPUT")
fi

echo ""
echo "The following images will be tagged and pushed:"
for tag in "${TAGS_TO_PUSH[@]}"; do
    echo "  - $REPO:$tag"
done
echo ""

# Final Confirmation
read -p "Are you sure you want to push these to Docker Hub? (y/n): " CONFIRM

if [[ "$CONFIRM" != "y" ]]; then
    echo "🚫 Push cancelled by user."
    exit 0
fi

echo "🚀 Starting publish process..."

# Ensure we have a fresh build to tag from
echo "🔨 Building image..."
docker build -t "$REPO:local-build" .

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting push."
    exit 1
fi

# Tag and Push
for tag in "${TAGS_TO_PUSH[@]}"; do
    echo "🏷️  Tagging $REPO:$tag..."
    docker tag "$REPO:local-build" "$REPO:$tag"
    
    echo "📤 Pushing $REPO:$tag..."
    docker push "$REPO:$tag"
done

echo "✅ Successfully published tags: ${TAGS_TO_PUSH[*]}"
