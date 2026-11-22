import {SHOWCASE_GROUPS,showcaseGroup,resolveShowcaseFixture,resolveShowcaseScripts,sourceHasPreviewHtml} from './showcase.js';
import {hasRenderableReplacement} from './workbench.js';
import {auditFixtureContracts,regexPatternFingerprint} from './native.js';

const showcaseGet=id=>document.getElementById(id);
function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
const icons={Tracking:'◈',Social:'◌',Decorations:'✧',Typography:'Aa',Documents:'▤',Gabrielle:'✦',Other:'◇'};
/** A CSP + sandbox alone cannot emulate host behavior, but blocks script/network execution from imported source HTML. */
function browserDisplayHtml(fixture,output){
 // Gabi monitor/mutter cards are host-macro gated. Display only their original UI island,
 // never simulating the host variable conditions or altering the source regex/export.
 if(!['gabi-mutter','gabi-monitor'].includes(fixture.id))return output;
 const start=output.indexOf('<!-- UI_START -->'),end=output.indexOf('<!-- UI_END -->',start);
 return start>=0&&end>start?output.slice(start,end+'<!-- UI_END -->'.length):output;
}
function safePreviewDocument(output,thumbnail=false){
 const inner=thumbnail?'body{padding:16px!important}':'body{padding:22px!important}';
 return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; script-src 'none'; connect-src 'none'; form-action 'none'"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#08070b;color:#f4f2f7;font:14px/1.6 system-ui,sans-serif;overflow-wrap:anywhere}@media(max-width:650px){html{zoom:.90}}${inner}</style></head><body>${output}</body></html>`;
}

