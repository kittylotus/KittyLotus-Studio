import {regexPatternFingerprint} from './native.js';
/** Display-only taxonomy for the visual regex gallery. Native names and IDs stay untouched. */
export const SHOWCASE_GROUPS=['All','Tracking','Social','Decorations','Typography','Documents','Gabrielle','Other'];
export function showcaseGroup(script){
 const name=String(script?.scriptName||'').toLowerCase();
 if(/\[(?:track|omni tracker|psych ledger|state|motive)/i.test(name))return 'Tracking';
 if(/\[(?:social|discord|phone|instagram|tumblr|twitter|twitch|imessage)/i.test(name))return 'Social';
 if(/\[(?:decor|webnovel|cyoa|branching|scene breakers|thoughts|dm paths|dm setup|dm)/i.test(name))return 'Decorations';
 if(/\[(?:visuals|footnotes|thinking)/i.test(name))return 'Typography';
 if(/\[form\]/i.test(name))return 'Documents';
 if(/\[gabi\]/i.test(name))return 'Gabrielle';
 return 'Other';
}
export function resolveShowcaseFixture(scripts,fixture){
 const matches=(Array.isArray(scripts)?scripts:[]).filter(s=>s.scriptName===fixture?.scriptName);
 if(matches.length!==1)return null;
 return matches[0];
}
export function makeShowcaseCatalog(scripts,fixtures,platform){
 const list=(Array.isArray(scripts)?scripts:[]).filter(s=>s&&s.scriptName);
 const available=(Array.isArray(fixtures)?fixtures:[]).filter(f=>(f.platform||'lumi')===platform);
 const samples=available.map(f=>({fixture:f,script:resolveShowcaseFixture(list,f)})).filter(x=>x.script);
 return {samples,byGroup:SHOWCASE_GROUPS.slice(1).map(group=>({group,scripts:list.filter(s=>showcaseGroup(s)===group)}))};
}
/** Only documented, user-inspectable source HTML is previewed. No synthetic preview for missing contracts. */
export function sourceHasPreviewHtml(result){return !!(result?.log?.some(x=>x.changed)&&/<(?:div|section|span|style|details|article|header|main|aside|p)\b/i.test(result.output||''));}

/** Curated composite excerpts may run several original regexes, but never arbitrary new source. */
export function resolveShowcaseScripts(scripts,fixture){
 const requested=fixture?.scriptNames||[fixture?.scriptName];
 if(!Array.isArray(requested)||!requested.length||requested.length>24||new Set(requested).size!==requested.length)return null;
 const found=[];
 for(const name of requested){
  const candidates=(Array.isArray(scripts)?scripts:[]).filter(s=>s.scriptName===name);
  if(candidates.length!==1)return null;
  const script=candidates[0],contract=fixture.scriptContracts?.[name];
  if(contract&&(contract.pattern!==regexPatternFingerprint(script.findRegex)||contract.replacement!==regexPatternFingerprint(script.replaceString)))return null;
  found.push(script);
 }
 const selected=new Set(found.map(s=>s.id));
 return scripts.filter(s=>selected.has(s.id)).map(s=>({...s,disabled:false}));
}
