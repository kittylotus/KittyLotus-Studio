"""Fast mobile + desktop visual sanity check without localhost or external network."""
from pathlib import Path
from shutil import which
from base64 import b64encode
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
CSS=['studio.css','constellation.css','nightshift.css','workbench.css','workshop-ux.css','skinmaker-v08.css','skinmaker-v09.css','workshop-v10.css','regex-showcase.css','cascade-showcase.css','mobile-compact.css','skinlab-v017.css']
MODULES=['native.js','core.js','catalog.js','skin-controls.js','workbench.js','showcase.js','showcase-ui.js','cascade.js','cascade-showcase.js','app.js']
FILES=['data/native/lumiverse.json','data/native/sillytavern.json','data/native/janitor-reserved-agency.txt','data/native/janitor-impersonation.txt','data/fixtures/contract-fixtures.json','data/fixtures/showcase-samples.json','data/fixtures/showcase-snapshots.json','data/fixtures/cascade-samples.json']

def run(out=None):
 html=(ROOT/'index.html').read_text(encoding='utf8')
 for name in CSS:html=html.replace(f'<link href="./css/{name}" rel="stylesheet"/>','')
 html=html.replace('<script src="./js/app.js?v=0.17.0" type="module"></script>','')
 html=html.replace('</head>','<style>'+'\n'.join((ROOT/'css'/name).read_text(encoding='utf8') for name in CSS)+'</style></head>')
 b64=b64encode((ROOT/'assets/gabi/gabi-views.webp').read_bytes()).decode()
 html=html.replace('src="./assets/gabi/gabi-views.webp"',f'src="data:image/webp;base64,{b64}"')
 sources={name:(ROOT/'js'/name).read_text(encoding='utf8') for name in MODULES}
 app=sources['app.js'].replace('compileSourceRegex} from','compileSourceRegex,transformRegex} from',1)
 start=app.index('function runRegexInWorker(')
 stop=app.index('async function loadNativeRegex(',start)
 app=app[:start]+'async function runRegexInWorker(input,scripts,options){return transformRegex(input,scripts,options);}\n'+app[stop:]
 sources['app.js']=app.replace('?v=0.17.0','')
 fixtures={name:(ROOT/name).read_text(encoding='utf8') for name in FILES}
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path=which('chromium'),args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1,accept_downloads=True)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded')
  page.evaluate('''async ({sources,fixtures})=>{
   globalThis.fetch=async url=>{const key=String(url).replace(/^\\.\\//,'');return new Response(fixtures[key]||'Not found',{status:Object.hasOwn(fixtures,key)?200:404});};
   const urls={};
   for(const name of ['native.js','core.js','catalog.js','skin-controls.js','workbench.js','showcase.js','showcase-ui.js','cascade.js','cascade-showcase.js','app.js']){
    const code=sources[name].replace(/(from\\s*['"])\\.\\/([^'"]+\\.js)(['"])/g,(match,a,dep,z)=>{if(!urls[dep])throw Error(`Unresolved ${name} import ${dep}`);return `${a}${urls[dep]}${z}`;});
    urls[name]=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));
   }
   await import(urls['app.js']);
  }''',{'sources':sources,'fixtures':fixtures})
  assert "The screen's control panel" in page.locator('.lounge-heading .section-eyebrow').inner_text()
  assert 'Prep the scene, Teammate.' in page.locator('#homeTitle').inner_text()
  assert page.locator('#homeTitle em').count()==0
  print('navigating skin',flush=True)
  page.locator('.nav-item[data-view="skins"]').click()
  page.wait_for_timeout(1500)
  print('status',page.locator('#skinStatus').inner_text(),'base',page.locator('#skinBase option').count(),'toast',page.locator('#toast').inner_text(),'errors',errors,flush=True)
  page.wait_for_function("document.querySelector('#skinBase').options.length>=8",timeout=12000)
  print("skins loaded",flush=True)
  assert page.locator('#skinImportSingle').is_visible() and page.locator('#skinExportSingle').is_visible()
  page.locator('#skinCurrentName').fill('Nightshift Canvas')
  css=page.locator('#skinVariantSource').input_value().replace('--rxd-bg:','--rxd-bg: /* portable roundtrip */')
  page.locator('#skinVariantSource').evaluate("(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));}",css)
  print('download skin',flush=True)
  with page.expect_download(timeout=12000) as task:
   page.locator('#skinExportSingle').click()
  item=task.value
  exported=json.loads(Path(item.path()).read_text('utf8'))
  assert item.suggested_filename=='Nightshift Canvas-skin.json',item.suggested_filename
  assert exported['skin_name']=='Nightshift Canvas'
  assert exported['regex_script']['name']=='🎨 [Regex Skins] Nightshift Canvas'
  assert exported['regex_script']['metadata']['skin_label']=='Nightshift Canvas'
  assert '/* portable roundtrip */' in exported['regex_script']['replace_string']
  # Do not write unsaved changes just because export was used.
  assert page.locator('#sourceDirty').inner_text()=='Original'
  print('saving skin',flush=True)
  page.locator('#skinQuickSave').click()
  print('save status',page.locator('#skinQuickStatus').inner_text(),'toast',page.locator('#toast').inner_text(),flush=True)
  saved=json.loads(page.locator('#sourceRaw').input_value())
  print('saved skin examples',[(r['name'],r.get('metadata',{}).get('skin_label')) for r in saved['regex_scripts'] if 'Regex Skins' in r['name']][:3],flush=True)
  for records in (saved['regex_scripts'],saved['extensions']['regex_scripts']):
   assert any(row['name']=='🎨 [Regex Skins] Nightshift Canvas' and row['metadata']['skin_label']=='Nightshift Canvas' and '/* portable roundtrip */' in row['replace_string'] for row in records)
  # Re-import the actual downloaded bytes, not a handmade fixture.
  print('import skin',flush=True)
  with page.expect_file_chooser(timeout=8000) as chooser:
   page.locator('#skinImportSingle').click()
  chooser.value.set_files({'name':item.suggested_filename,'mimeType':'application/json','buffer':Path(item.path()).read_bytes()})
  page.wait_for_function("document.querySelector('#skinBase').options.length===9",timeout=12000)
  imported=json.loads(page.locator('#sourceRaw').input_value())
  for records in (imported['regex_scripts'],imported['extensions']['regex_scripts']):
   row=records[-1]
   assert row['name']=='🎨 [Regex Skins] Nightshift Canvas (Imported)',row['name']
   assert row['metadata']['skin_label']=='Nightshift Canvas (Imported)'
   assert row['disabled'] is True
  assert imported['regex_scripts'][-1]==imported['extensions']['regex_scripts'][-1]
  assert 'Imported Nightshift Canvas' in page.locator('#skinQuickStatus').inner_text()
  assert 'Imported Nightshift Canvas' in page.locator('#skinImportStatus').inner_text()
  # Mobile: preview is primary surface; editor drawers over it, never stacked beneath.
  print('mobile',flush=True)
  page.set_viewport_size({'width':390,'height':844})
  assert page.locator('#skinMobileTools').is_visible()
  assert page.locator('#skinOperator').evaluate('el=>el.inert') is True
  assert page.locator('#skinOpenControls').get_attribute('aria-expanded')=='false'
  assert page.locator('#skinFrame').is_visible()
  if out:
   Path(out).mkdir(parents=True,exist_ok=True)
   page.screenshot(path=str(Path(out)/'skin-mobile-preview.png'),animations='disabled')
  print('opening drawer',flush=True)
  page.locator('#skinOpenControls').click()
  assert page.locator('#skinOperator').evaluate('el=>getComputedStyle(el).position')=='fixed'
  assert page.locator('#skinOperator').evaluate('el=>el.inert') is False
  assert page.locator('#skinOpenControls').get_attribute('aria-expanded')=='true'
  page.locator('#skinCurrentName').wait_for(state='visible',timeout=5000)
  if out:page.screenshot(path=str(Path(out)/'skin-mobile-drawer.png'),animations='disabled')
  # Name changes persist while scrolling; no unintended iframe reset.
  original_doc=page.locator('#skinFrame').get_attribute('srcdoc')
  page.locator('#skinCurrentName').fill('Nightshift Canvas 2')
  page.locator('#skinQuickSave').click()
  assert page.locator('#skinFrame').get_attribute('srcdoc')==original_doc
  print('picking',flush=True)
  page.locator('#skinPickPreview').click()
  assert page.locator('#skinOpenControls').get_attribute('aria-expanded')=='false'
  assert page.locator('#skinMobilePick').get_attribute('aria-pressed')=='true'
  native=page.frame_locator('#skinFrame')
  native.locator('.klm-tab--short').evaluate('el=>el.click()')
  assert page.locator('#skinPartPicker').input_value()=='tabs'
  assert page.locator('#skinOpenControls').get_attribute('aria-expanded')=='true'
  assert page.locator('#skinDossierVariables [data-skin-token="--rxd-accent"]').count()==1
  page.keyboard.press('Escape')
  assert page.locator('#skinOpenControls').get_attribute('aria-expanded')=='false'
  assert page.locator('#skinOperator').evaluate('el=>el.inert') is True
  assert not errors,errors
  print('PASS: named export/import and mobile picker',flush=True)
  browser.close()
if __name__=='__main__':
 import sys
 run(sys.argv[1] if len(sys.argv)>1 else None)
