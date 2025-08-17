#!/bin/bash

echo "Starting Mini Seller Console with Docker..."

if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "Building and starting containers..."
docker-compose up --build -d

echo "Waiting for application to start..."
sleep 5

echo "Application started successfully!"
echo "Access the application at: http://localhost:3000"
echo ""
echo "Commands:"
echo "  Stop containers:    docker-compose down"
echo "  View logs:          docker-compose logs -f"
echo "  Restart:            docker-compose restart"
echo ""
