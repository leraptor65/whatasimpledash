#!/bin/bash

# Configuration
DOCKERHUB_USERNAME="leraptor65"
IMAGE_NAME="whatasimpledash"

# Function to get latest semver tag from Docker Hub (ignoring 'latest' and 'testing')
get_latest_known_version() {
    # Fetch tags, parse names, filter out latest/testing, allow only standard version formats roughly or everything else
    # We take the head -n 1 after filtering
    curl -s "https://hub.docker.com/v2/repositories/$DOCKERHUB_USERNAME/$IMAGE_NAME/tags/?page_size=20" | \
    grep -o '"name": *"[^"]*"' | \
    sed 's/"name": *//;s/"//g' | \
    grep -vE "^latest$|^testing$" | \
    head -n 1
}

# 1. Determine Initial Target Version from Arguments
TARGET_VERSION=""
ARG_1="$1"

echo "--- Checking Docker Hub for latest version... ---"
LATEST_KNOWN=$(get_latest_known_version)
if [ -z "$LATEST_KNOWN" ]; then LATEST_KNOWN="none"; fi
echo "Latest published version: $LATEST_KNOWN"
echo ""

if [ -n "$ARG_1" ]; then
    # User provided an argument
    if [[ "$ARG_1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || [ "$ARG_1" == "testing" ]; then
        TARGET_VERSION="$ARG_1"
    else
        echo "!!! Invalid option/label provided: $ARG_1 !!!"
        echo "Please provide a valid version number (x.x.x) or 'testing'."
        # Fall through to prompt
    fi
fi

# 2. Main Confirmation Loop
while true; do
    # If no version set (or was invalid), ask for it
    if [ -z "$TARGET_VERSION" ]; then
        echo "Enter the version to publish (e.g. 2.0.1) or 'testing':"
        read -p "> " TARGET_VERSION
    fi

    # Validate input again just in case (optional but good UI)
    if [[ ! "$TARGET_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] && [ "$TARGET_VERSION" != "testing" ]; then
        echo "Warning: '$TARGET_VERSION' does not look like a standard version number or 'testing'."
    fi

    echo ""
    echo "=========================================="
    echo "  Target Version : $TARGET_VERSION"
    echo "=========================================="
    read -p "Proceed with this version? (y/n) " -n 1 -r REPLY
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        break # User confirmed
    else
        # User said No
        echo "Aborted upgrade to $TARGET_VERSION."
        echo "What tag do you want to use instead?"
        TARGET_VERSION="" # Clear variable to trigger prompt in next loop iteration
    fi
done

# 3. Execution
echo ""
echo "--- Starting Build Process for: $TARGET_VERSION ---"

# Build Command
sudo docker build --no-cache -t $DOCKERHUB_USERNAME/$IMAGE_NAME:$TARGET_VERSION .
if [ $? -ne 0 ]; then
    echo "Docker build failed. Aborting."
    exit 1
fi

# Login
echo "--- Logging in to Docker Hub... ---"
sudo docker login

# Push Target
echo "--- Pushing $TARGET_VERSION to Docker Hub... ---"
sudo docker push $DOCKERHUB_USERNAME/$IMAGE_NAME:$TARGET_VERSION

# Handle 'latest' tag (only if not testing)
if [ "$TARGET_VERSION" != "testing" ]; then
    echo "--- Tagging and Pushing 'latest' ---"
    sudo docker tag $DOCKERHUB_USERNAME/$IMAGE_NAME:$TARGET_VERSION $DOCKERHUB_USERNAME/$IMAGE_NAME:latest
    sudo docker push $DOCKERHUB_USERNAME/$IMAGE_NAME:latest
    
    echo "--- Creating Git Tag v$TARGET_VERSION ---"
    if git rev-parse "v$TARGET_VERSION" >/dev/null 2>&1; then
        echo "Git tag v$TARGET_VERSION already exists. Skipping."
    else
        git tag "v$TARGET_VERSION"
        git push origin "v$TARGET_VERSION"
    fi
else
    echo "--- Skipping 'latest' tag and Git tag for 'testing' build ---"
fi

echo "--- Publish complete! ---"
