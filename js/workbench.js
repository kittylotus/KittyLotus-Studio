/** Source-preserving editors shared by Studio workspaces. Native identities are never guessed. */
import {detectNativeFormat,getActualRegexScripts} from './native.js';
import {compileSourceRegex} from './core.js';

export const cleanHeading = name => String(name || 'Untitled').replace(/[≽≼✧━┌┆╰─✦★⩊•❛❜ू﹝﹞ྀིૢ]/g,'').replace(/\s+/g,' ').trim() || 'Untitled';

/** ST category, subsection, and option-set headings are presentation-only. */
export function stHeadingKind(name) {
 const value=String(name||'').trim();
 if(/^✨\s*(?:┆\s*)?✧/u.test(value))return 'wrapper';
 if(/^╰─{3,}/u.test(value))return 'closer';
 if(/^┆\s*✧\s*━{2,}/u.test(value)||/^┌─.*━{2,}/u.test(value))return 'wrapper';
 if(/^┆\s*→/u.test(value)||/^┆\s*✧/u.test(value)||/^┌─/u.test(value)||/^╰❛\*ੈ/u.test(value))return 'subgroup';
 if(/━{2,}/u.test(value)&&!/^╰/u.test(value)&&!/^┆\s*✧/u.test(value))return 'subgroup';
 if(/[ૢ]✧/u.test(value))return 'leaf';
 return 'entry';
}
export function stPresentationLabel(name){
 const value=String(name||'').replace(/^.*?→\s*/u,match=>match.includes('→')?'':match)
  .replace(/^[^\p{L}\p{N}]+/u,'')
  .replace(/[━─✧•*ૢ\s]+$/u,'').trim();
 return value||cleanHeading(name);
}
/** Single-collapse ST visual hierarchy. Unicode is presentation metadata only. */
export function stOutlinePresentation(section){
 const result=[];let level=1,boxOpen=false;
 for(const entry of section?.entries||[]){
  const original=String(entry.originalName||'').trim(),text=String(entry.content||'').trim();
  const boxStart=/^┌─/u.test(original);
  const boxEnd=/^╰\s*→/u.test(original)||/^╰─{4,}\s*$/u.test(original);
  const closer=entry.kind==='closer'&&!boxEnd;
  const major=entry.kind==='wrapper'&&/^✨/u.test(original);
  const upper=/^┆\s*→/u.test(original)||/^┆\s*✧/u.test(original)||/^╰❛\*ੈ/u.test(original)||(!major&&/━{2,}/u.test(original)&&!/^[*ૢ]/u.test(original));
  const lower=/[ૢ]✧/u.test(original)&&!upper||/^┆\s*\*ૢ✧/u.test(original);
  let kind='prompt';
  if(major){kind='major';level=1;boxOpen=false;}
  else if(boxStart){kind='box-start';boxOpen=true;level=1;}
  else if(boxEnd){kind='box-end';}
  else if(closer){kind='closer';level=1;}
  else if(upper){kind='second';level=2;}
  else if(lower){kind='third';level=3;}
  result.push({entry,kind,level:Math.max(1,level),box:boxOpen,hasContent:!!text});
  if(boxEnd){boxOpen=false;level=1;}
 }
 return result;
}
/** Keep one entry per native prompt in the original ordering, with a separate UI outline. */
export function sillyTavernSections(source) {
 if(detectNativeFormat(source)!=='st')return [];
 const prompts=Array.isArray(source.prompts)?source.prompts:[];
 const order=source.prompt_order?.[0]?.order??[];
 const orderById=new Map(order.map((item,i)=>[item.identifier,{...item,order:i}]));
 const promptById=new Map(prompts.map(p=>[p.identifier,p]));
 const sequence=order.length ? [...order.map(o=>promptById.get(o.identifier)).filter(Boolean),...prompts.filter(p=>!orderById.has(p.identifier))] : prompts;
 const groups=[];let current=null,subgroup=null,leaf=null;
 const createGroup=(id,name)=>{const g={id,name,entries:[],structure:[],looseEntries:[],subgroups:[]};groups.push(g);subgroup=null;leaf=null;return g;};
 const createSubgroup=(id,name,implicit=false)=>{const item={id,name,implicit,entries:[],looseEntries:[],children:[]};current.subgroups.push(item);subgroup=item;leaf=null;return item;};
 for(let index=0;index<sequence.length;index++){
  const prompt=sequence[index];
  const kind=stHeadingKind(prompt.name);
  if(!current || kind==='wrapper' || (order.length&&index===order.length)){
   current=createGroup(kind==='wrapper'?prompt.identifier:(order.length&&index===order.length?'st-unordered':'st-opening'),kind==='wrapper'?stPresentationLabel(prompt.name):(order.length&&index===order.length?'Not in prompt order':'Opening & Settings'));
  }
  const entry={id:prompt.identifier,name:cleanHeading(prompt.name),originalName:prompt.name||'',content:prompt.content??'',enabled:orderById.has(prompt.identifier)?!!orderById.get(prompt.identifier).enabled:!!prompt.enabled,marker:!!prompt.marker,isHeading:kind!=='entry',kind,role:prompt.role||'system'};
  current.entries.push(entry);
  if(kind==='wrapper'||kind==='closer'){
   current.structure.push(entry);subgroup=null;leaf=null;continue;
  }
  if(kind==='subgroup'){
   createSubgroup(entry.id,stPresentationLabel(prompt.name));subgroup.entries.push(entry);subgroup.looseEntries.push(entry);continue;
  }
  if(kind==='leaf'){
   if(!subgroup)createSubgroup(`${current.id}:general`,'Additional controls',true);
   leaf={id:entry.id,name:stPresentationLabel(prompt.name),entries:[entry]};
   subgroup.children.push(leaf);subgroup.entries.push(entry);continue;
  }
  if(leaf){leaf.entries.push(entry);subgroup.entries.push(entry);}
  else if(subgroup){subgroup.looseEntries.push(entry);subgroup.entries.push(entry);}
  else current.looseEntries.push(entry);
 }
 return groups.filter(group=>group.entries.length);
}
export function setSillyTavernPrompt(source,id,patch){
 if(detectNativeFormat(source)!=='st')throw new Error('The active source is not a SillyTavern preset.');
 const matching=source.prompts.filter(p=>p.identifier===id);
 if(matching.length!==1)throw new Error('Ambiguous or missing SillyTavern prompt identifier.');
 const prompt=matching[0];
 if(Object.hasOwn(patch,'enabled')){
  const enabled=!!patch.enabled;prompt.enabled=enabled;
  for(const p of source.prompt_order||[])for(const o of p.order||[])if(o.identifier===id)o.enabled=enabled;
 }
 if(Object.hasOwn(patch,'content')){
  if(typeof patch.content!=='string')throw new Error('Prompt content must be text.');
  prompt.content=patch.content;
 }
 return prompt;
}
export function platformRegexGroups(scripts,platform){
 const result=new Map();
 for(const script of scripts){
  const bracket=(script.scriptName||'').match(/\[([^\]]+)\]/);
  const folder=platform==='st'?bracket?.[1]||'Other scripts':script.folder||'Ungrouped';
  const value={...script,folder};
  if(!result.has(folder))result.set(folder,[]);
  result.get(folder).push(value);
 }
 return result;
}
/** Update actual native regex representations, both Lumiverse mirrors when present. */
export function patchNativeRegex(source,id,patch){
 const format=detectNativeFormat(source);
 if(!['lumi','st'].includes(format))throw new Error('The active source has no native regex scripts.');
 const allowed=['findRegex','replaceString','disabled','flags'];
 for(const key of Object.keys(patch))if(!allowed.includes(key))throw new Error(`Unsupported regex field ${key}.`);
 if(Object.hasOwn(patch,'findRegex'))compileSourceRegex(patch.findRegex,patch.flags??null);
 const arrays=format==='lumi'?[source.regex_scripts,source.extensions?.regex_scripts]:[source.extensions?.regex_scripts];
 let changed=0;
 for(const array of arrays){
  if(!Array.isArray(array))continue;
  const numericIndex=format==='lumi'&&/^lumi-regex-\d+$/.test(String(id))?Number(String(id).slice('lumi-regex-'.length)):-1;
  const matches=numericIndex>=0?[array[numericIndex]].filter(Boolean):array.filter(s=>String(s.script_id??s.id)===String(id));
  if(matches.length!==1)throw new Error('Missing or ambiguous native regex identity in source mirror.');
  const row=matches[0];
  if(numericIndex>=0 && (!String(row.name||'').trim() || !Array.isArray(source.regex_scripts) || row.name!==source.regex_scripts[numericIndex]?.name))throw new Error('Regex source mirror is out of sync.');
  const fields=format==='lumi'?{findRegex:'find_regex',replaceString:'replace_string',disabled:'disabled',flags:'flags'}:{findRegex:'findRegex',replaceString:'replaceString',disabled:'disabled',flags:'flags'};
  for(const [key,val] of Object.entries(patch))if(row[fields[key]]!==val){row[fields[key]]=val;changed++;}
 }
 return changed;
}
export function addCustomDossierSkin(source,baseId,title){
 if(detectNativeFormat(source)!=='lumi')throw new Error('Custom dossier variants belong to a Lumiverse source.');
 const arrays=[source.regex_scripts,source.extensions?.regex_scripts];
 if(arrays.some(x=>!Array.isArray(x)))throw new Error('Source mirror missing: refusing partial skin creation.');
 const id=globalThis.crypto?.randomUUID?.() || 'custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 const name='🎨 [Regex Skins] '+String(title||'Custom Dossier').trim().slice(0,72);
 if(arrays[0].some(s=>s.name===name))throw new Error('Skin name already exists.');
 for(const arr of arrays){
  const index=/^lumi-regex-\d+$/.test(String(baseId))?Number(String(baseId).slice('lumi-regex-'.length)):-1;
  const base=index>=0?[arr[index]].filter(Boolean):arr.filter(s=>String(s.script_id??s.id)===String(baseId));
  if(base.length!==1||!String(base[0].find_regex||'').includes('RX_DOSSIER_SKIN'))throw new Error('Base dossier skin is missing or ambiguous.');
  arr.push({...structuredClone(base[0]),script_id:id,name,metadata:{...(base[0].metadata&&typeof base[0].metadata==='object'?structuredClone(base[0].metadata):{}),skin_id:id,skin_label:String(title||'Custom Dossier').trim().slice(0,72)},disabled:true,sort_order:Math.max(...arr.map(s=>Number(s.sort_order)||0),0)+1});
 }
 return id;
}
/** Portable one-skin JSON. The original Lumiverse regex record is retained intact. */
export function individualDossierSkin(source,id,css){
 if(detectNativeFormat(source)!=='lumi')throw new Error('Only Lumiverse has native dossier skins.');
 const matching=getActualRegexScripts(source).filter(script=>script.id===id&&/RX_DOSSIER_SKIN/.test(script.findRegex));
 if(matching.length!==1)throw new Error('Selected native dossier skin is missing or ambiguous.');
 const script=matching[0];
 const value=cssSafeForStyle(css===undefined?script.replaceString:css);
 // One exact native regex script, not a truncated entire preset or a synthetic CSS-only stub.
 return {kind:'kittylotus-dossier-skin',version:1,platform:'lumiverse',regex_script:{...structuredClone(script.meta),replace_string:value,disabled:false}};
}
/** Import the same portable file without losing other native entries or desynchronizing mirrors. */
export function importIndividualDossierSkin(source,portable){
 if(detectNativeFormat(source)!=='lumi')throw new Error('A Lumiverse preset must be loaded.');
 if(portable?.kind!=='kittylotus-dossier-skin'||portable.version!==1||portable.platform!=='lumiverse'||!portable.regex_script||typeof portable.regex_script!=='object')throw new Error('Not a KittyLotus individual dossier skin.');
 const script=portable.regex_script;
 if(!String(script.find_regex||'').includes('RX_DOSSIER_SKIN')||typeof script.replace_string!=='string')throw new Error('Portable skin has no native dossier regex.');
 cssSafeForStyle(script.replace_string);
 const arrays=[source.regex_scripts,source.extensions?.regex_scripts];
 if(arrays.some(arr=>!Array.isArray(arr)))throw new Error('Native regex mirrors are missing.');
 const name=String(script.name||'').trim();
 if(!name||!/Regex Skins|Dossier Skin/i.test(name))throw new Error('Portable script is not a dossier skin.');
 const existing=new Set(arrays.flatMap(arr=>arr.map(row=>row.name)));
 let uniqueName=name,counter=1;
 while(existing.has(uniqueName)){uniqueName=name.replace(/\s*\(Imported(?: \d+)?\)$/,'')+` (Imported${counter>1?' '+counter:''})`;counter++;}
 compileSourceRegex(script.find_regex,script.flags||'g');
 const id=globalThis.crypto?.randomUUID?.()||'imported-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 const index=Math.max(...arrays.flatMap(arr=>arr.map(row=>Number(row.sort_order)||0)),0)+1;
 const record={...structuredClone(script),name:uniqueName,metadata:{...(script.metadata&&typeof script.metadata==='object'?structuredClone(script.metadata):{}),skin_id:id,skin_label:uniqueName.replace(/^.*?\]\s*/, '')},script_id:id,disabled:true,sort_order:index};
 // Validate both destinations before writing either, then clone identical records into both.
 for(const arr of arrays)arr.push(structuredClone(record));
 return id;
}
/** Preview uses actual unified-shell source, not a handwritten reconstruction. */
export function trackerPreviewInput(){return `<!-- KL_MULTI_TRACKER_START -->\n<klmt id="mt12345678">\n<modules>state|aux|motive|psyche|scene|inspect|social|knowledge</modules>\n<mt:state><time>18:42 · Rain</time><place>City Library</place><mode>Quiet suspicion</mode><present>Gabrielle, Mara</present><goal>Find the missing letter</goal><change>A familiar clue resurfaces</change></mt:state>\n<mt:aux><threads>Unopened letter</threads><inventory>Silver key</inventory></mt:aux>\n</klmt>\n<!-- KL_MULTI_TRACKER_END -->`}
export function trackerPreviewScripts(source,skinId){
 const all=getActualRegexScripts(source);
 const shell=all.find(s=>s.scriptName.includes('Unified shell and selector'));
 if(!shell)throw new Error('Unified tracker shell is missing from the source.');
 const skin=all.find(s=>s.id===skinId);
 if(skinId && (!skin||!String(skin.findRegex).includes('RX_DOSSIER_SKIN')))throw new Error('Selected dossier skin is not available.');
 return [shell,...(skin?[skin]:[])].map(s=>({...s,disabled:false}));
}
export function cssSafeForStyle(css){
 if(typeof css!=='string'||css.length>18000)throw new Error('CSS must be under 18,000 characters.');
 // No markup breaks, imports or remote asset requests in a browser-local preview.
 if(/<\s*\/?\s*style|<\s*script|@import\b|url\s*\(/i.test(css))throw new Error('Use plain CSS only: no HTML tags, @import or remote URLs.');
 return css;
}


/** Both presets ship this same ledger packet contract but their own original HTML. */
export function motiveLedgerRenderer(source){
 return getActualRegexScripts(source).find(script=>/\[TRACK\].*Motive Ledger$/i.test(script.scriptName)&&/MOTIVE_LEDGER_START/.test(script.replaceString))||null;
}
export function motiveLedgerPreviewInput(){
 const values={
  id:'m24681012',drive:'Gabrielle wants to get the narrative engine responding instead of recapping.',
  pressure:'A missing library index and an inconvenient deadline.',
  short_1:'Find the index key',short_1_state:'active',short_2:'Keep Kitty out of a recap loop',short_2_state:'at risk',short_3:'Inspect the archive terminal',short_3_state:'pending',
  long_1:'Identify who rewrote the library log',long_1_state:'active',long_2:'Keep the workshop accessible',long_2_state:'pending',long_3:'Get everyone home before dawn',long_3_state:'uncertain',
  thoughts:'Gabi: The interface is innocent. It is the payload that is being dramatic.',trace_1:'The library clock just skipped three minutes.',trace_2:'The terminal logged a second visitor.',trace_3:'Kitty found the index entry under a false title.'
 };
 return `<details><summary>✦ writing ledger...</summary>\n[Motive Ledger] {${Object.entries(values).map(([key,value])=>`"${key}":"${value}"`).join(',')}} [/Motive Ledger]\n</details>`;
}
/** A replacement with actual HTML/CSS rather than a marker, macro, or plain-text annotation. */
export function hasRenderableReplacement(script){
 const replacement=String(script?.replaceString||'');
 return /<\/?(?:div|section|article|aside|details|summary|table|tr|td|th|span|p|h[1-6]|button|input|label|svg|style|header|footer|figure|ul|li|img|main|nav|pre)\b/i.test(replacement);
}
/** Native declaration enumeration: every key comes from the actual selected regex skin. */
export function nativeSkinVariables(css){
 const result=[];const seen=new Set();
 for(const match of String(css||'').matchAll(/(--rxd-[a-z\d-]+)\s*:\s*([^;{}]+);/gi)){
  if(seen.has(match[1]))continue;
  seen.add(match[1]);result.push({name:match[1],value:match[2].trim()});
 }
 return result;
}
export function updateSkinVariable(css,key,value){
 if(!/^--rxd-[a-z\d-]+$/i.test(key))throw new Error('Invalid skin variable.');
 if(typeof value!=='string'||!value.trim()||/[;{}<>]/.test(value)||/@import\b|url\s*\(/i.test(value))throw new Error('Use a safe single CSS value.');
 const pattern=new RegExp(`(${key}\\s*:\\s*)([^;{}]+)(;)`,'g');
 if(!pattern.test(css))throw new Error(`Skin source has no ${key} declaration.`);
 return css.replace(pattern,(_whole,start,_old,end)=>start+value.trim()+end);
}
