#!/bin/bash
#
# Verify Deployment Script
# Run this after deploying to check everything works
#
# Usage: ./verify-deployment.sh https://lician.com

set -e

DOMAIN="${1:-https://lician.com}"

echo "=========================================="
echo "  Verifying Deployment: $DOMAIN"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

check() {
    local name="$1"
    local url="$2"
    local expected="$3"

    printf "%-40s" "Checking $name..."

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10 2>/dev/null || echo "000")

    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response, expected $expected)"
        ((FAILED++))
    fi
}

check_content() {
    local name="$1"
    local url="$2"
    local contains="$3"

    printf "%-40s" "Checking $name..."

    response=$(curl -s "$url" --max-time 10 2>/dev/null || echo "")

    if echo "$response" | grep -q "$contains"; then
        echo -e "${GREEN}✓ OK${NC} (contains '$contains')"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (missing '$contains')"
        ((FAILED++))
    fi
}

echo "Testing endpoints..."
echo ""

# Basic pages
check "Homepage" "$DOMAIN" "200"
check "Stock page" "$DOMAIN/stock/AAPL" "200"
check "Markets page" "$DOMAIN/markets" "200"

# API endpoints
check "Stock API" "$DOMAIN/api/stock?ticker=AAPL" "200"
check "Health endpoint" "$DOMAIN/api/health" "200"

# Static assets
check "Next.js static" "$DOMAIN/_next/static/css" "200"

# Check for specific content
check_content "Homepage title" "$DOMAIN" "Lician"

echo ""
echo "=========================================="
echo "  Results"
echo "=========================================="
echo ""
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All checks passed! Deployment successful.${NC}"
    exit 0
else
    echo -e "${YELLOW}Some checks failed. Review the errors above.${NC}"
    exit 1
fi
