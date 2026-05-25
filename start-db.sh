#!/bin/bash

# Script to start PostgreSQL with Podman

echo "🚀 Starting PostgreSQL database with Podman..."

# Ensure podman socket is running
if ! systemctl --user is-active --quiet podman.socket; then
    echo "📡 Starting Podman socket..."
    systemctl --user start podman.socket
    sleep 2
fi

# Start containers
echo "🐘 Starting PostgreSQL container..."
podman compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Check if container is running
if podman ps | grep -q mvp-postgres; then
    echo "✅ PostgreSQL is running!"
    echo ""
    echo "📊 Container status:"
    podman ps --filter name=mvp-postgres
    echo ""
    echo "🔗 Connection string:"
    echo "   postgresql://user:password@localhost:5432/mydb"
    echo ""
    echo "💡 Useful commands:"
    echo "   podman compose logs -f       # View logs"
    echo "   podman compose down          # Stop database"
    echo "   podman compose restart       # Restart database"
else
    echo "❌ Failed to start PostgreSQL"
    echo "📋 Checking logs..."
    podman compose logs
    exit 1
fi