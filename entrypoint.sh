#!/bin/sh
set -e

# Take ownership of the config directory, which is mounted from the host
chown -R nextjs:nodejs /app/config

# Define the path for the user's configuration file
CONFIG_FILE="/app/config/services.yml"

# Check if the config file does NOT exist
if [ ! -f "$CONFIG_FILE" ]; then
    echo "--> No services.yml found. Creating a sample file..."
    # Copy the default sample config into the user's config volume
    cp /app/config.sample.yml "$CONFIG_FILE"
    echo "--> Sample services.yml created at .$CONFIG_FILE"
fi

# Switch to the 'nextjs' user and execute the main container command
exec gosu nextjs "$@"