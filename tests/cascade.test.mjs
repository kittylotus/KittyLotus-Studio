import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getActualRegexScripts} from '../js/native.js';
import {transformRegex} from '../js/core.js';
import {resolveCascadePlan,describeCascadeExecution} from '../js/cascade.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const load=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const source=getActualRegexScripts(load('data/native/lumiverse.json'));
const data=load('data/fixtures/cascade-samples.json');

test('five presentation slots cover full tracker, weather, campaign, five social surfaces and CYOA Multi',()=>{
 assert.equal(data.version,1);
 assert.deepEqual(data.cascades.map(x=>x.id),['omni-tracker','weather-system','campaign-console','social-studio','cyoa-multi']);
 const social=data.cascades.find(x=>x.id==='social-studio');
 assert.deepEqual(social.variants.map(x=>x.label),['Twitter','Tumblr','Instagram','Twitch','iMessage']);
 assert.equal(new Set(data.cascades.map(x=>x.id)).size,5);
 assert.ok(data.cascades.reduce((n,x)=>n+x.variants.length,0)>=19);
});
test('every cascade variant executes only its exact source rules and the expected payload matches',()=>{
 for(const scene of data.cascades){
  for(const variant of scene.variants){
   const effective={...scene,scriptNames:variant.scriptNames||scene.scriptNames,scriptContracts:variant.scriptContracts||scene.scriptContracts,requiredMatches:variant.requiredMatches||scene.requiredMatches};
   const plan=resolveCascadePlan(source,effective);assert.equal(plan.ok,true,`${scene.id}/${variant.id}: ${plan.reason}`);
   const output=transformRegex(variant.input,plan.scripts,{curatedCascade:true});
   const summary=describeCascadeExecution(effective,variant,output.log);
   assert.ok(summary.complete,`${scene.id}/${variant.id}: ${summary.missing.join(', ')}`);
   assert.ok(summary.matched>=1,`${scene.id}/${variant.id}`);
   assert.match(output.output,/<(?:div|section|style|article|header)\b/i);
   assert.ok(typeof variant.gabi==='string'&&variant.gabi.includes('Gabi'),`${scene.id}/${variant.id}: missing Gabi's explanation`);
  }
 }
});
test('social carousel uses five distinct verified native pipelines, including full iMessage phone frame',()=>{
 const scene=data.cascades.find(s=>s.id==='social-studio');
 const ids=new Set();for(const v of scene.variants){
  const plan=resolveCascadePlan(source,{...scene,...v});assert.ok(plan.ok,`${v.id}: ${plan.reason}`);
  const out=transformRegex(v.input,plan.scripts,{curatedCascade:true});const summary=describeCascadeExecution({...scene,...v},v,out.log);
  assert.ok(summary.complete);ids.add(v.id);
  if(v.id==='imessage'){assert.equal(summary.matched,4);assert.match(out.output,/social-v2-imessage-phone/);assert.match(out.output,/Too late. He stole my security keycard/);}
 }
 assert.equal(ids.size,5);
});
test('CYOA Multi packet builds the real branching dialog with two actors and six routes',()=>{
 const s=data.cascades.find(x=>x.id==='cyoa-multi'),v=s.variants[0],plan=resolveCascadePlan(source,s);
 assert.equal(plan.ok,true);const out=transformRegex(v.input,plan.scripts,{curatedCascade:true});
 assert.equal(out.log.filter(x=>x.changed).length,1);assert.match(out.output,/gabi-fcm-launch/);
 assert.match(out.output,/Gabrielle/);assert.match(out.output,/Zephyr/);
 for(const tag of ['override','confess','guide-kitty','seal-lift','protect-gabi','handoff'])assert.ok(out.output.includes(tag),tag);
});
test('entire eight-module tracker runs 17 native rule matches and retains eight pages',()=>{
 const scene=data.cascades[0],plan=resolveCascadePlan(source,scene);
 const result=transformRegex(scene.variants[0].input,plan.scripts,{curatedCascade:true});
 const summary=describeCascadeExecution(scene,scene.variants[0],result.log);
 assert.equal(summary.matched,17);assert.equal(summary.considered,18);
 for(const part of ['state','aux','motive','psyche','scene','inspect','social','knowledge'])assert.match(result.output,new RegExp(`klmt-page--${part}|klmt-tile--${part}`),`missing ${part}`);
 assert.ok(result.output.length>150000,'the complete tracker exceeds the standard diagnostic cap');
 assert.throws(()=>transformRegex(scene.variants[0].input,plan.scripts),/150,000/);
});
test('weather resolver renders six distinct native conditions with the original artwork URLs',()=>{
 const scene=data.cascades.find(c=>c.id==='weather-system');const plan=resolveCascadePlan(source,scene);
 assert.equal(scene.variants.length,6);
 for(const variant of scene.variants){const result=transformRegex(variant.input,plan.scripts,{curatedCascade:true});
  assert.match(result.output,/kl-static-weather/);assert.match(result.output,/kittylotus\/\-KittyLotus-extras|github\.com\/kittylotus/i);
  assert.equal(result.log.filter(x=>x.changed).length,2);
 }
});
test('campaign stages use matching native mileage/ribbon/boost rules without inventing rewards',()=>{
 const scene=data.cascades.find(c=>c.id==='campaign-console');const plan=resolveCascadePlan(source,scene);
 const matched=id=>transformRegex(scene.variants.find(v=>v.id===id).input,plan.scripts,{curatedCascade:true}).log.filter(x=>x.changed).map(x=>x.script);
 assert.ok(matched('milestone-one').some(s=>s.includes('Earned objective')));
 assert.ok(matched('milestone-two').some(s=>s.includes('Earned objective')));
 assert.ok(matched('boost').some(s=>s.includes('Pending attribute reward')));
 assert.ok(matched('compact').some(s=>s.includes('Console & character sheet')));
});
test('changed native regexes invalidate exact source contracts, even if the name still matches',()=>{
 const scene=data.cascades[0],mutated=source.map((s,i)=>i===69?{...s,replaceString:s.replaceString+'<!-- changed -->'}:s);
 const result=resolveCascadePlan(mutated,scene);assert.equal(result.ok,false);assert.match(result.reason,/source changed/);
 const missing=resolveCascadePlan(source.filter(s=>s.scriptName!==scene.scriptNames[0]),scene);assert.equal(missing.ok,false);
});
