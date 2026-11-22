import {resolveCascadePlan,describeCascadeExecution} from './cascade.js';

const $=id=>document.getElementById(id);
function el(tag,cls,content){const value=document.createElement(tag);if(cls)value.className=cls;if(content!==undefined)value.textContent=content;return value;}
const symbols={Trackers:'◈',Environment:'☼',Campaign:'✦',Social:'◌',Websites:'▣'};
const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/** Native weather and CYOA artwork keep canonical source URLs; all previews disallow scripts. */
function trustedPreviewDocument(output,scene){
 const trustedArtwork=scene.id==='weather-system'||scene.id==='cyoa-multi';
 const imagePolicy=trustedArtwork?'img-src data: https://github.com https://raw.githubusercontent.com;':'img-src data:;';
 // Native CYOA already has a declarative popover dock and <details> actor chooser.
 // Keep them intact. No scripts, choice submission, or synthetic interaction layer is needed.
 // Only the verified generated ID is substituted upstream (in core.js) for the sandbox.
 const cyoa=scene.id==='cyoa-multi';
 const compactCss=cyoa?'':'@media(max-width:650px){html{zoom:.90}}';
 const previewCss=cyoa?`body:has(.gabi-cyoa-launch){min-height:100dvh;display:grid;place-items:center;background:radial-gradient(ellipse at 50% 44%,rgba(70,48,104,.2),transparent 66%),#030305}
 .gabi-cyoa-launch{position:relative;z-index:1}
 .gabi-cyoa-launch:focus-visible,.gabi-fcm-actor>summary:focus-visible,.gabi-cyoa-close:focus-visible{outline:2px solid #70ddff;outline-offset:4px}
 @media(max-width:650px){body:has(.gabi-cyoa-launch){padding:10px}}`:'';
 return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; ${imagePolicy} script-src 'none'; connect-src 'none'; font-src 'none'; form-action 'none'"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#060509;color:#f4f2f7;font:14px/1.6 system-ui,sans-serif;overflow-wrap:anywhere}body{padding:clamp(12px,2.5vw,24px)}img{max-width:100%}${compactCss}${previewCss}</style></head><body>${output}</body></html>`;
}
function emptyDocument(message){return trustedPreviewDocument(`<p style="color:#bfb0d4">${escapeText(message)}</p>`,{id:'empty'});}