export function createShowcase({getScripts,getPlatform,getFixtures,getSnapshots,getSource,run,onInspect,onSelect}){
 let category='All',search='',selected=null,indexShown=24,revision=0,loading=0;
 const cache=new Map();
 const present=()=>getScripts().filter(hasRenderableReplacement);
 const fixtures=()=>{
  const scripts=getScripts(),platform=getPlatform(),source=getSource();
  const ready=getFixtures().filter(f=>(f.platform||'lumi')===platform&&f.showcase===true);
  return ready.map(f=>({fixture:f,script:resolveShowcaseFixture(scripts,f)})).filter(x=>{
   if(!x.script||!hasRenderableReplacement(x.script))return false;
   if(x.fixture.patternFingerprint&&regexPatternFingerprint(x.script.findRegex)!==x.fixture.patternFingerprint)return false;
   if(!resolveShowcaseScripts(scripts,x.fixture))return false;
   return !source||auditFixtureContracts(source,[x.fixture])[0]?.ok;
  }).sort((a,b)=>{
   const rank=id=>id==='motive-lumi'||id==='motive-st'?0:id==='discord-message'||id==='st-discord'?1:id==='phone'?2:3;
   return rank(a.fixture.id)-rank(b.fixture.id);
  });
 };
 const keyFor=(fixture,script)=>`${getPlatform()}:${fixture.id}:${script.id}`;
 async function sampleResult(fixture,script){
  const key=keyFor(fixture,script),cached=cache.get(key);
  const all=resolveShowcaseScripts(getScripts(),fixture);if(!all)throw new Error('Native source no longer matches this curated fixture.');
  if(cached&&cached.pattern===script.findRegex&&cached.replacement===script.replaceString&&cached.signature===JSON.stringify(all.map(s=>[s.findRegex,s.replaceString])))return cached.result;
  const snapshot=getSnapshots()?.find(x=>x.id===fixture.id&&x.platform===getPlatform()
   &&x.patternFingerprint===regexPatternFingerprint(script.findRegex)
   &&x.replacementFingerprint===regexPatternFingerprint(script.replaceString)
   &&x.inputFingerprint===regexPatternFingerprint(fixture.input));
  const value=snapshot&&!fixture.scriptNames?{output:snapshot.output,log:[{script:script.scriptName,changed:true}]}:await run(fixture.input,all);
  if(!sourceHasPreviewHtml(value))throw new Error('This source regex did not produce visual HTML for the sample.');
  cache.set(key,{pattern:script.findRegex,replacement:script.replaceString,signature:JSON.stringify(all.map(s=>[s.findRegex,s.replaceString])),result:value});return value;
 }
 function getVisible(){return fixtures().filter(({fixture,script})=>{
  const group=fixture.group||showcaseGroup(script);return (category==='All'||group===category)&&(!search||`${fixture.name} ${fixture.kind||''} ${script.scriptName} ${group}`.toLowerCase().includes(search));
 });}
 function setFilters(){
  const host=showcaseGet('showcaseFilters');host.replaceChildren();const all=fixtures();
  for(const group of SHOWCASE_GROUPS){const count=group==='All'?all.length:all.filter(x=>(x.fixture.group||showcaseGroup(x.script))===group).length;if(group!=='All'&&!count)continue;
   const button=node('button',group===category?'active':'',group);button.type='button';button.setAttribute('aria-pressed',String(group===category));
   const n=node('small','',String(count));button.append(n);button.addEventListener('click',()=>{category=group;render();});host.append(button);
  }
 }
 async function hydrateCards(cards,renderRevision){
  // Sequential, bounded execution: expensive user-imported patterns never launch a Worker storm.
  for(const {fixture,script,frame,preview} of cards){
   if(renderRevision!==revision||!frame.isConnected)return;
   try{const result=await sampleResult(fixture,script);if(renderRevision!==revision||!frame.isConnected)return;
    frame.srcdoc=safePreviewDocument(browserDisplayHtml(fixture,result.output),true);preview.classList.add('is-ready');
   }catch(error){if(renderRevision!==revision||!frame.isConnected)return;preview.textContent='Preview unavailable · inspect sample';preview.classList.add('has-error');}
  }
 }
 async function choose(fixture,script,jump=true){
  selected={platform:getPlatform(),id:fixture.id};
  document.querySelectorAll('.showcase-card').forEach(card=>card.classList.toggle('selected',card.dataset.fixture===fixture.id));
  onSelect(script,fixture);
  showcaseGet('showcaseFeatureTitle').textContent=fixture.name;
  showcaseGet('showcaseFeatureDescription').textContent=`${fixture.kind||fixture.group||showcaseGroup(script)} · ${(fixture.scriptNames?.length||1)} original native ${fixture.scriptNames?.length===1||!fixture.scriptNames?'rule':'rules'}`;
  showcaseGet('showcaseFeatureStatus').textContent='Running original native replacement…';
  const token=++loading;
  try{const result=await sampleResult(fixture,script);if(token!==loading)return;
   showcaseGet('showcaseFrame').srcdoc=safePreviewDocument(browserDisplayHtml(fixture,result.output));
   showcaseGet('showcaseFeatureStatus').textContent=`Verified sample · ${result.log.filter(x=>x.changed).length} exact native regex matches · ${getPlatform()==='st'?'SillyTavern':'Lumiverse'}${['gabi-mutter','gabi-monitor'].includes(fixture.id)?' · host gate hidden for preview':''}`;
  }catch(error){if(token!==loading)return;showcaseGet('showcaseFrame').srcdoc=safePreviewDocument('<p>Cannot render this sample. Open the source inspector to check its contract.</p>');showcaseGet('showcaseFeatureStatus').textContent=error.message;}
  if(jump)showcaseGet('showcaseFeature').scrollIntoView({behavior:'instant',block:'start'});
 }
 function render({preserveInspector=false}={}){
  const token=++revision,list=getVisible(),host=showcaseGet('showcaseCards');host.replaceChildren();setFilters();
  showcaseGet('showcaseSampleCount').textContent=fixtures().length;showcaseGet('showcaseVisualCount').textContent=present().length;
  if(!list.length){host.append(node('p','showcase-empty','No verified HTML samples in this category. Browse the full native index below.'));return;}
  const cards=[];
  for(const {fixture,script} of list){const group=fixture.group||showcaseGroup(script);
   const button=node('article','showcase-card'+(selected?.id===fixture.id&&selected?.platform===getPlatform()?' selected':''));button.dataset.fixture=fixture.id;
   const thumb=node('div','showcase-thumb');const frame=node('iframe');frame.sandbox='';frame.setAttribute('referrerpolicy','no-referrer');frame.setAttribute('tabindex','-1');frame.setAttribute('aria-hidden','true');frame.loading='eager';thumb.append(frame);
   const badge=node('span','showcase-card-label',`${icons[group]||'◇'}  ${group}`),title=node('strong','',fixture.name),desc=node('small','',fixture.kind||'Native HTML renderer');
   const head=node('div','showcase-card-top');head.append(badge,node('span','showcase-verified','Verified'));
   const foot=node('div','showcase-card-body');foot.append(title,desc);
   const hit=node('button','showcase-card-hit');hit.type='button';hit.setAttribute('aria-label',`View ${fixture.name} sample`);hit.addEventListener('click',()=>choose(fixture,script));button.append(head,thumb,foot,hit);host.append(button);cards.push({fixture,script,frame,preview:thumb});
  }
  hydrateCards(cards,token);
  const all=fixtures(),active=all.find(x=>x.fixture.id===selected?.id&&selected?.platform===getPlatform())||list[0];
  if(preserveInspector){
   if(selected&&!fixtures().some(x=>x.fixture.id===selected.id)){
    selected=null;showcaseGet('showcaseFeatureStatus').textContent='Source edited · select another verified sample to preview';
   }
  }else if(active&&(selected?.id!==active.fixture.id||selected?.platform!==getPlatform()))choose(active.fixture,active.script,false);
  renderIndex();
 }
 function renderIndex(){
  const scripts=present(),query=showcaseGet('showcaseIndexSearch').value.trim().toLowerCase(),samples=fixtures();
  const filtered=scripts.filter(s=>!query||`${s.scriptName} ${s.folder}`.toLowerCase().includes(query));
  showcaseGet('showcaseIndexCount').textContent=`${scripts.length} visual scripts`;
  const host=showcaseGet('showcaseIndex');host.replaceChildren();
  for(const script of filtered.slice(0,indexShown)){
   const match=samples.find(x=>x.script.id===script.id),group=showcaseGroup(script),item=node('button','showcase-index-item');item.type='button';
   item.append(node('span','showcase-index-symbol',icons[group]||'◇'));
   const copy=node('span','showcase-index-copy');copy.append(node('strong','',script.scriptName),node('small','',`${group} · ${script.folder}`));item.append(copy);
   item.append(node('span','showcase-index-tag'+(match?' has-sample':''),match?'View sample':'No sample yet'));
   item.addEventListener('click',()=>{
    if(match)choose(match.fixture,match.script);
    else{selected=null;onInspect(script,null);showcaseGet('showcaseFeatureTitle').textContent=script.scriptName;showcaseGet('showcaseFeatureDescription').textContent='No verified sample is bundled for this regex. Use the workbench to supply an original packet.';showcaseGet('showcaseFeatureStatus').textContent='Original script selected · no invented HTML preview';showcaseGet('showcaseFrame').srcdoc=safePreviewDocument('<p style="font-size:13px;color:#aaa3b5">No verified HTML sample for this source regex.</p>');showcaseGet('showcaseFeature').scrollIntoView({behavior:'smooth',block:'start'});}
   });host.append(item);
  }
  const more=showcaseGet('showcaseMore');more.hidden=filtered.length<=indexShown;more.textContent=`Show more (${filtered.length-indexShown} remaining)`;
  if(!filtered.length)host.append(node('p','showcase-empty','No matching native script names.'));
 }
 showcaseGet('showcaseSearch').addEventListener('input',e=>{search=e.target.value.trim().toLowerCase();render();});
 showcaseGet('showcaseIndexSearch').addEventListener('input',()=>{indexShown=24;renderIndex();});
 showcaseGet('showcaseMore').addEventListener('click',()=>{indexShown+=24;renderIndex();});
 showcaseGet('showcaseOpenEditor').addEventListener('click',()=>{showcaseGet('regexWorkbenchDisclosure').open=true;showcaseGet('regexWorkbenchDisclosure').scrollIntoView({behavior:'smooth',block:'start'});});
 return {refresh:render,renderIndex};
}
