import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {dossierSkins} from '../js/native.js';
import {individualDossierSkin,importIndividualDossierSkin,sillyTavernSections,stOutlinePresentation} from '../js/workbench.js';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const lumi=JSON.parse(readFileSync(resolve(ROOT,'data/native/lumiverse.json'),'utf8'));
const st=JSON.parse(readFileSync(resolve(ROOT,'data/native/sillytavern.json'),'utf8'));

test('individual dossier export retains exactly the real regex record and the latest unsaved CSS',()=>{
 const source=structuredClone(lumi), skin=dossierSkins(source).find(s=>s.scriptName.includes('Default Purple'));
 assert.ok(skin);
 const edit=skin.replaceString.replace('--rxd-bg:', '--rxd-bg: /* test */');
 const portable=individualDossierSkin(source,skin.id,edit);
 assert.deepEqual(Object.keys(portable),['kind','version','platform','regex_script']);
 assert.equal(portable.regex_script.name,skin.meta.name);
 assert.equal(portable.regex_script.replace_string,edit);
 assert.equal(portable.regex_script.find_regex,skin.meta.find_regex);
 assert.equal(portable.regex_script.disabled,false);
 assert.equal(source.regex_scripts[skin.index].replace_string,skin.replaceString,'Individual export must not write unsaved CSS to source');
 const received=JSON.parse(JSON.stringify(portable));
 const id=importIndividualDossierSkin(source,received);
 assert.ok(id&&id!==skin.id);
 assert.equal(source.regex_scripts.length,lumi.regex_scripts.length+1);
 assert.equal(source.extensions.regex_scripts.length,lumi.extensions.regex_scripts.length+1);
 assert.deepEqual(source.regex_scripts.at(-1),source.extensions.regex_scripts.at(-1));
 assert.equal(source.regex_scripts.at(-1).replace_string,edit);
 assert.equal(source.regex_scripts.at(-1).disabled,true,'Imported skin must not silently activate');
 assert.equal(source.regex_scripts.at(-1).metadata.skin_id,id,'Imported skin must receive its own metadata identity');
 assert.match(source.regex_scripts.at(-1).name,/Imported/);
 assert.equal(dossierSkins(source).length,dossierSkins(lumi).length+1);
});

test('bad or hostile individual skin imports fail before touching either native mirror',()=>{
 const invalid=[
  {},{kind:'kittylotus-dossier-skin',version:1,platform:'lumiverse',regex_script:{}},
  { ...individualDossierSkin(lumi,dossierSkins(lumi)[0].id),regex_script:{...dossierSkins(lumi)[0].meta,replace_string:'url(https://test.invalid)'}},
 ];
 for(const portable of invalid){const source=structuredClone(lumi);const before=JSON.stringify(source);assert.throws(()=>importIndividualDossierSkin(source,portable));assert.equal(JSON.stringify(source),before);}
 const missingMirror=structuredClone(lumi);delete missingMirror.extensions.regex_scripts;
 assert.throws(()=>importIndividualDossierSkin(missingMirror,individualDossierSkin(lumi,dossierSkins(lumi)[0].id)),/mirror/);
});

test('all 311 ST source prompts remain in order, with correct Unicode tiers and exact box boundaries',()=>{
 const sections=sillyTavernSections(st);const outlines=sections.flatMap(stOutlinePresentation);
 assert.equal(outlines.length,311);
 assert.equal(new Set(outlines.map(o=>o.entry.id)).size,311);
 assert.ok(outlines.some(o=>o.kind==='second'&&o.entry.originalName==='┆✧ User Settings'));
 assert.ok(outlines.some(o=>o.kind==='third'&&o.entry.originalName==='*ૢ✧ Length'));
 const html=sections.find(s=>s.name==='HTML');const rows=stOutlinePresentation(html);
 const opened=rows.findIndex(o=>o.entry.originalName.startsWith('┌─ Image Gen'));
 const closed=rows.findIndex(o=>o.entry.originalName.startsWith('╰      → Governor'));
 assert.ok(opened>=0&&closed>opened);
 assert.equal(rows[opened].kind,'box-start');assert.equal(rows[closed].kind,'box-end');
 assert.ok(rows.slice(opened+1,closed+1).every(o=>o.box));
 assert.ok(rows[closed].hasContent,'Closing governor is a native content prompt, not pure decoration');
 const labels=sections.map(s=>s.name);
 assert.ok(labels.includes('FORMATTING')&&labels.includes('Not in prompt order'));
});