export function createCascadeShowcase({getCases,getScripts,getPlatform,run,onInspect}){
 let selectedId='omni-tracker',variantId='',generation=0;
 const cards=$('cascadeCards'),variants=$('cascadeVariants'),frame=$('cascadeFrame'),steps=$('cascadeSteps');
 const buttonFor=(text,cls,callback)=>{const b=el('button',cls,text);b.type='button';b.addEventListener('click',callback);return b;};
 const scenes=()=>getPlatform()==='lumi'?getCases().filter(s=>s.platform==='lumi'):[];
 function select(id){selectedId=id;variantId='';render();}
 function renderCards(){cards.replaceChildren();for(const scene of scenes()){
   const item=buttonFor('','cascade-card'+(scene.id===selectedId?' is-active':''),()=>select(scene.id));
   item.setAttribute('aria-pressed',String(scene.id===selectedId));item.setAttribute('aria-label',`Open ${scene.name}`);
   item.append(el('span','cascade-card-icon',symbols[scene.category]||'◇'));
   const copy=el('span','cascade-card-copy');copy.append(el('small','',`${scene.category} · ${scene.variants.length} ${scene.variants.length===1?'view':'views'}`),el('strong','',scene.name),el('span','',scene.kicker));item.append(copy);cards.append(item);
  }
 }
 function renderVariants(scene){variants.replaceChildren();for(const variant of scene.variants){
  const b=buttonFor(variant.label,variant.id===variantId?'is-active':'',()=>{variantId=variant.id;renderDetails(scene);});b.setAttribute('aria-pressed',String(variant.id===variantId));variants.append(b);
 }}
 function renderSteps(scene,plan,summary){steps.replaceChildren();
  if(!summary){steps.append(el('p','cascade-subtle',plan.reason));return;}
  for(const step of summary.steps){const item=buttonFor('',`cascade-step ${step.changed?'did-match':'did-skip'}`,()=>{
    const script=plan.scripts.find(s=>s.scriptName===step.name);if(script)onInspect(script);
   });item.title=`Inspect native regex: ${step.name}`;
   item.append(el('span','cascade-step-count',String(step.order).padStart(2,'0')),el('span','cascade-step-name',step.name),el('span','cascade-step-status',step.changed?'Matched':'No change'));steps.append(item);
  }
 }
 function render(){
  const available=scenes();if(!available.length){++generation;cards.replaceChildren();variants.replaceChildren();steps.replaceChildren();$('cascadeStage').setAttribute('aria-label',getPlatform()==='st'?'Lumiverse full presentations only':'Waiting for original native source');frame.srcdoc=emptyDocument('Select Lumiverse for the full presentation demos.');$('cascadeStatus').textContent='Not loaded';$('cascadeStat').textContent='Lumiverse source only';$('cascadeCopyStatus').textContent='';return;}
  const scene=available.find(s=>s.id===selectedId)||available[0];selectedId=scene.id;
  if(!scene.variants.some(v=>v.id===variantId))variantId=scene.variants[0].id;
  renderCards();renderDetails(scene);
 }
 async function renderDetails(scene){const variant=scene.variants.find(x=>x.id===variantId)||scene.variants[0];variantId=variant.id;
  const renderToken=++generation;
  $('cascadeStage').dataset.cascade=variant.previewKind||scene.id;
  $('cascadeStage').setAttribute('aria-label',scene.name+': '+variant.label+'. '+scene.description);
  $('cascadeGabi').textContent=variant.gabi;$('cascadePacket').value=variant.input;$('cascadeCopyStatus').textContent='';
  $('cascadeFootnote').textContent=scene.notes||'Original native output; browser sandbox disables host-only interactions.';
  $('cascadeStatus').textContent='Running original native source…';
  const executionScene={...scene,scriptNames:variant.scriptNames||scene.scriptNames,scriptContracts:variant.scriptContracts||scene.scriptContracts,requiredMatches:variant.requiredMatches||scene.requiredMatches,previewHostPopoverId:variant.previewHostPopoverId||scene.previewHostPopoverId};
  $('cascadeStat').textContent=`${executionScene.scriptNames.length} source rules`;
  renderVariants(scene);steps.replaceChildren(el('p','cascade-subtle','Checking source patterns…'));
  const plan=resolveCascadePlan(getScripts(),executionScene);if(!plan.ok){frame.srcdoc=emptyDocument(plan.reason);$('cascadeStatus').textContent='Source contract changed · preview unavailable';renderSteps(scene,plan,null);return;}
  try{const result=await run(variant.input,plan.scripts,{curatedCascade:true,previewHostPopoverId:executionScene.previewHostPopoverId===true});if(renderToken!==generation)return;
   const summary=describeCascadeExecution(executionScene,variant,result.log);renderSteps(scene,plan,summary);
   $('cascadeStat').textContent=`${summary.matched} matched / ${summary.considered} checked`;
   if(!summary.complete){frame.srcdoc=emptyDocument(`Required rules did not match: ${summary.missing.join(', ')}`);$('cascadeStatus').textContent='Fixture contract failed';return;}
   frame.srcdoc=trustedPreviewDocument(result.output,scene);
   $('cascadeStatus').textContent=`${summary.matched} original regex matches · ${Math.round(result.output.length/1024)} KB native HTML · sandboxed`;
  }catch(error){if(renderToken!==generation)return;frame.srcdoc=emptyDocument(error.message);$('cascadeStatus').textContent=error.message;steps.replaceChildren(el('p','cascade-subtle',error.message));}
 }
 $('cascadeCopyPacket').addEventListener('click',async()=>{
  const source=$('cascadePacket').value;try{await navigator.clipboard.writeText(source);$('cascadeCopyStatus').textContent='Gabi packet copied';}
  catch{$('cascadePacket').focus();$('cascadePacket').select();$('cascadeCopyStatus').textContent='Select and copy the highlighted packet';}
 });
 $('cascadeFullscreen').addEventListener('click',()=>{
  const wrap=$('cascadeStage');if(document.fullscreenElement===wrap){document.exitFullscreen?.();return;}
  if(wrap.requestFullscreen)wrap.requestFullscreen().catch(()=>{});
 });
 return {refresh:render};
}
