#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Navigate to the project root
cd "$SCRIPT_DIR/.."

echo ">>> Starting Langfuse services..."
cd langfuse
docker compose up -d

echo ">>> Starting CER-Agent services..."
cd ..
docker compose -f docker-compose.base.yaml -f docker-compose.prod.yaml up -d

echo ">>> All services are up and running!"
