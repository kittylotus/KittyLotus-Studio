import {REPO,EXTRA_BASE,GABIS,CHIBIS,SKIN_GROUPS,DEFAULT_SKINS,DEFAULT_DEMO_SCRIPTS,MODULES} from './catalog.js';
import {createShowcase} from './showcase-ui.js?v=0.17.0';
import {createCascadeShowcase} from './cascade-showcase.js?v=0.17.0';
import {SOURCE_PATHS,PRESET_REPO,detectNativeFormat,nativeSections,nativeValue,setNativeValue,resolveNativeChoice,resolveNativeMultiChoice,auditFixtureContracts,getActualRegexScripts,dossierSkins,selectDossierSkin,resolveGitHubCandidates,makeNativeFixtureSummary} from './native.js';
import {PROFILE_FORMAT,PROFILE_SCHEMA,MAX_REGEX_BYTES,parseDocument,serializeDocument,getJsonValue,setJsonValue,convertPrimitive,stripUnsafeFilename,profileValid,filterGitHubTree,encodeGitHubPath,extractRegexScripts,compileSourceRegex} from './core.js';
import {skinVariableGuide,nativeSkinGroupNames,editableColorParts,replaceEditableColor,editableLength,insertDossierSkinIntoRenderer,MOTIVE_AREAS,nativeTokensForArea,motiveAreaForSelector} from './skin-controls.js';
import {cleanHeading,sillyTavernSections,stOutlinePresentation,stPresentationLabel,setSillyTavernPrompt,platformRegexGroups,patchNativeRegex,addCustomDossierSkin,saveDossierSkin,individualDossierSkin,importIndividualDossierSkin,trackerPreviewInput,trackerPreviewScripts,cssSafeForStyle,motiveLedgerRenderer,motiveLedgerPreviewInput,hasRenderableReplacement,nativeSkinVariables,updateSkinVariable} from './workbench.js?v=0.17.0';

const $=(id)=>document.getElementById(id);
const svgIcon=(name,className='icon')=>{const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('class',className);s.setAttribute('aria-hidden','true');const u=document.createElementNS('http://www.w3.org/2000/svg','use');u.setAttribute('href',`#i-${name}`);s.append(u);return s;};
const BUNDLED_GABI_AVATAR='./assets/gabi/expressions/gabi_neutral.png';
const contextEntries={home:[['home','Overview','home'],['architect','Preset Architect','sliders'],['skins','Skin Lab','palette'],['regex','Regex Showcase','flask'],['gabi','Gabi Gallery','images']]};
function renderContext(){
 const nav=$('contextNav');if(!nav)return;nav.replaceChildren();
 const add=(label,icon,selected,onClick)=>{const b=make('button',{type:'button',class:selected?'active':''});b.append(svgIcon(icon),document.createTextNode(label));b.addEventListener('click',onClick);nav.append(b);};
 if(state.view==='architect'){
  const source=state.source?.document?.value,format=detectNativeFormat(source);
  if(state.platform==='jani'){
   for(const [id,label] of [['reserved','No impersonation'],['impersonation','Impersonation + steering']])add(label,'file',state.janitorVariant===id,()=>{if(state.janitorVariant===id)return;const previous=state.janitorVariant;state.janitorVariant=id;loadJanitorVariant().catch(e=>{state.janitorVariant=previous;renderContext();toast(e.message,true);});});
   $('contextHelp').textContent='Two complete, original master prompts. Pick a version, inspect its text and download it unchanged.';return;
  }
  const groups=state.platform==='lumi'&&format==='lumi'?nativeSections(source):state.platform==='st'&&format==='st'?sillyTavernSections(source):[];
  for(const group of groups){const count=state.platform==='st'?group.entries.length:group.controls.length;
   const label=humanGroupLabel(group.name);const b=make('button',{type:'button',class:group.id===state.nativeCategory?'active':''});b.append(svgIcon('sliders'),make('span',{},label),make('small',{},String(count)));b.addEventListener('click',()=>{state.nativeCategory=group.id;renderNativeArchitect();});nav.append(b);
  }
  $('contextHelp').textContent=state.platform==='st'?'Choose a prompt family. Subgroups and native prompt switches live together in the editor.': 'Choose a variable family. Its controls and descriptions appear beside your selection.';return;
 }
 $('contextHelp').textContent='Native source navigation is scoped to Preset Architect.';
}
function wireArtworkFallbacks(){document.addEventListener('error',(event)=>{const img=event.target;if(!(img instanceof HTMLImageElement))return;
 if(img.dataset.gabiPortrait!==undefined && img.dataset.fallbackTried!=='1'){img.dataset.fallbackTried='1';img.src=BUNDLED_GABI_AVATAR;return;}
 if(img.dataset.galleryExpression!==undefined){const card=img.closest('.gabi-card');card?.classList.add('art-missing');img.hidden=true;return;}
 if(img.dataset.fallbackTried!=='1' && (img.dataset.staticGabi!==undefined || img.src.includes('/Expressions/'))){img.dataset.fallbackTried='1';img.src=BUNDLED_GABI_AVATAR;return;}
 img.hidden=true;
},true);}

