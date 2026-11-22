/** Source-driven CSS value controls. Never infer or overwrite undeclared skin tokens. */
const COLOR_RE = /rgba?\(\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?\s*(?:,\s*(?:0?\.\d+|1(?:\.0+)?|0))?\s*\)|#[a-f\d]{3,8}\b/gi;
const GROUPS={
 'Color accents':['accent','accent-soft','accent-line','blush','rose','lilac','sky','mint'],
 'Surfaces':['bg','bg-2','panel','panel-soft','header'],
 'Edges & labels':['line','line-soft','text','muted','label','chip-bg','chip-border','chip-text'],
 'Shapes':['radius-card','radius-inner','radius-pill','cut'],
 'Depth & typography':['shadow','shadow-soft','serif','sans','mono']
};
const PURPOSE={
 accent:'Primary highlights, active markers and ornaments',
 'accent-soft':'Accent wash behind cards and headings',
 'accent-line':'Highlighted outlines and dividers',
 blush:'Warm decorative accents',rose:'Stronger rosy highlights',lilac:'Secondary violet accents',sky:'Cool accent details',mint:'Positive accent details',
 bg:'Outermost renderer backdrop','bg-2':'Secondary backdrop and layered backgrounds',
 panel:'Main card backgrounds','panel-soft':'Subtle inner card backgrounds',header:'Header surfaces',
 line:'Main boundaries and outlines','line-soft':'Quiet separator lines',text:'Body and heading text',muted:'Secondary explanatory text',label:'Small labels and metadata',
 'chip-bg':'Tab and pill backgrounds','chip-border':'Tab and pill outlines','chip-text':'Tab and pill text',
 'radius-card':'Outer card corner roundness','radius-inner':'Inner panel corner roundness','radius-pill':'Tab and pill corner roundness',cut:'Corner cuts and geometry',
 shadow:'Large surface shadow','shadow-soft':'Smaller card shadow',serif:'Editorial font',sans:'Interface font',mono:'Monospace font'
};
export const nativeSkinGroupNames=Object.keys(GROUPS);
export function skinVariableGuide(name,rendererCss=''){
 const short=String(name).replace(/^--rxd-/,'');
 const group=Object.entries(GROUPS).find(([,names])=>names.includes(short))?.[0]||'Other native tokens';
 // Count actual references, not declarations. A zero is useful information, not a fabricated preview effect.
 const hits=String(rendererCss).match(new RegExp(`var\\(\\s*${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?=[,\\s)])`,'g'))||[];
 return {group,label:short.replaceAll('-',' ').replace(/\b\w/g,c=>c.toUpperCase()),purpose:PURPOSE[short]||'Native CSS declaration',usages:hits.length};
}
export function editableColorParts(value){
 const text=String(value||'');const result=[];COLOR_RE.lastIndex=0;
 for(const match of text.matchAll(COLOR_RE)){
  const raw=match[0];let hex,alpha=1;
  if(raw[0]==='#'){
   let h=raw.slice(1);if(h.length===3||h.length===4)h=[...h].map(c=>c+c).join('');
   if(h.length===8){alpha=Number((parseInt(h.slice(6),16)/255).toFixed(3));h=h.slice(0,6);}
   if(h.length!==6)continue;hex='#'+h.toLowerCase();
  }else{
   const pieces=raw.slice(raw.indexOf('(')+1,-1).split(',').map(s=>s.trim());
   const channels=pieces.slice(0,3).map(Number);
   if(channels.some(c=>!Number.isFinite(c)||c<0||c>255))continue;
   hex='#'+channels.map(c=>Math.round(c).toString(16).padStart(2,'0')).join('');
   alpha=pieces.length===4?Number(pieces[3]):1;
  }
  result.push({index:match.index,raw,hex,alpha:Math.min(1,Math.max(0,alpha))});
 }
 return result;
}
export function replaceEditableColor(value,index,hex,alpha){
 if(!/^#[\da-f]{6}$/i.test(hex)||!Number.isFinite(alpha)||alpha<0||alpha>1)throw new Error('Invalid color or opacity.');
 const parts=editableColorParts(value),part=parts[index];if(!part)throw new Error('Color stop does not exist.');
 const channels=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 const rendered=alpha<1||/^rgba?\(/i.test(part.raw)?`rgba(${channels.join(',')},${Number(alpha.toFixed(3))})`:hex.toLowerCase();
 // A host-linked var() wins over its fallback. Detach from the host when directly edited.
 if(/^var\(\s*--[a-z\d-]+\s*,/i.test(String(value).trim())&&parts.length===1)return rendered;
 return value.slice(0,part.index)+rendered+value.slice(part.index+part.raw.length);
}
export function editableLength(value){
 const match=String(value||'').trim().match(/^(-?\d+(?:\.\d+)?)(px|rem|%)$/);
 if(!match)return null;
 return {number:Number(match[1]),unit:match[2]};
}
export function insertDossierSkinIntoRenderer(replacement,skinCss){
 const marker='/*@@RX_DOSSIER_SKIN@@*/';
 if(!String(replacement).includes(marker))throw new Error('Native Motive renderer has no dossier skin injection marker.');
 if(typeof skinCss!=='string'||/\<\s*\/?\s*style|@import\b|url\s*\(/i.test(skinCss))throw new Error('Invalid native skin CSS.');
 return replacement.replace(marker,skinCss);
}

/** Named Motive areas, selected from declarations actually used in the native renderer. */
export const MOTIVE_AREAS=[
 {id:'visible',label:'Everything visible',description:'Only tokens referenced by this Motive Ledger renderer. No dead controls.',names:[]},
 {id:'canvas',label:'Frame & backdrop',description:'The ledger shell, backdrop, header surface and overall shadow.',names:['bg','bg-2','header','shadow']},
 {id:'cards',label:'Cards & separators',description:'Inner cards, their outlines and their corner shapes.',names:['bg-2','line','line-soft','radius-card','radius-inner','shadow']},
 {id:'tabs',label:'Tabs & active accents',description:'Active tabs, decorative highlights and state indicators.',names:['accent','accent-soft','accent-line','lilac','rose','mint']},
 {id:'text',label:'Text & labels',description:'Main text, secondary copy, metadata and violet heading text.',names:['text','muted','label','lilac']},
 {id:'geometry',label:'Corners & depth',description:'Card radii and the original large shadow.',names:['radius-card','radius-inner','shadow']},
 {id:'unused',label:'Other native tokens · advanced',description:'Genuine dossier tokens not referenced by this Motive Ledger. They still matter to other surfaces.',names:[]},
];
export function nativeTokensForArea(entries,rendererCss,areaId){
 const area=MOTIVE_AREAS.find(item=>item.id===areaId)||MOTIVE_AREAS[0];
 return entries.filter(item=>{
  const usage=skinVariableGuide(item.name,rendererCss).usages;
  if(area.id==='visible')return usage>0;
  if(area.id==='unused')return usage===0;
  return usage>0&&area.names.includes(item.name.replace(/^--rxd-/,''));
 });
}
export function motiveAreaForSelector(target){
 const node=target?.closest?.bind(target);if(!node)return 'visible';
 if(node('.klm-tabs,.klm-tab,.klm-status'))return 'tabs';
 if(node('.klm-eyebrow,.klm-value,.klm-standalone-id,.klm-trace-text'))return 'text';
 if(node('.klm-panel,.klm-force,.klm-goals,.klm-arc,.klm-trace'))return 'cards';
 if(node('.klm-standalone-head,.klm-standalone-mark'))return 'canvas';
 if(node('.klm-stage,.klm-standalone-body,.rxd-motive'))return 'canvas';
 return 'visible';
}
