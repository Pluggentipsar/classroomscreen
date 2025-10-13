from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:5000")

        # Click the launcher button
        launcher_button = page.locator("#dockMoreButton")
        expect(launcher_button).to_be_visible()
        launcher_button.click()

        # Wait for the launcher overlay to appear
        launcher_overlay = page.locator("#launcherOverlay")
        expect(launcher_overlay).to_be_visible()

        # Click the "Sittplatskarta" (Seating Chart) button within the launcher
        seating_chart_button = page.locator(".launcher-widget-card:has-text('Sittplatskarta')")
        expect(seating_chart_button).to_be_visible()
        seating_chart_button.click()

        # Wait for the widget to be added to the page
        widget_locator = page.locator(".widget[data-type='seating-chart']")
        expect(widget_locator).to_be_visible()

        # Take a screenshot of the seating chart widget
        widget = page.query_selector(".widget[data-type='seating-chart']")
        if widget:
            widget.screenshot(path="jules-scratch/verification/seating_chart_verification.png")
        else:
            page.screenshot(path="jules-scratch/verification/full_page_error.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error_screenshot.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)