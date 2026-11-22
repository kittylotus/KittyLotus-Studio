"""v0.10 whole-workshop browser contracts: bounded Skin Lab, one-skin ZIP-ready JSON, ST and Janitor."""
import json
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright
from native_browser_smoke import inline_fixture

def run(out=None):
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path=which('chromium'),args=['--no-sandbox'])
  context=browser.new_context(viewport={'width':1440,'height':900},accept_downloads=True)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('dialog',lambda dialog:dialog.accept())
  page.set_content(inline_fixture(),wait_until='domcontentloaded')
  page.locator('.nav-item[data-view="skins"]').click()
  page.wait_for_function("document.querySelector('#skinBase').options.length>=8")
  operator=page.locator('.skin-operator')
  geom=operator.evaluate("e=>{let s=getComputedStyle(e),b=e.getBoundingClientRect();return {position:s.position,height:b.height,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight}}")
  print('Skin Lab scroll card geometry:',geom,flush=True)
  assert geom['position']!='sticky',geom
  assert geom['scrollHeight']>geom['clientHeight']+100,geom
  assert 440<=geom['height']<=920,geom
  assert abs(geom['height']-(0.64*900+230))<2,geom
  crosshair=page.locator('#skinPickPreview')
  assert crosshair.locator('svg use[href="#i-crosshair"]').count()==1
  assert crosshair.inner_text().strip()==''
  assert page.locator('#skinExportSingle').is_visible()
  # Export pending CSS edits, not only the last committed native snapshot.
  page.locator('#skinVariantSource').evaluate("e=>{e.value=e.value.replace('--rxd-bg:', '--rxd-bg: /* individual */');e.dispatchEvent(new Event('input',{bubbles:true}));}")
  with page.expect_download(timeout=15000) as item:
   page.locator('#skinExportSingle').click()
  downloaded=item.value
  data=json.loads(Path(downloaded.path()).read_text())
  assert data['kind']=='kittylotus-dossier-skin'
  assert data['regex_script']['name'].startswith('🎨')
  assert '/* individual */' in data['regex_script']['replace_string']
  assert page.locator('#sourceDirty').inner_text()=='Original'
  print('Individual native regex JSON exports current unsaved edits without dirtying the whole preset: PASS',flush=True)
  # Save source first, then roundtrip individual file through native mirror import.
  page.locator('#skinQuickSave').click()
  page.locator('#skinManager').evaluate('el=>el.open=true')
  page.locator('#skinImportFile').set_input_files({'name':'standalone-skin.json','mimeType':'application/json','buffer':json.dumps(data).encode()})
  page.wait_for_function("document.querySelector('#skinBase').options.length===9")
  mirrored=json.loads(page.locator('#sourceRaw').input_value())
  assert mirrored['regex_scripts'][-1]==mirrored['extensions']['regex_scripts'][-1]
  assert mirrored['regex_scripts'][-1]['disabled'] is True
  assert mirrored['regex_scripts'][-1]['name'].endswith(' (Imported)')
  assert page.locator('#skinBase option').count()==9
  print('Portable individual skin imports into both regex mirrors, safely disabled by default: PASS',flush=True)
  if out:
   Path(out).mkdir(parents=True,exist_ok=True)
   page.locator('#skinManager').evaluate('el=>el.open=false')
   page.screenshot(path=str(Path(out)/'skin-lab-v10.png'),animations='disabled')
  # ST: no inner accordion, real source boxes, original ordering and controls.
  page.locator('.nav-item[data-view="architect"]').click()
  page.locator('[data-platform="st"]').click()
  page.wait_for_function("document.querySelector('#nativeStatus').textContent.includes('311 native prompts')")
  page.locator('#contextNav button').filter(has_text='HTML').click()
  assert page.locator('#nativeDetails details').count()==1
  assert page.locator('#nativeDetails .st-source-box').count()>=1
  imageBox=page.locator('#nativeDetails .st-source-box').filter(has_text='Image Gen').first
  assert imageBox.count()==1
  assert imageBox.get_by_text('Governor + URL',exact=False).count()>=1
  assert imageBox.locator('.st-structural-row input[type=checkbox]').count()>=2
  if out:page.screenshot(path=str(Path(out)/'st-html-v10.png'),animations='disabled')
  print('ST single major accordion, exact Image Gen source box, editable closure instructions: PASS',flush=True)
  # Janitor: hide irrelevant search, direct complete-text copy.
  page.locator('[data-platform="jani"]').click()
  page.wait_for_function("document.querySelector('#janitorPromptText').value.length>1000")
  assert not page.locator('#nativeSearchRow').is_visible()
  page.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.__janitorCopied=value}}})")
  page.locator('#janitorCopy').click()
  page.wait_for_function("window.__janitorCopied===document.querySelector('#janitorPromptText').value")
  assert page.locator('#janitorExport').is_visible()
  print('Janitor no redundant content search, one-click full text copy and download: PASS',flush=True)
  assert not errors,errors
  print('v0.10 targeted browser smoke: PASS',flush=True)
  browser.close()
if __name__=='__main__':
 import sys
 run(sys.argv[1] if len(sys.argv)>1 else None)
