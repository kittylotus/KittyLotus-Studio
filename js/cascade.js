import {regexPatternFingerprint} from './native.js';

/** All cascade demos bind to exact source regexes, in source order, never a decorative HTML template. */
export function resolveCascadePlan(scripts,scene){
 if(!Array.isArray(scripts)||!scene||!Array.isArray(scene.scriptNames)||scene.scriptNames.length>100)return {ok:false,reason:'Invalid source cascade',scripts:[]};
 const source=[];
 for(const name of scene.scriptNames){
  const matches=scripts.filter(s=>s.scriptName===name);
  if(matches.length!==1)return {ok:false,reason:`${name}: ${matches.length?'ambiguous':'missing'} source regex`,scripts:[]};
  const script=matches[0],contract=scene.scriptContracts?.[name];
  if(!contract||contract.pattern!==regexPatternFingerprint(script.findRegex)||contract.replacement!==regexPatternFingerprint(script.replaceString))return {ok:false,reason:`${name}: source changed from verified contract`,scripts:[]};
  source.push(script);
 }
 const chosen=new Set(source.map(s=>s.id));
 const inNativeOrder=scripts.filter(s=>chosen.has(s.id));
 if(inNativeOrder.length!==source.length)return {ok:false,reason:'Nonunique native source identity',scripts:[]};
 return {ok:true,reason:'Verified source contracts',scripts:inNativeOrder.map(s=>({...s,disabled:false}))};
}
export function describeCascadeExecution(scene,variant,log){
 const matched=log.filter(entry=>entry.changed);
 const required=variant.requiredMatches||scene.requiredMatches||[];
 const missing=required.filter(name=>!matched.some(entry=>entry.script===name));
 return {matched:matched.length,considered:log.length,missing,complete:missing.length===0,steps:log.map((entry,index)=>({order:index+1,name:entry.script,changed:entry.changed}))};
}