const make=(tag,attrs={},text)=>{const el=document.createElement(tag);for(const [key,value] of Object.entries(attrs)){if(key==='class')el.className=value;else if(key==='title')el.title=value;else if(key==='type')el.type=value;else if(key==='role')el.setAttribute('role',value);else if(key==='aria-label')el.setAttribute('aria-label',value);else if(key==='src')el.src=value;else if(key==='alt')el.alt=value;else if(key==='loading')el.loading=value;else el.setAttribute(key,String(value));}if(text!==undefined)el.textContent=String(text);return el;};
const safeStore=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
const safeRead=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v??fallback;}catch{return fallback;}};
const stored=safeRead('kittylotus-studio-v1',{});
const state={showcaseFixtures:[],showcaseSnapshots:[],cascadeFixtures:[],skinPlatform:'lumi',regexVisualOnly:true,nativeCategory:null,nativeSearch:'',nativeLoadPending:false,nativeLoadAttempted:false,dossierSkinId:null,regexFolder:'all',dashboardFilter:'all',view:'home',platform:['lumi','st','jani'].includes(stored.platform)?stored.platform:'lumi',selectedModule:'gabi',plan:stored.plan&&typeof stored.plan==='object'?stored.plan:{},skins:{...DEFAULT_SKINS,...(stored.skins&&typeof stored.skins==='object'?stored.skins:{})},device:'desktop',source:null,sourceTab:'tree',regexScripts:[],regexPackName:'',regexTab:'rendered',regexOutput:'',regexPlatform:'lumi',regexSelectedId:null,regexSearch:'',skinRendererId:null,skinPreviewTimer:null,skinOverride:'',skinPreviewBusy:false,janitorVariant:'reserved',nativeExpanded:new Set(),chibiUrls:[]};
for(const g of SKIN_GROUPS){if(!g.options.some(o=>o.id===state.skins[g.id]))state.skins[g.id]=g.options[0].id;}
let toastTimer;
function toast(message,error=false){const node=$('toast');node.textContent=message;node.classList.toggle('error',error);node.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('visible'),4400);}
function persist(){safeStore('kittylotus-studio-v1',{platform:state.platform,skins:state.skins,plan:state.plan});}
function download(name,text,type='application/json'){const blob=new Blob([text],{type:`${type};charset=utf-8`}),url=URL.createObjectURL(blob);const link=make('a');link.href=url;link.download=stripUnsafeFilename(name);document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function renderDashboard(){
 if(!$('portalCount'))return;
 const planning=Object.values(state.plan).filter(Boolean).length;
 const custom=(state.skinOverride?.trim()?1:0)+(state.source?.document?.kind==='json'?dossierSkins(state.source.document.value).filter(s=>/Custom Dossier|Custom Skin/i.test(s.scriptName)).length:0);
 const total=state.regexScripts.length;
 const active=state.regexScripts.filter(script=>!script.disabled).length;
 const s=state.source;
 const set=(id,value)=>{const node=$(id);if(node)node.textContent=value;};
 set('dashArchitectStatus',state.source?.document?.kind==='json'?`${state.platform==='st'?sillyTavernSections(state.source.document.value).length:nativeSections(state.source.document.value).length} native groups`:`${MODULES.length} reference groups`);
 set('dashSourceStatus',s?(s.changed?'Modified source':'Source ready'):'Awaiting source');
 set('dashSourceDetail',s?s.name:'Open a native preset file to start');
 set('dashSkinStatus',`${custom} native / CSS customizations`);
 set('dashRegexStatus',total?`${active}/${total} scripts enabled`:'No regex pack loaded');
 set('dashGabiStatus',`${GABIS.length} bundled expressions · ${CHIBIS.length+state.chibiUrls.length} chibis`);
 set('dashProfileStatus',`${planning} planning choices saved locally`);
 set('dashboardSource',s?s.name:'Not imported');
 set('dashboardSourceChange',s?(s.changed?`${s.changes} local change${s.changes===1?'':'s'}`:'Original source preserved'):'Waiting for a file');
 set('dashboardRegexCount',`${active} active script${active===1?'':'s'}`);
 set('dashboardRegexPack',total?state.regexPackName:'No pack imported');
 set('dashboardSkinsCount',`${custom} customization${custom===1?'':'s'}`);
 set('dashboardPlanCount',`${planning} switch${planning===1?'':'es'} marked`);
 const select=$('dashboardTargetSelect');if(select)select.value=state.platform;
 renderDashboardFilter();
}
function renderDashboardFilter(){
 const cards=[...document.querySelectorAll('[data-dashboard-group]')];
 const chosen=state.dashboardFilter;
 let visible=0;
 for(const card of cards){const show=chosen==='all'||card.dataset.dashboardGroup===chosen;card.hidden=!show;if(show)visible++;}
 document.querySelectorAll('[data-dashboard-filter]').forEach(button=>{const selected=button.dataset.dashboardFilter===chosen;button.classList.toggle('is-active',selected);button.setAttribute('aria-pressed',String(selected));});
 const count=$('portalCount');if(count)count.textContent=`${visible} workspace${visible===1?'':'s'}`;
}
function wireDashboard(){
 document.querySelectorAll('[data-dashboard-filter]').forEach(button=>button.addEventListener('click',()=>{state.dashboardFilter=button.dataset.dashboardFilter;renderDashboardFilter();}));
 $('dashboardImportSource').addEventListener('click',()=>$('sourceFileInput').click());
 $('dashboardTargetSelect').addEventListener('change',event=>{state.platform=event.target.value;persist();renderPlatforms();});
 document.querySelector('[data-dashboard-action="save-profile"]').addEventListener('click',()=>$('exportProfileButton').click());
 renderDashboard();
}
function setDockExpression(view){
 const expressions={home:'gabi_neutral.png',architect:'gabi_analyzing.png',source:'gabi_debugging.png',skins:'gabi_thinking.png',regex:'gabi_debugging.png',gabi:'gabi_playful.png'};
 const portrait=document.querySelector('[data-gabi-portrait]');const name=expressions[view]||expressions.home;
 if(portrait&&portrait.dataset.expression!==name){portrait.dataset.expression=name;portrait.src='./assets/gabi/expressions/'+name;}
 const dock=document.querySelector('.gabi-dock-meta p');if(dock)dock.textContent=({home:'Off duty. Allegedly.',architect:'The variables are behaving. For now.',source:'Back up before experimenting.',skins:'The CSS has opinions.',regex:'One misplaced bracket, fifty regrets.',gabi:'The art department is thriving.'})[view];
}
function navigate(view){
 const available=['home','architect','source','skins','regex','gabi'];const next=available.includes(view)?view:'home';state.view=next;
 document.body.classList.toggle('is-overview',next==='home');if(next==='home')renderDashboard();
 document.querySelectorAll('.view').forEach(n=>n.classList.toggle('is-visible',n.id===`view-${next}`));
 document.querySelectorAll('[data-view]').forEach(n=>n.classList.toggle('is-active',n.dataset.view===next));
 $('topTitle').textContent=({home:'Overview',architect:'Preset Architect',source:'Advanced Source',skins:'Skin Lab',regex:'Regex Showcase',gabi:'Gabi Gallery'})[next];
 document.body.classList.toggle('with-context',next==='architect');
 $('sidebar').classList.remove('open');$('menuToggle').setAttribute('aria-expanded','false');setDockExpression(next);renderContext();window.scrollTo({top:0,behavior:'instant'});
 if(next==='architect'&&(!state.source||detectNativeFormat(state.source.document.value)!==state.platform))loadBundled(state.platform).catch(e=>toast(e.message,true));
 if(next==='regex'&&(!state.regexScripts.length||state.regexPlatform!==state.platform&&state.platform==='st')){
  state.regexPlatform=state.platform==='st'?'st':'lumi';$('regexPlatform').value=state.regexPlatform;
  loadNativeRegex(state.regexPlatform).catch(e=>toast(e.message,true));
 }
 if(next==='skins'&&(!state.skinRendererId||detectNativeFormat(state.source?.document?.value)!==state.skinPlatform))loadSkinSource().catch(e=>toast(e.message,true));
}
function renderPlatforms(){
 document.querySelectorAll('[data-platform]').forEach(b=>b.classList.toggle('selected',b.dataset.platform===state.platform));
 $('platformNote').textContent=({lumi:'117 real controls · native JSON',st:'311 native prompt entries',jani:'2 original master prompts'})[state.platform];
 if($('dashboardTargetSelect'))$('dashboardTargetSelect').value=state.platform;renderDashboard();
}
function wireNavigation(){
 document.querySelectorAll('[data-view],[data-goto]').forEach(b=>b.addEventListener('click',()=>location.hash=b.dataset.view||b.dataset.goto));
 window.addEventListener('hashchange',()=>navigate(location.hash.slice(1)));
 $('menuToggle').addEventListener('click',()=>{const open=$('sidebar').classList.toggle('open');$('menuToggle').setAttribute('aria-expanded',String(open));});
 document.querySelectorAll('[data-platform]').forEach(b=>b.addEventListener('click',()=>{const platform=b.dataset.platform;if(platform===state.platform)return;loadBundled(platform).catch(e=>{toast(e.message,true);renderPlatforms();});}));
 renderPlatforms();navigate(location.hash.slice(1)||'home');
}
function renderModules(){
 const q=$('moduleSearch').value.trim().toLowerCase();const matches=MODULES.filter(m=>[m.name,m.sub,m.summary,m.tip,...m.items.flatMap(x=>[x.name,x.desc,x.impact])].join(' ').toLowerCase().includes(q));
 const list=$('moduleList');list.replaceChildren();$('moduleCount').textContent=`${matches.length} of ${MODULES.length} documented groups`;
 if(!matches.length){list.append(make('p',{class:'muted-tiny'},'No modules match that search.'));return;}
 if(!matches.some(m=>m.id===state.selectedModule))state.selectedModule=matches[0].id;
 matches.forEach(m=>{const b=make('button',{class:`module-item${state.selectedModule===m.id?' selected':''}`,type:'button'});const ic=make('span',{class:'module-icon'});ic.append(svgIcon(m.icon));b.append(ic);const text=make('span');text.append(make('strong',{},m.name),make('small',{},m.sub));const arrow=make('span',{class:'module-arrow'});arrow.append(svgIcon('chevron-right'));b.append(text,arrow);b.addEventListener('click',()=>{state.selectedModule=m.id;renderModules();renderModuleDetail();renderContext();});list.append(b);});
 renderModuleDetail();
}
function renderModuleDetail(){const m=MODULES.find(x=>x.id===state.selectedModule)||MODULES[0],detail=$('moduleDetail');detail.replaceChildren();
 const hero=make('div',{class:'module-hero'}),copy=make('div');copy.append(make('span',{class:'module-tagline'},m.tag),make('h2',{},m.name),make('p',{},m.summary));hero.append(copy);
 const portrait=GABIS.find(g=>g.id===m.portrait);if(portrait)hero.append(make('img',{class:'module-portrait',src:'./assets/gabi/expressions/'+portrait.file,'data-static-gabi':'',alt:`Gabrielle: ${portrait.name}`,loading:'lazy'}));detail.append(hero);
 const note=make('div',{class:'module-note'});note.append(make('strong',{},'GABI’S FIELD NOTE  '),document.createTextNode(m.tip));detail.append(note);
 const heading=make('div',{class:'settings-heading'});heading.append(make('h3',{},'Subgroups & planning switches'),make('span',{class:'pill pill-soft'},`${m.items.length} concepts`));detail.append(heading);
 const list=make('div',{class:'setting-list'});for(const item of m.items){const row=make('div',{class:'setting-row'}),text=make('div');text.append(make('strong',{},item.name),make('p',{},item.desc),make('div',{class:'setting-extra'},`If enabled: ${item.impact}`));const pressed=!!state.plan[item.id];const toggle=make('button',{type:'button',class:'toggle',role:'switch','aria-label':`Include ${item.name} in planning profile`});toggle.setAttribute('aria-checked',String(pressed));toggle.title='Planning profile only. No native preset field mapping yet.';toggle.addEventListener('click',()=>{state.plan[item.id]=!state.plan[item.id];toggle.setAttribute('aria-checked',String(state.plan[item.id]));persist();renderDashboard();});row.append(text,toggle);list.append(row);}detail.append(list);
 const bottom=make('div',{class:'inline-disclaimer'});bottom.append(svgIcon('info'),document.createTextNode(' These switches only mark interests in your Studio profile. They do not mutate the source JSON until a verified mapping layer is added.'));detail.append(bottom);
}
function wireArchitect(){
 $('moduleSearch').addEventListener('input',renderModules);renderModules();
 $('nativeSearch').addEventListener('input',e=>{state.nativeSearch=e.target.value;renderNativeArchitect();});
 $('nativeLoadBundled').addEventListener('click',()=>loadBundled(state.platform).catch(e=>toast(e.message,true)));
 $('nativeSyncGitHub').addEventListener('click',()=>syncNativeFromGitHub().catch(e=>toast(e.message,true)));
 $('nativeExport').addEventListener('click',()=>$('exportSourceButton').click());
 $('nativeRegex').addEventListener('click',()=>{state.regexPlatform=state.platform==='st'?'st':'lumi';$('regexPlatform').value=state.regexPlatform;location.hash='regex';loadNativeRegex(state.regexPlatform).catch(e=>toast(e.message,true));});
 $('nativeConcepts').addEventListener('click',()=>{$('conceptExplorer').hidden=!$('conceptExplorer').hidden;});
 $('advancedSourceButton').addEventListener('click',()=>location.hash='source');
 $('nativeMobileGroup').addEventListener('change',e=>{state.nativeCategory=e.target.value;renderNativeArchitect();});
 $('expandNativeAll').addEventListener('click',()=>{document.querySelectorAll('#nativeDetails details').forEach(d=>{d.open=true;state.nativeExpanded.add(d.dataset.blockId||'');});});
 $('collapseNativeAll').addEventListener('click',()=>{document.querySelectorAll('#nativeDetails details').forEach(d=>d.open=false);state.nativeExpanded.clear();});
 $('janitorVariant').addEventListener('change',e=>{state.janitorVariant=e.target.value;loadJanitorVariant().catch(error=>toast(error.message,true));});
 $('janitorExport').addEventListener('click',()=>{if(state.source?.document.kind!=='text')return;download(state.janitorVariant==='impersonation'?'janitor-impersonation.txt':'janitor-reserved-agency.txt',serializeDocument(state.source.document,state.source.changed),'text/plain');});
 $('janitorCopy').addEventListener('click',async()=>{const value=$('janitorPromptText').value;if(!value)return toast('Load a master prompt first.',true);try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(value);else{$('janitorPromptText').focus();$('janitorPromptText').select();if(!document.execCommand('copy'))throw Error('Clipboard unavailable');}toast('Complete Janitor prompt copied.');}catch(e){toast('Clipboard unavailable. Select the prompt text and copy manually.',true);}});
 $('applyDossierSkin').addEventListener('click',()=>{const source=state.source;if(!source||source.document.kind!=='json')return toast('Load a Lumiverse source first.',true);try{const count=selectDossierSkin(source.document.value,$('dossierSkinSelect').value);state.dossierSkinId=$('dossierSkinSelect').value;if(count){source.changed=true;source.changes++;updateSourceMeta();$('sourceRaw').value=serializeDocument(source.document,true);}renderDossierSkinOptions();toast(count?`Selected dossier skin in ${count} native entries. Export your preset to save.`:'That dossier skin is already selected.');}catch(e){toast(e.message,true);}});
 renderNativeArchitect();
}
function cleanNativeGroup(name){return String(name||'Unknown').replace(/[≽≼✧━┌┆╰─✦★⩊•]/g,'').replace(/\s+/g,' ').trim()||'General';}
function humanGroupLabel(name){const raw=cleanNativeGroup(name);if(raw==='HTML')return raw;if(raw!==raw.toUpperCase())return raw;return raw.toLowerCase().replace(/\b[a-z]/g,c=>c.toUpperCase()).replace(/\bAnd\b/g,'and').replace(/\bCot\b/g,'CoT').replace(/\bDnd\b/g,'DnD').replace(/\bHtml\b/g,'HTML');}
function nativeControlInput(control,source){
 const value=nativeValue(source,control),kind=control.type,container=make('div',{class:'native-input'});
 const commit=(next)=>{const previous=nativeValue(source,control);try{setNativeValue(source,control,next);if(JSON.stringify(previous)!==JSON.stringify(next)){state.source.changed=true;state.source.changes++;updateSourceMeta();$('sourceRaw').value=serializeDocument(state.source.document,true);toast(`Updated ${control.label||control.name} in native source.`);}}catch(e){toast(e.message,true);renderNativeArchitect();}};
 let input;
 if(kind==='switch'){input=make('input',{type:'checkbox',role:'switch',class:'native-switch'});input.checked=value===1||value===true;input.addEventListener('change',()=>commit(typeof value==='boolean'?input.checked:(input.checked?1:0)));}
 else if(kind==='select'){input=make('select',{class:'field-input native-select'});for(const o of control.options||[]){const option=make('option',{},o.label||String(o.value));option.value=String(o.id??o.value);if(String(value)===String(o.id)||String(value)===String(o.value))option.selected=true;input.append(option);}input.addEventListener('change',()=>{const opt=(control.options||[]).find(o=>String(o.id??o.value)===input.value);const next=resolveNativeChoice(control,value,opt?.id??opt?.value);commit(next);});}
 else if(kind==='slider'||kind==='number'){const wrap=make('div',{class:'native-number-wrap'});input=make('input',{type:kind==='slider'?'range':'number',class:kind==='slider'?'native-range':'field-input'});input.min=control.min??0;input.max=control.max??100;input.step=control.step??1;input.value=Number(value);const output=make('output',{class:'native-number'},String(value));input.addEventListener('input',()=>output.textContent=input.value);input.addEventListener('change',()=>commit(Number(input.value)));wrap.append(input,output);container.append(wrap);return container;}
 else if(kind==='multiselect'){
  const options=control.options||[],current=Array.isArray(value)?value:[];
  let chosen=new Set(options.filter(o=>current.some(v=>String(v)===String(o.id)||String(v)===String(o.value))).map(o=>String(o.id??o.value)));
  const list=make('div',{class:'native-choice-list',role:'group','aria-label':control.label||control.name});
  const summary=make('span',{class:'native-choice-count'});const updateCount=()=>summary.textContent=`${chosen.size} of ${options.length} selected`;
  for(const option of options){const key=String(option.id??option.value),button=make('button',{type:'button',class:'native-choice'+(chosen.has(key)?' is-selected':'')},option.label||String(option.value));
   button.setAttribute('aria-pressed',String(chosen.has(key)));
   button.addEventListener('click',()=>{const next=new Set(chosen);if(next.has(key))next.delete(key);else next.add(key);
    try{commit(resolveNativeMultiChoice(control,value,[...next]));chosen=next;button.classList.toggle('is-selected',chosen.has(key));button.setAttribute('aria-pressed',String(chosen.has(key)));updateCount();}catch(e){toast(e.message,true);}
   });list.append(button);
  }
  updateCount();container.classList.add('native-input-choices');container.append(summary,list);return container;
 }
 else if(kind==='textarea'){input=make('textarea',{class:'field-input native-textarea'});input.value=String(value);input.addEventListener('change',()=>commit(input.value));}
 else {input=make('input',{type:'text',class:'field-input'});input.value=String(value);input.addEventListener('change',()=>commit(input.value));}
 input.setAttribute('aria-label',control.label||control.name);container.prepend(input);return container;
}
function markNativeDirty(){
 if(!state.source)return;state.source.changed=true;state.source.changes++;
 updateSourceMeta();$('sourceRaw').value=serializeDocument(state.source.document,true);
}
function stPromptRow(entry,source){
 const row=make('div',{class:'st-prompt-row'}),checkbox=make('input',{type:'checkbox',role:'switch',class:'studio-switch'});checkbox.checked=entry.enabled;
 checkbox.setAttribute('aria-label',`Enable ${entry.name}`);
 checkbox.addEventListener('change',()=>{try{setSillyTavernPrompt(source,entry.id,{enabled:checkbox.checked});markNativeDirty();}catch(e){checkbox.checked=!checkbox.checked;toast(e.message,true);}});
 const copy=make('div',{class:'st-prompt-label'});copy.append(make('strong',{},entry.name),make('small',{},entry.role+(entry.marker?' · marker':'')));
 const edit=make('button',{type:'button',class:'button button-quiet small'},'Edit');
 const editor=make('div',{class:'st-prompt-editor'});editor.hidden=true;
 const textarea=make('textarea',{class:'code-textarea'});textarea.value=entry.content;textarea.spellcheck=false;
 const save=make('button',{type:'button',class:'button button-primary small'},'Save prompt');const cancel=make('button',{type:'button',class:'button button-quiet small'},'Close');
 edit.addEventListener('click',()=>{editor.hidden=!editor.hidden;edit.textContent=editor.hidden?'Edit':'Close';});
 cancel.addEventListener('click',()=>{editor.hidden=true;edit.textContent='Edit';});
 save.addEventListener('click',()=>{try{setSillyTavernPrompt(source,entry.id,{content:textarea.value});markNativeDirty();toast('Native ST prompt updated.');}catch(e){toast(e.message,true);}});
 editor.append(make('code',{},entry.id),textarea,save,cancel);row.append(checkbox,copy,edit,editor);return row;
}
function renderNativeArchitect(){
 const holder=$('nativeCategories'),details=$('nativeDetails'),mobile=$('nativeMobileGroup');if(!holder||!details)return;
 holder.replaceChildren();details.replaceChildren();mobile.replaceChildren();
 const source=state.source?.document?.value,format=detectNativeFormat(source);
 const isLumi=state.platform==='lumi'&&format==='lumi',isST=state.platform==='st'&&format==='st',isJani=state.platform==='jani'&&format==='jani';
 $('janitorPicker').hidden=!isJani;$('nativeSearchRow').hidden=isJani;$('nativeWorkshop').hidden=!(isLumi||isST);
 const groups=isLumi?nativeSections(source):isST?sillyTavernSections(source):[];
 const total=isLumi?groups.reduce((n,g)=>n+g.controls.length,0):isST?groups.reduce((n,g)=>n+g.entries.length,0):0;
 $('nativeStatus').textContent=isJani?'Native master prompt / fixed source':groups.length?`${groups.length} groups · ${total} native ${isST?'prompts':'controls'}${state.source.changed?' · modified':''}`:state.source?'Load the matching source for this platform':'No native source loaded';
 $('nativeExport').disabled=!(isJani||isST||isLumi);$('nativeRegex').disabled=!(isST||isLumi);
 if(isJani){$('janitorPromptText').value=source;$('janitorVariant').value=state.janitorVariant;renderContext();return;}
 if(!groups.length){details.append(make('p',{class:'empty-state'},'Load the bundled preset or import a matching native JSON source.'));renderContext();return;}
 const search=state.nativeSearch.trim().toLowerCase();
 const stMatches=(g,e)=>{
  if(!search)return true;
  if([g.name,e.name,e.originalName,e.content].join(' ').toLowerCase().includes(search))return true;
  return g.subgroups.some(s=>(s.name.toLowerCase().includes(search)&&s.entries.includes(e))||s.children.some(c=>c.name.toLowerCase().includes(search)&&c.entries.includes(e)));
 };
 const filtered=groups.map(g=>({...g,controls:isLumi?g.controls.filter(v=>!search||[g.name,v.label,v.description,v.name,v.blockName].join(' ').toLowerCase().includes(search)):undefined,entries:isST?g.entries.filter(e=>stMatches(g,e)):undefined})).filter(g=>(isLumi?g.controls:g.entries).length);
 if(!filtered.length){details.append(make('div',{class:'empty-state'},'No native controls match your search.'));renderContext();return;}
 if(!filtered.some(g=>g.id===state.nativeCategory))state.nativeCategory=filtered[0].id;
 for(const section of filtered){const count=(isLumi?section.controls:section.entries).length;const label=humanGroupLabel(section.name);
  const b=make('button',{type:'button',class:'native-category'+(section.id===state.nativeCategory?' selected':'')});b.append(make('span',{},label),make('small',{},String(count)));b.addEventListener('click',()=>{state.nativeCategory=section.id;renderNativeArchitect();});holder.append(b);
  const option=make('option',{},`${label} (${count})`);option.value=section.id;mobile.append(option);
 }
 mobile.value=state.nativeCategory;
 const chosen=filtered.find(g=>g.id===state.nativeCategory);
 const title=make('div',{class:'native-group-head'});title.append(make('h2',{},humanGroupLabel(chosen.name)),make('span',{class:'pill pill-soft'},`${(isLumi?chosen.controls:chosen.entries).length} items`));details.append(title);
 if(isLumi){const byBlock=new Map();for(const control of chosen.controls){if(!byBlock.has(control.blockId))byBlock.set(control.blockId,[]);byBlock.get(control.blockId).push(control);}
  let first=true;
  for(const [blockId,controls] of byBlock){const chunk=make('details',{class:'native-block compact-block'});chunk.dataset.blockId=blockId;
   chunk.open=!!search||state.nativeExpanded.has(blockId)||first;first=false;
   const summary=make('summary',{class:'native-block-name'});summary.append(make('span',{},controls[0].blockName.replace(/[┆✧━┌╰─✦]/g,'').trim()),make('small',{},`${controls.length} controls`));chunk.append(summary);
   chunk.addEventListener('toggle',()=>{if(chunk.open)state.nativeExpanded.add(blockId);else state.nativeExpanded.delete(blockId);});
   const rows=make('div',{class:'native-block-rows'});
   for(const control of controls){const row=make('div',{class:'native-row'}),body=make('div',{class:'native-row-copy'});const variable=make('code',{class:'copyable-var',title:'Click to copy variable name'},control.name);variable.tabIndex=0;variable.addEventListener('click',()=>navigator.clipboard?.writeText(control.name).then(()=>toast('Variable copied.')).catch(()=>{}));body.append(make('strong',{},control.label||control.name),make('p',{},control.description||'No native description.'),variable);row.append(body,nativeControlInput(control,source));rows.append(row);}
   chunk.append(rows);details.append(chunk);
  }
 }else{
  // Native ST preserves its original 311 ordered prompt records. Visual hierarchy is never exported.
  const shown=new Set(chosen.entries.map(e=>e.id));
  const major=make('details',{class:'st-major-outline'});major.dataset.blockId=`${chosen.id}:major`;
  major.open=true;
  const heading=make('summary',{class:'st-major-heading'});heading.append(make('span',{},humanGroupLabel(chosen.name)),make('small',{},`${chosen.entries.length} prompts`));major.append(heading);
  const content=make('div',{class:'st-major-content'});
  const markerDrawer=make('div',{class:'st-empty-source-drawer'}),markerRows=make('div',{class:'st-marker-rows'});
  markerRows.hidden=true;let markerCount=0;
  const saveEmptyMarker=(entry)=>{const row=stPromptRow(entry,source);row.classList.add('st-structural-row');markerRows.append(row);markerCount++;};
  const ordered=stOutlinePresentation(chosen);
  let box=null;
  function place(item,node){(box||content).append(node);}
  for(const info of ordered){
   const entry=info.entry;
   if(!shown.has(entry.id))continue;
   if(info.kind==='major'){
    if(info.hasContent)place(info,stPromptRow(entry,source));else saveEmptyMarker(entry);
    continue;
   }
   if(info.kind==='box-start'){
    // Box markers are real source records, sometimes containing opening tags.
    box=make('section',{class:'st-source-box'});
    const title=make('div',{class:'st-source-box-title'});title.append(make('strong',{},stPresentationLabel(entry.originalName)),make('small',{},'SOURCE BOX'));box.append(title);
    content.append(box);
    if(info.hasContent){const row=stPromptRow(entry,source);row.classList.add('st-structural-row');box.append(row);}else saveEmptyMarker(entry);
    continue;
   }
   if(info.kind==='box-end'){
    const target=box||content;
    if(info.hasContent){const row=stPromptRow(entry,source);row.classList.add('st-structural-row');target.append(row);}else saveEmptyMarker(entry);
    box=null;continue;
   }
   if(info.kind==='closer'){
    if(info.hasContent){const row=stPromptRow(entry,source);row.classList.add('st-structural-row');place(info,row);}else saveEmptyMarker(entry);
    continue;
   }
   if(info.kind==='second'||info.kind==='third'){
    const section=make('div',{class:`st-hierarchy-heading st-hierarchy-${info.kind}`});
    section.append(make('span',{},stPresentationLabel(entry.originalName)));
    if(info.hasContent)section.append(make('small',{},'Editable native prompt below'));
    place(info,section);
    if(!info.hasContent){saveEmptyMarker(entry);continue;}
   }
   const row=stPromptRow(entry,source);row.classList.add(`st-depth-${info.level}`);
   if(info.kind!=='prompt')row.classList.add('st-heading-source');
   place(info,row);
  }
  if(markerCount){const toggle=make('button',{type:'button',class:'button button-quiet small st-marker-toggle'},`Show ${markerCount} empty source marker${markerCount===1?'':'s'}`);
   toggle.setAttribute('aria-expanded','false');toggle.addEventListener('click',()=>{markerRows.hidden=!markerRows.hidden;toggle.setAttribute('aria-expanded',String(!markerRows.hidden));toggle.textContent=(markerRows.hidden?'Show':'Hide')+` ${markerCount} empty source marker${markerCount===1?'':'s'}`;});
   markerDrawer.append(toggle,markerRows);content.append(markerDrawer);
  }
  major.append(content);details.append(major);
 }

 renderContext();
}
async function loadJanitorVariant(){
 const path=state.janitorVariant==='impersonation'?'./data/native/janitor-impersonation.txt':'./data/native/janitor-reserved-agency.txt';
 if(state.source?.changed&&!confirm('Discard unsaved native source edits?'))return;
 const response=await fetch(path);if(!response.ok)throw new Error('Selected Janitor prompt unavailable.');
 loadSource(path.split('/').at(-1),await response.text(),'bundled',true);
 $('janitorVariant').value=state.janitorVariant;renderContext();
}
async function loadBundled(platform='lumi'){
 if(state.source?.changed&&!confirm('Discard unexported changes to the current source?'))return;
 state.platform=platform;persist();renderPlatforms();
 const path=SOURCE_PATHS[platform];if(!path)throw new Error('Unsupported bundled format.');
 const response=await fetch(path);if(!response.ok)throw new Error(`Bundled preset unavailable (${response.status}). Run the site through the local server.`);
 const txt=await response.text();const name=path.split('/').at(-1);loadSource(name,txt,'bundled',true);
 toast(`Loaded bundled ${platform==='lumi'?'Lumiverse':platform==='st'?'SillyTavern':'Janitor'} snapshot.`);
}
async function syncNativeFromGitHub(){
 if(state.source?.changed&&!confirm('Replace the current modified source with a remote version? Export your changes first.'))return;
 $('nativeStatus').textContent='Checking the public GitHub repository...';
 const response=await fetch(`https://api.github.com/repos/${PRESET_REPO}/git/trees/main?recursive=1`,{headers:{Accept:'application/vnd.github+json'}});if(!response.ok)throw new Error(`GitHub tree request failed (${response.status}). Use bundled source offline.`);
 const data=await response.json();const choices=resolveGitHubCandidates(data.tree,state.platform);
 if(choices.length!==1){$('nativeStatus').textContent=choices.length?`${choices.length} matching files: select one under Source Editor → Browse repository`:'No matching release file found on main.';toast(choices.length?'Multiple versions found. Choose the correct one in Source Editor → Browse repository.':'No matching native source file found.',true);return;}
 const path=encodeGitHubPath(choices[0].path);const fetchResult=await fetch(`https://raw.githubusercontent.com/${PRESET_REPO}/main/${path}`);if(!fetchResult.ok)throw new Error(`Could not fetch ${choices[0].path}.`);
 const text=await fetchResult.text();
 let loaded;
 try{loaded=parseDocument(text,choices[0].path);}catch(e){throw new Error(`The remote source isn't valid: ${e.message}`);}
 if(detectNativeFormat(loaded.value)!==state.platform)throw new Error('Remote source format does not match selected platform. Refusing to replace your preset.');
 if(state.platform==='lumi'){
  const fixtureResponse=await fetch('./data/fixtures/contract-fixtures.json');
  if(fixtureResponse.ok){const contract=(await fixtureResponse.json()).fixtures||[];const results=auditFixtureContracts(loaded.value,contract);const invalid=results.filter(r=>!r.ok);
   if(invalid.length&&!confirm(`${invalid.length} fixture contracts differ from this live GitHub source. Existing previews may be out of date. Load anyway?\n`+invalid.map(f=>`${f.id}: ${f.reason}`).join('\n')))return;
   if(invalid.length)toast(`Live source loaded with ${invalid.length} fixture mismatches. Review before publishing.`,true);
  }
 }
 if(!loadSource(choices[0].path,text,'github',true))throw new Error('Remote source import failed.');
 toast(`Synced ${choices[0].path} from GitHub.`);
}
function renderDossierSkinOptions(){
 const select=$('dossierSkinSelect');if(!select)return;select.replaceChildren();
 const source=state.source?.document?.kind==='json'?state.source.document.value:null;const skins=dossierSkins(source);
 if(!skins.length){select.disabled=true;$('applyDossierSkin').disabled=true;$('dossierPreview').textContent='Load a Lumiverse preset with the Regex Skins folder.';return;}
 select.disabled=false;$('applyDossierSkin').disabled=false;
 for(const skin of skins){const option=make('option',{},skin.scriptName.replace(/^[^\[]*\]/,'').trim());option.value=skin.id;select.append(option);}
 const enabled=skins.find(s=>!s.disabled);const wanted=skins.find(s=>s.id===state.dossierSkinId)||enabled||skins[0];select.value=wanted.id;
 function preview(){const skin=skins.find(s=>s.id===select.value)||skins[0];const css=skin.replaceString;const safe=css.replace(/<\/style/gi,'');$('dossierPreview').srcdoc=`<!doctype html><meta charset=utf-8><style>:root{${safe}} body{margin:0;padding:18px;background:#080810;color:var(--rxd-text,#eee);font:14px system-ui} .skin-sample{border-radius:var(--rxd-radius-card,12px);border:1px solid var(--rxd-line,#555);background:var(--rxd-panel,#15151e);padding:18px;box-shadow:var(--rxd-shadow-soft,none)}.skin-top{color:var(--rxd-label,#aaa);font-size:10px;letter-spacing:.15em;margin-bottom:12px}.skin-pill{background:var(--rxd-chip-bg,#333);color:var(--rxd-chip-text,#fff);border:1px solid var(--rxd-chip-border,#444);padding:6px 10px;border-radius:var(--rxd-radius-pill,99px)}.skin-row{display:flex;justify-content:space-between;gap:15px;align-items:center}.skin-sub{color:var(--rxd-muted,#aaa);margin:10px 0 0}</style><div class=skin-sample><div class=skin-top>DOSSIER / REAL REGEX VARIABLES</div><div class=skin-row><strong>Psychological State</strong><span class=skin-pill>Observed</span></div><p class=skin-sub>CSS variables from the selected native skin. Host renderer controls the complete layout.</p></div>`;}
 select.onchange=()=>{state.dossierSkinId=select.value;preview();};preview();
}

