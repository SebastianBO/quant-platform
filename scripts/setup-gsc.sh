#!/bin/bash
# Google Search Console Setup Script
# Run this after getting your verification code from GSC

set -e

echo "=========================================="
echo "Google Search Console Setup"
echo "=========================================="
echo ""

# Check if verification code is provided
if [ -z "$1" ]; then
    echo "Opening Google Search Console..."
    echo ""
    echo "Steps:"
    echo "1. The browser will open Search Console"
    echo "2. Click 'Add property'"
    echo "3. Choose 'URL prefix' and enter: https://lician.com"
    echo "4. Expand 'HTML tag' under 'Other verification methods'"
    echo "5. Copy ONLY the content value (the long string after content=\")"
    echo ""
    echo "Then run this script again with the code:"
    echo "  ./scripts/setup-gsc.sh YOUR_VERIFICATION_CODE"
    echo ""

    # Open Search Console in browser
    open "https://search.google.com/search-console/welcome?resource_id=https://lician.com/"

    exit 0
fi

VERIFICATION_CODE=$1

echo "Setting up verification code: $VERIFICATION_CODE"
echo ""

# Add to Vercel environment
echo "Adding to Vercel environment..."
echo "$VERIFICATION_CODE" | vercel env add NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION production --force 2>/dev/null || {
    vercel env rm NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION production -y 2>/dev/null || true
    echo "$VERIFICATION_CODE" | vercel env add NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION production
}

echo ""
echo "Deploying to production..."
vercel --prod

echo ""
echo "=========================================="
echo "DONE!"
echo "=========================================="
echo ""
echo "Now go back to Google Search Console and click 'Verify'"
echo ""
echo "After verification, submit your sitemap:"
echo "1. Go to: https://search.google.com/search-console"
echo "2. Select lician.com property"
echo "3. Click 'Sitemaps' in left menu"
echo "4. Enter: sitemap.xml"
echo "5. Click 'Submit'"
echo ""
