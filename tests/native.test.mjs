import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {detectNativeFormat,nativeSections,nativeValue,setNativeValue,validateControl,resolveNativeChoice,resolveNativeMultiChoice,regexPatternFingerprint,auditFixtureContracts,getActualRegexScripts,dossierSkins,selectDossierSkin,resolveGitHubCandidates,makeNativeFixtureSummary} from '../js/native.js';
import {extractRegexScripts,compileSourceRegex,transformRegex} from '../js/core.js';
import {GABIS,CHIBIS} from '../js/catalog.js';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const lumiverse=JSON.parse(readFileSync(resolve(ROOT,'data/native/lumiverse.json'),'utf8'));
const st=JSON.parse(readFileSync(resolve(ROOT,'data/native/sillytavern.json'),'utf8'));
const fixtures=JSON.parse(readFileSync(resolve(ROOT,'data/fixtures/contract-fixtures.json'),'utf8')).fixtures;

test('native fixtures identify three correct export formats',()=>{
 assert.equal(detectNativeFormat(lumiverse),'lumi');
 assert.equal(detectNativeFormat(st),'st');
 assert.equal(detectNativeFormat(readFileSync(resolve(ROOT,'data/native/janitor-reserved-agency.txt'),'utf8')),'jani');
 assert.equal(detectNativeFormat({blocks:[],prompts:[]}),null);
});
test('Lumiverse schema parses every native control with provenance and unique variable identity',()=>{
 const groups=nativeSections(lumiverse);const controls=groups.flatMap(x=>x.controls);
 assert.equal(controls.length,117);assert.ok(groups.length>=15);
 assert.equal(new Set(controls.map(c=>c.id)).size,controls.length);
 for(const c of controls){assert.ok(c.blockId&&c.name&&c.type);assert.ok(lumiverse.blocks.some(b=>b.id===c.blockId));assert.notEqual(nativeValue(lumiverse,c),undefined);}
 const summary=makeNativeFixtureSummary(lumiverse);
 assert.equal(summary.regexScripts,220);assert.equal(summary.skinVariants,8);
 assert.equal(summary.controls,117);assert.ok(summary.regexFolders>=15);
});
test('native editor writes a real variable without changing unrelated identities',()=>{
 const copy=structuredClone(lumiverse);
 const controls=nativeSections(copy).flatMap(x=>x.controls);
 const agency=controls.find(v=>v.name==='speak_for_user');
 const before=structuredClone(copy.blocks);const previous=nativeValue(copy,agency);
 const next=previous===0?1:0;
 setNativeValue(copy,agency,next);
 assert.equal(copy.promptVariables[agency.blockId][agency.name],next);
 assert.deepEqual(copy.blocks,before);
 assert.equal(copy.schemaVersion,lumiverse.schemaVersion);
 assert.equal(copy.regex_scripts.length,220);
 assert.throws(()=>setNativeValue(copy,{...agency,id:'wrong-uuid'},0),/Variable ID/);
 assert.throws(()=>setNativeValue(copy,agency,'yes'),/Switch/);
});
test('native sliders, selects and multiselects reject invented options and out-of-range numbers',()=>{
 const controls=nativeSections(lumiverse).flatMap(g=>g.controls);
 const slider=controls.find(v=>v.type==='slider'&&v.max!==undefined);
 assert.throws(()=>validateControl(slider,Number(slider.max)+100),/maximum/);
 const select=controls.find(v=>v.type==='select'&&v.options?.length);
 assert.throws(()=>validateControl(select,'definitely-not-a-source-choice'),/native schema/);
 const multi=controls.find(v=>v.type==='multiselect');
 assert.throws(()=>validateControl(multi,['not-in-source-schema']),/Unknown/);
 assert.doesNotThrow(()=>validateControl(multi,[multi.options[1].id]));
});
test('Lumiverse snake_case and SillyTavern camelCase regex adapters preserve full native counts, order and flags',()=>{
 const l=getActualRegexScripts(lumiverse),s=getActualRegexScripts(st);
 assert.equal(l.length,220);assert.equal(s.length,22);
 assert.equal(extractRegexScripts(lumiverse).length,220);
 assert.equal(extractRegexScripts(st).length,22);
 assert.equal(l[0].scriptName,lumiverse.regex_scripts[0].name);
 assert.equal(l[0].flags,lumiverse.regex_scripts[0].flags);
 assert.equal(l[1].index,1);
});
test('dossier skin applies exactly one enabled variant to both native mirrors and preserves non-skin scripts',()=>{
 const copy=structuredClone(lumiverse);const skins=dossierSkins(copy);
 assert.equal(skins.length,8);
 const previousNames=copy.regex_scripts.filter(r=>!r.folder.includes('Regex Skins')).map(r=>[r.name,r.disabled]);
 const chosen=skins.at(-1);
 const edits=selectDossierSkin(copy,chosen.id);
 assert.ok(edits>=0);
 for(const scripts of [copy.regex_scripts,copy.extensions.regex_scripts]){
  const variants=scripts.filter(x=>x.folder.includes('Regex Skins'));
  assert.equal(variants.length,8);
  assert.equal(variants.filter(x=>!x.disabled).length,1);
  assert.equal(variants.find(x=>!x.disabled).name,chosen.scriptName);
 }
 assert.deepEqual(copy.regex_scripts.filter(r=>!r.folder.includes('Regex Skins')).map(r=>[r.name,r.disabled]),previousNames);
 assert.throws(()=>selectDossierSkin(copy,'not-a-real-native-skin'),/does not exist/);
});
test('contract fixtures contain authentic marker packets and match the current regex source',()=>{
 for(const fixture of fixtures){
  const native=fixture.platform==='st'?st:lumiverse;
  const script=getActualRegexScripts(native).find(r=>r.scriptName===fixture.scriptName||r.scriptName.includes(fixture.scriptQuery));
  assert.ok(script,`${fixture.name}: source script missing`);
  const compiled=compileSourceRegex(script.findRegex,script.flags);
  assert.ok(compiled.test(fixture.input),`${fixture.name}: native source no longer matches fixture`);
  const result=transformRegex(fixture.input,[script]);
  assert.ok(result.log[0].changed,`${fixture.name}: source renderer did not match`);
 }
});
test('GitHub sync avoids ambiguous version choice and accepts original repo paths',()=>{
 const tree=[{type:'blob',path:'Lumiverse/V6/a.json',size:100},{type:'blob',path:'Lumiverse/V6/b.json',size:300},{type:'blob',path:'Janitor Prompt/a.txt',size:300},{type:'blob',path:'SillyTavern.json',size:1000},{type:'blob',path:'Lumiverse/V5/c.json',size:300}];
 assert.equal(resolveGitHubCandidates(tree,'lumi').length,2);
 assert.equal(resolveGitHubCandidates(tree,'jani').length,1);
 assert.equal(resolveGitHubCandidates(tree,'st').length,1);
 assert.equal(resolveGitHubCandidates(tree,'bad').length,0);
});
test('all bundled expressions and chibis exist by exact registry name and have PNG headers',()=>{
 assert.equal(GABIS.length,15);assert.equal(CHIBIS.length,5);
 for(const item of GABIS){const path=resolve(ROOT,'assets/gabi/expressions',item.file);assert.equal(readFileSync(path).subarray(1,4).toString(),'PNG');}
 for(const item of CHIBIS){const path=resolve(ROOT,item.src.replace(/^\.\//,''));assert.equal(readFileSync(path).subarray(1,4).toString(),'PNG');}
});

test('native dropdown exporter respects value-vs-UUID identity, including mixed option catalogs',()=>{
 const controls=nativeSections(lumiverse).flatMap(s=>s.controls);
 const mode=controls.find(x=>x.name==='KL_NARRATIVE_MODE');
 assert.equal(resolveNativeChoice(mode,nativeValue(lumiverse,mode),mode.options.find(x=>x.value==='alternating').id),'alternating');
 const place=controls.find(x=>x.name==='gabiplacement');
 assert.equal(resolveNativeChoice(place,nativeValue(lumiverse,place),place.options[1].id),place.options[1].id);
 const prose=controls.find(x=>x.name==='KL_PROSE_LEVEL');
 assert.equal(resolveNativeChoice(prose,nativeValue(lumiverse,prose),prose.options.at(-1).id),prose.options.at(-1).id);
 const multi=controls.find(x=>x.name==='npc_name_locale');
 assert.equal(resolveNativeMultiChoice(multi,nativeValue(lumiverse,multi),[multi.options[1].id])[0],multi.options[1].id);
 assert.throws(()=>resolveNativeChoice(mode,'roleplay','missing-id'),/not in the native schema/);
});
test('all schema fixtures pin one exact native script, source pattern and payload match',()=>{
 const lumiFixtures=fixtures.filter(f=>f.platform!=='st'),stFixtures=fixtures.filter(f=>f.platform==='st');
 const audit=[...auditFixtureContracts(lumiverse,lumiFixtures),...auditFixtureContracts(st,stFixtures)];
 assert.equal(audit.length,fixtures.length);
 assert.ok(audit.every(x=>x.ok),JSON.stringify(audit));
 const copy=structuredClone(lumiverse);
 const fixture=fixtures[0];
 copy.regex_scripts.find(s=>s.name===fixture.scriptName).find_regex='deadbeef';
 const drift=auditFixtureContracts(copy,fixtures).find(x=>x.id===fixture.id);
 assert.equal(drift.reason,'upstream regex changed');
 const multiple=structuredClone(fixtures[0]);delete multiple.scriptName;
 multiple.scriptQuery='Regex Skins';
 assert.equal(auditFixtureContracts(lumiverse,[multiple])[0].reason,'ambiguous script match');
 assert.equal(regexPatternFingerprint('test'),regexPatternFingerprint('test'));
});
