"""Offline interactive smoke of native ST, Janitor, regex editing, and the Skin Lab."""
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright
from native_browser_smoke import inline_fixture

def run(output=None):
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path=which('chromium'),args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':900})
  page.on('dialog',lambda d:d.accept())
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(inline_fixture(),wait_until='domcontentloaded')
  page.locator('.nav-item[data-view="skins"]').click()
  page.wait_for_function("document.getElementById('skinRendererName').textContent.includes('Motive Ledger')")
  page.wait_for_function("document.querySelector('#skinFrame').srcdoc.includes('MOTIVE_LEDGER_START')",timeout=15000)
  assert page.locator('#skinBase option').count()==8
  assert page.locator('#skinDossierVariables .skin-token-card').count() == 4
  page.locator('#skinPlatform').select_option('st')
  page.wait_for_function("document.getElementById('skinStatus').textContent.includes('SillyTavern')")
  page.wait_for_function("document.querySelector('#skinFrame').srcdoc.includes('MOTIVE_LEDGER_START')")
  assert page.locator('#skinLumiOnly').is_hidden()
  page.locator('#skinPlatform').select_option('lumi')
  page.wait_for_function("document.getElementById('skinLumiOnly').hidden === false")
  page.locator('[data-skin-device="mobile"]').click()
  assert 'device-mobile' in page.locator('#skinFrameWrap').get_attribute('class')
  if output:
   Path(output).mkdir(parents=True,exist_ok=True)
   page.screenshot(path=str(Path(output)/'skins.png'))
  print('Skin Lab previews the actual ST/Lumi Motive Ledger, with Lumiverse native variables: PASS',flush=True)

  page.locator('.nav-item[data-view="architect"]').click()
  page.locator('[data-platform="st"]').click()
  page.wait_for_function("document.getElementById('nativeStatus').textContent.includes('311 native prompts')",timeout=15000)
  assert page.locator('#nativeCategories button').count()>7
  # Native ST toggles should be mounted and synchronized to prompt_order.
  check=page.locator('#nativeDetails .st-prompt-row input[type=checkbox]').first
  initial=check.is_checked();check.click();assert check.is_checked()!=initial
  assert page.locator('#sourceDirty').inner_text()=='Modified'
  page.locator('#nativeSearch').fill('Draft killer')
  assert page.locator('#nativeDetails .st-prompt-row').count()==1
  page.locator('#nativeDetails .st-prompt-row > button').first.click()
  assert page.locator('.st-prompt-editor:not([hidden]) textarea').count()==1
  page.locator('.st-prompt-editor textarea').fill('Native prompt edited in browser smoke.')
  page.locator('.st-prompt-editor button').first.click()
  assert 'Modified' in page.locator('#sourceDirty').inner_text()
  print('ST 311 prompts, toggles, text editor and active source mutations: PASS',flush=True)
  if output:
   page.locator('#nativeSearch').fill('')
   page.screenshot(path=str(Path(output)/'st-architect.png'))

  page.locator('.nav-item[data-view="regex"]').click()
  page.locator('#regexWorkbenchDisclosure').evaluate('(el)=>el.open=true')
  page.locator('#regexPlatform').select_option('st')
  page.locator('#loadNativeRegex').click()
  page.wait_for_function("document.getElementById('regexCount').textContent.includes('22 loaded')",timeout=15000)
  assert page.locator('#regexSaveScript').is_enabled()
  old=page.locator('#regexPattern').input_value()
  page.locator('#regexPattern').fill(old+'|KL_TEST_SENTINEL')
  page.locator('#regexSaveScript').click()
  assert 'Saved into native JSON' in page.locator('#regexSaveState').inner_text()
  print('ST native regex script edit and save: PASS',flush=True)

  page.locator('.nav-item[data-view="architect"]').click()
  page.locator('[data-platform="jani"]').click()
  page.wait_for_function("document.getElementById('janitorPicker').hidden === false",timeout=15000)
  reserved=page.locator('#janitorPromptText').input_value()
  page.locator('#contextNav button').filter(has_text='Impersonation + steering').click()
  page.wait_for_function("(previous) => document.getElementById('janitorPromptText').value !== previous",arg=reserved,timeout=15000)
  impersonation=page.locator('#janitorPromptText').input_value()
  assert len(reserved)>200 and len(impersonation)>200 and reserved!=impersonation
  print('Janitor prompt picker switches exact native text documents: PASS',flush=True)
  assert not errors,errors
  browser.close()

if __name__=='__main__':
 import sys
 run(sys.argv[1] if len(sys.argv)>1 else None)
