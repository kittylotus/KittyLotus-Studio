export const PROFILE_FORMAT='kittylotus-studio-profile';
export const PROFILE_SCHEMA=1;
export const MAX_SOURCE_BYTES=6_000_000;
export const MAX_REGEX_BYTES=2_000_000;

export function parseDocument(text, filename='import.json') {
  if (typeof text!=='string') throw new Error('Source content must be text.');
  if (new TextEncoder().encode(text).byteLength>MAX_SOURCE_BYTES) throw new Error('Source exceeds the 6 MB editing limit.');
  const json=/\.json$/i.test(filename) || /^[\s\uFEFF]*[\[{]/.test(text);
  if (!json) return {kind:'text',value:text,original:text};
  try { return {kind:'json',value:JSON.parse(text),original:text}; }
  catch (e) { if (/\.json$/i.test(filename)) throw new Error(`Invalid JSON: ${e.message}`); return {kind:'text',value:text,original:text}; }
}
export function serializeDocument(doc, changed){
  if(!changed) return doc.original;
  return doc.kind==='json' ? JSON.stringify(doc.value,null,2)+'\n' : String(doc.value);
}
export function getJsonValue(root,path){let node=root;for(const key of path){if(node===null||typeof node!=='object'||!Object.hasOwn(node,key))throw new Error('Value path no longer exists.');node=node[key];}return node;}
export function setJsonValue(root,path,value){
  if(!Array.isArray(path)||!path.length) return value;
  const blocked=new Set(['__proto__','prototype','constructor']);
  if(path.some(k=>blocked.has(String(k)))) throw new Error('Unsafe object key is read-only.');
  const parent=getJsonValue(root,path.slice(0,-1));
  const key=path.at(-1);
  if(!parent||typeof parent!=='object'||!Object.hasOwn(parent,key))throw new Error('Value path no longer exists.');
  parent[key]=value;return root;
}
export function convertPrimitive(raw,old){
  if(typeof old==='string')return String(raw);
  if(typeof old==='boolean')return Boolean(raw);
  if(typeof old==='number'){const val=Number(raw);if(!Number.isFinite(val))throw new Error('Expected a finite number.');return val;}
  if(old===null){if(raw===''||raw==='null')return null;throw new Error('Use raw editor to change a null value.');}
  throw new Error('Use raw editor for arrays and objects.');
}
export function stripUnsafeFilename(name){return String(name||'export.json').replace(/[\\/:*?"<>|\x00-\x1F]/g,'_').slice(0,160)||'export.json';}
export function profileValid(profile){return !!(profile&&profile.format===PROFILE_FORMAT&&profile.schemaVersion===PROFILE_SCHEMA&&typeof profile.platform==='string'&&profile.skins&&typeof profile.skins==='object'&&profile.plan&&typeof profile.plan==='object');}
export function filterGitHubTree(tree){return (Array.isArray(tree)?tree:[]).filter(x=>x&&x.type==='blob'&&typeof x.path==='string'&&/\.(?:json|txt|md|prompt)$/i.test(x.path)&&(!x.size||x.size<MAX_SOURCE_BYTES)).sort((a,b)=>a.path.localeCompare(b.path));}
export function encodeGitHubPath(path){return path.split('/').map(encodeURIComponent).join('/');}

/** Extract script objects without silently inventing schema-compatible export shapes. */
export function extractRegexScripts(value){
 const seen=new WeakSet(),out=[];
 function visit(v,depth){
  if(depth>7||out.length>=500||!v||typeof v!=='object'||seen.has(v))return;
  seen.add(v);
  if(Array.isArray(v)){for(const item of v)visit(item,depth+1);return;}
  const find=typeof v.findRegex==='string'?v.findRegex:typeof v.find_regex==='string'?v.find_regex:null;
  const replace=typeof v.replaceString==='string'?v.replaceString:typeof v.replace_string==='string'?v.replace_string:null;
  if(find!==null&&replace!==null){
   out.push({scriptName:String(v.scriptName||v.name||`Regex ${out.length+1}`),findRegex:find,replaceString:replace,flags:typeof v.flags==='string'?v.flags:null,folder:v.folder||'Ungrouped',target:v.target||v.placement||[],disabled:!!v.disabled,meta:v});return;
  }
  // Prefer the canonical top-level Lumiverse array; extensions.regex_scripts mirrors it.
  if(Array.isArray(v.regex_scripts))visit(v.regex_scripts,depth+1);
  else if(Array.isArray(v.regexScripts))visit(v.regexScripts,depth+1);
  else if(Array.isArray(v.scripts))visit(v.scripts,depth+1);
  else if(Array.isArray(v.entries))visit(v.entries,depth+1);
  else if(v.extensions)visit(v.extensions,depth+1);
 }
 visit(value,0);return out;
}
export function compileSourceRegex(findRegex,sourceFlags){
 if(typeof findRegex!=='string'||findRegex.length>12000)throw new Error('Invalid or oversized regex pattern.');
 let pattern=findRegex,flags=typeof sourceFlags==='string'&&sourceFlags.length?sourceFlags:'g';
 if(findRegex.startsWith('/')){
  const end=findRegex.lastIndexOf('/');
  if(end>0&&/^[dgimsuvy]*$/.test(findRegex.slice(end+1))){pattern=findRegex.slice(1,end);if(!sourceFlags)flags=findRegex.slice(end+1);}
 }
 if(!flags.includes('g')&&!flags.includes('y'))flags+='g';
 try{return new RegExp(pattern,flags);}catch(e){throw new Error(e.message);}
}
export function transformRegex(input,scripts,options={}){
 if(typeof input!=='string'||input.length>20000)throw new Error('Input exceeds 20,000 characters.');
 if(!Array.isArray(scripts)||scripts.length>100)throw new Error('Too many active scripts for a single preview (max 100).');
 const maxOutput=options?.curatedCascade===true?260000:150000;
 let output=input;const log=[];
 for(const script of scripts){if(script.disabled)continue;
  try {const regex=compileSourceRegex(script.findRegex,script.flags);const start=output;output=output.replace(regex,script.replaceString);if(output.length>maxOutput)throw new Error(`Output exceeds ${maxOutput.toLocaleString()} characters.`);log.push({script:script.scriptName,changed:output!==start});}
  catch(e){throw new Error(`${script.scriptName}: ${e.message}`);}
 }
 return {output,log};
}
