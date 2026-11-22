import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dossierSkins} from '../js/native.js';
import {nativeSkinVariables} from '../js/workbench.js';
import {editableColorParts,replaceEditableColor,editableLength,skinVariableGuide,insertDossierSkinIntoRenderer} from '../js/skin-controls.js';
import {motiveLedgerRenderer} from '../js/workbench.js';
const source=JSON.parse(readFileSync(new URL('../data/native/lumiverse.json',import.meta.url)));
const skin=dossierSkins(source).find(s=>/Default Purple/.test(s.scriptName));
const tokens=nativeSkinVariables(skin.replaceString);
const lookup=name=>tokens.find(t=>t.name===`--rxd-${name}`).value;

test('native color parser supports hex, rgba and every gradient stop without flattening the expression',()=>{
 const background=lookup('bg');const c=editableColorParts(background);assert.equal(c.length,1);assert.equal(c[0].alpha,.98);
 assert.equal(replaceEditableColor(background,0,'#112233',.25),'rgba(17,34,51,0.25)');
 const panel=lookup('panel');const stops=editableColorParts(panel);assert.equal(stops.length,2);
 const updated=replaceEditableColor(panel,1,'#123456',.6);
 assert.match(updated,/linear-gradient\(180deg,/);assert.match(updated,/rgba\(22,18,34,\.94\)/);assert.match(updated,/rgba\(18,52,86,0\.6\)/);
 assert.equal(editableColorParts('rgba(255,255,255,.042)')[0].alpha,.042);
 assert.throws(()=>replaceEditableColor(panel,4,'#123456',1),/does not exist/);
 assert.throws(()=>replaceEditableColor(panel,1,'#gggggg',1),/Invalid color/);
});
test('host-linked native colors detach when customized; composite values retain raw editing path',()=>{
 assert.equal(replaceEditableColor('var(--lumiverse-primary,#a58cf2)',0,'#112233',.9),'rgba(17,34,51,0.9)');
 assert.equal(replaceEditableColor('var(--lumiverse-primary-015,rgba(165,140,242,.15))',0,'#112233',.3),'rgba(17,34,51,0.3)');
 assert.equal(editableColorParts('color-mix(in srgb,var(--rxd-accent) 50%,white)').length,0);
 assert.deepEqual(editableLength('14px'),{number:14,unit:'px'});
 assert.equal(editableLength('4px 14px 4px 14px'),null);
});
test('skin guide counts usages from the native Motive regex and retains exact native token inventory',()=>{
 const motive=motiveLedgerRenderer(source);
 assert.equal(tokens.length,27);
 for(const token of tokens){const guide=skinVariableGuide(token.name,motive.replaceString);assert.ok(guide.purpose);assert.ok(guide.group);assert.ok(guide.label);}
 assert.equal(skinVariableGuide('--rxd-panel',motive.replaceString).group,'Surfaces');
 assert.equal(skinVariableGuide('--rxd-panel',motive.replaceString).usages,0, 'some native dossier tokens are intentionally not referenced by this renderer');
 assert.ok(skinVariableGuide('--rxd-bg',motive.replaceString).usages>0);
});
test('selected dossier rules enter the real source renderer through its original native marker',()=>{
 const motive=motiveLedgerRenderer(source).replaceString;
 const rendered=insertDossierSkinIntoRenderer(motive,skin.replaceString);
 assert.ok(rendered.includes('--rxd-panel:linear-gradient'));
 assert.ok(!rendered.includes('/*@@RX_DOSSIER_SKIN@@*/'));
 assert.throws(()=>insertDossierSkinIntoRenderer('not a renderer',skin.replaceString),/marker/);
 assert.throws(()=>insertDossierSkinIntoRenderer(motive,'</style><script>hi</script>'),/Invalid/);
});
