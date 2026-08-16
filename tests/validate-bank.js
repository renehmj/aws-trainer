/*
 * Question-bank validation. Pure Node, no browser and no server needed, so it is
 * the fastest signal in CI and the one that catches the mistakes that actually
 * happen when adding questions by hand.
 *
 *   node tests/validate-bank.js
 *
 * Checks, per certification path:
 *   - every topic string exists in that path's syllabus (a typo silently creates
 *     a second subject, which is the single easiest error to make)
 *   - question ids are unique
 *   - every correct answer refers to a real option
 *   - single/multi type matches the number of correct answers
 *   - whyWrong keys are real options and never explain a correct answer
 *   - explanations are present and not stubs
 *   - domain mix stays within 3 points of the real blueprint weights once a bank
 *     is large enough for the comparison to mean anything
 */

const path = require('path');
const problems = [];
const notes = [];

global.window = {};
require(path.join(__dirname, '..', 'certs.js'));
['saa-c03', 'dva-c02', 'sap-c02', 'dop-c02']
  .forEach(f => require(path.join(__dirname, '..', `bank-${f}.js`)));

const CERTS = global.window.CERTS || [];
const BANKS = global.window.BANKS || {};
const MIX_TOLERANCE = 0.03;
const MIX_MIN_BANK = 40;

if (!CERTS.length) problems.push('certs.js registered no certification paths');

let total = 0;

CERTS.forEach(cert => {
  const bank = BANKS[cert.id] || [];
  total += bank.length;

  const syllabus = new Set();
  cert.domains.forEach(d => (d.topics || []).forEach(t => syllabus.add(`${d.name} :: ${t}`)));
  const domainNames = cert.domains.map(d => d.name);

  const weightSum = cert.domains.reduce((n, d) => n + d.weight, 0);
  if (Math.abs(weightSum - 1) > 0.001) {
    problems.push(`${cert.id}: domain weights sum to ${weightSum.toFixed(3)}, expected 1.000`);
  }

  const seenIds = new Set();
  const used = new Map();

  bank.forEach(q => {
    const at = `${cert.id}/${q.id || '(no id)'}`;

    if (!q.id) problems.push(`${at}: missing id`);
    else if (seenIds.has(q.id)) problems.push(`${at}: duplicate id`);
    seenIds.add(q.id);

    if (!domainNames.includes(q.domain)) {
      problems.push(`${at}: domain "${q.domain}" is not a domain of this path`);
    }

    const key = `${q.domain} :: ${q.topic}`;
    used.set(key, (used.get(key) || 0) + 1);
    if (!syllabus.has(key)) {
      problems.push(`${at}: topic "${q.topic}" is not in the syllabus for "${q.domain}" ` +
                    `— add it to certs.js or fix the typo`);
    }

    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) {
      problems.push(`${at}: difficulty "${q.difficulty}" must be easy, medium or hard`);
    }
    if (!['single', 'multi'].includes(q.type)) {
      problems.push(`${at}: type "${q.type}" must be single or multi`);
    }
    if (!q.question || q.question.length < 40) problems.push(`${at}: question text missing or too short`);
    if (!q.explanation || q.explanation.length < 40) problems.push(`${at}: explanation missing or too short`);

    const options = q.options || [];
    const optIds = options.map(o => o.id);
    if (options.length < 3) problems.push(`${at}: fewer than 3 options`);
    if (new Set(optIds).size !== optIds.length) problems.push(`${at}: duplicate option ids`);
    options.forEach(o => { if (!o.text) problems.push(`${at}: option ${o.id} has no text`); });

    const correct = q.correct || [];
    if (!correct.length) problems.push(`${at}: no correct answer`);
    correct.forEach(c => {
      if (!optIds.includes(c)) problems.push(`${at}: correct answer "${c}" is not one of the options`);
    });
    if (q.type === 'single' && correct.length !== 1) {
      problems.push(`${at}: type single but ${correct.length} correct answers`);
    }
    if (q.type === 'multi' && correct.length < 2) {
      problems.push(`${at}: type multi but only ${correct.length} correct answer`);
    }

    Object.keys(q.whyWrong || {}).forEach(k => {
      if (!optIds.includes(k)) problems.push(`${at}: whyWrong key "${k}" is not an option`);
      if (correct.includes(k)) problems.push(`${at}: whyWrong explains "${k}", which is a correct answer`);
    });
  });

  // domain mix vs blueprint — only meaningful once a bank has some size
  if (bank.length >= MIX_MIN_BANK) {
    cert.domains.forEach(d => {
      const share = bank.filter(q => q.domain === d.name).length / bank.length;
      const off = Math.abs(share - d.weight);
      if (off > MIX_TOLERANCE) {
        problems.push(`${cert.id}: "${d.name}" is ${(share * 100).toFixed(1)}% of the bank but the ` +
                      `blueprint weight is ${(d.weight * 100).toFixed(0)}% ` +
                      `(off by ${(off * 100).toFixed(1)} points, tolerance ${MIX_TOLERANCE * 100})`);
      }
    });
  }

  const thin = [...used.entries()].filter(([, n]) => n < 2).length;
  notes.push(`${cert.id.padEnd(9)} ${String(bank.length).padStart(4)} questions · ` +
             `${String(used.size).padStart(3)}/${syllabus.size} subjects covered` +
             (thin ? ` · ${thin} subject(s) with a single question` : ''));
});

notes.forEach(n => console.log('  ' + n));
console.log(`  ${'TOTAL'.padEnd(9)} ${String(total).padStart(4)} questions across ${CERTS.length} paths`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  problems.forEach(p => console.error('  ✗ ' + p));
  process.exit(1);
}
console.log('\n✓ all banks valid');