function updateSourceMeta(){const s=state.source;$('sourceName').textContent=s?s.name:'No file selected';$('sourceInfo').textContent=s?(s.origin==='github'?'Imported from the official public repository.':s.origin==='bundled'?'Verified bundled snapshot; available offline.':'Imported from a local file. Your contents are not uploaded.'):'Import a local .json/.txt file or browse files from the public repository.';$('sourceFormat').textContent=s?(s.document.kind==='json'?'JSON':'Text'):'—';$('sourceDirty').textContent=s?(s.changed?'Modified':'Original'):'Not loaded';$('sourceChanges').textContent=s?String(s.changes):'0';renderDashboard();$('exportSourceButton').disabled=!s;$('resetSourceButton').disabled=!s;}
function loadSource(name,contents,origin='local',stay=false){
 try{const document=parseDocument(contents,name);state.source={name,document,changed:false,changes:0,origin};const nativeType=detectNativeFormat(document.value);if(nativeType){state.platform=nativeType;persist();}updateSourceMeta();renderPlatforms();renderSourceTree();$('sourceRaw').value=contents;$('rawStatus').textContent='';if(document.kind==='text')setSourceTab('raw');else setSourceTab('tree');toast(`Loaded ${name}`);renderNativeArchitect();renderDossierSkinOptions();if(!stay)location.hash='architect';return true;}catch(e){toast(e.message,true);return false;}
}
function renderSourceTree(){const holder=$('sourceTree');holder.replaceChildren();const s=state.source;if(!s){holder.append(make('div',{class:'empty-state'},'Import a real file to inspect its actual fields.'));return;}if(s.document.kind!=='json'){holder.append(make('div',{class:'empty-state'},'Text-based prompt: use Raw editor to edit the source.'));return;}
 const root=s.document.value;
 function appendNode(container,key,value,path,depth){
  if(depth>12){container.append(make('div',{class:'muted-tiny'},'Further nesting hidden. Use Raw editor.'));return;}
  const expandable=!!(value&&typeof value==='object');const entry=make('div',{class:'tree-node'});
  if(expandable){const details=make('details');if(depth<1)details.open=true;const summary=make('summary',{class:'tree-row'});summary.append(make('span',{class:'tree-key'},key),make('span',{class:'tree-type'},Array.isArray(value)?`array [${value.length}]`:`object {${Object.keys(value).length}}`));details.append(summary);const inner=make('div');let built=false;
   const build=()=>{if(built)return;built=true;const entries=Object.entries(value);entries.slice(0,250).forEach(([k,v])=>appendNode(inner,k,v,[...path,k],depth+1));if(entries.length>250)inner.append(make('p',{class:'muted-tiny'},`${entries.length-250} more entries not rendered. Use Raw editor.`));};details.addEventListener('toggle',()=>{if(details.open)build();});if(details.open)build();details.append(inner);entry.append(details);
  }else{const row=make('div',{class:'tree-row'}),oldType=value===null?'null':typeof value;row.append(make('span',{class:'tree-key'},key),make('span',{class:'tree-type'},oldType));
   if(oldType==='boolean'){const input=make('input',{type:'checkbox',role:'switch',class:'tree-leaf'});input.checked=value;input.addEventListener('change',()=>commitTree(path,input.checked));row.append(input);}else if(oldType==='string'||oldType==='number'){const input=make('input',{type:oldType==='number'?'number':'text',class:`tree-leaf${String(value).length>30?' long':''}`});input.value=String(value);input.title=String(value);input.addEventListener('change',()=>{try{commitTree(path,convertPrimitive(input.value,value));}catch(e){input.value=String(value);toast(e.message,true);}});row.append(input);}else row.append(make('span',{class:'muted-tiny'},'null; edit in Raw view'));
   entry.append(row);
  }container.append(entry);
 }
 appendNode(holder,'ROOT',root,[],0);
}
function commitTree(path,val){const s=state.source;if(!s)return;try{const current=getJsonValue(s.document.value,path);if(Object.is(current,val))return;s.document.value=setJsonValue(s.document.value,path,val);s.changed=true;s.changes++;updateSourceMeta();$('sourceRaw').value=serializeDocument(s.document,true);renderNativeArchitect();toast('Value updated. Export to download your changes.');}catch(e){toast(e.message,true);renderSourceTree();}}
function setSourceTab(tab){state.sourceTab=tab;document.querySelectorAll('[data-source-tab]').forEach(b=>b.classList.toggle('active',b.dataset.sourceTab===tab));$('sourceTree').hidden=tab!=='tree';$('sourceRawWrap').hidden=tab!=='raw';if(tab==='raw'&&state.source)$('sourceRaw').value=serializeDocument(state.source.document,state.source.changed);if(tab==='tree')renderSourceTree();}
async function browseRepo(){const browser=$('repoBrowser');browser.hidden=false;const files=$('repoFiles');files.replaceChildren(make('span',{class:'muted'},'Fetching public repository tree...'));try{
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);let response;try{response=await fetch(`https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`,{headers:{Accept:'application/vnd.github+json'},signal:controller.signal});}finally{clearTimeout(timer);}if(!response.ok)throw new Error(`GitHub API ${response.status}: try a local download if the API is rate-limited.`);const data=await response.json();const matches=filterGitHubTree(data.tree);files.replaceChildren();if(data.truncated)files.append(make('p',{class:'muted-tiny'},'GitHub truncated this listing; not all paths are shown.'));if(!matches.length){files.append(make('p',{class:'muted'},'No matching text / JSON files found.'));return;}
 for(const file of matches){const btn=make('button',{class:'repo-file',type:'button'});btn.append(make('span',{},file.path),make('small',{},file.size?`${Math.round(file.size/1024)} KB`:'file'));btn.addEventListener('click',async()=>{btn.disabled=true;const old=btn.textContent;btn.textContent='Loading source...';try{const url=`https://raw.githubusercontent.com/${REPO}/main/${encodeGitHubPath(file.path)}`;const r=await fetch(url);if(!r.ok)throw new Error(`Could not fetch source (${r.status}).`);loadSource(file.path.split('/').at(-1),await r.text(),'github');browser.hidden=true;}catch(e){btn.textContent=old;toast(e.message,true);}finally{btn.disabled=false;}});files.append(btn);}
 }catch(e){files.replaceChildren(make('p',{class:'muted'},`Could not browse GitHub: ${e.message}. You can still import a downloaded file locally.`));}}
