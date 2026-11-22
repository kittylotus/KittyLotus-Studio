"""Fast mobile + desktop visual sanity check without localhost or external network."""
from pathlib import Path
from shutil import which
from base64 import b64encode
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
CSS=['studio.css','constellation.css','nightshift.css','workbench.css','workshop-ux.css','skinmaker-v08.css','skinmaker-v09.css','workshop-v10.css','regex-showcase.css','cascade-showcase.css','mobile-compact.css','skinlab-v017.css']
MODULES=['native.js','core.js','catalog.js','skin-controls.js','workbench.js','showcase.js','showcase-ui.js','cascade.js','cascade-showcase.js','app.js']
FILES=['data/native/lumiverse.json','data/native/sillytavern.json','data/native/janitor-reserved-agency.txt','data/native/janitor-impersonation.txt','data/fixtures/contract-fixtures.json','data/fixtures/showcase-samples.json','data/fixtures/showcase-snapshots.json','data/fixtures/cascade-samples.json']

def run():
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
  page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
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
  page.evaluate("document.querySelector('.nav-item[data-view=regex]').click()")
  page.wait_for_function("document.getElementById('cascadeStatus').textContent.includes('original regex matches')",timeout=25000)
  assert page.evaluate("getComputedStyle(document.body).zoom")=='0.9'
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
  frame=page.locator('#cascadeFrame').content_frame
  assert frame.locator('html').evaluate('(el)=>getComputedStyle(el).zoom')=='0.9'
  page.screenshot(path=str(ROOT.parent/'kitty-v016-mobile.png'))
  page.locator('.cascade-card').filter(has_text='CYOA Multi').evaluate('(el)=>el.click()')
  page.wait_for_function("document.getElementById('cascadeStatus').textContent.includes('3 original regex matches')",timeout=25000)
  cyoa=page.locator('#cascadeFrame').content_frame
  assert cyoa.locator('.gabi-fcm-launch').is_visible()
  assert cyoa.locator('html').evaluate('(el)=>getComputedStyle(el).zoom')=='1'
  # The native declarative popover must still activate under the mobile presentation scale.
  # Trigger the DOM activation directly: Chromium's Playwright pointer hit-testing is
  # unreliable across a sandbox iframe nested inside CSS zoom.
  cyoa.locator('.gabi-fcm-launch').evaluate('(e)=>e.click()')
  assert cyoa.locator('.gabi-cyoa-pop').is_visible()
  cyoa.locator('.gabi-fcm-a1 summary').evaluate('(e)=>e.click()')
  assert cyoa.locator('.gabi-fcm-a1 .gabi-cyoa-route').count()==3
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
  page.set_viewport_size({'width':1440,'height':900})
  assert page.evaluate("getComputedStyle(document.body).zoom")=='1'
  assert frame.locator('html').evaluate('(el)=>getComputedStyle(el).zoom')=='1'
  assert not errors,errors
  print('PASS: 390px compact layout + iframe scale + CYOA declarative activation + desktop reset',flush=True)
  browser.close()
if __name__=='__main__':run()
