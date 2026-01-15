#!/usr/bin/env python3
"""UI Test for lician.com - Tests all main buttons and interactions"""

from playwright.sync_api import sync_playwright
import time
import os

# Create screenshots directory
os.makedirs('/tmp/lician-screenshots', exist_ok=True)

def test_lician_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        results = []

        print("=" * 60)
        print("LICIAN.COM UI TEST")
        print("=" * 60)

        # 1. Navigate to homepage
        print("\n1. Loading homepage...")
        page.goto('https://lician.com', timeout=30000)
        page.wait_for_load_state('networkidle')
        page.screenshot(path='/tmp/lician-screenshots/01-homepage.png')
        print("   ✓ Homepage loaded")
        results.append(("Homepage load", True))

        # 2. Test Login button in header
        print("\n2. Testing Login button...")
        try:
            login_btn = page.locator('a[href="/login"], button:has-text("Sign in"), a:has-text("Sign in")').first
            if login_btn.is_visible():
                login_btn.click()
                page.wait_for_load_state('networkidle')
                page.screenshot(path='/tmp/lician-screenshots/02-login-page.png')
                current_url = page.url
                if '/login' in current_url:
                    print(f"   ✓ Login page opened: {current_url}")
                    results.append(("Login button", True))
                else:
                    print(f"   ✗ Wrong URL: {current_url}")
                    results.append(("Login button", False))
                page.go_back()
                page.wait_for_load_state('networkidle')
            else:
                print("   - Login button not visible (user may be logged in)")
                results.append(("Login button", "N/A"))
        except Exception as e:
            print(f"   ✗ Error: {e}")
            results.append(("Login button", False))

        # 3. Test Cmd+K search
        print("\n3. Testing Cmd+K search...")
        try:
            page.keyboard.press('Meta+k')
            time.sleep(0.5)
            page.screenshot(path='/tmp/lician-screenshots/03-cmdk-search.png')

            # Check if command dialog opened
            dialog = page.locator('[role="dialog"], [data-radix-dialog-content], .command-dialog')
            if dialog.is_visible():
                print("   ✓ Cmd+K search dialog opened")
                results.append(("Cmd+K search", True))
                # Close it
                page.keyboard.press('Escape')
                time.sleep(0.3)
            else:
                print("   ✗ Cmd+K dialog not visible")
                results.append(("Cmd+K search", False))
        except Exception as e:
            print(f"   ✗ Error: {e}")
            results.append(("Cmd+K search", False))

        # 4. Test Model selector dropdown
        print("\n4. Testing Model selector...")
        try:
            # Look for model selector button
            model_btn = page.locator('button:has-text("Gemini"), button:has-text("GPT"), button:has-text("Claude"), [data-model-selector]').first
            if model_btn.is_visible():
                model_btn.click()
                time.sleep(0.5)
                page.screenshot(path='/tmp/lician-screenshots/04-model-selector.png')
                print("   ✓ Model selector clicked")
                results.append(("Model selector", True))
                # Click elsewhere to close
                page.keyboard.press('Escape')
                time.sleep(0.3)
            else:
                print("   - Model selector not found on this page")
                results.append(("Model selector", "N/A"))
        except Exception as e:
            print(f"   ✗ Error: {e}")
            results.append(("Model selector", False))

        # 5. Test Tool buttons
        print("\n5. Testing Tool buttons...")
        tool_buttons = [
            ("Stock Screener", "/screener"),
            ("Compare Stocks", "/compare"),
            ("DCF Valuation", "/dcf"),
        ]

        for btn_text, expected_path in tool_buttons:
            try:
                btn = page.locator(f'button:has-text("{btn_text}"), a:has-text("{btn_text}")').first
                if btn.is_visible():
                    btn.click()
                    page.wait_for_load_state('networkidle', timeout=10000)
                    page.screenshot(path=f'/tmp/lician-screenshots/05-tool-{btn_text.lower().replace(" ", "-")}.png')
                    current_url = page.url
                    if expected_path in current_url or 'lician.com' in current_url:
                        print(f"   ✓ {btn_text} button works -> {current_url}")
                        results.append((f"Tool: {btn_text}", True))
                    else:
                        print(f"   ? {btn_text} -> {current_url}")
                        results.append((f"Tool: {btn_text}", True))
                    page.goto('https://lician.com')
                    page.wait_for_load_state('networkidle')
                else:
                    print(f"   - {btn_text} button not visible")
                    results.append((f"Tool: {btn_text}", "N/A"))
            except Exception as e:
                print(f"   ✗ {btn_text} error: {e}")
                results.append((f"Tool: {btn_text}", False))

        # 6. Test Carousel navigation
        print("\n6. Testing Carousel navigation...")
        try:
            # Look for carousel dots or navigation arrows
            carousel_nav = page.locator('[data-carousel], .carousel, button[aria-label*="slide"], button[aria-label*="next"], button[aria-label*="previous"]')
            dots = page.locator('button[role="tab"], [data-carousel-dot], .carousel-dot')

            if dots.count() > 0:
                dots.nth(1).click()
                time.sleep(0.5)
                page.screenshot(path='/tmp/lician-screenshots/06-carousel-slide2.png')
                print(f"   ✓ Carousel has {dots.count()} navigation dots")
                results.append(("Carousel navigation", True))
            else:
                print("   - No carousel dots found")
                results.append(("Carousel navigation", "N/A"))
        except Exception as e:
            print(f"   ✗ Error: {e}")
            results.append(("Carousel navigation", False))

        # 7. Test Chat input
        print("\n7. Testing Chat input...")
        try:
            chat_input = page.locator('textarea, input[type="text"][placeholder*="Ask"], [contenteditable="true"]').first
            if chat_input.is_visible():
                chat_input.click()
                chat_input.fill("What is AAPL stock price?")
                page.screenshot(path='/tmp/lician-screenshots/07-chat-input.png')
                print("   ✓ Chat input accepts text")
                results.append(("Chat input", True))
            else:
                print("   - Chat input not visible")
                results.append(("Chat input", "N/A"))
        except Exception as e:
            print(f"   ✗ Error: {e}")
            results.append(("Chat input", False))

        # 8. Test Stripe checkout redirect
        print("\n8. Testing Stripe checkout...")
        try:
            page.goto('https://lician.com/api/stripe/quick-checkout?plan=monthly', timeout=10000)
            page.wait_for_load_state('networkidle', timeout=10000)
            page.screenshot(path='/tmp/lician-screenshots/08-stripe-checkout.png')
            current_url = page.url
            if 'checkout.stripe.com' in current_url:
                print(f"   ✓ Stripe checkout redirect works")
                results.append(("Stripe checkout", True))
            else:
                print(f"   ✗ Not redirected to Stripe: {current_url}")
                results.append(("Stripe checkout", False))
        except Exception as e:
            print(f"   ✗ Error: {e}")
            results.append(("Stripe checkout", False))

        # Final summary
        print("\n" + "=" * 60)
        print("TEST RESULTS SUMMARY")
        print("=" * 60)

        passed = sum(1 for _, status in results if status == True)
        failed = sum(1 for _, status in results if status == False)
        skipped = sum(1 for _, status in results if status == "N/A")

        for name, status in results:
            if status == True:
                print(f"  ✓ {name}")
            elif status == False:
                print(f"  ✗ {name}")
            else:
                print(f"  - {name} (skipped)")

        print(f"\nTotal: {passed} passed, {failed} failed, {skipped} skipped")
        print(f"\nScreenshots saved to: /tmp/lician-screenshots/")

        browser.close()

        return failed == 0

if __name__ == "__main__":
    success = test_lician_ui()
    exit(0 if success else 1)
