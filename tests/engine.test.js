/* Empirical test of the real adaptive engine, per path.
 * Pulls the inline <script> out of the served page, runs it against minimal
 * DOM/localStorage stubs, and samples the genuine pickWeighted(). */

const http = require('http');
const https = require('https');
const vm = require('vm');
/* Base URL is configurable so the same suite runs against the local Docker
 * container or a throwaway server in CI. */
const BASE = process.env.BASE_URL || 'http://localhost:8080';

// The suite runs against both the local container (http) and the published
// GitHub Pages site (https), so pick the client from the URL scheme.
const get = url => new Promise((res, rej) => (url.startsWith('https:') ? https : http).get(url, r => {
  let b = ''; r.on('data', c => b += c); r.on('end', () => res(b));
}).on('error', rej));

const pass = [], fail = [];
const ok = (c, m) => (c ? pass : fail).push(m);

(async () => {
  const html = await get(BASE + '/');
  const certsSrc = await get(BASE + '/certs.js');
  const saaSrc   = await get(BASE + '/bank-saa-c03.js');
  const dvaSrc   = await get(BASE + '/bank-dva-c02.js');

  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  ok(scripts.length === 1, 'found the inline engine script');
  const engineSrc = scripts[0];

  const el = () => {
    const e = {
      innerHTML: '', textContent: '', value: '', disabled: false, checked: false,
      style: {}, dataset: {}, children: [], files: [],
      classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
      addEventListener(){}, appendChild(){}, removeChild(){}, remove(){}, click(){},
      querySelector(){ return el(); }, querySelectorAll(){ return []; }, getAttribute(){ return ''; }
    };
    return e;
  };
  const store = new Map();
  const sandbox = {
    console,
    window: {},
    document: {
      documentElement: { style: { setProperty(){}, getPropertyValue(){ return ''; } } },
      getElementById(){ return el(); }, querySelector(){ return el(); },
      querySelectorAll(){ return []; }, createElement(){ return el(); }
    },
    localStorage: {
      getItem: k => store.has(k) ? store.get(k) : null,
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k)
    },
    Blob: function(){}, FileReader: function(){}, URL: { createObjectURL(){}, revokeObjectURL(){} },
    confirm: () => false, alert: () => {}, setInterval: () => 0, clearInterval: () => {},
    Date, Math, JSON, Object, Array, String, Number, Set, Map, Error, parseInt, isNaN
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  vm.runInContext(certsSrc, sandbox);
  vm.runInContext(saaSrc, sandbox);
  vm.runInContext(dvaSrc, sandbox);
  vm.runInContext(engineSrc +
    '\n;globalThis.__e = {weightFor, pickWeighted, tkey, statOfKey,' +
    ' get BANK(){return BANK}, get CERT(){return CERT}, get S(){return S},' +
    ' reload(){ S = load(); }, use(id){ setCert(id); } };', sandbox);

  const E = sandbox.__e;
  ok(E.CERT.id === 'SAA-C03', 'engine booted on the SAA path (' + E.CERT.id + ')');
  ok(E.BANK.length === sandbox.window.BANKS['SAA-C03'].length,
     `active bank matches the path (${E.BANK.length} questions)`);

  /* --- switching path swaps bank AND state namespace --- */
  E.use('DVA-C02');
  ok(E.BANK.length === sandbox.window.BANKS['DVA-C02'].length,
     `switching to DVA swapped the bank (${E.BANK.length} questions)`);
  ok(E.BANK.every(q => q.id.startsWith('dev') || q.id.startsWith('dsec') ||
                       q.id.startsWith('dep') || q.id.startsWith('tro')),
     'DVA bank contains only DVA questions');
  E.use('SAA-C03');

  /* --- weak topics are over-served --- */
  const B = E.BANK;
  const weakQ = B[0];
  const weakKey = weakQ.domain + ' :: ' + weakQ.topic;
  const state = { v:2, seq:100, questions:{}, topics:{}, missed:[], history:[] };
  B.forEach(q => {
    const k = q.domain + ' :: ' + q.topic;
    state.topics[k] = (k === weakKey) ? {attempts:10, correct:0} : {attempts:10, correct:10};
    state.questions[q.id] = {attempts:1, correct:(k === weakKey ? 0 : 1), lastSeen:0};
  });
  store.set('trainer_v2::SAA-C03', JSON.stringify(state));
  E.reload();

  const N = 20000, hits = {};
  for (let i = 0; i < N; i++) { const q = E.pickWeighted(B); hits[q.id] = (hits[q.id] || 0) + 1; }
  const share = (hits[weakQ.id] || 0) / N, uniform = 1 / B.length;
  ok(share > uniform * 5,
    `weak subject over-served ${(share/uniform).toFixed(1)}x vs uniform (${(share*100).toFixed(1)}% vs ${(uniform*100).toFixed(1)}%)`);
  ok(Object.keys(hits).length > B.length * 0.8,
    `selection still covers the bank (${Object.keys(hits).length}/${B.length})`);

  /* --- novelty, recency, repeated-miss multipliers --- */
  const fresh = { v:2, seq:100, questions:{}, topics:{}, missed:[], history:[] };
  B.forEach(q => { fresh.topics[q.domain + ' :: ' + q.topic] = {attempts:10, correct:10}; });
  B.slice(1).forEach(q => { fresh.questions[q.id] = {attempts:1, correct:1, lastSeen:0}; });
  store.set('trainer_v2::SAA-C03', JSON.stringify(fresh)); E.reload();
  ok(Math.abs(E.weightFor(B[0]) / E.weightFor(B[1]) - 1.8) < 0.001,
    `unseen question gets the 1.8x novelty boost`);

  const rec = JSON.parse(JSON.stringify(fresh));
  rec.questions[B[1].id] = {attempts:1, correct:1, lastSeen: rec.seq};
  rec.questions[B[2].id] = {attempts:1, correct:1, lastSeen: rec.seq - 50};
  store.set('trainer_v2::SAA-C03', JSON.stringify(rec)); E.reload();
  ok(E.weightFor(B[1]) < E.weightFor(B[2]) * 0.1, 'just-seen question strongly damped');

  const miss = JSON.parse(JSON.stringify(fresh));
  miss.questions[B[1].id] = {attempts:4, correct:0, lastSeen:0};
  miss.questions[B[2].id] = {attempts:4, correct:4, lastSeen:0};
  store.set('trainer_v2::SAA-C03', JSON.stringify(miss)); E.reload();
  ok(Math.abs(E.weightFor(B[1]) / E.weightFor(B[2]) - 1.5) < 0.001,
    'repeatedly-missed question boosted 1.5x');

  /* --- each path adapts on its own statistics --- */
  const dvaBank = sandbox.window.BANKS['DVA-C02'];
  const dvaState = { v:2, seq:100, questions:{}, topics:{}, missed:[], history:[] };
  const dvaWeak = dvaBank[0].domain + ' :: ' + dvaBank[0].topic;
  dvaBank.forEach(q => {
    const k = q.domain + ' :: ' + q.topic;
    dvaState.topics[k] = (k === dvaWeak) ? {attempts:10, correct:0} : {attempts:10, correct:10};
    dvaState.questions[q.id] = {attempts:1, correct:(k === dvaWeak ? 0 : 1), lastSeen:0};
  });
  store.set('trainer_v2::DVA-C02', JSON.stringify(dvaState));
  E.use('DVA-C02');
  const dHits = {};
  for (let i = 0; i < 8000; i++) { const q = E.pickWeighted(E.BANK); dHits[q.id] = (dHits[q.id]||0)+1; }
  const dShare = (dHits[dvaBank[0].id] || 0) / 8000, dUniform = 1 / dvaBank.length;
  ok(dShare > dUniform * 2,
     `DVA path adapts on its own stats — its weak subject over-served ${(dShare/dUniform).toFixed(1)}x`);

  E.use('SAA-C03');
  const saaTopics = Object.keys(E.S.topics);
  ok(saaTopics.every(k => k.startsWith('Design ')),
     'switching back loads only SAA statistics (no DVA subjects leaked in)');

  console.log('\n--- PASS (' + pass.length + ') ---');
  pass.forEach(p => console.log('  ok   ' + p));
  if (fail.length) { console.log('\n--- FAIL (' + fail.length + ') ---'); fail.forEach(f => console.log('  FAIL ' + f)); }
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
