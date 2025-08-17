#!/bin/bash

echo "Starting Mini Seller Console in Development Mode..."

if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "Building and starting development containers..."
docker-compose --profile dev up --build -d

echo "Waiting for development server to start..."
sleep 8

echo "Development server started successfully!"
echo "Access the application at: http://localhost:5173"
echo "Hot reload enabled - changes will be reflected automatically"
echo ""
echo "Commands:"
echo "  Stop containers:    docker-compose --profile dev down"
echo "  View logs:          docker-compose --profile dev logs -f"
echo "  Restart:            docker-compose --profile dev restart"
echo ""
