#!/bin/bash
set -e

echo "Starting Render build for Web..."

# Clean install without running scripts
echo "Installing dependencies..."
npm ci --include=dev --ignore-scripts --force || npm install --include=dev --ignore-scripts --force

# Build the application
echo "Building Next.js application..."
next build

echo "Build complete!"