function wireSource(){
 $('openSourceButton').addEventListener('click',()=>$('sourceFileInput').click());$('sourceFileInput').addEventListener('change',async(e)=>{const f=e.target.files?.[0];if(f){if(f.size>6_000_000){toast('File over 6 MB. Use a smaller source.',true);return;}loadSource(f.name,await f.text());}e.target.value='';});$('browseRepoButton').addEventListener('click',browseRepo);$('closeRepoBrowser').addEventListener('click',()=>$('repoBrowser').hidden=true);
 $('exportSourceButton').addEventListener('click',()=>{const s=state.source;if(!s)return;download(s.name,serializeDocument(s.document,s.changed),s.document.kind==='json'?'application/json':'text/plain');toast('Native source file exported.');});
 $('resetSourceButton').addEventListener('click',()=>{const s=state.source;if(!s)return;loadSource(s.name,s.document.original,s.origin);toast('Restored the imported source.');});
 document.querySelectorAll('[data-source-tab]').forEach(b=>b.addEventListener('click',()=>setSourceTab(b.dataset.sourceTab)));
 $('applyRawButton').addEventListener('click',()=>{const s=state.source;if(!s){toast('Import a source file first.',true);return;}try{const updated=parseDocument($('sourceRaw').value,s.name);if(updated.kind!==s.document.kind)throw new Error('Format changed unexpectedly. Check filename and JSON syntax.');s.document.value=updated.value;s.changed=true;s.changes++;updateSourceMeta();renderSourceTree();$('rawStatus').textContent='Changes applied';toast('Raw changes applied. Export to download.');}catch(e){$('rawStatus').textContent=e.message;toast(e.message,true);}});
 updateSourceMeta();
}
/* --------------------- Skin Lab: the two authentic Motive Ledgers --------------------- */
function nativeSkinSource(){return state.source?.document?.value;}
function skinRenderer(){return motiveLedgerRenderer(nativeSkinSource());}
function skinMarkDirty(changed){if(changed){markNativeDirty();renderDashboard();}}
/** One native variable, with a semantic label, real renderer-use count and CSS-aware controls. */
function skinTokenRow(variable,{getCurrent,commit,rendererCss=''}){
 const guide=skinVariableGuide(variable.name,rendererCss);
 const row=make('div',{class:'skin-token-card'});row.dataset.skinToken=variable.name;row.dataset.skinGroup=guide.group;
 const heading=make('div',{class:'skin-token-heading'});
 const info=make('div',{class:'skin-token-identity'});
 info.append(make('strong',{},guide.label),make('span',{},guide.purpose));
 const usage=make('small',{class:'skin-token-usage'+(guide.usages?'':' is-unused')},guide.usages?`${guide.usages} renderer use${guide.usages===1?'':'s'}`:'Not used in Motive');
 if(!guide.usages)usage.title='This native token is preserved and editable, but the Motive Ledger renderer does not reference it. Open the token swatch for examples of other surfaces.';
 heading.append(info,usage);
 const editor=make('div',{class:'skin-token-controls'});
 const raw=make('details',{class:'skin-token-raw'}),rawHead=make('summary',{},'CSS source · '+variable.name);
 const rawInput=make('input',{type:'text',class:'field-input','aria-label':`CSS value for ${variable.name}`});rawInput.value=getCurrent();
 const apply=(newValue)=>{try{commit(newValue);rawInput.value=newValue;row.classList.remove('skin-token-invalid');}catch(e){row.classList.add('skin-token-invalid');toast(e.message,true);}};
 rawInput.addEventListener('change',()=>apply(rawInput.value));raw.append(rawHead,rawInput);
 const value=getCurrent();const parts=/^color-mix\(/i.test(value)?[]:editableColorParts(value);
 if(parts.length){
  for(const [index,part] of parts.entries()){
   const control=make('div',{class:'skin-color-control'});
   const caption=make('span',{class:'skin-part-label'},parts.length===1?'Color':`Color stop ${index+1}`);
   const inputs=make('div',{class:'skin-color-inputs'});
   const color=make('input',{type:'color',class:'skin-color','aria-label':`Choose ${guide.label} color ${index+1}`});color.value=part.hex;
   const alpha=make('input',{type:'range',class:'skin-alpha-slider',min:'0',max:'100',step:'1','aria-label':`${guide.label} color ${index+1} opacity percentage`});alpha.value=String(Math.round(part.alpha*100));
   const amount=make('output',{class:'skin-alpha-value'},`${alpha.value}%`);
   const setColor=()=>{const current=getCurrent();const currentParts=editableColorParts(current);if(!currentParts[index])return;
    const next=replaceEditableColor(current,index,color.value,Number(alpha.value)/100);apply(next);amount.textContent=`${alpha.value}%`;
   };
   color.addEventListener('input',setColor);alpha.addEventListener('input',setColor);
   const sliderLine=make('div',{class:'skin-opacity-line'});sliderLine.append(make('span',{},'Opacity'),alpha,amount);
   inputs.append(color,sliderLine);control.append(caption,inputs);editor.append(control);
  }
 }else{
  const len=editableLength(value);
  if(len&&len.number>=0){
   const line=make('div',{class:'skin-length-control'});
   const slider=make('input',{type:'range',class:'skin-dimension-slider',min:'0',max:String(Math.max(len.unit==='px'?48:8,len.number, len.number>200?1000:0)),step:len.unit==='px'?'1':'0.1','aria-label':`${guide.label} size`});slider.value=String(len.number);
   const number=make('input',{type:'number',min:'0',max:slider.max,step:slider.step,value:String(len.number),class:'skin-dimension-number','aria-label':`${guide.label} numeric size`});
   const setDimension=(v)=>{if(!Number.isFinite(Number(v)))return;const next=`${v}${len.unit}`;apply(next);slider.value=String(v);number.value=String(v);};
   slider.addEventListener('input',()=>setDimension(slider.value));number.addEventListener('change',()=>setDimension(number.value));
   line.append(slider,number,make('span',{class:'skin-unit'},len.unit));editor.append(line);
  }else editor.append(make('span',{class:'skin-token-complex'},/^var\(/.test(value)?'Host-linked value · edit raw CSS to override':/^color-mix\(/.test(value)?'Derived color · edit its source tokens or raw CSS':'Composite CSS · edit exact value below'));
 }
 row.append(heading,editor,raw);return row;
}
function mountTokenGroups(holder,entries,controls,rendererCss=''){
 holder.replaceChildren();const grouped=new Map();for(const variable of entries){const g=skinVariableGuide(variable.name,rendererCss).group;if(!grouped.has(g))grouped.set(g,[]);grouped.get(g).push(variable);}
 for(const groupName of [...nativeSkinGroupNames,...grouped.keys()].filter((g,i,a)=>a.indexOf(g)===i)){
  const variables=grouped.get(groupName);if(!variables?.length)continue;
  const details=make('details',{class:'skin-token-group'});details.open=groupName==='Surfaces'||groupName==='Color accents';
  const summary=make('summary',{},groupName);summary.append(make('span',{class:'skin-group-count'},String(variables.length)));details.append(summary);
  const list=make('div',{class:'skin-token-grid'});for(const variable of variables)list.append(skinTokenRow(variable,controls(variable)));details.append(list);holder.append(details);
 }
}
function renderDossierVariables(){
 const holder=$('skinDossierVariables'),source=nativeSkinSource();
 const variants=detectNativeFormat(source)==='lumi'?dossierSkins(source):[];
 const select=$('skinBase'),previous=state.dossierSkinId;
 select.replaceChildren();for(const script of variants){const option=make('option',{},script.scriptName.replace(/^.*?\]\s*/,''));option.value=script.id;select.append(option);}
 const selected=variants.find(s=>s.id===previous)||variants.find(s=>/Default Purple/.test(s.scriptName))||variants[0];
 state.dossierSkinId=selected?.id||null;select.value=state.dossierSkinId||'';
 if(!selected){$('skinVariantSource').value='';$('skinVariableCount').textContent='No native skins';holder.replaceChildren();return;}
 $('skinVariantSource').value=selected.replaceString;setSkinSaveStatus('Ready to edit · save when finished');$('skinManageName').textContent=selected.scriptName.replace(/^.*?\]\s*/, '');$('skinCurrentName').value=selected.scriptName.replace(/^.*?\]\s*/, '');
 const entries=nativeSkinVariables(selected.replaceString);
 $('skinVariableCount').textContent=`${entries.length} native tokens`;
 renderSkinPart();previewDossierSample();queueSkinPreview();
}
/** Only render the selected native tokens. An area switch is explicit and preserves the separate editor's scroll. */
function setSkinSaveStatus(message){$('skinVariantSaveState').textContent=message;$('skinQuickStatus').textContent=message;}
function renderSkinPart(){
 const holder=$('skinDossierVariables'),css=$('skinVariantSource').value,entries=nativeSkinVariables(css);
 const rendererCss=skinRenderer()?.replaceString||'',area=state.skinPart||'visible';
 const selected=nativeTokensForArea(entries,rendererCss,area);
 const item=MOTIVE_AREAS.find(x=>x.id===area)||MOTIVE_AREAS[0];
 const select=$('skinPartPicker');select.value=item.id;
 $('skinPartDescription').textContent=item.description;
 $('skinPartCount').textContent=`${selected.length} controls · ${entries.length} native declarations preserved`;
 const getCurrent=(name)=>nativeSkinVariables($('skinVariantSource').value).find(entry=>entry.name===name)?.value||'';
 const scroll=$('skinDossierVariables').scrollTop;
 mountTokenGroups(holder,selected,variable=>({rendererCss,getCurrent:()=>getCurrent(variable.name),commit:(value)=>{
  const changed=updateSkinVariable($('skinVariantSource').value,variable.name,value);cssSafeForStyle(changed);
  $('skinVariantSource').value=changed;
  setSkinSaveStatus('Unsaved changes · save skin to commit');
  applySkinStylesWithoutReload();
 }}),rendererCss);
 holder.scrollTop=scroll;
}
/** Style-only changes update the sandbox DOM, not iframe.srcdoc (which resets tabs and scroll). */
function applySkinStylesWithoutReload(){
 const frame=$('skinFrame');let doc;
 try{doc=frame.contentDocument;}catch{return queueSkinPreview();}
 if(!doc?.querySelector('.rxd-motive')){queueSkinPreview();return;}
 try{
  const variant=state.skinPlatform==='lumi'?cssSafeForStyle($('skinVariantSource').value):'';
  const overrides=compiledSkinCSS();
  let injected=doc.getElementById('skinLiveDossier');
  if(!injected){injected=doc.createElement('style');injected.id='skinLiveDossier';doc.body.append(injected);}
  injected.textContent=variant?`.rxd-motive {${variant}}`:'';
  let preview=doc.getElementById('skinLiveOverrides');
  if(!preview){preview=doc.createElement('style');preview.id='skinLiveOverrides';doc.body.append(preview);}
  preview.textContent=overrides;
  // The auxiliary swatch is lazy, but still reflects the edited value when opened.
  if($('skinDossierFrame')?.closest('details')?.open)previewDossierSample();
 }catch(e){setSkinSaveStatus(e.message);toast(e.message,true);}
}
/** Optional visual picker: native DOM classifications, no scripts run inside the source iframe. */
function armSkinPickerFrame(){
 const frame=$('skinFrame');let doc;
 try{doc=frame.contentDocument;}catch{return;}
 if(!doc?.querySelector('.rxd-motive'))return;
 let hints=doc.getElementById('skinPickerHints');
 if(!hints){hints=doc.createElement('style');hints.id='skinPickerHints';doc.head.append(hints);}
 hints.textContent=state.skinPicking?`.rxd-motive .klm-standalone-head:hover,.rxd-motive .klm-panel:hover,.rxd-motive .klm-tab:hover,.rxd-motive .klm-eyebrow:hover,.rxd-motive .klm-value:hover{outline:2px dashed #70ddff!important;outline-offset:2px!important;cursor:crosshair!important}`:'';
 if(doc.__studioPickListener)return;
 const handler=(event)=>{
  if(!state.skinPicking)return;
  const area=motiveAreaForSelector(event.target);
  event.preventDefault();event.stopImmediatePropagation();
  state.skinPart=area;state.skinPicking=false;
  $('skinPartPicker').value=area;for(const id of ['skinPickPreview','skinMobilePick'])$(id).setAttribute('aria-pressed','false');
  renderSkinPart();armSkinPickerFrame();
  // The picker is visible at the top of the independently scrolling operator rail.
  if(isSkinMobile())openSkinDrawer();
  $('skinPartPicker').focus({preventScroll:true});
  $('skinPartPicker').closest('.skin-part-tools')?.scrollIntoView({block:'nearest',behavior:'instant'});
 };
 doc.addEventListener('click',handler,true);doc.__studioPickListener=handler;
}
function previewDossierSample(){
 try{const css=cssSafeForStyle($('skinVariantSource').value);
  const html=`<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>
 :root{${css}}*{box-sizing:border-box}body{margin:0;background:var(--rxd-bg,#08070d);color:var(--rxd-text,#f2ecff);font:13px system-ui;padding:15px;}
 .sample{padding:16px;background:var(--rxd-panel,#17121e);border:1px solid var(--rxd-line,#4b3e57);border-radius:var(--rxd-radius-card,12px);box-shadow:var(--rxd-shadow-soft,none)}
 .eyebrow{color:var(--rxd-label,#b9a1dd);font-size:10px;letter-spacing:.12em}.sample h3{font:600 18px Georgia,serif;margin:9px 0}.sample p{color:var(--rxd-muted,#aaa);line-height:1.5}
 .chips{display:flex;gap:5px;flex-wrap:wrap}.chip{display:inline-block;color:var(--rxd-chip-text,#fff);background:var(--rxd-chip-bg,#493963);border:1px solid var(--rxd-chip-border,#614d81);border-radius:var(--rxd-radius-pill,20px);padding:5px 9px}
 .note{margin-top:12px;padding:10px;background:var(--rxd-panel-soft,#222);border:1px solid var(--rxd-line-soft,#555);border-radius:var(--rxd-radius-inner,8px)}.accent{color:var(--rxd-accent,#a58cf2)}</style>
 <div class="sample"><div class="eyebrow">NATIVE TOKEN MAP</div><h3>Gabrielle / Field note</h3><p>Cards, text, chips and borders use the selected source-backed variables.</p><div class="chips"><span class="chip">Pulse</span><span class="chip">Private</span></div><div class="note"><span class="accent">◆</span> The actual Motive Ledger above also uses this palette.</div></div>`;
  $('skinDossierFrame').srcdoc=html;
 }catch(e){$('skinVariantSaveState').textContent=e.message;}
}
function renderMotiveVariables(){
 const holder=$('skinMotiveVariables'),script=skinRenderer(),entries=nativeSkinVariables(script?.replaceString);
 $('skinMotiveCount').textContent=entries.length?`${entries.length} source tokens`:'Native CSS without variables';
 if(!entries.length){holder.replaceChildren(make('p',{class:'muted-tiny'},'The original renderer has no editable CSS variables.'));return;}
 if(!state.skinMotiveOverrides)state.skinMotiveOverrides=new Map();
 const getCurrent=(variable)=>state.skinMotiveOverrides.get(variable.name)??variable.value;
 mountTokenGroups(holder,entries,variable=>({rendererCss:script.replaceString,getCurrent:()=>getCurrent(variable),commit:(value)=>{
  updateSkinVariable(`${variable.name}:${variable.value};`,variable.name,value);
  state.skinMotiveOverrides.set(variable.name,value);applySkinStylesWithoutReload();
 }}),script.replaceString);
}
function compiledSkinCSS(){
 const css=cssSafeForStyle($('skinCss').value);
 const overrides=[...(state.skinMotiveOverrides||new Map()).entries()];
 for(const [key,value] of overrides)updateSkinVariable(`${key}:initial;`,key,value);
 const variables=overrides.length?`.rxd-motive {${overrides.map(([key,value])=>`${key}: ${value};`).join(' ')}}\n`:'';
 return `${variables}${css}`;
}
function queueSkinPreview(){clearTimeout(state.skinPreviewTimer);state.skinPreviewTimer=setTimeout(()=>previewSkin().catch(e=>{$('skinNotes').textContent=e.message;toast(e.message,true);}),180);}
async function previewSkin(){
 const script=skinRenderer();if(!script)throw new Error('The selected source contains no Motive Ledger HTML renderer.');
 const revision=++state.skinPreviewRevision,platform=state.skinPlatform,source=nativeSkinSource();
 const variantCss=platform==='lumi'&&state.dossierSkinId?cssSafeForStyle($('skinVariantSource').value):null;
 const effectiveScript=variantCss&&script.replaceString.includes('/*@@RX_DOSSIER_SKIN@@*/')?{...script,replaceString:insertDossierSkinIntoRenderer(script.replaceString,variantCss)}:script;
 const result=await runRegexInWorker($('skinInput').value,[{...effectiveScript,disabled:false}]);
 if(revision!==state.skinPreviewRevision||platform!==state.skinPlatform||source!==nativeSkinSource())return;
 const changed=result.log.some(x=>x.changed),css=compiledSkinCSS();
 const output=changed?result.output:'<p class="sample-miss">The original Motive Ledger regex did not match this payload. Reload the Gabi fixture to recover its exact format.</p>';
 const html=`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; form-action 'none'"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:#0c0a11;color:#f2ebfa;font:14px/1.6 system-ui,sans-serif;overflow-wrap:anywhere}body{padding:16px}*{box-sizing:border-box}.sample-miss{color:#c6a8df;padding:30px;border:1px dashed #52416a}</style></head><body>${output}<style>${css}</style></body></html>`;
 $('skinFrame').srcdoc=html;
 $('skinNotes').textContent=changed?`Matched the original ${state.skinPlatform==='st'?'SillyTavern':'Lumiverse'} Motive Ledger regex.${variantCss?' Live dossier CSS is inserted through the original RX_DOSSIER_SKIN marker.':''} Browser sandbox disables host interactions.`:'Motive Ledger regex did not match. The preview is intentionally blank rather than showing invented HTML.';
}
async function loadSkinSource(){
 const platform=$('skinPlatform').value;state.skinPlatform=platform;state.skinPreviewRevision=(state.skinPreviewRevision||0)+1;
 if(detectNativeFormat(nativeSkinSource())!==platform)await loadBundled(platform);
 if(detectNativeFormat(nativeSkinSource())!==platform)throw new Error(`Skin Lab needs a matching ${platform==='st'?'SillyTavern':'Lumiverse'} source.`);
 const script=skinRenderer();if(!script)throw new Error('No Motive Ledger HTML renderer in this native snapshot.');
 state.skinRendererId=script.id;state.skinMotiveOverrides=new Map();
 $('skinRendererName').textContent=script.scriptName;$('skinQuickActions').hidden=platform!=='lumi';$('skinLumiOnly').hidden=platform!=='lumi';$('skinApply').hidden=platform!=='lumi';$('skinExportNative').hidden=platform!=='lumi';
 $('skinCreate').hidden=platform!=='lumi';$('skinImportSingle').hidden=platform!=='lumi';$('skinExportSingle').hidden=platform!=='lumi';$('skinCurrentNameGroup').hidden=platform!=='lumi';$('skinMotiveDetails').hidden=platform!=='lumi';
 if(platform!=='lumi')closeSkinDrawer();
 $('skinInput').value=motiveLedgerPreviewInput();
 if(platform==='lumi'){renderDossierVariables();renderMotiveVariables();}
 $('skinStatus').textContent=`${platform==='st'?'SillyTavern':'Lumiverse'} · original Motive Ledger renderer`;
 queueSkinPreview();
}
const isSkinMobile=()=>window.matchMedia('(max-width:700px)').matches;
function syncSkinDrawer(){
 const open=!!state.skinDrawerOpen&&isSkinMobile();
 $('skinOperator').classList.toggle('is-drawer-open',open);
 $('skinOperator').inert=isSkinMobile()&&!open;
 $('skinDrawerBackdrop').hidden=!open;
 $('skinOpenControls').setAttribute('aria-expanded',String(open));
 document.body.classList.toggle('skin-drawer-open',open);
}
function openSkinDrawer(){if(!isSkinMobile())return;state.skinDrawerOpen=true;syncSkinDrawer();$('skinCloseControls').focus({preventScroll:true});}
function closeSkinDrawer(){const wasOpen=state.skinDrawerOpen;state.skinDrawerOpen=false;syncSkinDrawer();if(wasOpen&&isSkinMobile())$('skinOpenControls').focus({preventScroll:true});}
function toggleSkinPicker(){
 state.skinPicking=!state.skinPicking;
 for(const id of ['skinPickPreview','skinMobilePick'])$(id).setAttribute('aria-pressed',String(state.skinPicking));
 armSkinPickerFrame();
 if(state.skinPicking&&isSkinMobile()){closeSkinDrawer();$('skinMobilePick').focus({preventScroll:true});}
}
function setSkinImportStatus(message,error=false){const status=$('skinImportStatus');status.textContent=message;status.dataset.error=String(error);status.hidden=false;}
function wireSkinLab(){
 const partSelect=$('skinPartPicker');
 for(const area of MOTIVE_AREAS){const opt=make('option',{},area.label);opt.value=area.id;partSelect.append(opt);}
 state.skinPart='canvas';state.skinPicking=false;partSelect.value='canvas';
 partSelect.addEventListener('change',()=>{state.skinPart=partSelect.value;renderSkinPart();});
 $('skinPickPreview').addEventListener('click',toggleSkinPicker);
 $('skinMobilePick').addEventListener('click',toggleSkinPicker);
 $('skinOpenControls').addEventListener('click',openSkinDrawer);
 $('skinCloseControls').addEventListener('click',closeSkinDrawer);
 $('skinDrawerBackdrop').addEventListener('click',closeSkinDrawer);
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.skinDrawerOpen){event.preventDefault();closeSkinDrawer();}});
 window.matchMedia('(max-width:700px)').addEventListener('change',()=>{if(!isSkinMobile())closeSkinDrawer();else syncSkinDrawer();});
 $('skinQuickSave').addEventListener('click',()=>{const rail=document.querySelector('.skin-operator'),position=rail.scrollTop;$('skinSaveVariant').click();rail.scrollTop=position;requestAnimationFrame(()=>{if(state.view==='skins')rail.scrollTop=position;});});
 $('skinQuickActivate').addEventListener('click',()=>$('skinActivate').click());
 $('skinFrame').addEventListener('load',()=>{if($('skinFrame').contentDocument?.querySelector('.rxd-motive'))applySkinStylesWithoutReload();armSkinPickerFrame();});
 $('skinPlatform').addEventListener('change',()=>loadSkinSource().catch(e=>toast(e.message,true)));
 $('skinLoad').addEventListener('click',()=>loadSkinSource().catch(e=>toast(e.message,true)));
 $('skinInput').addEventListener('input',queueSkinPreview);
 $('skinCss').addEventListener('input',()=>{state.skinOverride=$('skinCss').value;applySkinStylesWithoutReload();});
 $('skinRefresh').addEventListener('click',()=>previewSkin().catch(e=>toast(e.message,true)));
 $('skinResetSample').addEventListener('click',()=>{$('skinInput').value=motiveLedgerPreviewInput();queueSkinPreview();});
 for(const b of document.querySelectorAll('[data-skin-device]'))b.addEventListener('click',()=>{$('skinFrameWrap').classList.toggle('device-mobile',b.dataset.skinDevice==='mobile');document.querySelectorAll('[data-skin-device]').forEach(node=>node.classList.toggle('active',node===b));});
 $('skinExportCss').addEventListener('click',()=>{try{const skin=state.skinPlatform==='lumi'?cssSafeForStyle($('skinVariantSource').value):'';const css=(skin?`.rxd-motive {\n${skin}\n}\n`:'')+compiledSkinCSS();download('kittylotus-motive-preview.css',css,'text/css');toast('Selected dossier palette and Motive CSS exported.');}catch(e){toast(e.message,true);}});
 $('skinExportNative').addEventListener('click',()=>{if(detectNativeFormat(nativeSkinSource())!=='lumi')return toast('Load a Lumiverse source first.',true);$('exportSourceButton').click();});
 $('skinExportSingle').addEventListener('click',()=>{try{const skin=individualDossierSkin(nativeSkinSource(),state.dossierSkinId,$('skinVariantSource').value,$('skinCurrentName').value);download(`${skin.skin_name}-skin.json`,JSON.stringify(skin,null,2));setSkinSaveStatus(`Exported ${skin.skin_name} · ready to import`);toast('Exported a named skin with matching native regex metadata and current CSS.');}catch(e){setSkinSaveStatus(e.message);toast(e.message,true);}});
 $('skinApply').addEventListener('click',()=>{
  const source=nativeSkinSource();if(detectNativeFormat(source)!=='lumi')return toast('Only Lumiverse exposes native skin creation here.',true);
  try{const css=compiledSkinCSS(),script=skinRenderer();if(!css.trim())return toast('No CSS override to write.');
   const start='<!-- KLS_MOTIVE_OVERRIDE_START -->',end='<!-- KLS_MOTIVE_OVERRIDE_END -->';
   const clean=script.replaceString.replace(/<!-- KLS_MOTIVE_OVERRIDE_START -->[\s\S]*?<!-- KLS_MOTIVE_OVERRIDE_END -->/g,'');
   const edits=patchNativeRegex(source,script.id,{replaceString:clean+`\n${start}<style>${css}</style>${end}`});
   skinMarkDirty(edits);toast(edits?'Motive overrides saved into both Lumiverse regex mirrors. Export your JSON.':'Motive overrides are unchanged.');queueSkinPreview();
  }catch(e){toast(e.message,true);}
 });
 $('skinBase').addEventListener('change',()=>{const previous=dossierSkins(nativeSkinSource()).find(s=>s.id===state.dossierSkinId);if(previous&&(previous.replaceString!==$('skinVariantSource').value||(previous.scriptName.replace(/^.*?\]\s*/,''))!==$('skinCurrentName').value.trim())){$('skinBase').value=state.dossierSkinId;return toast('Unsaved skin CSS. Save this skin before switching to another.',true);}state.dossierSkinId=$('skinBase').value;renderDossierVariables();});
 $('skinActivate').addEventListener('click',()=>{const source=nativeSkinSource(),skin=dossierSkins(source).find(s=>s.id===state.dossierSkinId);if(!skin)return toast('Choose a native Lumiverse skin.',true);if(skin.replaceString!==$('skinVariantSource').value||(skin.scriptName.replace(/^.*?\]\s*/,''))!==$('skinCurrentName').value.trim())return toast('Save the skin name and CSS before activating.',true);try{const changed=selectDossierSkin(source,skin.id);skinMarkDirty(changed);setSkinSaveStatus(changed?'Active in native preset · export JSON':'Already active · export JSON to keep changes');toast(changed?'Selected this skin in the native preset. Export JSON to keep it.':'This skin is already active.');}catch(e){toast(e.message,true);}});
 $('skinCurrentName').addEventListener('input',()=>setSkinSaveStatus('Unsaved skin name · Save skin to commit'));
 $('skinVariantSource').addEventListener('input',()=>{setSkinSaveStatus('Unsaved changes · save skin to commit');applySkinStylesWithoutReload();});
 $('skinVariantSource').addEventListener('change',()=>renderSkinPart());
 $('skinSaveVariant').addEventListener('click',()=>{
  const source=nativeSkinSource(),skin=dossierSkins(source).find(s=>s.id===state.dossierSkinId);if(!skin)return toast('Select a native dossier skin.',true);
  try{const edits=saveDossierSkin(source,skin.id,$('skinCurrentName').value,$('skinVariantSource').value);skinMarkDirty(edits);$('skinManageName').textContent=$('skinCurrentName').value.trim();renderDossierSkinOptions();for(const option of $('skinBase').options){if(option.value===skin.id)option.textContent=$('skinCurrentName').value.trim();}setSkinSaveStatus(edits?'Name and CSS saved · export native JSON':'No changes');applySkinStylesWithoutReload();toast(edits?'Skin name, metadata and CSS saved to both mirrors.':'Dossier skin unchanged.');}
  catch(e){toast(e.message,true);}
 });
 $('skinImportSingle').addEventListener('click',()=>{$('skinImportStatus').hidden=true;$('skinImportFile').click();});
 $('skinImportFile').addEventListener('change',async(event)=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  const source=nativeSkinSource();if(detectNativeFormat(source)!=='lumi'){setSkinImportStatus('Load a Lumiverse preset first.',true);return toast('Load a Lumiverse preset first.',true);}
  const selected=dossierSkins(source).find(s=>s.id===state.dossierSkinId);
  if(selected&&(selected.replaceString!==$('skinVariantSource').value||(selected.scriptName.replace(/^.*?\]\s*/,''))!==$('skinCurrentName').value.trim())){setSkinImportStatus('Save current skin name/CSS before importing.',true);return toast('Save or discard current skin edits before importing.',true);}
  try{if(file.size>180000)throw Error('Individual skin JSON is too large.');const portable=JSON.parse(await file.text());
   const id=importIndividualDossierSkin(source,portable);state.dossierSkinId=id;markNativeDirty();renderDossierVariables();setSkinSaveStatus(`Imported ${$('skinCurrentName').value} · activate or edit`);setSkinImportStatus(`Imported ${$('skinCurrentName').value} into both preset mirrors. Activate or edit it, then export the full preset.`);toast('Imported one native skin into both mirrors. Use in preset and export full JSON to keep it.');
  }catch(e){setSkinSaveStatus(`Skin import rejected: ${e.message}`);setSkinImportStatus(`Skin import rejected: ${e.message}`,true);toast(`Skin import rejected: ${e.message}`,true);}
 });
 $('skinCreate').addEventListener('click',()=>{
  const source=nativeSkinSource();if(detectNativeFormat(source)!=='lumi')return toast('Native dossier skins are Lumiverse-only.',true);
  try{const previous=dossierSkins(source).find(s=>s.id===state.dossierSkinId);if(previous&&(previous.replaceString!==$('skinVariantSource').value||(previous.scriptName.replace(/^.*?\]\s*/,''))!==$('skinCurrentName').value.trim()))return toast('Save or discard your CSS edits before cloning a new skin.',true);const id=addCustomDossierSkin(source,state.dossierSkinId,$('skinName').value);markNativeDirty();state.dossierSkinId=id;renderDossierVariables();toast('Cloned a real native dossier skin, including every CSS token. Export JSON to keep it.');}
  catch(e){toast(e.message,true);}
 });
}

