"""True ESM browser regression: preserve module scopes, run every ST outline family.

The legacy offline smoke concatenated modules into a single scope and accidentally
made stPresentationLabel global. This test creates separate browser Blob modules,
rewrites only import specifiers, and imports app.js with its real export boundaries.
No local webserver or blocked loopback is necessary.
"""
from pathlib import Path
from base64 import b64encode
from shutil import which
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
MODULES=['native.js','core.js','catalog.js','skin-controls.js','workbench.js','showcase.js','showcase-ui.js','cascade.js','cascade-showcase.js','app.js']
CSS=['studio.css','constellation.css','nightshift.css','workbench.css','workshop-ux.css','skinmaker-v08.css','skinmaker-v09.css','workshop-v10.css','regex-showcase.css','cascade-showcase.css','mobile-compact.css','skinlab-v017.css']
FIXTURES=['data/native/lumiverse.json','data/native/sillytavern.json','data/native/janitor-reserved-agency.txt','data/native/janitor-impersonation.txt','data/fixtures/contract-fixtures.json','data/fixtures/showcase-samples.json','data/fixtures/showcase-snapshots.json','data/fixtures/cascade-samples.json']

def run():
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    for name in CSS:html=html.replace(f'<link href="./css/{name}" rel="stylesheet"/>','')
    html=html.replace('<script src="./js/app.js?v=0.17.0" type="module"></script>','')
    html=html.replace('</head>','<style>'+'\n'.join((ROOT/'css'/name).read_text(encoding='utf-8') for name in CSS)+'</style></head>')
    image='data:image/webp;base64,'+b64encode((ROOT/'assets/gabi/gabi-views.webp').read_bytes()).decode()
    html=html.replace('src="./assets/gabi/gabi-views.webp"',f'src="{image}"')
    sources={name:(ROOT/'js'/name).read_text(encoding='utf-8').replace('?v=0.17.0','') for name in MODULES}
    fixtures={name:(ROOT/name).read_text(encoding='utf-8') for name in FIXTURES}
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path=which('chromium') or which('google-chrome'),args=['--no-sandbox'])
        page=browser.new_page(viewport={'width':1440,'height':900})
        errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
        page.set_content(html,wait_until='domcontentloaded')
        page.evaluate('''async ({sources,fixtures})=>{
          globalThis.fetch=async url=>{
            const path=String(url).replace(/^\\.\\//,'');
            if(Object.hasOwn(fixtures,path))return new Response(fixtures[path],{status:200});
            return new Response('Not found',{status:404});
          };
          const urls={};
          for(const name of ['native.js','core.js','catalog.js','skin-controls.js','workbench.js','showcase.js','showcase-ui.js','cascade.js','cascade-showcase.js','app.js']){
            const value=sources[name].replace(/(from\\s*['"])\\.\\/([^'"]+\\.js)(['"])/g,(match,start,dependency,end)=>{
              if(!urls[dependency])throw Error(`Unresolved import ${dependency} in ${name}`);
              return `${start}${urls[dependency]}${end}`;
            });
            urls[name]=URL.createObjectURL(new Blob([value],{type:'text/javascript'}));
          }
          await import(urls['app.js']);
        }''',{'sources':sources,'fixtures':fixtures})
        page.locator('.nav-item[data-view="architect"]').click()
        page.wait_for_function("document.querySelector('#nativeStatus')?.textContent.includes('native controls')",timeout=20000)
        page.locator('[data-platform="st"]').click()
        page.wait_for_function("document.querySelector('#nativeStatus')?.textContent.includes('311 native prompts')",timeout=20000)
        groups=page.locator('#contextNav button')
        group_labels=[x.inner_text().split('\n')[0] for x in groups.all()]
        assert len(group_labels)==17,group_labels
        for i,label in enumerate(group_labels):
            groups.nth(i).click()
            rows=page.locator('#nativeDetails .st-prompt-row').count()
            major=page.locator('#nativeDetails details.st-major-outline').count()
            assert rows>0 and major==1,(label,rows,major,page.locator('#nativeDetails').inner_text()[:250])
        print(f'All {len(group_labels)} real ST groups have nonempty native prompt rows: PASS',flush=True)
        groups.filter(has_text='Text Addons').click()
        assert page.locator('#nativeDetails .st-prompt-row').count() == 21
        assert page.locator('#nativeDetails .st-hierarchy-heading').count() > 1
        page.locator('#nativeDetails .st-prompt-row button').filter(has_text='Edit').first.click()
        assert page.locator('#nativeDetails .st-prompt-editor:not([hidden])').count()==1
        assert page.locator('#contextNav button.active').filter(has_text='Text Addons').count()==1
        # Switch through Janitor and back: stale navigation must never mask ST render failures.
        page.locator('[data-platform="jani"]').click()
        page.wait_for_function("document.querySelector('#janitorPromptText').value.length>1000",timeout=20000)
        page.locator('[data-platform="st"]').click()
        page.wait_for_function("document.querySelector('#nativeStatus').textContent.includes('311 native prompts')",timeout=20000)
        page.locator('#contextNav button').filter(has_text='Text Addons').click()
        assert page.locator('#nativeDetails .st-prompt-row').count()==21
        assert page.locator('#contextNav button').filter(has_text='No impersonation').count()==0
        assert not errors,errors
        print('ST Text Addons, editor, Janitor switchback, native ESM scope: PASS',flush=True)
        browser.close()

if __name__=='__main__':run()
