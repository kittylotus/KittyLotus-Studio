import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(ROOT,'index.html'),'utf8');
const app=readFileSync(resolve(ROOT,'js/app.js'),'utf8');
test('all hardcoded HTML ids are unique',()=>{const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);});
test('static entrypoint assets exist',()=>{for(const file of ['index.html','css/studio.css','css/constellation.css','css/nightshift.css','js/catalog.js','js/core.js','js/app.js','js/regex-worker.js','js/workbench.js','css/workbench.css','css/workshop-ux.css','css/skinmaker-v08.css','js/skin-controls.js','assets/gabi/gabi-views.webp','assets/favicon.svg','.nojekyll'])assert.ok(existsSync(resolve(ROOT,file)),`${file} missing`);});
test('all direct JS element-id references exist in the markup',()=>{const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));const referenced=[...app.matchAll(/\$\('([A-Za-z][^']*)'\)/g)].map(m=>m[1]);for(const id of referenced)assert.ok(ids.has(id),`missing id: ${id}`);});
test('site has semantic navigation and text alternatives for official Gabi artwork',()=>{assert.match(html,/<nav\s/);assert.match(html,/aria-label="Workspace"/);assert.match(html,/alt="Gabrielle"/);});

test('Constellation shell has working contextual navigation targets',()=>{for(const id of ['contextRail','contextNav','contextHelp','dashboardTargetSelect','dashboardSource'])assert.match(html,new RegExp(`id="${id}"`));assert.match(app,/function renderContext\(/);});
test('icons use inline SVG symbols rather than ASCII glyph substitutes',()=>{const ids=[...html.matchAll(/<symbol id="(i-[a-z-]+)"/g)].map(m=>m[1]);assert.ok(ids.length>=25);for(const m of html.matchAll(/<use href="#(i-[a-z-]+)"/g))assert.ok(ids.includes(m[1]),`unknown icon ${m[1]}`);assert.doesNotMatch(html,/[⌂⌘☷✧⌁♡✳↗↺ⓘ▶☰]/);});
test('rendered module icons have SVG registry entries',async()=>{const {MODULES}=await import('../js/catalog.js');const ids=new Set([...html.matchAll(/<symbol id="i-([a-z-]+)"/g)].map(m=>m[1]));for(const module of MODULES)assert.ok(ids.has(module.icon),`missing module icon ${module.icon}`);});

test('overview is a functioning lounge dashboard with SVG icons',()=>{for(const id of ['dashboardTargetSelect','portalGrid','portalCount','dashboardSource','dashboardRegexCount','dashboardSkinsCount','dashboardPlanCount'])assert.match(html,new RegExp(`id="${id}"`));assert.match(app,/function renderDashboardFilter\(/);assert.match(html,/assets\/gabi\/gabi-views\.webp/);assert.ok(existsSync(resolve(ROOT,'assets/gabi/gabi-views.webp')));});
test('portal workspaces correspond to native app routes',()=>{const routes=[...html.matchAll(/class="portal-card"[^>]*data-goto="([^"]+)"/g)].map(x=>x[1]);assert.deepEqual(routes.sort(),['architect','gabi','regex','skins']);assert.match(html,/data-dashboard-action="save-profile"/);});
test('dashboard has no imported-source fake success state',()=>{assert.match(html,/id="dashboardSource">Not imported/);assert.match(html,/id="dashboardSource">Not imported/);assert.match(app,/s\?\(s\.changed\?'Modified source'/);});


test('lounge filters preserve grid geometry while hiding unused actions',()=>{
 const css=readFileSync(resolve(ROOT,'css/nightshift.css'),'utf8');
 assert.match(css,/\.portal-card\[hidden\]\{display:flex!important;visibility:hidden;pointer-events:none\}/);
});
test('Gabrielle dock is anchored to bottom of primary sidebar',()=>{
 const css=readFileSync(resolve(ROOT,'css/constellation.css'),'utf8');
 assert.match(css,/\.gabi-dock\{[^}]*margin:auto -15px -14px/);
});

// Catch missing named ESM imports that concatenated browser fixtures cannot detect.
test('every local ES module named import has a matching exported binding',()=>{
 for(const sourceName of ['app.js','native.js','core.js']){
  const source=readFileSync(resolve(ROOT,'js',sourceName),'utf8');
  for(const match of source.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"](\.\/[^'"]+)['"]/g)){
   const imported=readFileSync(resolve(ROOT,'js',match[2]),'utf8');
   for(const raw of match[1].split(',')){
    const name=raw.trim().split(/\s+as\s+/)[0];
    if(!name)continue;
    assert.match(imported,new RegExp(`export\\s+(?:(?:async|default)\\s+)?(?:const|let|function|class)\\s+${name}\\b`),`${sourceName} imports ${name} from ${match[2]} but it is not exported`);
   }
  }
 }
});