/* Sample gallery is the public-facing surface; this editor remains the advanced escape hatch. */
const showcase=createShowcase({
 getScripts:()=>state.regexScripts,
 getPlatform:()=>state.regexPlatform,
 getFixtures:()=>[...(state.nativeFixtures||[]),...state.showcaseFixtures],
 getSnapshots:()=>state.showcaseSnapshots,
 getSource:()=>actualRegexSource(),
 run:(input,scripts)=>runRegexInWorker(input,scripts),
 onSelect:(script,fixture)=>{state.regexFolder=script.folder;renderRegexFolderOptions();selectRegexScript(script.id);$('regexInput').value=fixture.input;$('regexFixtureHelp').textContent=fixture.notes||'Sample from the original native regex contract.';const option=[...$('fixtureSelector').options].find(o=>o.value===fixture.id);if(option)$('fixtureSelector').value=fixture.id;},
 onInspect:(script)=>{state.regexFolder=script.folder;renderRegexFolderOptions();selectRegexScript(script.id);}
});
const cascades=createCascadeShowcase({
 getCases:()=>state.cascadeFixtures,
 getScripts:()=>state.regexScripts,
 getPlatform:()=>state.regexPlatform,
 run:(input,scripts,options)=>runRegexInWorker(input,scripts,options),
 onInspect:script=>{state.regexFolder=script.folder;renderRegexFolderOptions();selectRegexScript(script.id);$('regexWorkbenchDisclosure').open=true;$('regexWorkbenchDisclosure').scrollIntoView({behavior:'smooth',block:'start'});}
});
/* --------------------- Regex Playground: actual source editing --------------------- */
function actualRegexSource(){return state.source?.document?.kind==='json'&&detectNativeFormat(state.source.document.value)===state.regexPlatform&&!state.regexDetached?state.source.document.value:null;}
function renderRegexFolderOptions(){
 const sel=$('regexFolderFilter');sel.replaceChildren();const grouped=platformRegexGroups(state.regexScripts,state.regexPlatform);
 for(const [id,label] of [['all','All folders'],...[...grouped.keys()].map(g=>[g,`${g} (${grouped.get(g).length})`])]){const option=make('option',{},label);option.value=id;sel.append(option);}
 if(![...sel.options].some(o=>o.value===state.regexFolder))state.regexFolder=grouped.keys().next().value||'all';sel.value=state.regexFolder;
}
function selectRegexScript(id){const script=state.regexScripts.find(s=>s.id===id);if(!script)return;
 $('regexPreviewKind').textContent=hasRenderableReplacement(script)?'HTML replacement · visual preview available':'Text / metadata replacement · output only';
 state.regexSelectedId=id;$('regexSelectedName').textContent=script.scriptName;
 $('regexScriptMeta').textContent=`${script.folder} · ${script.disabled?'disabled':'enabled'} · ${script.target?.join?.(', ')||'native'}`;
 $('regexPattern').value=script.findRegex;$('regexReplacement').value=script.replaceString;$('regexFlags').value=script.flags||'';$('regexDisabled').checked=script.disabled;
 $('regexSaveState').textContent=actualRegexSource()?'Edit fields, then save to the real JSON.':'Detached import: preview only. Import a full native source to edit/export.';
 $('regexSaveScript').disabled=!actualRegexSource();
 renderRegexList();
}
function renderRegexList(){
 const holder=$('regexList');holder.replaceChildren();
 const query=$('regexSearch').value.trim().toLowerCase();const shown=state.regexScripts.filter(s=>(!state.regexVisualOnly||hasRenderableReplacement(s))&&(state.regexFolder==='all'||s.folder===state.regexFolder)&&(!query||[s.scriptName,s.folder,s.findRegex].join(' ').toLowerCase().includes(query)));
 $('regexCount').textContent=`${shown.length} ${state.regexVisualOnly?'HTML renderers':'scripts'} / ${state.regexScripts.length} loaded`;
 if(!shown.length){holder.append(make('p',{class:'muted'},'No matching native scripts.'));return;}
 for(const script of shown.slice(0,150)){
  const row=make('div',{class:'regex-item'+(script.id===state.regexSelectedId?' selected':'')}),toggle=make('input',{type:'checkbox',role:'switch',class:'studio-switch'});
  toggle.checked=!script.disabled;toggle.setAttribute('aria-label',`Enable ${script.scriptName}`);
  toggle.addEventListener('change',()=>{try{
    const source=actualRegexSource(),nextDisabled=!toggle.checked;
    if(source){const edits=patchNativeRegex(source,script.id,{disabled:nextDisabled});if(edits)markNativeDirty();}
    script.disabled=nextDisabled;updateRegexStatus();selectRegexScript(script.id);
   }catch(e){toggle.checked=!toggle.checked;toast(e.message,true);}
  });
  const choose=make('button',{type:'button',class:'regex-item-select'});
  choose.append(make('strong',{},script.scriptName),make('small',{},`${script.folder} · ${script.disabled?'Disabled':'Enabled'}`));
  choose.addEventListener('click',()=>selectRegexScript(script.id));row.append(toggle,choose);holder.append(row);
 }
 if(shown.length>150)holder.append(make('div',{class:'muted-tiny'},`${shown.length-150} more matches hidden. Narrow your search to select them.`));
}
function updateRegexStatus(){
 renderDashboard();$('regexStatus').textContent=state.regexScripts.length?`${state.regexScripts.filter(s=>!s.disabled).length}/${state.regexScripts.length} enabled · ${state.regexPackName}`:'No regex pack loaded';
}
function setRegexTab(tab){state.regexTab=tab;document.querySelectorAll('[data-regex-tab]').forEach(b=>b.classList.toggle('active',b.dataset.regexTab===tab));$('regexRenderWrap').hidden=tab!=='rendered';$('regexOutputWrap').hidden=tab!=='text';}
function setRegexOutput(output,log=[],renderable=false){
 state.regexOutput=output;$('regexOutput').value=output;
 const body=renderable?output:'<p style="color:#b5a9c8">This run produced text or metadata, not rendered HTML. Inspect the <strong>Output text</strong> tab instead.</p>';
 const html=`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; form-action 'none'; font-src 'none'"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:16px;background:#0f0b13;color:#eee9f6;font:14px/1.65 system-ui;overflow-wrap:anywhere}*{box-sizing:border-box}</style></head><body>${body}</body></html>`;
 $('regexFrame').srcdoc=html;
 $('regexNotes').textContent=`${log.length} regexes executed · ${log.filter(l=>l.changed).length} matched. ${renderable?'Actual HTML replacement rendered in the sandbox.':'No HTML replacement matched; showing text output.'} Host macros and placement are not emulated.`;
}
function runRegexInWorker(input,scripts,options){return new Promise((resolve,reject)=>{
 const worker=new Worker(new URL('./regex-worker.js',import.meta.url),{type:'module'});let settled=false;
 const finish=()=>{clearTimeout(timeout);worker.terminate();};const timeout=setTimeout(()=>{if(settled)return;settled=true;finish();reject(new Error('Regex preview timed out. An expensive pattern or replacement may need a smaller input.'));},options?.curatedCascade===true?6000:2500);
 worker.onmessage=e=>{if(settled)return;settled=true;finish();e.data.ok?resolve(e.data):reject(new Error(e.data.error));};
 worker.onerror=e=>{if(settled)return;settled=true;finish();reject(new Error('Regex worker failed: '+e.message));};
 worker.postMessage({input,scripts,options});
});}
async function loadNativeRegex(platform=state.regexPlatform){
 if(!['lumi','st'].includes(platform))throw new Error('Regex source must be Lumiverse or SillyTavern.');
 state.regexPlatform=platform;$('regexPlatform').value=platform;
 let source=state.source?.document?.value;
 if(detectNativeFormat(source)!==platform){await loadBundled(platform);source=state.source?.document?.value;}
 if(detectNativeFormat(source)!==platform)throw new Error('Load a matching native source or export pending work first.');
 state.regexDetached=false;
 state.regexScripts=getActualRegexScripts(source).map(s=>({...s,folder:platform==='st'?(s.scriptName.match(/\[([^\]]+)\]/)?.[1]||'Other scripts'):s.folder}));
 if(!state.regexScripts.length)throw new Error('No native regex scripts in the selected source.');
 state.regexPackName=state.source.name;
 if(state.regexFolder==='all'||!state.regexScripts.some(s=>s.folder===state.regexFolder))state.regexFolder=platform==='lumi'?(state.regexScripts.find(s=>hasRenderableReplacement(s)&&/TRACK|DECORATIONS/.test(s.scriptName))?.folder||'all'):(state.regexScripts.find(s=>hasRenderableReplacement(s))?.folder||'all');
 renderRegexFolderOptions();
 const visible=state.regexScripts.filter(s=>(state.regexFolder==='all'||s.folder===state.regexFolder)&&(!state.regexVisualOnly||hasRenderableReplacement(s)));
 const chosen=visible.find(s=>s.id===state.regexSelectedId)||visible[0]||state.regexScripts.find(s=>!state.regexVisualOnly||hasRenderableReplacement(s))||state.regexScripts[0];
 selectRegexScript(chosen.id);updateRegexStatus();showcase.refresh();cascades.refresh();toast(`Loaded ${state.regexScripts.length} actual ${platform==='st'?'SillyTavern':'Lumiverse'} regexes.`);
}
async function loadFixtureList(){
 try{const r=await fetch('./data/fixtures/contract-fixtures.json');if(!r.ok)throw new Error('Fixture unavailable');state.nativeFixtures=(await r.json()).fixtures||[];
 try{const galleryResponse=await fetch('./data/fixtures/showcase-samples.json');if(galleryResponse.ok){state.showcaseFixtures=(await galleryResponse.json()).fixtures||[];}}catch{};
 try{const snapshotResponse=await fetch('./data/fixtures/showcase-snapshots.json');if(snapshotResponse.ok){state.showcaseSnapshots=(await snapshotResponse.json()).snapshots||[];}}catch{};
 try{const cascadeResponse=await fetch('./data/fixtures/cascade-samples.json');if(cascadeResponse.ok){state.cascadeFixtures=(await cascadeResponse.json()).cascades||[];}}catch{};
 const select=$('fixtureSelector');for(const fixture of [...state.nativeFixtures,...state.showcaseFixtures]){const option=make('option',{},fixture.name);option.value=fixture.id;select.append(option);}
 $('loadFixture').addEventListener('click',async()=>{
  const fixture=[...state.nativeFixtures,...state.showcaseFixtures].find(f=>f.id===select.value);if(!fixture)return;
  try{const platform=fixture.platform||'lumi';
   if(state.regexPlatform!==platform||!state.regexScripts.length)await loadNativeRegex(platform);
   $('regexInput').value=fixture.input;
   const script=state.regexScripts.find(s=>s.scriptName===fixture.scriptName)||state.regexScripts.find(s=>s.scriptName.includes(fixture.scriptQuery||'\0'));
   if(!script)throw new Error('This exact sample regex is absent from the current native source.');
   state.regexFolder=script.folder;renderRegexFolderOptions();selectRegexScript(script.id);
   const valid=actualRegexSource()?auditFixtureContracts(actualRegexSource(),[fixture])[0]:null;
   $('regexFixtureHelp').textContent=fixture.notes||'';
   toast(valid?.ok?`Verified native fixture: ${fixture.name}`:`Fixture loaded, but its fingerprint differs from the current source.`,!valid?.ok);
  }catch(e){toast(e.message,true);}
 });
 showcase.refresh();cascades.refresh();
 }catch(e){$('loadFixture').disabled=true;}
}
function wireRegex(){
 $('regexPlatform').addEventListener('change',()=>loadNativeRegex($('regexPlatform').value).catch(e=>toast(e.message,true)));
 $('loadNativeRegex').addEventListener('click',()=>loadNativeRegex($('regexPlatform').value).catch(e=>toast(e.message,true)));
 $('regexFolderFilter').addEventListener('change',e=>{state.regexFolder=e.target.value;const first=state.regexScripts.find(s=>(state.regexFolder==='all'||s.folder===state.regexFolder)&&(!state.regexVisualOnly||hasRenderableReplacement(s)));if(first)selectRegexScript(first.id);else renderRegexList();});
 $('regexSearch').addEventListener('input',renderRegexList);
 $('regexVisualOnly').addEventListener('change',e=>{state.regexVisualOnly=e.target.checked;const visible=state.regexScripts.filter(s=>(state.regexFolder==='all'||s.folder===state.regexFolder)&&(!state.regexVisualOnly||hasRenderableReplacement(s)));if(visible.length&&!visible.some(s=>s.id===state.regexSelectedId))selectRegexScript(visible[0].id);renderRegexList();});
 $('importRegex').addEventListener('click',()=>$('regexFileInput').click());
 $('regexFileInput').addEventListener('change',async e=>{const f=e.target.files?.[0];e.target.value='';if(!f)return;if(f.size>MAX_REGEX_BYTES)return toast('Import a script pack under 2 MB.',true);
  try{const parsed=JSON.parse(await f.text()),scripts=extractRegexScripts(parsed);if(!scripts.length)throw new Error('No native find/replace regex entries found.');
   state.regexDetached=true;state.regexScripts=scripts.map((s,i)=>({...s,id:'imported-'+i,index:i,folder:s.folder||'Imported'}));state.regexPackName=f.name;state.regexFolder='all';renderRegexFolderOptions();selectRegexScript(state.regexScripts[0].id);updateRegexStatus();showcase.refresh();cascades.refresh();toast('Detached regex pack loaded for testing; native source unchanged.');
  }catch(e){toast(e.message,true);}
 });
 $('demoRegex').addEventListener('click',()=>{state.regexDetached=true;state.regexScripts=DEFAULT_DEMO_SCRIPTS.map((s,i)=>({...s,id:'demo-'+i,folder:'Demonstration'}));state.regexPackName='Toy demo';state.regexFolder='all';renderRegexFolderOptions();selectRegexScript(state.regexScripts[0].id);updateRegexStatus();});
 $('clearRegex').addEventListener('click',()=>{state.regexScripts=[];state.regexSelectedId=null;state.regexPackName='';state.regexFolder='all';renderRegexFolderOptions();renderRegexList();setRegexOutput('');updateRegexStatus();showcase.refresh();cascades.refresh();});
 $('regexSaveScript').addEventListener('click',()=>{
  const script=state.regexScripts.find(s=>s.id===state.regexSelectedId),source=actualRegexSource();if(!script||!source)return toast('Load a native preset and select a script to edit.',true);
  try{const flags=$('regexFlags').value.trim()||null;compileSourceRegex($('regexPattern').value,flags);
   const patch={findRegex:$('regexPattern').value,replaceString:$('regexReplacement').value,disabled:$('regexDisabled').checked};
   if(flags!==script.flags)patch.flags=flags;
   const edits=patchNativeRegex(source,script.id,patch);
   if(edits){Object.assign(script,patch);markNativeDirty();$('regexSaveState').textContent='Saved into native JSON · export to publish';toast('Native regex saved. Mirror arrays updated when present.');showcase.refresh({preserveInspector:true});cascades.refresh();}
   else toast('No changes to save.');renderRegexList();
  }catch(e){$('regexSaveState').textContent=e.message;toast(e.message,true);}
 });
 $('regexExportSource').addEventListener('click',()=>{if(!actualRegexSource())return toast('A full native source is required for export.',true);$('exportSourceButton').click();});
 $('runRegex').addEventListener('click',async()=>{
  const scripts=state.regexScripts;if(!scripts.length)return toast('Load a native regex source first.',true);
  const selected=scripts.find(s=>s.id===state.regexSelectedId);const mode=$('regexRunMode').value;
  let chosen=mode==='single'?(selected?[{...selected,disabled:false}]:[]):scripts.filter(s=>(state.regexFolder==='all'||s.folder===state.regexFolder)&&!s.disabled&&(!state.regexVisualOnly||hasRenderableReplacement(s)));
  if(mode==='folder'&&chosen.length>100)return toast('Select a single folder: this browser safety limit is 100 regexes per pipeline.',true);
  if(!chosen.length)return toast('No enabled scripts in this selection.',true);
  const button=$('runRegex');button.disabled=true;
  try{const result=await runRegexInWorker($('regexInput').value,chosen);const matched=result.log.filter(x=>x.changed);
   const generatedHtml=matched.some(item=>chosen.some(s=>s.scriptName===item.script&&hasRenderableReplacement(s)));
   setRegexOutput(result.output,result.log,generatedHtml);if(!generatedHtml)setRegexTab('text');toast(`${matched.length} of ${result.log.length} regexes matched${generatedHtml?' · HTML ready':' · text result'}.`);}
  catch(e){$('regexNotes').textContent=e.message;toast(e.message,true);}finally{button.disabled=false;}
 });
 document.querySelectorAll('[data-regex-tab]').forEach(b=>b.addEventListener('click',()=>setRegexTab(b.dataset.regexTab)));
 setRegexOutput('');renderRegexFolderOptions();renderRegexList();loadFixtureList();
}

