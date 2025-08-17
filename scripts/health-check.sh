#!/bin/bash

echo "Mini Seller Console Health Check"
echo "=================================="

if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running"
    exit 1
fi

PROD_CONTAINER=$(docker-compose ps -q mini-seller-console 2>/dev/null)
DEV_CONTAINER=$(docker-compose ps -q mini-seller-console-dev 2>/dev/null)

if [ ! -z "$PROD_CONTAINER" ] && [ "$(docker inspect -f '{{.State.Running}}' $PROD_CONTAINER 2>/dev/null)" = "true" ]; then
    echo "Production container is running"
    echo "Testing production endpoint..."
    
    if curl -s -f http://localhost:3000 > /dev/null; then
        echo "Production app is responding at http://localhost:3000"
        PROD_HEALTHY=true
    else
        echo "Production app is not responding"
        PROD_HEALTHY=false
    fi
else
    echo "Production container is not running"
    PROD_HEALTHY=false
fi

if [ ! -z "$DEV_CONTAINER" ] && [ "$(docker inspect -f '{{.State.Running}}' $DEV_CONTAINER 2>/dev/null)" = "true" ]; then
    echo "Development container is running"
    echo "Testing development endpoint..."
    
    if curl -s -f http://localhost:5173 > /dev/null; then
        echo "Development app is responding at http://localhost:5173"
        DEV_HEALTHY=true
    else
        echo "Development app is not responding"
        DEV_HEALTHY=false
    fi
else
    echo "Development container is not running"
    DEV_HEALTHY=false
fi

echo ""
echo "Summary:"
if [ "$PROD_HEALTHY" = "true" ]; then
    echo "Production:  http://localhost:3000 (Ready for testing!)"
fi

if [ "$DEV_HEALTHY" = "true" ]; then
    echo "Development: http://localhost:5173 (Hot reload enabled)"
fi

if [ "$PROD_HEALTHY" = "false" ] && [ "$DEV_HEALTHY" = "false" ]; then
    echo "No containers running. Start with:"
    echo "   npm run docker:prod    (for production testing)"
    echo "   npm run docker:dev     (for development)"
fi

echo ""
