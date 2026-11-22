/** Native KittyLotus schema adapters. No guessed variable IDs or output structures. */
export const SOURCE_PATHS={lumi:'./data/native/lumiverse.json',st:'./data/native/sillytavern.json',jani:'./data/native/janitor-reserved-agency.txt'};
export const PRESET_REPO='kittylotus/KittyLotus-Multimodal';
export function detectNativeFormat(value){
 if(typeof value==='string')return 'jani';
 if(!value||typeof value!=='object')return null;
 if(Array.isArray(value.blocks)&&value.blocks.some(b=>b&&typeof b.id==='string'))return 'lumi';
 if(Array.isArray(value.prompts)&&value.extensions&&Array.isArray(value.prompt_order))return 'st';
 return null;
}
export function nativeSections(preset){
 if(detectNativeFormat(preset)!=='lumi')return [];
 const sections=[],ids=new Set();let current=null;
 for(const block of preset.blocks){
  if(!block||typeof block.id!=='string')continue;
  if(block.marker==='category'){
   current={id:block.id,name:block.name||'Untitled section',controls:[]};sections.push(current);ids.add(block.id);
  }
  const vars=Array.isArray(block.variables)?block.variables:[];
  if(!vars.length)continue;
  let category=sections.find(s=>s.id===block.group) || current;
  if(!category){category={id:'unassigned',name:'Other controls',controls:[]};sections.push(category);current=category;}
  for(const variable of vars){
   if(typeof variable?.name!=='string'||typeof variable?.type!=='string'||!variable.name)continue;
   category.controls.push({...variable,blockId:block.id,blockName:block.name||'',enabled:block.enabled!==false,blockGroup:block.group||null});
  }
 }
 return sections.filter(s=>s.controls.length);
}
export function nativeValue(preset,control){
 const values=preset?.promptVariables?.[control.blockId];
 if(values&&Object.hasOwn(values,control.name))return values[control.name];
 return control.defaultValue??(control.type==='multiselect'?[]:control.type==='switch'?0:'');
}
function validPrimitive(value){return value===null||typeof value==='string'||typeof value==='number'||typeof value==='boolean';}
export function validateControl(control,value){
 if(!control||!control.blockId||!control.name)throw new Error('Invalid native variable identity.');
 if(control.type==='switch'){
  if(!(value===0||value===1||value===true||value===false))throw new Error('Switch must be boolean or 0/1.');
 }else if(control.type==='slider'||control.type==='number'){
  if(typeof value!=='number'||!Number.isFinite(value))throw new Error('Expected a finite number.');
  if(control.min!==undefined&&value<Number(control.min))throw new Error('Value is below minimum.');
  if(control.max!==undefined&&value>Number(control.max))throw new Error('Value is above maximum.');
 }else if(control.type==='select'){
  if(!validPrimitive(value))throw new Error('Invalid choice.');
  if(Array.isArray(control.options)&&control.options.length&&!control.options.some(o=>String(o.id)===String(value)||String(o.value)===String(value)))throw new Error('Choice is not in the native schema.');
 }else if(control.type==='multiselect'){
  if(!Array.isArray(value)||value.some(v=>!validPrimitive(v)))throw new Error('Expected an array of choices.');
  const options=control.options||[];
  for(const entry of value)if(!options.some(o=>String(o.id)===String(entry)||String(o.value)===String(entry)))throw new Error('Unknown multi-select option.');
 }else if(control.type==='text'||control.type==='textarea'){
  if(typeof value!=='string')throw new Error('Expected text.');
 }else throw new Error(`Unsupported native control type ${control.type}.`);
 return value;
}
/** A few native controls have UUID option IDs but semantic option values.
 * Preserve the current preset's representation instead of always writing an ID. */
