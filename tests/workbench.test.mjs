import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {sillyTavernSections,stHeadingKind,stPresentationLabel,setSillyTavernPrompt,platformRegexGroups,patchNativeRegex,addCustomDossierSkin,trackerPreviewInput,trackerPreviewScripts,cssSafeForStyle} from '../js/workbench.js';
import {getActualRegexScripts,dossierSkins} from '../js/native.js';
import {transformRegex} from '../js/core.js';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const lumi=JSON.parse(readFileSync(resolve(ROOT,'data/native/lumiverse.json'),'utf8'));
const st=JSON.parse(readFileSync(resolve(ROOT,'data/native/sillytavern.json'),'utf8'));

test('311 SillyTavern prompt toggles remain grouped, keyed and ordered',()=>{
 const sections=sillyTavernSections(st),prompts=sections.flatMap(s=>s.entries);
 assert.equal(prompts.length,311);assert.ok(sections.length>7);
 assert.equal(new Set(prompts.map(e=>e.id)).size,311);
 for(const section of sections)assert.ok(section.name.length>0&&section.entries.length>0);
});
test('ST outline uses real decorative section prefixes without modifying native order',()=>{
 const groups=sillyTavernSections(st);
 const flat=groups.flatMap(g=>g.entries);
 const original=[...st.prompt_order[0].order.map(row=>row.identifier),...st.prompts.filter(p=>!st.prompt_order[0].order.some(row=>row.identifier===p.identifier)).map(p=>p.identifier)];
 assert.deepEqual(flat.map(e=>e.id),original);
 assert.equal(groups.at(-1).name,'Not in prompt order');
 assert.ok(groups.some(g=>g.name==='FORMATTING'));
 assert.ok(groups.some(g=>g.name==='Rolls'));
 assert.equal(stHeadingKind('✨┆✧ ━━FORMATTING━━'),'wrapper');
 assert.equal(stHeadingKind('┆       → User POV'),'subgroup');
 assert.equal(stHeadingKind('╰❛*ੈ⭐‧₊˚ೃ Stakes'),'subgroup');
 assert.equal(stHeadingKind('*ૢ✧ Length'),'leaf');
 assert.equal(stHeadingKind('╰───❛°ू ﹝✦﹞°ू❜ ───╯'),'closer');
 assert.equal(stPresentationLabel('╰❛*ੈ⭐‧₊˚ೃ Stakes'),'Stakes');
 const formatting=groups.find(g=>g.name==='FORMATTING');
 assert.ok(formatting.subgroups.length>3);
 assert.ok(formatting.subgroups.some(s=>s.name==='User POV'));
 assert.ok(formatting.subgroups.some(s=>s.children.some(c=>c.name==='Length')));
 const seen=groups.flatMap(g=>[...g.structure,...g.looseEntries,...g.subgroups.flatMap(s=>[...s.looseEntries,...s.children.flatMap(c=>c.entries)])]);
 assert.equal(seen.length,311);assert.equal(new Set(seen.map(e=>e.id)).size,311);
});
test('ST prompt toggle and content editor keep prompt_order and prompt object in sync',()=>{
 const copy=structuredClone(st),entry=sillyTavernSections(copy).flatMap(s=>s.entries).find(e=>e.id!=='nsfw');
 const original=copy.prompts.find(p=>p.identifier===entry.id);
 setSillyTavernPrompt(copy,entry.id,{enabled:!entry.enabled,content:original.content+'\n// local test'});
 assert.equal(original.enabled,!entry.enabled);
 assert.ok(original.content.endsWith('// local test'));
 const order=copy.prompt_order.flatMap(p=>p.order).find(o=>o.identifier===entry.id);
 assert.equal(order.enabled,!entry.enabled);
 assert.throws(()=>setSillyTavernPrompt(copy,'not-an-id',{enabled:true}),/Ambiguous or missing/);
});
test('Lumiverse id-less regex patch updates exactly the corresponding entry in both mirror arrays',()=>{
 const copy=structuredClone(lumi),scripts=getActualRegexScripts(copy);
 assert.equal(scripts.length,220);
 const chosen=scripts.find(s=>s.scriptName.includes('Unified shell and selector'));
 assert.ok(chosen.id.startsWith('lumi-regex-'));
 const unchangedName=copy.regex_scripts[chosen.index+1].name;
 const updated=chosen.replaceString+'\n<!-- test -->';
 assert.equal(patchNativeRegex(copy,chosen.id,{replaceString:updated}),2);
 for(const a of [copy.regex_scripts,copy.extensions.regex_scripts])assert.equal(a[chosen.index].replace_string,updated);
 assert.equal(copy.regex_scripts[chosen.index+1].name,unchangedName);
 const bad=structuredClone(lumi);bad.extensions.regex_scripts[chosen.index].name='MISMATCH';
 assert.throws(()=>patchNativeRegex(bad,chosen.id,{disabled:true}),/out of sync/);
});
test('ST regex patch uses exact ID and preserves unrelated native source',()=>{
 const copy=structuredClone(st),first=getActualRegexScripts(copy)[0];
 assert.equal(patchNativeRegex(copy,first.id,{disabled:!first.disabled}),1);
 assert.equal(copy.extensions.regex_scripts[0].disabled,!first.disabled);
 assert.equal(copy.prompts.length,311);
 assert.throws(()=>patchNativeRegex(copy,'fake',{disabled:false}),/missing or ambiguous/i);
});
test('new dossier skin clones both exact regex source mirrors and can be edited by its UUID',()=>{
 const copy=structuredClone(lumi),base=dossierSkins(copy)[0];
 const id=addCustomDossierSkin(copy,base.id,'Custom Dossier - Test');
 assert.ok(id);
 for(const arr of [copy.regex_scripts,copy.extensions.regex_scripts]){
  assert.equal(arr.length,221);
  assert.equal(arr.at(-1).script_id,id);
  assert.equal(arr.at(-1).disabled,true);
 }
 assert.equal(dossierSkins(copy).length,9);
 assert.equal(patchNativeRegex(copy,id,{replaceString:'--rxd-accent:#fff;'}),2);
 for(const arr of [copy.regex_scripts,copy.extensions.regex_scripts])assert.equal(arr.at(-1).replace_string,'--rxd-accent:#fff;');
});
test('real unified tracker template matches a synthetic source packet without inventing the renderer',()=>{
 const scripts=trackerPreviewScripts(lumi,dossierSkins(lumi)[0].id),result=transformRegex(trackerPreviewInput(),scripts);
 assert.equal(scripts.length,2);
 assert.ok(result.output.includes('class="klmt-island"'));
 assert.ok(result.output.includes('class="klmt'));
 assert.ok(result.log[0].changed);
 assert.ok(result.output.length>50_000);
});
test('CSS editor refuses HTML, remote imports and oversized overrides',()=>{
 assert.equal(cssSafeForStyle('.klmt {color:red}'),'.klmt {color:red}');
 for(const css of ['</style><script>','@import "other.css"','.klmt{background:url(https://a)}','x'.repeat(18001)])assert.throws(()=>cssSafeForStyle(css));
});
test('SillyTavern regex groups use source labels rather than a single invented folder',()=>{
 const groups=platformRegexGroups(getActualRegexScripts(st),'st');assert.ok(groups.size>4);assert.ok(groups.has('Gabi'));
});
