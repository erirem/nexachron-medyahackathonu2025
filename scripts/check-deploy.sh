#!/bin/bash

echo "🔍 Checking deployment status..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API Health Check
echo "Checking API..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://nexachron-api.onrender.com/health)
if [ "$API_STATUS" = "200" ]; then
    echo -e "${GREEN}✓${NC} API is running (Status: $API_STATUS)"
    curl -s https://nexachron-api.onrender.com/health | jq '.'
else
    echo -e "${RED}✗${NC} API is down or not accessible (Status: $API_STATUS)"
fi

echo ""

# Frontend Check
echo "Checking Frontend..."
WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://nexachron-web.onrender.com)
if [ "$WEB_STATUS" = "200" ]; then
    echo -e "${GREEN}✓${NC} Frontend is running (Status: $WEB_STATUS)"
else
    echo -e "${RED}✗${NC} Frontend is down or not accessible (Status: $WEB_STATUS)"
fi

echo ""
echo "📊 Deployment Summary:"
echo "-------------------"
if [ "$API_STATUS" = "200" ] && [ "$WEB_STATUS" = "200" ]; then
    echo -e "${GREEN}All services are operational!${NC}"
else
    echo -e "${YELLOW}Some services need attention.${NC}"
    echo "Check Render Dashboard for logs: https://dashboard.render.com"
fi