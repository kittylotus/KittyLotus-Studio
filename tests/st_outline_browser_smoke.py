"""Functional browser checks for presentation-only SillyTavern heading hierarchy."""
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright
from native_browser_smoke import inline_fixture


def run(output=None):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=which('chromium') or which('google-chrome'), args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content(inline_fixture(), wait_until='domcontentloaded')
        page.locator('.nav-item[data-view="architect"]').click()
        page.locator('[data-platform="st"]').click()
        page.wait_for_function("document.querySelector('#nativeStatus').textContent.includes('311 native prompts')")
        page.locator('#contextNav button').filter(has_text='Formatting').click()
        majors = page.locator('#nativeDetails details.st-major-outline')
        assert majors.count() == 1, 'One collapsible per major level'
        assert page.locator('#nativeDetails details.st-outline-second').count() == 0
        assert page.locator('#nativeDetails details.st-outline-third').count() == 0
        assert page.locator('#nativeDetails .st-hierarchy-second').count() > 4
        assert page.locator('#nativeDetails .st-hierarchy-third').count() > 2
        assert page.locator('#nativeDetails .st-hierarchy-second').filter(has_text='User POV').count() == 1
        assert page.locator('#nativeDetails .st-hierarchy-third').filter(has_text='Length').count() == 1
        # Heading source instructions must remain editable.
        assert page.locator('#nativeDetails .st-heading-source button').count() > 0
        toggle = page.locator('#nativeDetails .st-major-content .st-prompt-row input[type=checkbox]').first
        before = toggle.is_checked()
        toggle.click()
        after = toggle.is_checked()
        assert before != after
        assert page.locator('#sourceDirty').inner_text() == 'Modified'
        # The UI grouping must never become a serialization format.
        source = page.locator('#sourceRaw').input_value()
        import json
        obj = json.loads(source)
        assert len(obj['prompts']) == 311
        assert 'st-outline' not in source
        assert obj['prompts'][0]['identifier']
        print('Single major collapse / second / third visual hierarchy, native toggle identity: PASS', flush=True)
        if output:
            Path(output).mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(Path(output)/'st-hierarchy.png'))
        for width in [390,360]:
            page.set_viewport_size({'width':width,'height':844})
            # No horizontal page overflows on mobile, even with nested accordions.
            actual = page.evaluate('document.documentElement.scrollWidth')
            assert actual <= width, f'ST hierarchy overflows at {width}px: {actual}px'
        assert not errors, errors
        print('ST outline desktop and mobile layout: PASS', flush=True)
        browser.close()

if __name__ == '__main__':
    import sys
    run(sys.argv[1] if len(sys.argv)>1 else None)
