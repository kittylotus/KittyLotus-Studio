import {transformRegex} from './core.js';
self.onmessage=(event)=>{
 try {const result=transformRegex(event.data.input,event.data.scripts,event.data.options);self.postMessage({ok:true,...result});}
 catch(error){self.postMessage({ok:false,error:String(error?.message||error)});}
};
