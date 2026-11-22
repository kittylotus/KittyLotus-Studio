"""Real separate-ESM browser verification for v0.13 source-driven showcases."""
from pathlib import Path
from shutil import which
from base64 import b64encode
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
CSS=['studio.css','constellation.css','nightshift.css','workbench.css','workshop-ux.css','skinmaker-v08.css','skinmaker-v09.css','workshop-v10.css','regex-showcase.css','cascade-showcase.css']
MODULES=['native.js','core.js','catalog.js','skin-controls.js','workbench.js','showcase.js','showcase-ui.js','cascade.js','cascade-showcase.js','app.js']
FILES=['data/native/lumiverse.json','data/native/sillytavern.json','data/native/janitor-reserved-agency.txt','data/native/janitor-impersonation.txt','data/fixtures/contract-fixtures.json','data/fixtures/showcase-samples.json','data/fixtures/showcase-snapshots.json','data/fixtures/cascade-samples.json']

def run():
 html=(ROOT/'index.html').read_text(encoding='utf-8')
 for name in CSS:html=html.replace(f'<link href="./css/{name}" rel="stylesheet"/>','')
 html=html.replace('<script src="./js/app.js" type="module"></script>','')
 html=html.replace('</head>','<style>'+'\n'.join((ROOT/'css'/name).read_text(encoding='utf-8') for name in CSS)+'</style></head>')
 b64=b64encode((ROOT/'assets/gabi/gabi-views.webp').read_bytes()).decode()
 html=html.replace('src="./assets/gabi/gabi-views.webp"',f'src="data:image/webp;base64,{b64}"')
 sources={name:(ROOT/'js'/name).read_text(encoding='utf-8') for name in MODULES}
 app=sources['app.js'].replace('compileSourceRegex} from','compileSourceRegex,transformRegex} from',1)
 start=app.index('function runRegexInWorker(')
 stop=app.index('async function loadNativeRegex(',start)
 app=app[:start]+'async function runRegexInWorker(input,scripts,options){return transformRegex(input,scripts,options);}\n'+app[stop:]
 sources['app.js']=app
 fixtures={name:(ROOT/name).read_text(encoding='utf-8') for name in FILES}
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path=which('chromium') or which('google-chrome') or None,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
  errors=[]
  page.on('pageerror',lambda error: errors.append(str(error)))
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
  page.locator('.nav-item[data-view="regex"]').click()
  page.wait_for_function("document.querySelectorAll('.cascade-card').length === 5",timeout=20000)
  assert page.locator('.cascade-card').count()==5
  assert page.locator('.cascade-feature-head').count()==0
  assert page.locator('#cascadeFullscreen').count()==1
  assert page.locator('.cascade-card').filter(has_text='Social worlds').count()==1
  page.locator('.cascade-card').filter(has_text='Social worlds').click()
  assert page.locator('#cascadeVariants button').count()==5
  for label,needle in [('Twitter','Twitter'),('Tumblr','Tumblr'),('Instagram','Instagram'),('Twitch','Twitch'),('iMessage','Kitty')]:
   page.locator('#cascadeVariants button').filter(has_text=label).click()
   page.wait_for_function("document.getElementById('cascadeStatus').textContent.includes('original regex matches')",timeout=25000)
   text=page.locator('#cascadeFrame').content_frame.locator('body').inner_text()
   assert len(text)>20,(label,text[:200])
  assert '4 original regex matches' in page.locator('#cascadeStatus').inner_text()
  assert 'Kitty' in page.locator('#cascadeFrame').content_frame.locator('body').inner_text()
  page.locator('.cascade-feature').scroll_into_view_if_needed()
  page.screenshot(path=str(ROOT.parent/'social-five.png'))
  page.locator('.cascade-card').filter(has_text='CYOA Multi').click()
  page.wait_for_function("document.getElementById('cascadeStatus').textContent.includes('1 original regex matches')",timeout=25000)
  assert 'Gabrielle' in page.locator('#cascadePacket').input_value()
  assert page.locator('#cascadeFrame').content_frame.locator('.gabi-fcm-launch').count()>=1
  page.locator('.cascade-feature').scroll_into_view_if_needed()
  page.screenshot(path=str(ROOT.parent/'cyoa-multi.png'))
  page.locator('.cascade-card').filter(has_text='Omni Tracker').click()
  page.wait_for_function("document.getElementById('cascadeStatus').textContent.includes('17 original regex matches')",timeout=25000)
  assert page.locator('#cascadeFrame').content_frame.locator('.klmt-dock').count()>=1
  page.wait_for_function("document.getElementById('showcaseSampleCount').textContent === '10'",timeout=15000)
  assert page.locator('.showcase-card').count()==10
  assert page.locator('.showcase-card[data-fixture="phone"]').count()==0
  assert page.locator('.showcase-card[data-fixture="text-effects"]').count()==1
  page.locator('.showcase-card[data-fixture="text-effects"] .showcase-card-hit').click()
  page.wait_for_function("document.getElementById('showcaseFeatureStatus').textContent.includes('8 exact native regex matches')",timeout=20000)
  assert 'Kitty' in page.locator('#showcaseFrame').content_frame.locator('body').inner_text()
  page.locator('.showcase-feature').scroll_into_view_if_needed()
  page.screenshot(path=str(ROOT.parent/'text-effects.png'))
  page.locator('.showcase-card[data-fixture="marginalia"] .showcase-card-hit').evaluate('(el)=>el.click()')
  page.wait_for_function("document.getElementById('showcaseFeatureStatus').textContent.includes('4 exact native regex matches')",timeout=20000)
  assert page.locator('#showcaseFrame').content_frame.locator('button[popovertarget]').count()>=4
  page.locator('.showcase-feature').scroll_into_view_if_needed()
  page.screenshot(path=str(ROOT.parent/'marginalia.png'))
  for name in ['pov','thoughts','event-chaos','gabi-mutter','gabi-monitor','gabi-commentary']:
   page.locator(f'.showcase-card[data-fixture="{name}"] .showcase-card-hit').click()
   page.wait_for_function("document.getElementById('showcaseFeatureStatus').textContent.includes('Verified sample')",timeout=20000)
  page.locator('#regexPlatform').select_option('st')
  page.wait_for_function("document.getElementById('showcaseSampleCount').textContent === '3'",timeout=20000)
  assert page.locator('.showcase-card').count()==3
  page.set_viewport_size({'width':390,'height':844})
  page.locator('.cascade-showcase').scroll_into_view_if_needed()
  page.screenshot(path=str(ROOT.parent/'v13-mobile.png'))
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),page.evaluate('[document.documentElement.scrollWidth,innerWidth]')
  assert not errors,errors
  print('PASS: full cascade source, 5 social variants, CYOA Multi, 10 text-effect fixtures, ST, mobile, separate ES modules')
  browser.close()
if __name__=='__main__':run()
