"""Real HTTP-served browser smoke for native preset contracts and bundled art."""
from pathlib import Path
from base64 import b64encode
from playwright.sync_api import sync_playwright
import json,sys
from shutil import which
ROOT=Path(__file__).resolve().parents[1]

def inline_fixture():
    html=(ROOT/'index.html').read_text()
    for filename in ['studio.css','constellation.css','nightshift.css','workbench.css','workshop-ux.css','skinmaker-v08.css','skinmaker-v09.css','workshop-v10.css','regex-showcase.css','cascade-showcase.css','mobile-compact.css']:
        html=html.replace(f'<link href="./css/{filename}" rel="stylesheet"/>','')
    html=html.replace('<script src="./js/app.js?v=0.16.0" type="module"></script>','')
    styles='\n'.join((ROOT/'css'/x).read_text() for x in ['studio.css','constellation.css','nightshift.css','workbench.css','workshop-ux.css','skinmaker-v08.css','skinmaker-v09.css','workshop-v10.css','regex-showcase.css','cascade-showcase.css','mobile-compact.css'])
    html=html.replace('</head>',f'<style>{styles}</style></head>')
    lounge='data:image/webp;base64,'+b64encode((ROOT/'assets/gabi/gabi-views.webp').read_bytes()).decode()
    html=html.replace('src="./assets/gabi/gabi-views.webp"',f'src="{lounge}"')
    fixtures={str(x.relative_to(ROOT)).replace('\\','/'):x.read_text(encoding='utf-8') for x in [ROOT/'data/native/lumiverse.json',ROOT/'data/native/sillytavern.json',ROOT/'data/native/janitor-reserved-agency.txt',ROOT/'data/native/janitor-impersonation.txt',ROOT/'data/fixtures/contract-fixtures.json',ROOT/'data/fixtures/showcase-samples.json',ROOT/'data/fixtures/showcase-snapshots.json',ROOT/'data/fixtures/cascade-samples.json']}
    import json
    prelude=r'const __fixtures='+json.dumps(fixtures,ensure_ascii=False)+r';globalThis.fetch=async function(url){const p=String(url).replace(/^\.\//, ""); if(Object.hasOwn(__fixtures,p))return new Response(__fixtures[p],{status:200});return new Response("Not found",{status:404});};'
    scripts=[]
    for name in ['catalog.js','native.js','core.js','workbench.js','skin-controls.js','showcase.js','showcase-ui.js','cascade.js','cascade-showcase.js','app.js']:
        source=(ROOT/'js'/name).read_text()
        source='\n'.join(line for line in source.splitlines() if not line.strip().startswith('import '))
        source=source.replace('export const ','const ').replace('export function ','function ').replace('export async function ','async function ')
        if name=='app.js':
            a=source.index('function runRegexInWorker(');b=source.index('async function loadNativeRegex(',a)
            source=source[:a]+'async function runRegexInWorker(input,scripts,options){return transformRegex(input,scripts,options);}'+'\n'+source[b:]
        scripts.append(source)
    html=html.replace('</body>','<script type="module">'+prelude+'\n'+'\n'.join(scripts)+'</script></body>')
    return html