export function resolveNativeChoice(control,current,selectedId){
 const options=Array.isArray(control?.options)?control.options:[];
 const selected=options.find(o=>String(o.id??o.value)===String(selectedId));
 if(!selected)throw new Error('Choice is not in the native schema.');
 const existing=options.find(o=>String(o.id)===String(current)||String(o.value)===String(current));
 const storedAsId=existing&&String(existing.id)!==String(existing.value)&&String(current)===String(existing.id);
 return storedAsId?(selected.id??selected.value):(selected.value??selected.id);
}
export function resolveNativeMultiChoice(control,current,selectedIds){
 if(!Array.isArray(selectedIds))throw new Error('Selections must be an array.');
 const options=Array.isArray(control?.options)?control.options:[];
 const previous=Array.isArray(current)?current:[];
 const storedAsId=previous.some(value=>options.some(o=>String(o.id)!==String(o.value)&&String(value)===String(o.id)));
 return selectedIds.map(id=>{
  const selected=options.find(o=>String(o.id??o.value)===String(id));
  if(!selected)throw new Error('Choice is not in the native schema.');
  return storedAsId?(selected.id??selected.value):(selected.value??selected.id);
 });
}
/** Fixture fingerprints are exact source-pattern contracts, not visual render guarantees. */
export function regexPatternFingerprint(value){
 const str=String(value??'');let hash=0x811c9dc5;
 for(let i=0;i<str.length;i++){hash^=str.charCodeAt(i);hash=Math.imul(hash,0x01000193)>>>0;}
 return hash.toString(16).padStart(8,'0');
}
export function auditFixtureContracts(source,fixtures){
 const scripts=getActualRegexScripts(source);
 return (Array.isArray(fixtures)?fixtures:[]).map(fixture=>{
  const candidates=fixture.scriptName?scripts.filter(s=>s.scriptName===fixture.scriptName):scripts.filter(s=>s.scriptName.includes(fixture.scriptQuery||'\u0000'));
  if(candidates.length!==1)return {id:fixture.id,ok:false,reason:candidates.length?'ambiguous script match':'missing script'};
  const script=candidates[0];
  if(fixture.patternFingerprint&&regexPatternFingerprint(script.findRegex)!==fixture.patternFingerprint)return {id:fixture.id,ok:false,reason:'upstream regex changed'};
  try{
   // Keep the audit local to the canonical regex parser, including inline /pattern/flags.
   let pattern=script.findRegex,flags=script.flags||'g';
   if(pattern.startsWith('/')){const end=pattern.lastIndexOf('/');if(end>0&&/^[dgimsuvy]*$/.test(pattern.slice(end+1))){if(!script.flags)flags=pattern.slice(end+1);pattern=pattern.slice(1,end);}}
   const regex=new RegExp(pattern,flags);
   if(!regex.test(fixture.input))return {id:fixture.id,ok:false,reason:'sample no longer matches'};
  }catch{return {id:fixture.id,ok:false,reason:'invalid regex pattern'};}
  return {id:fixture.id,ok:true,reason:'matched'};
 });
}
export function setNativeValue(preset,control,value){
 if(detectNativeFormat(preset)!=='lumi')throw new Error('Native controls require a Lumiverse preset.');
 const exists=preset.blocks.find(b=>b.id===control.blockId);
 if(!exists||!Array.isArray(exists.variables)||!exists.variables.some(v=>v.id===control.id&&v.name===control.name))throw new Error('Variable ID does not exist in this source.');
 validateControl(control,value);
 if(!preset.promptVariables||typeof preset.promptVariables!=='object')preset.promptVariables={};
 if(!preset.promptVariables[control.blockId]||typeof preset.promptVariables[control.blockId]!=='object')preset.promptVariables[control.blockId]={};
 preset.promptVariables[control.blockId][control.name]=value;
 return preset;
}
export function getActualRegexScripts(value){
 const format=detectNativeFormat(value);
 const original=format==='lumi'?(Array.isArray(value.regex_scripts)?value.regex_scripts:value.extensions?.regex_scripts):format==='st'?value.extensions?.regex_scripts:null;
 if(!Array.isArray(original))return [];
 return original.filter(r=>r&&typeof(r.find_regex??r.findRegex)==='string'&&typeof(r.replace_string??r.replaceString)==='string').map((r,i)=>({
  id:r.script_id||r.id||`${format}-regex-${i}`,index:i,scriptName:r.name||r.scriptName||`Regex ${i+1}`,findRegex:r.find_regex??r.findRegex,replaceString:r.replace_string??r.replaceString,flags:r.flags||null,disabled:!!r.disabled,folder:r.folder||'Ungrouped',target:r.target||r.placement||[],sortOrder:r.sort_order??i,meta:r
 }));
}
export function dossierSkins(source){
 return getActualRegexScripts(source).filter(r=>/Regex Skins|Dossier Skin/i.test(`${r.folder} ${r.scriptName}`)&&/RX_DOSSIER_SKIN/.test(r.findRegex));
}
export function selectDossierSkin(source,scriptId){
 if(detectNativeFormat(source)!=='lumi')throw new Error('Dossier skin export requires Lumiverse source.');
 const selected=dossierSkins(source).find(s=>s.id===scriptId);
 if(!selected)throw new Error('Selected skin does not exist in this preset.');
 let changed=0;
 for(const scripts of [source.regex_scripts,source.extensions?.regex_scripts]){
  if(!Array.isArray(scripts))continue;
  for(const item of scripts){
   if(!/Regex Skins|Dossier Skin/i.test(`${item.folder} ${item.name}`)||!/RX_DOSSIER_SKIN/.test(String(item.find_regex)))continue;
   const shouldDisable=String(item.script_id||item.id||'')!==String(selected.meta.script_id||selected.meta.id||'');
   // Some native scripts have empty script IDs. Use stable name + folder identity instead.
   const isSelected=item.name===selected.scriptName&&item.folder===selected.folder;
   const disable=!isSelected;
   if(item.disabled!==disable){item.disabled=disable;changed++;}
  }
 }
 return changed;
}
export function resolveGitHubCandidates(tree,platform){
 const entries=(Array.isArray(tree)?tree:[]).filter(r=>r?.type==='blob'&&typeof r.path==='string'&&r.size<=6000000);
 if(platform==='lumi')return entries.filter(r=>/^Lumiverse\/V6\/.*\.json$/i.test(r.path)).sort((a,b)=>a.path.localeCompare(b.path));
 if(platform==='st')return entries.filter(r=>/SillyTavern\.json$/i.test(r.path));
 if(platform==='jani')return entries.filter(r=>/^Janitor Prompt\/.*\.txt$/i.test(r.path));
 return [];
}
export function makeNativeFixtureSummary(source){
 const sections=nativeSections(source),scripts=getActualRegexScripts(source),types={};
 for(const section of sections)for(const control of section.controls)types[control.type]=(types[control.type]||0)+1;
 return {format:detectNativeFormat(source),blocks:source?.blocks?.length||0,sections:sections.length,controls:sections.reduce((n,s)=>n+s.controls.length,0),regexScripts:scripts.length,regexFolders:new Set(scripts.map(s=>s.folder)).size,skinVariants:dossierSkins(source).length,types};
}