function renderGabis(){const holder=$('gabiGallery');holder.replaceChildren();GABIS.forEach((g,i)=>{const card=make('div',{class:'gabi-card'});const img=make('img',{src:'./assets/gabi/expressions/'+g.file,alt:`Gabrielle: ${g.name}`,loading:'lazy'});img.dataset.galleryExpression=g.id;img.dataset.galleryFile=g.file;card.append(img);const label=make('div',{class:'gabi-label'});label.append(make('strong',{},g.name),make('span',{},String(i+1).padStart(2,'0')));card.append(label);holder.append(card);});for(const chibi of CHIBIS)addChibi(chibi.src,chibi.name,false);}
function addChibi(url,name,temporary=true){$('emptyChibis')?.remove();const card=make('div',{class:'gabi-card'});card.append(make('img',{src:url,alt:`Gabi chibi: ${name}`,loading:'lazy'}));const label=make('div',{class:'gabi-label'});label.append(make('strong',{},name),make('span',{},temporary?'SESSION':'BUNDLED'));card.append(label);$('chibiGallery').append(card);}
function wireGallery(){renderGabis();
 $('previewLoungeArt').addEventListener('click',()=>$('loungeArtInput').click());
 $('loungeArtInput').addEventListener('change',e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;
  if(!/^image\/(png|webp|jpeg)$/.test(file.type)||file.size>12_000_000)return toast('Choose a PNG/WebP/JPEG under 12 MB.',true);
  const url=URL.createObjectURL(file);document.querySelectorAll('.lounge-portrait,[data-gabi-portrait]').forEach(img=>img.src=url);
  if(state.previewLoungeUrl)URL.revokeObjectURL(state.previewLoungeUrl);state.previewLoungeUrl=url;
  toast('Lounge art previewed for this session. The bundled Gabi-Views remains unchanged.');
 });
