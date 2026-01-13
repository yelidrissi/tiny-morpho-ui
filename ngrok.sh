#!/bin/bash

# Set your static ngrok domain here (get one free at https://dashboard.ngrok.com/domains)
NGROK_DOMAIN="${NGROK_DOMAIN:-}"

# Start Docker container if not running
if ! docker compose ps --status running | grep -q "app"; then
    echo "Starting Docker container..."
    docker compose up -d --build

    echo "Waiting for container to be ready..."
    sleep 3
fi

echo "Starting ngrok tunnel to http://localhost:8080..."

if [ -n "$NGROK_DOMAIN" ]; then
    ngrok http --domain="$NGROK_DOMAIN" 8080
else
    echo "(Tip: Set NGROK_DOMAIN env var for a static domain)"
    ngrok http 8080
fi
