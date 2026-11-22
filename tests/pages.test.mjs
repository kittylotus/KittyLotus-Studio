import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const get=f=>readFileSync(resolve(root,f),'utf8');
test('GitHub Pages root works from a project subpath',()=>{
 const html=get('index.html');
 assert.match(html,/src="\.\/js\/app\.js\?v=0\.16\.0"/);
 assert.match(html,/href="\.\/css\/mobile-compact\.css"/);
 assert.doesNotMatch(html,/(?:src|href)=["']\/(?!\/)/);
 for(const [,local] of html.matchAll(/(?:src|href)=["'](\.\/[^"']+)["']/g))
  assert.ok(existsSync(resolve(root,local.split(/[?#]/)[0])),`Missing ${local}`);
 assert.ok(existsSync(resolve(root,'.nojekyll')));
});
test('mobile density applies only at phone breakpoints with no desktop global zoom',()=>{
 const css=get('css/mobile-compact.css');
 assert.match(css,/@media\s*\(max-width:700px\)/);
 assert.match(css,/body\s*\{\s*zoom:\s*\.92/);
 assert.match(css,/@media\s*\(max-width:390px\)/);
 assert.match(get('js/cascade-showcase.js'),/const compactCss=cyoa\?'':'@media\(max-width:650px\)\{html\{zoom:\.90\}\}'/);
 assert.match(get('js/showcase-ui.js'),/@media\(max-width:650px\)\{html\{zoom:\.90\}\}/);
});
test('deployment runs tests and stages public site only',()=>{
 const action=get('.github/workflows/pages.yml');
 for(const token of ['npm test','node scripts/stage-pages.mjs','actions/upload-pages-artifact@v3','actions/deploy-pages@v4'])
  assert.ok(action.includes(token),token);
 const staging=get('scripts/stage-pages.mjs');
 assert.match(staging,/const required=\['index\.html','\.nojekyll','css','js','data','assets'\]/);
 assert.ok(!staging.includes("cpSync(join(root,'tests')"));
});