$('addChibisButton').addEventListener('click',()=>$('chibiFileInput').click());$('chibiFileInput').addEventListener('change',e=>{const files=[...(e.target.files||[])].filter(f=>f.type.startsWith('image/')&&f.size<10_000_000);for(const file of files){const url=URL.createObjectURL(file);state.chibiUrls.push(url);addChibi(url,file.name.replace(/\.[^.]+$/,''));renderDashboard();}toast(`Added ${files.length} local chibi previews for this session.`);e.target.value='';});window.addEventListener('pagehide',()=>state.chibiUrls.forEach(u=>URL.revokeObjectURL(u)));}
function wireProfiles(){
 $('exportProfileButton').addEventListener('click',()=>{const profile={format:PROFILE_FORMAT,schemaVersion:PROFILE_SCHEMA,platform:state.platform,skins:state.skins,plan:state.plan,notes:'Studio profile preferences only; native presets export separately.'};download('kittylotus-studio-profile.json',JSON.stringify(profile,null,2)+'\n');toast('Studio profile downloaded.');});
 $('importProfileButton').addEventListener('click',()=>$('profileFileInput').click());$('profileFileInput').addEventListener('change',async e=>{const f=e.target.files?.[0];if(f){try{const p=JSON.parse(await f.text());if(!profileValid(p))throw new Error('Not a compatible KittyLotus Studio v1 profile.');if(!['lumi','st','jani'].includes(p.platform))throw new Error('Unknown profile platform.');state.platform=p.platform;state.plan=p.plan;state.skins={...DEFAULT_SKINS,...p.skins};for(const g of SKIN_GROUPS)if(!g.options.some(o=>o.id===state.skins[g.id]))state.skins[g.id]=g.options[0].id;persist();renderPlatforms();renderModules();renderSkinControls();renderDashboard();toast('Studio profile restored.');}catch(error){toast(error.message,true);}}e.target.value='';});
}
wireArtworkFallbacks();wireNavigation();wireDashboard();wireProfiles();wireArchitect();wireSource();wireSkinLab();wireRegex();wireGallery();renderDossierSkinOptions();
 // The supplied Gabi-Views illustration is bundled; only Overview uses the full composition.
 document.querySelectorAll('.lounge-portrait').forEach(img=>{if(!state.previewLoungeUrl)img.src='./assets/gabi/gabi-views.webp';});
