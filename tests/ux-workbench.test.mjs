import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getActualRegexScripts, dossierSkins} from '../js/native.js';
import {transformRegex} from '../js/core.js';
import {motiveLedgerRenderer, motiveLedgerPreviewInput, hasRenderableReplacement, nativeSkinVariables, updateSkinVariable, patchNativeRegex} from '../js/workbench.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = name => JSON.parse(readFileSync(resolve(root, `data/native/${name}.json`), 'utf8'));
const fixtures = JSON.parse(readFileSync(resolve(root, 'data/fixtures/contract-fixtures.json'), 'utf8')).fixtures;
const lumi = source('lumiverse');
const st = source('sillytavern');

test('each native platform renders the same Gabi ledger packet through its own authentic replacement', () => {
  for (const [platform, native] of [['lumi', lumi], ['st', st]]) {
    const renderer = motiveLedgerRenderer(native);
    assert.ok(renderer, `${platform} missing its native renderer`);
    assert.ok(hasRenderableReplacement(renderer));
    const payload = motiveLedgerPreviewInput();
    const fixture = fixtures.find(item => item.id === `motive-${platform}`);
    assert.ok(fixture, `${platform} missing regression fixture`);
    assert.equal(fixture.input, payload, 'the fixture and live preview must not drift apart');
    const result = transformRegex(payload, [{...renderer, disabled:false}]);
    assert.ok(result.log.some(entry => entry.changed), `${platform} renderer must match real contract`);
    assert.match(result.output, /<!-- MOTIVE_LEDGER_START -->/);
    assert.match(result.output, /Gabrielle/);
    assert.match(result.output, platform === 'lumi' ? /rxd-motive/ : /class="ml-head"/);
  }
});

test('missing or malformed renderer contract fails closed rather than inventing preview markup', () => {
  assert.equal(motiveLedgerRenderer({}), null);
  assert.equal(motiveLedgerRenderer(null), null);
  const mock = { ...lumi, regex_scripts:[], extensions:{regex_scripts:[]} };
  assert.equal(motiveLedgerRenderer(mock), null);
  assert.equal(hasRenderableReplacement(null), false);
  assert.equal(hasRenderableReplacement({replaceString:'Gabi: a plain-text trace, not HTML'}), false);
  assert.equal(hasRenderableReplacement({replaceString:'<section class="gabi">Visible</section>'}), true);
});

test('real dossier CSS exposes its entire native token inventory and edits without disturbing surrounding CSS', () => {
  const original = dossierSkins(lumi).find(item => /Default Purple/.test(item.scriptName))?.replaceString;
  assert.ok(original, 'missing native default dossier skin');
  const tokens = nativeSkinVariables(original);
  assert.ok(tokens.length >= 20, 'unexpected loss of CSS variable inventory');
  assert.equal(new Set(tokens.map(token => token.name)).size, tokens.length);
  const chosen = tokens.find(token => /color|accent|panel|line|text/.test(token.name)) || tokens[0];
  const sentinel = '#112233';
  const modified = updateSkinVariable(original, chosen.name, sentinel);
  assert.notEqual(modified, original);
  assert.equal(nativeSkinVariables(modified).find(token => token.name === chosen.name).value, sentinel);
  assert.equal(updateSkinVariable(modified, chosen.name, chosen.value), original, 'round-trip must preserve native CSS byte-for-byte');
  for (const [key, value] of [['--rxd-unknown', 'blue'], [chosen.name, 'red; body {}'], [chosen.name, 'url(https://bad)']]) {
    assert.throws(() => updateSkinVariable(original, key, value));
  }
  assert.deepEqual(nativeSkinVariables(null), []);
});

test('a native CSS change can be mirrored safely without desynchronizing the source arrays', () => {
  const copied = structuredClone(lumi);
  const skin = dossierSkins(copied).find(item => /Default Purple/.test(item.scriptName));
  const token = nativeSkinVariables(skin.replaceString)[0];
  const changed = updateSkinVariable(skin.replaceString, token.name, '#aabbcc');
  assert.equal(patchNativeRegex(copied, skin.id, {replaceString:changed}), 2);
  const updated = dossierSkins(copied).find(item => item.id === skin.id);
  assert.equal(updated.replaceString, changed);
  assert.equal(copied.regex_scripts[skin.index].replace_string, copied.extensions.regex_scripts[skin.index].replace_string);
  const malformed = structuredClone(lumi);
  malformed.extensions.regex_scripts[skin.index].name = 'DESYNC';
  assert.throws(() => patchNativeRegex(malformed, skin.id, {replaceString:changed}), /out of sync/);
});

test('nonvisual regex scripts remain accessible as scripts but excluded from the visual-only filter', () => {
  const all = getActualRegexScripts(lumi);
  const visual = all.filter(hasRenderableReplacement);
  assert.ok(visual.length > 0 && visual.length < all.length);
  assert.equal(all.length, 220);
  assert.ok(all.some(item => !hasRenderableReplacement(item)));
  assert.ok(visual.some(item => /TRACK/.test(item.scriptName)));
});
