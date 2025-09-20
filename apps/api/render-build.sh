#!/bin/bash
set -e

echo "Starting Render build for API..."

# Clean install without running scripts
echo "Installing dependencies..."
npm ci --include=dev --ignore-scripts --force || npm install --include=dev --ignore-scripts --force

# Build the application
echo "Building NestJS application..."
npx @nestjs/cli build

echo "Build complete!"