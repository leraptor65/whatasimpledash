#!/bin/sh
set -e

# Define the path for the user's configuration file
CONFIG_FILE="/app/config/services.yml"

# Check if the config file does NOT exist
if [ ! -f "$CONFIG_FILE" ]; then
    echo "--> No services.yml found. Creating a sample file..."
    # Copy the default sample config into the user's config volume
    cp /app/config.sample.yml "$CONFIG_FILE"
    # Make the new file writable by any user
    chmod 666 "$CONFIG_FILE"
    echo "--> Sample services.yml created at .$CONFIG_FILE with open permissions."
fi

# Execute the main container command passed to the script
exec "$@"