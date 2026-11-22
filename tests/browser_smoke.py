"""Offline DOM smoke for all Studio workspaces. Uses a native ESM fixture and browser.
Usage: python tests/browser_smoke.py [--screenshot-dir path]
"""
from pathlib import Path
from argparse import ArgumentParser
from playwright.sync_api import sync_playwright
from shutil import which
from native_browser_smoke import inline_fixture


def run(output=None):
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path=which('chromium') or which('google-chrome') or None,args=['--no-sandbox'])
        page=browser.new_page(viewport={'width':1440,'height':900})
        errors=[]
        page.on('pageerror',lambda e: errors.append(str(e)))
        page.set_content(inline_fixture(),wait_until='domcontentloaded')
        assert page.locator('#view-home.is-visible').count()==1
        assert page.locator('.portal-card:not([hidden])').count()==5
        baseline=page.locator('.portal-window').bounding_box()['height']
        page.locator('[data-dashboard-filter="visual"]').click()
        assert page.locator('.portal-card:not([hidden])').count()==2
        assert abs(page.locator('.portal-window').bounding_box()['height']-baseline)<=1
        page.locator('[data-dashboard-filter="all"]').click()
        assert page.locator('.portal-card:not([hidden])').count()==5
        sidebar=page.locator('#sidebar').bounding_box(); dock=page.locator('.gabi-dock').bounding_box()
        assert abs(sidebar['y']+sidebar['height']-dock['y']-dock['height'])<=2
        if output:
            Path(output).mkdir(parents=True,exist_ok=True)
            page.screenshot(path=str(Path(output)/'overview.png'))
        for view in ['architect','skins','regex','gabi']:
            page.locator(f'.nav-item[data-view="{view}"]').click()
            page.wait_for_function('(view) => document.querySelector(".view.is-visible")?.id === `view-${view}`',arg=view,timeout=10000)
            assert page.locator('#contextNav button').count()>0 if view=='architect' else page.locator('#contextNav button').count()==0
        page.set_viewport_size({'width':390,'height':844})
        page.evaluate("location.hash='home'")
        page.wait_for_function('document.querySelector("#view-home.is-visible")!==null')
        assert page.evaluate('document.documentElement.scrollWidth')<=page.evaluate('innerWidth')
        mobile_height=page.locator('.portal-window').bounding_box()['height']
        page.locator('[data-dashboard-filter="visual"]').click()
        assert abs(page.locator('.portal-window').bounding_box()['height']-mobile_height)<=1
        page.locator('[data-dashboard-filter="all"]').click()
        if output:page.screenshot(path=str(Path(output)/'mobile.png'))
        assert not errors,errors
        print('PASS: dashboard, 5 workspaces, rail anchor, filter geometry, and mobile layout',flush=True)
        browser.close()

if __name__=='__main__':
    args=ArgumentParser();args.add_argument('--screenshot-dir',default=None)
    run(args.parse_args().screenshot_dir)
