#!/bin/bash

set -e

echo "Starting E-Learning..."

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running!"
    echo "Please start Docker Desktop first."
    exit 1
fi

echo "Docker is running."

# Build only when requested
if [ "$1" = "--build" ]; then
    echo "Building Docker images..."
    docker compose build
fi

echo "Stopping old containers..."
docker compose down

echo "Starting services..."
docker compose up -d

echo ""
echo "Running containers:"
docker compose ps

echo ""
echo "E-Learning started successfully!"
echo ""
echo "Logs:"
echo "  docker compose logs -f"
echo ""
echo "Backend logs:"
echo "  docker compose logs -f be"
echo ""
echo "Frontend logs:"
echo "  docker compose logs -f fe"