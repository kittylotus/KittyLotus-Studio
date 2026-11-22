"""Interaction regressions for native CSS skin maker, visual switch, and prompt choice chips."""
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright
from native_browser_smoke import inline_fixture
import json


def run(output=None):
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path=which('chromium'),args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':900})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(inline_fixture(),wait_until='domcontentloaded')
  page.locator('.nav-item[data-view="skins"]').click()
  page.wait_for_function("document.querySelector('#skinFrame').srcdoc.includes('MOTIVE_LEDGER_START')",timeout=20000)
  assert page.locator('#skinDossierVariables .skin-token-card').count()==4
  assert page.locator('#skinDossierVariables .skin-token-group').count()>=2
  assert page.locator('#skinLumiOnly').is_visible()
  assert page.locator('#skinLumiOnly').evaluate("el=>el.closest('.skin-operator')!==null")
  assert page.locator('#skinFrame').evaluate("el=>el.contentDocument.querySelector('.rxd-motive')!==null")
  # An ordinary native tab selection must survive changing a palette value.
  live=page.frame_locator('#skinFrame')
  live.locator('.klm-tab--short').click()
  assert live.locator('.klm-radio--short').is_checked()
  assert page.locator('#skinPartPicker').input_value()=='canvas'
  before=page.locator('#skinFrame').get_attribute('srcdoc')
  bg=page.locator('#skinDossierVariables [data-skin-token="--rxd-bg"]')
  bg.locator('input[type="color"]').fill('#223344')
  bg.locator('input[type="range"]').evaluate("el=>{el.value='50';el.dispatchEvent(new Event('input',{bubbles:true}));}")
  expected='--rxd-bg:rgba(34,51,68,0.5);'
  assert expected in page.locator('#skinVariantSource').input_value()
  page.wait_for_function("target=>document.querySelector('#skinFrame').contentDocument?.getElementById('skinLiveDossier')?.textContent.includes(target)",arg=expected,timeout=15000)
  assert before==page.locator('#skinFrame').get_attribute('srcdoc'), 'Color edit must not reload preview document'
  assert live.locator('.klm-radio--short').is_checked(), 'Live styling must preserve the native selected tab'
  frame=page.frame_locator('#skinFrame')
  assert frame.locator('.rxd-motive').count()==1
  computed=frame.locator('.rxd-motive').evaluate("el=>getComputedStyle(el).getPropertyValue('--rxd-bg').trim()")
  assert computed=='rgba(34,51,68,0.5)',computed
  # Click-to-pick maps the *actual rendered element*, not its screenshot coordinates.
  page.locator('#skinPickPreview').click()
  assert page.locator('#skinPickPreview').get_attribute('aria-pressed')=='true'
  live.locator('.klm-tab--pulse').click()
  assert page.locator('#skinPartPicker').input_value()=='tabs'
  assert page.locator('#skinPickPreview').get_attribute('aria-pressed')=='false'
  assert page.locator('#skinDossierVariables [data-skin-token="--rxd-accent"]').count()==1
  assert live.locator('.klm-radio--short').is_checked(), 'Picking must not activate the clicked native tab'
  # The native gradient is edited as stops without flattening other gradients.
  page.locator('#skinPartPicker').select_option('unused')
  panel=page.locator('#skinDossierVariables [data-skin-token="--rxd-panel"]')
  assert panel.locator('input[type="color"]').count()==2
  panel.locator('input[type="color"]').first.fill('#aabbcc')
  assert 'rgba(170,187,204,0.94)' in page.locator('#skinVariantSource').input_value()
  assert 'linear-gradient(180deg' in page.locator('#skinVariantSource').input_value()
  page.locator('#skinPartPicker').select_option('geometry')
  radius_group=page.locator('#skinDossierVariables .skin-token-group').filter(has=page.locator('summary',has_text='Shapes')).first
  radius_group.locator('> summary').click()
  radius=page.locator('#skinDossierVariables [data-skin-token="--rxd-radius-card"] input[type=range]')
  radius.evaluate("el=>{el.value='30';el.dispatchEvent(new Event('input',{bubbles:true}));}")
  assert '--rxd-radius-card:30px' in page.locator('#skinVariantSource').input_value()
  skin_scroll=page.locator('.skin-operator').evaluate('el=>{el.scrollTop=180;return el.scrollTop}')
  rows_before=page.locator('#skinDossierVariables [data-skin-token]').count()
  page.locator('#skinQuickSave').click()
  assert page.locator('#skinPartPicker').input_value()=='geometry'
  assert page.locator('#skinDossierVariables [data-skin-token]').count()==rows_before
  scroll_after=page.locator('.skin-operator').evaluate('el=>el.scrollTop')
  assert abs(scroll_after-skin_scroll)<=1
  page.locator('#skinQuickActivate').click()
  native=json.loads(page.locator('#sourceRaw').input_value())
  selected_name=page.locator('#skinBase option:checked').inner_text()
  sources=[native['regex_scripts'],native['extensions']['regex_scripts']]
  for arr in sources:
   matches=[item for item in arr if 'Default Purple' in item['name']]
   assert len(matches)==1
   assert '--rxd-bg:rgba(34,51,68,0.5)' in matches[0]['replace_string']
   assert not matches[0]['disabled']
   assert sum(1 for item in arr if '[Regex Skins]' in item['name'] and not item['disabled'])==1
  print('Native skin editing preserves preview tab + editor scroll; visual picker, mirrors and activation: PASS',flush=True)
  if output:
   Path(output).mkdir(parents=True,exist_ok=True)
   page.screenshot(path=str(Path(output)/'skinmaker-v08-desktop.png'))
  page.locator('.nav-item[data-view="architect"]').click()
  page.locator('#nativeSearch').fill('Social Formats')
  buttons=page.locator('#nativeDetails .native-choice-list button')
  assert buttons.count()==6
  discord=buttons.filter(has_text='Discord channel')
  assert discord.count()==1
  pressed=discord.get_attribute('aria-pressed')
  discord.click()
  assert discord.get_attribute('aria-pressed')!=pressed
  updated=json.loads(page.locator('#sourceRaw').input_value())
  selection=updated['promptVariables']['019d43bd-26d9-7000-ba02-22dbdcfd609f']['KL_SOCIAL_MODE']
  assert isinstance(selection,list) and bool(selection)
  toggle=page.locator('#nativeDetails .native-row input[type=checkbox]').first
  assert page.locator('#nativeDetails select[multiple]').count()==0
  page.locator('#nativeSearch').fill('AutoWorld')
  toggle=page.locator('#nativeDetails .native-row input[type=checkbox]').first
  dimensions=toggle.evaluate("el=>({width:Math.round(el.getBoundingClientRect().width),height:Math.round(el.getBoundingClientRect().height)})")
  assert dimensions=={'width':37,'height':21},dimensions
  page.locator('.nav-item[data-view="skins"]').click()
  swatch=page.locator('#skinDossierVariables [data-skin-token="--rxd-bg"] input[type=color]')
  page.locator('#skinPartPicker').select_option('canvas')
  assert swatch.evaluate("el=>({radius:getComputedStyle(el).borderRadius,width:Math.round(el.getBoundingClientRect().width),height:Math.round(el.getBoundingClientRect().height)})")=={'radius':'50%','width':32,'height':32}
  assert page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()")=='#030305'
  print('Reference palette, 37×21 switches and round native color wells: PASS',flush=True)
  print('Social Formats chip selection preserves native array representation: PASS',flush=True)
  if output:
   page.locator('#nativeSearch').fill('')
   page.screenshot(path=str(Path(output)/'architect-v08-desktop.png'))
  page.locator('.nav-item[data-view="skins"]').click()
  for width in [390,360]:
   page.set_viewport_size({'width':width,'height':844})
   sw=page.evaluate('document.documentElement.scrollWidth')
   assert sw<=width, f'Skinmaker mobile overflow at {width}px: {sw}'
  if output:
   page.wait_for_timeout(350)
   page.screenshot(path=str(Path(output)/'skinmaker-v08-mobile.png'))
  assert not errors,errors
  browser.close()

if __name__=='__main__':
 import sys
 run(sys.argv[1] if len(sys.argv)>1 else None)