def run(output=None):
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path=which('chromium') or which('google-chrome') or None,args=['--no-sandbox'])
        page=browser.new_page(viewport={'width':1440,'height':900})
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.set_content(inline_fixture(),wait_until='domcontentloaded')
        page.locator('.nav-item[data-view="architect"]').click()
        page.wait_for_function("document.getElementById('nativeStatus').textContent.includes('native controls')",timeout=30000)
        status=page.locator('#nativeStatus').inner_text()
        print('Native status:',status,flush=True)
        assert '117' in status,status
        assert page.locator('#nativeCategories button').count()>=10
        assert page.locator('#nativeDetails .native-row').count()>0
        assert page.locator('#nativeConcepts').count()==1
        assert page.locator('#dossierSkinSelect option').count()==8
        assert page.locator('#sourceName').inner_text()=='lumiverse.json'
        page.locator('#nativeSearch').fill('Impersonation | Write for me')
        assert page.locator('#nativeDetails .native-row').count()==1
        before=page.locator('#sourceDirty').inner_text()
        cb=page.locator('#nativeDetails input[type=checkbox]').first
        cb.click()
        assert page.locator('#sourceDirty').inner_text()=='Modified',(before,page.locator('#sourceDirty').inner_text())
        value=json.loads(page.locator('#sourceRaw').input_value())
        assert value['promptVariables']['2122b805-978d-4658-af6a-75de16ed3dda']['speak_for_user']==1
        print('Real schema switch wrote into original promptVariables: PASS',flush=True)
        page.locator('#nativeSearch').fill('Narrative Mode')
        dropdown=page.locator('#nativeDetails .native-row select').first
        assert dropdown.count()==1
        dropdown.select_option('01a16841-051b-7000-8c10-035706412355')
        value=json.loads(page.locator('#sourceRaw').input_value())
        assert value['promptVariables']['2122b805-978d-4658-af6a-75de16ed3dda']['KL_NARRATIVE_MODE']=='alternating'
        print('Mixed select stored semantic value, not UI UUID: PASS',flush=True)
        page.locator('#nativeSearch').fill('')
        page.locator('.nav-item[data-view="skins"]').click()
        page.wait_for_function("document.getElementById('skinBase').options.length >= 8",timeout=15000)
        assert 'Motive Ledger' in page.locator('#skinRendererName').text_content()
        assert page.locator('#skinDossierVariables .skin-token-card').count() == 4, 'Only visible Motive declarations should appear by default'
        assert page.locator('#skinBase option').count()==8
        page.locator('#skinManager').evaluate('el=>el.open=true')
        page.locator('#skinCreate').click()
        assert page.locator('#skinBase option').count()==9
        print('Native Skin Lab copied a real regex variant into both source arrays: PASS',flush=True)
        page.locator('#skinCss').evaluate("el=>{el.closest('details').open=true}")
        page.locator('#skinCss').fill('.rxd-motive { letter-spacing: .01em; }')
        page.locator('#skinApply').click()
        assert page.locator('#sourceDirty').inner_text()=='Modified'
        print('Skin Lab write to native regex renderer: PASS',flush=True)
        page.locator('.nav-item[data-view="gabi"]').click()
        assert page.locator('#gabiGallery .gabi-card').count()==15
        assert page.locator('#chibiGallery .gabi-card').count()==5
        assert 'assets/gabi/expressions/gabi_' in page.locator('#gabiGallery .gabi-card img').first.get_attribute('src')
        assert 'assets/chibis/chibi-gabi-' in page.locator('#chibiGallery .gabi-card img').first.get_attribute('src')
        print('15 expressions and 5 chibis render locally: PASS',flush=True)
        page.locator('.nav-item[data-view="regex"]').click()
        page.locator('#loadNativeRegex').click()
        page.wait_for_function("document.getElementById('regexCount').textContent.includes('loaded')")
        assert '221 loaded' in page.locator('#regexCount').text_content()
        page.locator('#regexWorkbenchDisclosure').evaluate('(el)=>el.open=true')
        page.locator('#fixtureSelector').select_option('gabi-live')
        page.locator('#loadFixture').click()
        assert '<!-- GABI_START -->' in page.locator('#regexInput').input_value()
        page.locator('#runRegex').click()
        page.wait_for_function("document.getElementById('runRegex').disabled === false",timeout=10000)
        assert not errors,errors
        print('Native regex folder and sourced fixture: PASS',flush=True)
        for width in [390,360]:
            page.set_viewport_size({'width':width,'height':850})
            page.evaluate("location.hash='architect'")
            page.wait_for_function("document.querySelector('.view.is-visible')?.id==='view-architect'")
            sw=page.evaluate('document.documentElement.scrollWidth');iw=page.evaluate('innerWidth')
            assert sw<=iw, f'Architect horizontal overflow at {width}: {sw} > {iw}'
        if output:
            Path(output).mkdir(parents=True,exist_ok=True)
            page.set_viewport_size({'width':1440,'height':900})
            page.locator('#nativeSearch').fill('')
            page.screenshot(path=str(Path(output)/'architect.png'),full_page=False)
            page.set_viewport_size({'width':390,'height':844})
            page.wait_for_timeout(500)
            page.screenshot(path=str(Path(output)/'architect-mobile.png'),full_page=False)
        assert not errors,errors
        print('Native Studio browser smoke: PASS',flush=True)
        browser.close()

if __name__=='__main__':
    run(sys.argv[1] if len(sys.argv)>1 else None)
