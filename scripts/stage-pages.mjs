/**
 * Prepare only public site assets for GitHub Pages. No bundler, no server, no source mutation.
 * Works for both username.github.io repositories and /repository-name/ project pages.
 */
import {cpSync,existsSync,mkdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {resolve,join,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const out=resolve(root,'dist-pages');
const required=['index.html','.nojekyll','css','js','data','assets'];
for(const name of required){if(!existsSync(join(root,name)))throw Error(`Missing public site source: ${name}`);}
const html=readFileSync(join(root,'index.html'),'utf8');
if(!/<script[^>]*type="module"/.test(html))throw Error('Missing native module entrypoint');
if(/(?:src|href)=["']\/(?!\/)/.test(html))throw Error('Root-relative site asset would break project Pages URLs');
for(const match of html.matchAll(/(?:src|href)=["'](\.\/[^"']+)["']/g)){
 const pathname=match[1].split(/[?#]/,1)[0];
 if(!existsSync(resolve(root,pathname)))throw Error(`Missing local HTML asset: ${pathname}`);
}
// Fail all source checks before any staging writes. Only this derived directory is cleared.
if(out===root||!out.startsWith(root+sep))throw Error('Unsafe staging target');
rmSync(out,{recursive:true,force:true});mkdirSync(out,{recursive:true});
for(const name of required)cpSync(join(root,name),join(out,name),{recursive:true});
writeFileSync(join(out,'site-release.txt'),'KittyLotus Studio v0.17.1\n');
console.log('GitHub Pages stage verified: index.html + css/js/data/assets + .nojekyll');
