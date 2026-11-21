import test from 'node:test';
import assert from 'node:assert/strict';
import { referencesForYear, safeUrl, validFact, validateBackup } from '../src/model.js';

const fact = {id:'fact-1',title:'Observed release',date:'2026-11-21',market:'Global',source:'https://example.com/release',stance:'Neutral',note:'Interpretation'};
test('exact marker years do not imply classifications between markers', () => {
  assert.deepEqual(referencesForYear(2026).map(c => c.id),['B']);
  assert.deepEqual(referencesForYear(2032).map(c => c.id),['C']);
  assert.deepEqual(referencesForYear(2035).map(c => c.id),['A']);
  assert.deepEqual(referencesForYear(2027),[]);
  assert.deepEqual(referencesForYear(1999).map(c => c.id),['A','B']);
});
test('source links reject executable and local schemes', () => {
  for (const source of ['javascript:alert(1)','data:text/html,test','file:///tmp/file','invalid']) assert.equal(safeUrl(source),null);
  assert.equal(safeUrl(fact.source),fact.source);
});
test('fact validation rejects invalid calendar dates and unsupported values', () => {
  assert.equal(validFact(fact),true);
  for (const changes of [{date:'2026-02-30'},{date:'2060-01-01'},{stance:'Bullish'},{source:'javascript:alert(1)'},{title:'  '},{market:'Unknown'}]) assert.equal(validFact({...fact,...changes}),false);
});
test('backup round trip preserves research', () => {
  const data = {version:1,facts:[fact],scenarios:{2026:'An explicit scenario'}};
  assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(data))),data);
});
test('invalid imports and duplicate identities are rejected before replacement', () => {
  for (const data of [null,{version:2,facts:[],scenarios:{}},{version:1,facts:[fact,fact],scenarios:{}},{version:1,facts:[],scenarios:{2026:42}},{version:1,facts:[],scenarios:[]},{version:1,facts:[{...fact,source:'file:///tmp/x'}],scenarios:{}}]) assert.throws(() => validateBackup(data));
});
