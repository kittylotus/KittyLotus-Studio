"""E2E: actual HTTP static modules rather than inlined concatenated JS.
Catches forgotten ESM named imports and paths invisible to mocked DOM tests.
Requires Python Playwright plus a locally installed Chromium.
"""
from pathlib import Path
from shutil import which
import http.server
import socketserver
import threading
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw): super().__init__(*a, directory=str(ROOT), **kw)
    def log_message(self,*a): pass

class ReusableServer(socketserver.TCPServer): allow_reuse_address=True


def run():
    with ReusableServer(('127.0.0.1',0),QuietHandler) as server:
        thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        try:
            with sync_playwright() as p:
                browser=p.chromium.launch(headless=True,executable_path=which('chromium') or which('google-chrome') or None,args=['--no-sandbox'])
                page=browser.new_page(viewport={'width':1440,'height':900})
                exceptions=[]
                page.on('pageerror',lambda error: exceptions.append(str(error)))
                url=f'http://127.0.0.1:{server.server_address[1]}'
                page.goto(url,wait_until='domcontentloaded')
                page.wait_for_function("document.querySelector('#portalCount')?.textContent.includes('workspaces')",timeout=12000)
                assert page.locator('#view-home.is-visible').count()==1
                assert page.locator('.portal-card:not([hidden])').count()==6
                # Actual module imports loaded, no ReferenceError for missing named imports.
                page.locator('.nav-item[data-view="architect"]').click()
                page.wait_for_function("document.querySelector('#nativeStatus').textContent.includes('117 native controls')",timeout=12000)
                page.locator('#nativeSearch').fill('Narrative Mode')
                sel=page.locator('#nativeDetails .native-row select').first
                assert sel.count()==1
                sel.select_option('01a16841-051b-7000-8c10-035706412355')
                assert page.locator('#sourceDirty').inner_text()=='Modified'
                page.locator('.nav-item[data-view="gabi"]').click()
                assert page.locator('#gabiGallery .gabi-card').count()==15
                assert page.locator('#chibiGallery .gabi-card').count()==5
                # Portrait override optional. Crop is bundled and must load on a real server.
                page.evaluate("location.hash='home'")
                page.wait_for_function("document.querySelector('#view-home.is-visible')!==null")
                assert page.locator('.lounge-portrait').evaluate('(el)=>el.complete&&el.naturalWidth>0')
                page.locator('[data-dashboard-filter="visual"]').click()
                assert page.locator('.portal-card:not([hidden])').count()==2
                page.locator('[data-dashboard-filter="all"]').click()
                assert page.locator('.portal-card:not([hidden])').count()==6
                assert not exceptions,exceptions
                print('PASS: real static HTTP ESM imports, native dropdown, local Gabi, lounge, category tabs')
                browser.close()
        finally:
            server.shutdown();thread.join(timeout=3)

if __name__=='__main__':run()
