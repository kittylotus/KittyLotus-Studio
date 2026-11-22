import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {stPresentationLabel} from '../js/workbench.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');

test('ST outline presentation helper remains a true ESM import, not an accidental concatenated global',()=>{
  const app=readFileSync(resolve(root,'js/app.js'),'utf8');
  const match=app.match(/^import\s*\{([^}]+)\}\s*from\s*['"]\.\/workbench\.js(?:\?v=0\.17\.0)?['"];?$/m);
  assert.ok(match, 'App must retain its explicit workbench module import');
  assert.ok(match[1].split(',').map(value=>value.trim()).includes('stPresentationLabel'),
    'Renderer uses stPresentationLabel and must import it from workbench.js');
  assert.equal(stPresentationLabel('┆       → Branching'),'Branching');
  assert.match(app,/stPresentationLabel\(entry\.originalName\)/);
});
