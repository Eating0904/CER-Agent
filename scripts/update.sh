#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Navigate to the project root
cd "$SCRIPT_DIR/.."

echo ">>> Updating Frontend..."
docker compose -f docker-compose.base.yaml -f docker-compose.prod.yaml up -d --build frontend

echo ">>> Updating Backend..."
docker compose -f docker-compose.base.yaml -f docker-compose.prod.yaml restart backend

echo ">>> Update completed successfully!"
