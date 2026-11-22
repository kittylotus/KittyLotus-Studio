import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dossierSkins} from '../js/native.js';
import {motiveLedgerRenderer,nativeSkinVariables} from '../js/workbench.js';
import {MOTIVE_AREAS,nativeTokensForArea,motiveAreaForSelector,skinVariableGuide} from '../js/skin-controls.js';
const source=JSON.parse(readFileSync(new URL('../data/native/lumiverse.json',import.meta.url)));
const current=dossierSkins(source).find(s=>/Default Purple/.test(s.scriptName));
const sourceCss=motiveLedgerRenderer(source).replaceString;
const tokens=nativeSkinVariables(current.replaceString);
test('source-driven editor opens with focused Motive areas and retains all 27 declarations',()=>{
 assert.equal(tokens.length,27);
 assert.deepEqual(MOTIVE_AREAS.map(x=>x.id),['visible','canvas','cards','tabs','text','geometry','unused']);
 assert.deepEqual(nativeTokensForArea(tokens,sourceCss,'canvas').map(x=>x.name),['--rxd-bg','--rxd-bg-2','--rxd-header','--rxd-shadow']);
 assert.equal(nativeTokensForArea(tokens,sourceCss,'visible').length,17);
 const extra=nativeTokensForArea(tokens,sourceCss,'unused');
 assert.equal(extra.length,10);
 assert.ok(extra.some(x=>x.name==='--rxd-panel'));
 assert.ok(extra.every(x=>skinVariableGuide(x.name,sourceCss).usages===0));
});
test('picker classifies elements by their native Motive class, not coordinates or fake prompts',()=>{
 const target=selector=>({closest:query=>query.split(',').includes(selector)?{}:null});
 assert.equal(motiveAreaForSelector(target('.klm-tab')),'tabs');
 assert.equal(motiveAreaForSelector(target('.klm-value')),'text');
 assert.equal(motiveAreaForSelector(target('.klm-panel')),'cards');
 assert.equal(motiveAreaForSelector(target('.klm-standalone-head')),'canvas');
 assert.equal(motiveAreaForSelector(null),'visible');
});
