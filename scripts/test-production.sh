#!/bin/bash

# Production API Test Script
# Usage: ./scripts/test-production.sh

API_BASE="https://nexachron-api.onrender.com"
WEB_BASE="https://nexachron-web.onrender.com"

echo "🧪 Testing Nexachron Production APIs"
echo "=================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

test_endpoint() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    echo -e "\n${BLUE}Testing: $name${NC}"
    echo "URL: $url"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$url")
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ Status: $http_code${NC}"
        if [ ${#body} -gt 200 ]; then
            echo "Response: ${body:0:200}..."
        else
            echo "Response: $body"
        fi
    else
        echo -e "${RED}❌ Status: $http_code (expected: $expected_status)${NC}"
        echo "Response: $body"
    fi
}

# Wait for deployment
echo "⏳ Waiting for deployment to complete..."
sleep 30

# Basic health checks
test_endpoint "$API_BASE/health" "API Health Check"
test_endpoint "$WEB_BASE" "Web App" 200

# API endpoints (after deployment)
test_endpoint "$API_BASE/api/supabase-test" "Supabase Connection"
test_endpoint "$API_BASE/api/news" "News API"
test_endpoint "$API_BASE/api/news/popular" "Popular News"
test_endpoint "$API_BASE/api/news/mode/happy" "Happy News"

echo -e "\n🎯 Production URLs:"
echo "Frontend: $WEB_BASE"
echo "API: $API_BASE"
echo "API Docs: $API_BASE/api"
echo ""
echo "🧪 Manual Test Commands:"
echo "curl $API_BASE/health"
echo "curl $API_BASE/api/news"
echo "curl $API_BASE/api/news/popular"