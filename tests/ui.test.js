const { JSDOM, VirtualConsole } = require('jsdom');
const BASE = process.env.BASE_URL || 'http://localhost:8080';

const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errs.push('jsdomError: ' + e.message));
vc.on('error', (...a) => errs.push('console.error: ' + a.join(' ')));

const pass = [], fail = [];
const ok = (c, m) => (c ? pass : fail).push(m);
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const dom = await JSDOM.fromURL(BASE + '/', {
    runScripts: 'dangerously', resources: 'usable', virtualConsole: vc, pretendToBeVisual: true
  });
  await sleep(1400);
  const w = dom.window, d = w.document;
  w.confirm = () => true; w.alert = () => {};
  const nav = v => [...d.querySelectorAll('.navi')].find(b => b.dataset.view === v).click();
  // Parked paths have no rail button, so fall back to the switcher directly —
  // per-path isolation still has to hold for banks that are hidden from the UI.
  const usePath = async id => {
    const btn = d.querySelector('.path[data-cert="' + id + '"]');
    if (btn) btn.click(); else w.setCert(id);
    await sleep(420);
  };
  const reloadPath = async id => { await usePath(id === 'SAA-C03' ? 'DVA-C02' : 'SAA-C03'); await usePath(id); };
  const idOf = host => d.querySelector(host + ' .qmeta .tag:nth-child(4)').textContent;

  /* ---------- 1. paths configured ---------- */
  const CERTS = w.CERTS, BANKS = w.BANKS;
  ok(CERTS.length === 4, `4 certification paths configured (${CERTS.map(c=>c.id).join(', ')})`);
  // Only unparked paths are rendered — the focus is a single certification at a time.
  const visible = CERTS.filter(c => !c.parked);
  ok(d.querySelectorAll('#pathList .path').length === visible.length,
     `rail lists only unparked paths (${visible.map(c=>c.id).join(', ')})`);
  ok(visible.length === 1 && visible[0].id === 'SAA-C03', 'SAA-C03 is the only active goal');
  ok(CERTS.every(c => c.domains.reduce((s,x)=>s+x.weight,0) > 0.999 &&
                      c.domains.reduce((s,x)=>s+x.weight,0) < 1.001),
     'every path\'s domain weights sum to 100%');
  ok(CERTS.find(c=>c.id==='DOP-C02').domains.length === 6, 'DOP-C02 carries its 6 domains');
  ok(CERTS.find(c=>c.id==='SAP-C02').exam.pass === 750 &&
     CERTS.find(c=>c.id==='SAA-C03').exam.pass === 720, 'per-path exam rules differ (750 vs 720)');

  /* ---------- 1b. side rail chrome ---------- */
  const pathBtns = [...d.querySelectorAll('#pathList .path')];
  ok(pathBtns.every(b => b.querySelector('.code') && b.querySelector('.mini b') && b.querySelector('.pcs')),
     'each path row shows its code, progress bar and stats');
  const codeColors = pathBtns.map(b => b.querySelector('.code').getAttribute('style'));
  ok(new Set(codeColors).size === pathBtns.length, 'each visible path carries a distinct identity colour');
  ok(pathBtns.filter(b => b.classList.contains('on')).length === 1, 'exactly one path marked active');
  ok(d.getElementById('pathChip').textContent.includes('SAA-C03'), 'top bar chip names the active path');
  // Counts here are derived, not hard-coded — the rail grows as views are added.
  const naviBtns = [...d.querySelectorAll('.navi')];
  ok(naviBtns.length === d.querySelectorAll('main .view').length,
     `every view has a rail entry (${naviBtns.length})`);
  ok(naviBtns.every(b => b.querySelector('svg')), 'every nav item has an icon');
  ok(naviBtns.every(b => d.getElementById(b.dataset.view)),
     'every nav item points at a view that exists');
  ok(naviBtns.some(b => b.dataset.view === 'measure'), 'rail includes the Measure view');
  ok(d.getElementById('viewTitle').textContent === 'Dashboard', 'top bar shows the current view name');
  ok(d.documentElement.style.getPropertyValue('--accent').trim() === '#3987e5',
     'UI accent tinted with the active path colour');
  ok(d.getElementById('railFoot').textContent.includes('720'), 'rail footer shows this path\'s exam rules');

  /* ---------- 2. every bank validates against its own path ---------- */
  const problems = [];
  CERTS.forEach(c => {
    const B = BANKS[c.id] || [];
    const names = c.domains.map(x => x.name);
    const ids = new Set();
    B.forEach(q => {
      if (ids.has(q.id)) problems.push(`${c.id}/${q.id}: duplicate id`); ids.add(q.id);
      if (!names.includes(q.domain)) problems.push(`${c.id}/${q.id}: domain "${q.domain}" not in path`);
      if (!q.topic || !q.question || !q.explanation) problems.push(`${c.id}/${q.id}: missing text`);
      if (!['easy','medium','hard'].includes(q.difficulty)) problems.push(`${c.id}/${q.id}: bad difficulty`);
      if (!['single','multi'].includes(q.type)) problems.push(`${c.id}/${q.id}: bad type`);
      const optIds = (q.options||[]).map(o => o.id);
      if (optIds.length < 3) problems.push(`${c.id}/${q.id}: <3 options`);
      if (new Set(optIds).size !== optIds.length) problems.push(`${c.id}/${q.id}: dup option ids`);
      (q.correct||[]).forEach(x => { if (!optIds.includes(x)) problems.push(`${c.id}/${q.id}: correct ${x} not an option`); });
      if (q.type === 'single' && (q.correct||[]).length !== 1) problems.push(`${c.id}/${q.id}: single w/ ${q.correct.length}`);
      if (q.type === 'multi' && (q.correct||[]).length < 2) problems.push(`${c.id}/${q.id}: multi w/ <2`);
      Object.keys(q.whyWrong||{}).forEach(k => {
        if (!optIds.includes(k)) problems.push(`${c.id}/${q.id}: whyWrong key ${k} not an option`);
        if ((q.correct||[]).includes(k)) problems.push(`${c.id}/${q.id}: whyWrong explains correct ${k}`);
      });
    });
  });
  ok(problems.length === 0, 'all banks schema-valid against their own path' + (problems.length ? ' — ' + problems.join('; ') : ''));
  // Derived, not hard-coded — the bank grows every time questions are written.
  const sizes = Object.fromEntries(CERTS.map(c => [c.id, (BANKS[c.id]||[]).length]));
  ok(Object.values(sizes).every(n => n > 0),
     `every path has a non-empty bank (${JSON.stringify(sizes)})`);
  ok(sizes['SAA-C03'] === Math.max(...Object.values(sizes)),
     'SAA-C03 is the most developed bank');
  ok(CERTS.every(c => (BANKS[c.id]||[]).length > 0), 'every path now has questions');
  // domain mix must track the real blueprint weights
  const mixOff = CERTS.filter(c => (BANKS[c.id]||[]).length >= 40).map(c => {
    const B = BANKS[c.id];
    return c.domains.map(dm => {
      const share = B.filter(q => q.domain === dm.name).length / B.length;
      return Math.abs(share - dm.weight);
    }).reduce((a,b) => Math.max(a,b), 0);
  });
  ok(mixOff.every(x => x <= 0.03),
     `bank domain mix within 3 points of blueprint weights (worst ${(Math.max(0,...mixOff)*100).toFixed(1)} pts)`);
  const saaCov = new Set(BANKS['SAA-C03'].map(q => q.domain + ' :: ' + q.topic)).size;
  const saaSyl = CERTS.find(c=>c.id==='SAA-C03').domains.reduce((n,dm)=>n+dm.topics.length,0);
  ok(saaCov === saaSyl, `SAA covers every one of its ${saaSyl} syllabus subjects`);

  /* ---------- 3. dashboard + charts ---------- */
  ok(d.getElementById('heroFig').textContent.trim() === '—', 'hero shows no-data state on a fresh path');
  ok(d.querySelectorAll('#heroTiles .tile').length === 4, 'hero stat tiles rendered');
  ok(d.querySelectorAll('#domChart .hrow').length === 4, 'domain chart drew 4 bars for SAA');
  ok(d.querySelectorAll('#domChart .track > u').length === 4, 'each domain bar carries the 85% marker');
  ok(d.querySelectorAll('#masteryChart .legend span').length === 4, 'mastery legend labels all four states');
  ok(d.querySelector('#masteryChart .stack i'), 'mastery stacked bar rendered');
  ok(d.getElementById('scoreChart').textContent.includes('No mock exams'), 'score chart shows empty state');

  // table-view twins
  const dtBtn = [...d.querySelectorAll('#domChart .tvbtn')][0];
  dtBtn.click(); await sleep(60);
  ok(d.querySelectorAll('#domChart table.tv tbody tr').length === 4, 'domain table view lists 4 rows');
  dtBtn.click(); await sleep(60);
  ok(!d.querySelector('#domChart table.tv'), 'table view toggles back off');

  /* ---------- 4. practice ---------- */
  nav('practice'); await sleep(200);
  ok(!!d.querySelector('#practiceHost .qtext'), 'practice served a question');
  let qid = idOf('#practiceHost');
  let q = (BANKS['SAA-C03']).find(x => x.id === qid);
  ok(!!q, 'served question belongs to the active path (' + qid + ')');
  q.correct.forEach(c => d.querySelector(`#practiceHost .opt[data-id="${c}"] input`).click());
  d.querySelector('#practiceHost [data-submit]').click(); await sleep(100);
  ok(!!d.querySelector('#practiceHost .fb.ok'), 'correct answer graded correct');

  let st = JSON.parse(w.localStorage.getItem('trainer_v2::SAA-C03'));
  ok(st && st.questions[qid] && st.questions[qid].correct === 1, 'progress written to the SAA key');
  ok(!w.localStorage.getItem('trainer_v2::DVA-C02'), 'no DVA state created by SAA practice');

  // wrong answer -> missed queue
  [...d.querySelectorAll('#practiceHost button')].find(b => b.textContent === 'Next question').click();
  await sleep(150);
  qid = idOf('#practiceHost'); q = (BANKS['SAA-C03']).find(x => x.id === qid);
  const wrong = q.options.find(o => !q.correct.includes(o.id));
  d.querySelector(`#practiceHost .opt[data-id="${wrong.id}"] input`).click();
  d.querySelector('#practiceHost [data-submit]').click(); await sleep(100);
  ok(!!d.querySelector('#practiceHost .fb.no'), 'wrong answer graded incorrect');
  st = JSON.parse(w.localStorage.getItem('trainer_v2::SAA-C03'));
  ok(st.missed.includes(qid), 'wrong answer entered the missed queue');
  ok(d.getElementById('missBadge').style.display !== 'none' &&
     d.getElementById('missBadge').textContent === '1',
     'rail badge tracks the missed queue live, without visiting the dashboard');

  nav('review'); await sleep(150);
  const rq = (BANKS['SAA-C03']).find(x => x.id === idOf('#reviewHost'));
  rq.correct.forEach(c => d.querySelector(`#reviewHost .opt[data-id="${c}"] input`).click());
  d.querySelector('#reviewHost [data-submit]').click(); await sleep(120);
  st = JSON.parse(w.localStorage.getItem('trainer_v2::SAA-C03'));
  ok(!st.missed.includes(rq.id), 'answering correctly cleared it from the missed queue');

  /* ---------- 5. subjects sidebar (syllabus + bank) ---------- */
  nav('topics'); await sleep(200);
  const saaCert = CERTS.find(c => c.id === 'SAA-C03');
  const syllabus = saaCert.domains.reduce((n,dm) => n + dm.topics.length, 0);
  const covered = new Set(BANKS['SAA-C03'].map(x => x.domain + ' :: ' + x.topic)).size;
  const uniq = covered;
  ok(d.querySelectorAll('#subjectTree .sitem').length === syllabus,
     `sidebar lists the whole ${syllabus}-subject syllabus, not just the ${covered} with questions`);
  ok(d.querySelectorAll('#subjectTree .sitem.gap').length === syllabus - covered,
     `${syllabus - covered} subjects marked as awaiting questions`);
  ok(d.querySelectorAll('#subjectTree .sitem.gap .dot.hollow').length === syllabus - covered,
     'coverage gaps use a hollow dot, distinct from a study state');
  ok(d.querySelectorAll('#subjectTree .sgroup').length === 4, 'sidebar groups subjects under 4 domains');
  ok(d.getElementById('subjectWork').textContent.includes('Pick a subject'), 'work pane shows the landing state');
  ok(d.getElementById('subjectWork').textContent.includes('Awaiting questions'), 'landing state counts the gaps');

  // collapse a domain group
  const gh = d.querySelector('#subjectTree .gh');
  const beforeCollapse = d.querySelectorAll('#subjectTree .sitem').length;
  gh.click(); await sleep(60);
  ok(d.querySelectorAll('#subjectTree .sitem').length < beforeCollapse, 'domain group collapses');
  gh.click(); await sleep(60);
  ok(d.querySelectorAll('#subjectTree .sitem').length === beforeCollapse, 'and expands again');

  // filter
  const search = d.getElementById('topicSearch');
  search.value = 'IAM'; search.dispatchEvent(new w.Event('input')); await sleep(80);
  const filtered = [...d.querySelectorAll('#subjectTree .sitem')];
  ok(filtered.length > 0 && filtered.length < uniq, `filter narrowed to ${filtered.length}`);
  ok(filtered.every(i => i.textContent.toLowerCase().includes('iam')), 'filter results all match');
  search.value = ''; search.dispatchEvent(new w.Event('input')); await sleep(80);
  ok(d.querySelectorAll('#subjectTree .sitem').length === syllabus, 'clearing filter restores the list');

  // open a subject; sidebar must stay visible
  const item = d.querySelector('#subjectTree .sitem:not(.gap)');
  const wantKey = item.dataset.key;
  item.click(); await sleep(200);
  ok(d.querySelectorAll('#subjectTree .sitem').length === syllabus, 'sidebar still visible while working');
  ok(d.querySelector('#subjectTree .sitem.on'), 'active subject highlighted in the sidebar');
  ok(d.getElementById('sessTitle').textContent === wantKey.split(' :: ')[1], 'session titled with the subject');
  const sq = (BANKS['SAA-C03']).find(x => x.id === idOf('#sessHost'));
  ok(sq.domain + ' :: ' + sq.topic === wantKey, 'session served only that subject\'s question');
  sq.correct.forEach(c => d.querySelector(`#sessHost .opt[data-id="${c}"] input`).click());
  d.querySelector('#sessHost [data-submit]').click(); await sleep(150);
  ok(d.querySelector('#sessStats .tile .n').textContent.trim() === '100%', 'session score tile updated');

  // switch subject straight from the sidebar, mid-session
  const items = [...d.querySelectorAll('#subjectTree .sitem:not(.gap)')];
  const other = items.find(i => i.dataset.key !== wantKey);
  const otherKey = other.dataset.key;
  other.click(); await sleep(200);
  ok(d.getElementById('sessTitle').textContent === otherKey.split(' :: ')[1],
     'clicking another subject in the sidebar switches session without leaving the page');

  // whole-domain button
  d.querySelector('#subjectTree [data-domain]').click(); await sleep(200);
  const dq = (BANKS['SAA-C03']).find(x => x.id === idOf('#sessHost'));
  ok(d.getElementById('sessTitle').textContent.startsWith('Design'), 'whole-domain session opened');
  ok(dq.domain === d.getElementById('sessTitle').textContent, 'domain session scoped to that domain');
  d.getElementById('sessBack').click(); await sleep(150);

  /* ---------- 6. PATH SEPARATION ---------- */
  const saaBefore = JSON.parse(w.localStorage.getItem('trainer_v2::SAA-C03'));
  const saaAttempts = Object.values(saaBefore.questions).reduce((n,x) => n + x.attempts, 0);
  ok(saaAttempts > 0, `SAA path has ${saaAttempts} recorded attempts before switching`);


  await usePath('DVA-C02');
  ok(d.getElementById('pathChip').textContent.includes('DVA-C02'), 'switched to the DVA path');
  ok(d.documentElement.style.getPropertyValue('--accent').trim() === '#d95926',
     'switching path re-tints the whole UI');
  const dvaBtn = d.querySelector('#pathList .path[data-cert="DVA-C02"]');
  ok(dvaBtn ? dvaBtn.classList.contains('on') : true,
     'rail highlights the active path when that path is visible');
  ok(d.getElementById('heroFig').textContent.trim() === '—',
     'DVA dashboard starts empty — SAA progress does not leak across');
  nav('topics'); await sleep(200);
  const dvaSyl = CERTS.find(c => c.id === 'DVA-C02').domains.reduce((n,dm) => n + dm.topics.length, 0);
  const dvaKeys = [...d.querySelectorAll('#subjectTree .sitem')].map(i => i.dataset.key);
  ok(dvaKeys.length === dvaSyl && dvaKeys.every(k => !k.startsWith('Design ')),
     `DVA sidebar shows its own ${dvaKeys.length}-subject syllabus, none from SAA`);
  ok(d.querySelectorAll('#subjectTree .sitem:not(.gap)').length === 8,
     'exactly the 8 DVA subjects that have questions are startable');

  // answer one DVA question, then confirm each path kept its own numbers
  const dvaItem = d.querySelector('#subjectTree .sitem:not(.gap)');
  dvaItem.click(); await sleep(200);
  const dq2 = (BANKS['DVA-C02']).find(x => x.id === idOf('#sessHost'));
  ok(!!dq2, 'DVA session served a DVA question');
  dq2.correct.forEach(c => d.querySelector(`#sessHost .opt[data-id="${c}"] input`).click());
  d.querySelector('#sessHost [data-submit]').click(); await sleep(150);

  const dvaState = JSON.parse(w.localStorage.getItem('trainer_v2::DVA-C02'));
  const saaAfter = JSON.parse(w.localStorage.getItem('trainer_v2::SAA-C03'));
  ok(Object.keys(dvaState.questions).length === 1, 'DVA state holds exactly its own 1 answer');
  ok(JSON.stringify(saaAfter) === JSON.stringify(saaBefore), 'SAA state untouched by DVA activity');

  await usePath('SAA-C03');
  ok(d.getElementById('heroFig').textContent.trim() !== '—', 'switching back restores SAA progress');

  /* ---------- 7. partially-covered path ---------- */
  await usePath('DOP-C02');
  const dopCert = CERTS.find(c => c.id === 'DOP-C02');
  const dopSyl = dopCert.domains.reduce((n,dm) => n + dm.topics.length, 0);
  const dopCov = new Set((BANKS['DOP-C02']||[]).map(q => q.domain + ' :: ' + q.topic)).size;
  ok(d.querySelectorAll('#domChart .hrow').length === 6, 'DOP dashboard draws all 6 of its domains');
  nav('mock'); await sleep(120);
  ok(!d.getElementById('mockStart').disabled, 'mock available now that DOP has questions');
  ok(d.getElementById('railFoot').textContent.includes('750'), 'DOP rail footer shows its 750 pass mark');
  nav('topics'); await sleep(200);
  ok(d.querySelectorAll('#subjectTree .sgroup').length === 6, 'DOP sidebar shows all 6 domains');
  ok(d.querySelectorAll('#subjectTree .sitem').length === dopSyl,
     `DOP sidebar lists its full ${dopSyl}-subject syllabus`);
  ok(d.querySelectorAll('#subjectTree .sitem.gap').length === dopSyl - dopCov,
     `${dopSyl - dopCov} DOP subjects still marked as awaiting questions`);
  d.querySelector('#subjectTree .sitem.gap').click(); await sleep(200);
  ok(d.getElementById('sessHost').textContent.includes('bank-dop-c02.js'),
     'opening an uncovered subject explains where its questions go');
  const dopStart = d.querySelector('#subjectTree .sitem:not(.gap)');
  dopStart.click(); await sleep(200);
  const dq3 = (BANKS['DOP-C02']).find(x => x.id === idOf('#sessHost'));
  ok(!!dq3, 'a covered DOP subject serves a real DOP question');
  await usePath('SAA-C03');

  /* ---------- 8. mock exam end to end ---------- */
  w.localStorage.setItem('trainer_v2::SAA-C03', JSON.stringify(
    {v:2, seq:0, questions:{}, topics:{}, missed:[], history:[]}));
  await reloadPath('SAA-C03');
  nav('mock'); await sleep(150);
  d.getElementById('mockStart').click(); await sleep(300);
  const n = d.querySelectorAll('#mockPal button').length;
  ok(n === Math.min(65, BANKS['SAA-C03'].length), `mock built ${n} questions`);
  const expect = Math.round(130 * 60 * (n / 65));
  const hh = String(Math.floor(expect/3600)).padStart(2,'0'),
        mm = String(Math.floor(expect%3600/60)).padStart(2,'0');
  ok(d.getElementById('mockTimer').textContent.startsWith(hh + ':' + mm),
     `timer scaled to bank size (${d.getElementById('mockTimer').textContent})`);
  ok(!d.querySelector('#mockHost [data-submit]'), 'mock does not grade per question');

  for (let i = 0; i < n; i++) {
    d.querySelectorAll('#mockPal button')[i].click(); await sleep(0);
    const mq = (BANKS['SAA-C03']).find(x => x.id === idOf('#mockHost'));
    mq.correct.forEach(c => {
      const inp = d.querySelector(`#mockHost .opt[data-id="${c}"] input`);
      if (!inp.checked) inp.click();
    });
  }
  d.getElementById('mockSubmit').click(); await sleep(400);
  ok(d.querySelector('#mockResult .tile .n').textContent.trim() === '1000', 'perfect mock scores 1000');
  ok([...d.querySelectorAll('#mockResult .tile .n')].some(e => e.textContent.trim() === 'PASS'), 'reported PASS');
  st = JSON.parse(w.localStorage.getItem('trainer_v2::SAA-C03'));
  ok(st.history.length === 1 && st.history[0].score === 1000, 'result written to this path\'s history');
  ok(Object.keys(st.questions).length === n, 'mock answers fed the adaptive model');
  d.getElementById('mockReview').click(); await sleep(300);
  ok(d.querySelectorAll('#mockReviewHost .fb').length === n, 'answer review rendered every question');

  // second mock -> the score chart becomes a real line
  nav('mock'); await sleep(100);
  d.getElementById('mockStart').click(); await sleep(300);
  const n2 = d.querySelectorAll('#mockPal button').length;
  for (let i = 0; i < n2; i++) {
    d.querySelectorAll('#mockPal button')[i].click(); await sleep(0);
    const mq = (BANKS['SAA-C03']).find(x => x.id === idOf('#mockHost'));
    mq.correct.forEach(c => {
      const inp = d.querySelector(`#mockHost .opt[data-id="${c}"] input`);
      if (!inp.checked) inp.click();
    });
  }
  d.getElementById('mockSubmit').click(); await sleep(400);
  nav('dashboard'); await sleep(200);
  ok(!!d.querySelector('#scoreChart svg.plot'), 'score chart draws an SVG line after two attempts');
  ok(d.querySelectorAll('#scoreChart .dot').length === 2, 'one dot per attempt');
  ok(d.querySelectorAll('#scoreChart .hit').length === 2, 'hover hit-areas exist for tooltips');
  ok(d.querySelector('#scoreChart svg').getAttribute('aria-label').includes('Mock exam'), 'chart has an aria-label');
  const scBtn = d.querySelector('#scoreChart .tvbtn');
  scBtn.click(); await sleep(60);
  ok(d.querySelectorAll('#scoreChart table.tv tbody tr').length === 2, 'score table view lists both attempts');
  ok(d.querySelector('#heroFig').textContent.includes('100'), 'hero reflects a perfect record');
  ok(d.querySelector('#heroChip .chip').textContent.includes('ready to book'), 'readiness chip carries a text label, not colour alone');

  /* ---------- 9. weakest-subject click-through ---------- */
  const poisoned = JSON.parse(w.localStorage.getItem('trainer_v2::SAA-C03'));
  const pk = Object.keys(poisoned.topics)[0];
  poisoned.topics[pk] = {attempts:4, correct:0};
  w.localStorage.setItem('trainer_v2::SAA-C03', JSON.stringify(poisoned));
  await reloadPath('SAA-C03');
  const wrow = d.querySelector('#weakChart .hrow.click');
  ok(!!wrow, 'weakest-subjects chart rendered clickable rows');
  wrow.click(); await sleep(250);
  ok(d.getElementById('topics').classList.contains('active') &&
     d.getElementById('sessTitle'), 'clicking a weak subject opens its session');

  /* ---------- 10. export bundle ---------- */
  nav('data'); await sleep(120);
  ok(d.querySelectorAll('#bankStats .row').length === CERTS.filter(c=>!c.parked).length,
     'data view lists the active goal only');

  /* ---------- 11. paste-based import ---------- */
  const sample = [
    '1. A company runs a web application on EC2 instances behind an Application Load Balancer.',
    'Sessions are lost whenever an instance is replaced. Which service should store session state?',
    'A) Amazon ElastiCache for Redis',
    'B) Amazon EBS attached to each instance',
    'C) EC2 instance store',
    'D) AWS Storage Gateway',
    'Answer: A',
    'Explanation: A shared in-memory store keeps the instances stateless.',
    '',
    '2. Which S3 storage class suits data read once a quarter that still needs millisecond retrieval?',
    'A. S3 Standard',
    'B. S3 Standard-IA',
    'C. S3 Glacier Deep Archive',
    'D. S3 One Zone-IA',
    'Correct answer: B',
    '',
    '3. Which TWO services provide a private path to Amazon S3 from a VPC?',
    'A) Gateway VPC endpoint',
    'B) NAT gateway',
    'C) Interface VPC endpoint',
    'D) Internet gateway',
    'Answers: A, C'
  ].join('\n');

  d.getElementById('pasteBox').value = sample;
  d.getElementById('pasteParse').click(); await sleep(150);
  let dr = [...d.querySelectorAll('#pastePreview .draft')];
  ok(dr.length === 3, `parsed ${dr.length} questions out of the pasted text`);
  ok(dr[0].querySelectorAll('ol li').length === 4, 'first draft captured all 4 options');
  ok(dr[0].querySelector('ol li.ans') && dr[0].querySelectorAll('ol li.ans').length === 1,
     'single answer detected and marked');
  ok(dr[2].querySelectorAll('ol li.ans').length === 2, 'multi-answer question detected two answers');
  ok(dr[0].textContent.includes('stateless'), 'explanation text captured');
  ok(dr.every(x => x.classList.contains('bad')), 'drafts flagged until a subject is assigned');

  // assign domain + subject on the first draft
  let sel = dr[0].querySelector('[data-f="domain"]');
  sel.value = 'Design Resilient Architectures';
  sel.dispatchEvent(new w.Event('change')); await sleep(120);
  dr = [...d.querySelectorAll('#pastePreview .draft')];
  const topSel = dr[0].querySelector('[data-f="topic"]');
  ok([...topSel.options].some(o => o.value === 'Stateless application design'),
     'subject dropdown is populated from that domain\'s syllabus');
  topSel.value = 'Stateless application design';
  topSel.dispatchEvent(new w.Event('change')); await sleep(120);
  dr = [...d.querySelectorAll('#pastePreview .draft')];
  ok(!dr[0].classList.contains('bad'), 'first draft ready once answer + subject are set');

  const bankBefore = BANKS['SAA-C03'].length;
  d.getElementById('draftAdd').click(); await sleep(400);
  const added = JSON.parse(w.localStorage.getItem('trainer_v2::added::SAA-C03') || '[]');
  ok(added.length === 1, 'only the ready draft was added');
  ok(added[0].domain === 'Design Resilient Architectures' &&
     added[0].topic === 'Stateless application design' && added[0].type === 'single',
     'added question carries the assigned subject and inferred type');
  ok(added[0].id.startsWith('res-p'), 'added question got a domain-prefixed id (' + added[0].id + ')');
  ok(d.querySelectorAll('#pastePreview .draft').length === 2, 'unassigned drafts stay for review');

  nav('data'); await sleep(150);
  ok(d.getElementById('addedList').textContent.includes('Stateless application design'),
     'pasted question listed under this path');
  ok(d.getElementById('bankStats').textContent.includes(String(bankBefore + 1)),
     'bank count includes pasted questions');

  // it must actually take part in study
  nav('topics'); await sleep(200);
  const statelessRow = [...d.querySelectorAll('#subjectTree .sitem')]
    .find(i => i.dataset.key.endsWith(':: Stateless application design'));
  statelessRow.click(); await sleep(200);
  const builtIn = BANKS['SAA-C03'].filter(x => x.topic === 'Stateless application design').length;
  const poolTile = d.querySelectorAll('#sessStats .tile .n')[2];
  ok(poolTile && poolTile.textContent.trim() === String(builtIn + 1),
     `the subject offers ${builtIn} built-in + 1 pasted = ${builtIn + 1} questions`);

  // export carries pasted questions
  nav('data'); await sleep(150);
  let exported = null;
  w.Blob = function(parts){ exported = parts.join(''); };
  w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {};
  // jsdom cannot "navigate" to a download link, so neutralise the anchor click
  const origAnchorClick = w.HTMLAnchorElement.prototype.click;
  w.HTMLAnchorElement.prototype.click = function(){};
  d.getElementById('btnExport').click(); await sleep(150);
  w.HTMLAnchorElement.prototype.click = origAnchorClick;
  const bundle = JSON.parse(exported);
  ok(bundle.v === 3 && bundle.added && bundle.added['SAA-C03'] &&
     bundle.added['SAA-C03'].length === 1, 'export bundle carries pasted questions');

  // delete it again
  d.querySelector('#addedList [data-del]').click(); await sleep(300);
  ok(JSON.parse(w.localStorage.getItem('trainer_v2::added::SAA-C03') || '[]').length === 0,
     'pasted question can be deleted');

  /* ---------- 12. unlettered options, no answer line, "(Select TWO.)" ---------- */
  const plain = [
    '1. Question',
    'An online events registration system is hosted in AWS and uses ECS to host its front-end tier and an RDS configured with Multi-AZ for its database tier. What are the events that will make Amazon RDS automatically perform a failover to the standby replica? (Select TWO.)',
    '',
    'Loss of availability in primary Availability Zone',
    'Compute unit failure on secondary DB instance',
    'Storage failure on primary',
    'In the event of Read Replica failure',
    'Storage failure on secondary DB instance'
  ].join('\n');

  nav('data'); await sleep(150);
  d.getElementById('pasteBox').value = plain;
  d.getElementById('pasteParse').click(); await sleep(200);
  let pd = [...d.querySelectorAll('#pastePreview .draft')];
  ok(pd.length === 1, `unlettered source parsed into ${pd.length} question`);
  ok(pd.length === 1 && pd[0].querySelectorAll('ol li').length === 5,
     'all 5 plain-line options recovered without letters');
  ok(pd.length === 1 && !pd[0].querySelector('.qt').textContent.trim().startsWith('Question'),
     'the bare "Question" heading line was stripped from the stem');
  ok(pd.length === 1 && pd[0].querySelector('.qt').textContent.includes('online events registration'),
     'stem captured');
  ok(pd.length === 1 && pd[0].textContent.includes('select 2'), '"(Select TWO.)" detected and shown');
  ok(pd.length === 1 && pd[0].querySelector('.warnline').textContent.includes('tick the 2 correct'),
     'missing answer is flagged with the expected count');

  // tick only one -> still blocked, with a count-specific message
  pd[0].querySelector('[data-letter="A"]').click(); await sleep(120);
  pd = [...d.querySelectorAll('#pastePreview .draft')];
  ok(pd[0].querySelector('.warnline').textContent.includes('asks for 2 answers'),
     'ticking too few answers is caught');

  // tick the real second answer, assign subject, add
  pd[0].querySelector('[data-letter="C"]').click(); await sleep(120);
  pd = [...d.querySelectorAll('#pastePreview .draft')];
  let psel = pd[0].querySelector('[data-f="domain"]');
  psel.value = 'Design Resilient Architectures';
  psel.dispatchEvent(new w.Event('change')); await sleep(120);
  pd = [...d.querySelectorAll('#pastePreview .draft')];
  const ptop = pd[0].querySelector('[data-f="topic"]');
  ptop.value = 'RDS Multi-AZ vs read replicas';
  ptop.dispatchEvent(new w.Event('change')); await sleep(120);
  pd = [...d.querySelectorAll('#pastePreview .draft')];
  ok(!pd[0].classList.contains('bad'), 'draft ready once 2 answers and a subject are set');

  d.getElementById('draftAdd').click(); await sleep(400);
  const plainAdded = JSON.parse(w.localStorage.getItem('trainer_v2::added::SAA-C03') || '[]');
  ok(plainAdded.length === 1 && plainAdded[0].type === 'multi' && plainAdded[0].correct.length === 2,
     'added as a multi-answer question with both answers');
  ok(plainAdded[0].options.length === 5 && plainAdded[0].options[0].id === 'A',
     'options stored with generated letters');

  // bullet-prefixed variant
  d.getElementById('pasteBox').value =
    'Which service stores objects?\n\n- Amazon S3\n- Amazon EBS\n- Amazon EFS\nAnswer: A';
  d.getElementById('pasteParse').click(); await sleep(200);
  const bd = [...d.querySelectorAll('#pastePreview .draft')];
  ok(bd.length === 1 && bd[0].querySelectorAll('ol li').length === 3,
     'bullet-prefixed options parsed and bullets stripped');
  ok(bd[0].querySelectorAll('ol li.ans').length === 1, 'answer line still honoured alongside plain options');

  /* ---------- 13. option order is shuffled, and stable within a mock ---------- */
  nav('mock'); await sleep(120);
  d.getElementById('mockStart').click(); await sleep(300);
  const palN = d.querySelectorAll('#mockPal button').length;

  // the mock draws from the built-in bank plus anything pasted in earlier
  const pasted = JSON.parse(w.localStorage.getItem('trainer_v2::added::SAA-C03') || '[]');
  const lookup = [...BANKS['SAA-C03'], ...pasted];

  const positions = {};
  let firstQOrder = null;
  for (let i = 0; i < palN; i++) {
    d.querySelectorAll('#mockPal button')[i].click(); await sleep(0);
    const qid = idOf('#mockHost');
    const mq = lookup.find(x => x.id === qid);
    if (!mq) continue;
    const shown = [...d.querySelectorAll('#mockHost .opt')].map(o => o.dataset.id);
    if (i === 0) firstQOrder = shown.slice();
    const idx = shown.indexOf(mq.correct[0]);
    positions[idx] = (positions[idx] || 0) + 1;
  }
  const total = Object.values(positions).reduce((a,b) => a+b, 0);
  const atA = (positions[0] || 0) / total;
  ok(atA < 0.5, `correct answer is not stuck at position A (${(atA*100).toFixed(0)}% at A over ${total} questions)`);
  ok(Object.keys(positions).length >= 3,
     `correct answer appears in ${Object.keys(positions).length} different positions`);

  // letters shown must be sequential A,B,C,... regardless of underlying ids
  d.querySelectorAll('#mockPal button')[0].click(); await sleep(0);
  const letters = [...d.querySelectorAll('#mockHost .opt .k')].map(e => e.textContent);
  ok(letters.join('') === 'ABCDEFGH'.slice(0, letters.length),
     'displayed letters are sequential from A');

  // navigating away and back must preserve the shuffled layout
  d.querySelectorAll('#mockPal button')[1].click(); await sleep(0);
  d.querySelectorAll('#mockPal button')[0].click(); await sleep(0);
  const backOrder = [...d.querySelectorAll('#mockHost .opt')].map(o => o.dataset.id);
  ok(backOrder.join() === firstQOrder.join(), 'option order stays stable across mock navigation');

  // feedback letters must match what was displayed
  nav('practice'); await sleep(200);
  const pq = lookup.find(x => x.id === idOf('#practiceHost'));
  const shownIds = [...d.querySelectorAll('#practiceHost .opt')].map(o => o.dataset.id);
  const wrongPick = shownIds.find(id => !pq.correct.includes(id));
  d.querySelector(`#practiceHost .opt[data-id="${wrongPick}"] input`).click();
  d.querySelector('#practiceHost [data-submit]').click(); await sleep(120);
  const expectLetters = pq.correct.map(id => 'ABCDEFGH'[shownIds.indexOf(id)]).sort().join(', ');
  ok(d.querySelector('#practiceHost .fb h4').textContent.includes(expectLetters),
     `feedback names the displayed letter(s) "${expectLetters}", not the bank's ids`);

  /* ---------- 14. Measure tab ---------- */
  nav('measure'); await sleep(200);
  ok(d.getElementById('measure').classList.contains('active'), 'Measure view opens');
  ok(d.getElementById('viewTitle').textContent === 'Exam readiness', 'topbar titles the Measure view');
  const gates = d.querySelectorAll('#readyGates .hrow');
  ok(gates.length === 5, `five readiness gates rendered (${gates.length})`);
  ok(/\/ 5 gates/.test(d.getElementById('readyFig').textContent),
     'headline shows gates passed out of five');
  const word = d.getElementById('readyWord').textContent;
  ok(['Ready','Getting there','Not ready'].includes(word),
     `verdict is a text label, not colour alone ("${word}")`);
  ok(d.getElementById('readyGap').textContent.length > 0, 'names the next gate to clear');

  const floors = d.querySelectorAll('#floorChart .hrow');
  ok(floors.length === 4, `domain floor chart shows all 4 domains (${floors.length})`);
  ok(d.querySelectorAll('#floorChart .track > u').length === 4,
     'each domain bar carries the 70% floor marker');
  ok(d.querySelectorAll('#covChart .stack > i').length >= 1, 'coverage stack rendered');
  ok(d.querySelector('#calNote table.tv') !== null, 'calibration note renders its comparison table');

  // every chart must have a table-view twin
  ok(d.querySelectorAll('#readyGates .tvbtn').length === 1 &&
     d.querySelectorAll('#floorChart .tvbtn').length === 1,
     'gates and floors each offer a table view');

  // re-entering must not stack duplicate table buttons
  nav('dashboard'); await sleep(80); nav('measure'); await sleep(120);
  ok(d.querySelectorAll('#readyGates .tvbtn').length === 1,
     'revisiting Measure does not duplicate controls');

  // readiness must be judged on first attempts only
  const before = d.getElementById('readyFig').textContent;
  ok(typeof before === 'string' && before.length > 0, 'readiness figure is populated');
  const saved = JSON.parse(w.localStorage.getItem('trainer_v2::SAA-C03') || '{}');
  const firsts = Object.values(saved.questions || {}).filter(x => x.first === 0 || x.first === 1);
  ok(firsts.length > 0, 'first-attempt outcome is recorded on answered questions');
  ok(firsts.every(x => x.first <= x.attempts),
     'first-attempt flag is consistent with the attempt count');

  console.log('\n--- PASS (' + pass.length + ') ---');
  pass.forEach(p => console.log('  ok   ' + p));
  if (fail.length) { console.log('\n--- FAIL (' + fail.length + ') ---'); fail.forEach(f => console.log('  FAIL ' + f)); }
  if (errs.length) { console.log('\n--- PAGE ERRORS (' + errs.length + ') ---'); errs.forEach(e => console.log('  ' + e)); }
  else console.log('\nno page errors');
  dom.window.close();
  process.exit(fail.length || errs.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
