import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dossierSkins} from '../js/native.js';
import {saveDossierSkin,individualDossierSkin,importIndividualDossierSkin} from '../js/workbench.js';

const original=JSON.parse(readFileSync(new URL('../data/native/lumiverse.json',import.meta.url)));
const defaultSkin=()=>dossierSkins(original).find(row=>row.scriptName.includes('Default Purple'));

test('skin name and CSS save atomically into both Lumiverse source mirrors',()=>{
 const source=structuredClone(original),skin=defaultSkin();
 const css=skin.replaceString.replace('--rxd-bg:','--rxd-bg: /* named */');
 const count=saveDossierSkin(source,skin.id,'Moonlit Terminal',css);
 assert.ok(count>0);
 for(const mirror of [source.regex_scripts,source.extensions.regex_scripts]){
  const item=mirror[skin.index];
  assert.equal(item.name,'🎨 [Regex Skins] Moonlit Terminal');
  assert.equal(item.metadata.skin_label,'Moonlit Terminal');
  assert.equal(item.replace_string,css);
  assert.equal(item.find_regex,skin.meta.find_regex);
 }
 assert.equal(source.regex_scripts[skin.index].script_id,original.regex_scripts[skin.index].script_id);
 assert.equal(original.regex_scripts[skin.index].name,skin.scriptName);
});

test('export mirrors unsaved UI name into filename identity and portable schema, without mutating preset',()=>{
 const source=structuredClone(original),skin=defaultSkin(),before=JSON.stringify(source);
 const portable=individualDossierSkin(source,skin.id,skin.replaceString,'  Neon Drift  ');
 assert.equal(portable.skin_name,'Neon Drift');
 assert.equal(portable.regex_script.name,'🎨 [Regex Skins] Neon Drift');
 assert.equal(portable.regex_script.metadata.skin_label,'Neon Drift');
 assert.equal(JSON.stringify(source),before);
 const id=importIndividualDossierSkin(source,portable);
 assert.ok(id&&id!==skin.id);
 assert.deepEqual(source.regex_scripts.at(-1),source.extensions.regex_scripts.at(-1));
 assert.equal(source.regex_scripts.at(-1).name,'🎨 [Regex Skins] Neon Drift');
 assert.equal(source.regex_scripts.at(-1).metadata.skin_label,'Neon Drift');
 assert.equal(source.regex_scripts.at(-1).disabled,true);
});

test('invalid and ambiguous renames fail before either native mirror changes',()=>{
 const skin=defaultSkin();
 for(const title of ['', '   ', 'x'.repeat(73), 'Bad\nName', 'Bare White Lines']){
  const source=structuredClone(original),before=JSON.stringify(source);
  assert.throws(()=>saveDossierSkin(source,skin.id,title,skin.replaceString));
  assert.equal(JSON.stringify(source),before);
 }
 const broken=structuredClone(original),beforeSkin=broken.regex_scripts[skin.index].name;
 broken.extensions.regex_scripts[skin.index].name='Oops';
 const snapshot=JSON.stringify(broken);
 assert.throws(()=>saveDossierSkin(broken,skin.id,'New Name',skin.replaceString),/mismatch/i);
 assert.equal(JSON.stringify(broken),snapshot);
 assert.equal(broken.regex_scripts[skin.index].name,beforeSkin);
});

test('legacy portable skin falls back to native record name instead of stale metadata labels',()=>{
 const skin=defaultSkin(),source=structuredClone(original);
 const old=individualDossierSkin(source,skin.id);
 delete old.skin_name;
 old.regex_script.metadata.skin_label='Wrong Parent Name';
 const id=importIndividualDossierSkin(source,old);
 assert.ok(id);
 assert.equal(source.regex_scripts.at(-1).metadata.skin_label,'Default Purple (Imported)');
});
