# AWS Certification Adaptive Trainer

[![CI](https://github.com/renehmj/aws-trainer/actions/workflows/ci.yml/badge.svg)](https://github.com/renehmj/aws-trainer/actions/workflows/ci.yml)
[![Pages](https://github.com/renehmj/aws-trainer/actions/workflows/pages.yml/badge.svg)](https://github.com/renehmj/aws-trainer/actions/workflows/pages.yml)

A self-contained adaptive practice app covering four AWS certification paths —
SAA-C03, DVA-C02, SAP-C02 and DOP-C02. Plain HTML/CSS/JS, no framework, no build step
and no backend: every answer, score and mock result stays in your own browser.

**Live: https://renehmj.github.io/aws-trainer/**

166 original practice questions written from the official exam guides and AWS
documentation. Nothing here is copied from any commercial question bank.

**Each path is fully separate** — its own question bank, its own domains and exam
rules, and its own adaptive progress. Working on SAA never moves a number on DVA.

| Path | Code | Exam | Bank |
|---|---|---|---|
| Solutions Architect – Associate | SAA-C03 | 65q / 130min / 720 to pass | 149 questions, all 59 subjects |
| Developer – Associate | DVA-C02 | 65q / 130min / 720 to pass | 8 questions, 8 of 33 subjects |
| Solutions Architect – Professional | SAP-C02 | 75q / 180min / 750 to pass | 16 questions, 16 of 32 subjects |
| DevOps Engineer – Professional | DOP-C02 | 75q / 180min / 750 to pass | 17 questions, 17 of 31 subjects |

Switch paths in the left rail. Progress is stored per path in the browser's
`localStorage` (`trainer_v2::<CERT-ID>`), with JSON export/import covering every path
at once.

## Interface

A permanent left rail holds both navigation levels: the four certification paths at
the top — each with its identity colour, live accuracy bar and bank size — and the six
study views below, with icons and a live badge on Review Missed. A slim top bar names
the current view and the active path.

Each path owns a colour (SAA blue, DVA orange, SAP aqua, DOP yellow) and selecting a
path re-tints the whole interface: nav highlight, card markers, chart series, progress
bars. That makes it obvious at a glance which path you are working in. The colour never
carries meaning on its own — the path code always sits beside it.

---

## Publishing and CI (GitHub)

The repository hosts and tests itself on GitHub's free tier.

**GitHub Pages** publishes the app on every push to `main`
(`.github/workflows/pages.yml`). The bank validator runs first, so a broken question can
never reach the live site. Because the app is static and keeps everything in
`localStorage`, the hosted copy needs no server, no database and no account.

**GitHub Actions** runs the full suite on every push and pull request
(`.github/workflows/ci.yml`): bank validation, then the 122-check UI suite and the
12-check adaptive-engine suite driving the real page in jsdom.

Both are free and unlimited for public repositories.

### First-time setup

```bash
git init
git add .
git commit -m "AWS certification adaptive trainer"
git branch -M main
git remote add origin https://github.com/renehmj/aws-trainer.git
git push -u origin main
```

Then in the repository: **Settings → Pages → Source → GitHub Actions**. The next push
publishes the site. Replace `renehmj` in this README with your GitHub username so the
badges and live link resolve.

### Running the tests locally

```bash
npm install                    # jsdom, the only dependency
node tests/validate-bank.js    # no server needed
npm run serve &                # python3 -m http.server 8080
npm run test:ui
npm run test:engine
```

`BASE_URL` overrides the target, so the suites can also run against the Docker container
on port 8080.

---

## Running it

The stack is already up. From anywhere on the LAN:

    http://192.168.66.4:8080

From this machine: <http://localhost:8080>

```bash
docker compose up -d      # start
docker compose ps         # status
docker compose logs -f    # nginx access/error log
docker compose restart    # restart
docker compose down       # stop and remove the container
```

The container has `restart: unless-stopped` and the Docker service is enabled at
boot, so it comes back automatically after a reboot.

### Editing questions

The project **directory** is bind-mounted into the container. Edit a bank file,
refresh the browser, and the new questions are live — no rebuild, no restart. nginx
sends `Cache-Control: no-store` so the browser never serves a stale bank.

> **Why the whole directory and not individual files.** A single-file bind mount is
> pinned to that file's inode. Editors that save by writing a temp file and renaming
> it over the original — VS Code does this in several configurations — replace the
> inode, and the container then serves the *old* file forever with no error anywhere.
> Mounting the directory avoids this. `nginx.conf` returns 404 for `*.md`, `*.yml`,
> `*.conf`, `Dockerfile` and dotfiles so the non-app files are not exposed.

### Reaching it from a phone or another device

**Important:** this app runs inside a QEMU virtual machine on a NAT'd network
(`192.168.66.0/24`, gateway `192.168.66.1` with a virtual MAC, no other hosts on the
segment). That address is reachable **only from the Mac hosting the VM** — not from
phones, tablets or anything else on the real wifi. Three ways to fix that:

**1. Bridged networking (best, permanent).** In the VM application's network settings,
change the adapter from Shared/NAT to Bridged. The VM then gets an address from the home
router and every device on the wifi can reach it directly. The IP will change — check it
afterwards with `ip -4 addr show enp0s1`.

**2. SSH tunnel from the Mac (fastest, nothing to reconfigure).** On the Mac:

```bash
ipconfig getifaddr en0                                   # the Mac's wifi IP
ssh -N -L 0.0.0.0:8080:localhost:8080 root@192.168.66.4   # leave running
```

Then browse to `http://<Mac-wifi-IP>:8080` from the phone. This only works while the
Mac is awake and the command is running.

**3. Port forwarding in the VM app.** Add a rule forwarding host port 8080 to
`192.168.66.4:8080`, then use `http://<Mac-wifi-IP>:8080`.

Once reachable, add it to the home screen (Safari: Share → Add to Home Screen; Chrome:
menu → Add to Home screen). A web manifest and icons are included, so it opens full
screen with no browser chrome. The layout collapses to a single column below 900px.

**Progress is per browser.** The phone keeps a separate record from the laptop —
`localStorage` is not shared. Move it with Data → Export all paths, then Import.

### Changing the port

Edit the `ports:` line in `docker-compose.yml` (`"8080:80"` → `"9000:80"`) and run
`docker compose up -d`.

### Baked image (for deploying elsewhere later)

```bash
docker build -t aws-trainer .
docker run -d -p 8080:80 --name aws-trainer aws-trainer
```

Use this only for deployment. For daily study the compose setup is better because
edits are instant.

---

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app — markup, inline CSS, and the inline adaptive engine |
| `certs.js` | The four paths: domains, weights, exam rules |
| `bank-saa-c03.js` | SAA-C03 questions |
| `bank-dva-c02.js` | DVA-C02 questions |
| `bank-sap-c02.js` | SAP-C02 questions |
| `bank-dop-c02.js` | DOP-C02 questions |
| `nginx.conf` | Serves the static files with caching disabled |
| `docker-compose.yml` | Local run with the directory bind-mounted (live editing) |
| `Dockerfile` | Baked image for deployment |
| `manifest.json`, `icon-*.png` | Home-screen install support on phones |
| `tests/validate-bank.js` | Bank validation — schema, syllabus, answer keys, blueprint mix |
| `tests/ui.test.js` | 122 checks driving the real page in jsdom |
| `tests/engine.test.js` | 12 checks sampling the real adaptive weighting |
| `.github/workflows/` | CI and GitHub Pages deployment |

---

## Modes

- **Dashboard** — readiness figure against the 85% book-the-exam threshold, accuracy
  by domain with the readiness marker, subject-mastery breakdown, a mock-score trend
  line with the pass mark drawn in, and clickable weakest subjects. Every chart has a
  table view.
- **Subjects** — a permanent left sidebar listing every subject (`domain :: topic`)
  grouped by domain, each with a status dot and current accuracy. Click one to open an
  adaptive session on it; the sidebar stays visible so you can switch subjects
  mid-session. Filter by name, hide anything already at 85%, collapse domains, or take
  a whole domain at once.
- **Practice** — endless adaptive stream across the whole path.
- **Mock Exam** — full-length, domain-weighted to the path's blueprint, real countdown,
  scored on that exam's own scale, question palette with flagging, per-domain
  breakdown, and full answer review. If the bank is smaller than a full exam it uses
  what exists and scales the time limit proportionally.
- **Review Missed** — every missed question resurfaces until answered correctly.
- **Data** — paste your own questions in (see below), manage what you have pasted, and
  export every path's progress and pasted questions as one JSON bundle.

---

## Adding questions

Append objects to the array in the relevant bank file. `window.BANKS["<CERT-ID>"]`
is the global each file registers.

```js
{
  id: "sec-009",                           // unique within the path; use the domain prefix
  domain: "Design Secure Architectures",   // must exactly match a domain in certs.js
  topic: "IAM policy evaluation",          // free text; drives the adaptive engine
  difficulty: "medium",                    // "easy" | "medium" | "hard"
  type: "single",                          // "single" | "multi"
  question: "…scenario…",
  options: [ {id:"A", text:"…"}, {id:"B", text:"…"}, {id:"C", text:"…"}, {id:"D", text:"…"} ],
  correct: ["B"],                          // array of correct option ids
  explanation: "Why the correct answer is correct.",
  whyWrong: { A: "…", C: "…", D: "…" }     // optional but this is where learning happens
}
```

Domain strings must match `certs.js` exactly — the domain prefixes to use for ids are
in that file too. Keep each bank roughly proportional to its exam weights so mocks
stay realistic.

**Copy `topic` strings verbatim from `certs.js`.** Each domain there carries a
canonical topic list — the syllabus. The engine tracks accuracy per `domain :: topic`,
so a near-miss label (`"SQS decoupling"` vs `"Decoupling with SQS"`) silently creates a
second subject. Subjects browse from the union of the syllabus and whatever the bank
uses, so a syllabus subject with no questions shows as a coverage gap with a hollow
dot, and the dashboard reports syllabus coverage.

Aim for roughly 5–8 questions per subject as a bank matures.

### Pasting your own questions

The Data view has a paste box that takes question text in whatever shape you have it:

- **Numbered or not** — `1.`, `Q3)`, `Question 7:`, a bare `1. Question` heading, or nothing.
- **Lettered options** — `A)`, `A.`, `A -`, `(A)`.
- **Unlettered options** — one plain line each, with or without `-` / `*` / `•` bullets.
  Letters are generated. This is the common shape when copying from a practice site.
- **Answers** — `Answer: B`, `Correct answer: B`, `Answers: A, C`, `Key: BD`. If the
  source has no answer line, tick the correct options on the draft instead.
- **`(Select TWO.)`** — detected from the stem and enforced: the draft will not be added
  until exactly that many options are ticked.
- **Explanations** — from an `Explanation:` / `Rationale:` / `Why:` line.

Single vs multi is inferred from how many answers end up ticked.

Each draft must be assigned a **domain and syllabus subject** before it can be added —
that keeps pasted material on the same canonical labels as everything else, so it feeds
the adaptive engine properly. Drafts missing an answer or a subject are flagged and
held back rather than added half-formed.

Added questions are stored in the browser per path (`trainer_v2::added::<CERT-ID>`) and
mixed into the bank, so they appear in practice, subject sessions and mocks immediately.
They travel with the export bundle. "Show all as JSON" dumps them for handing back to be
rewritten into polished originals with proper per-option explanations.

### Adding a fifth path

Append an entry to `certs.js`, create a matching `bank-<id>.js` that registers
`window.BANKS["<ID>"]`, and add a `<script>` tag for it in `index.html`.

---

## How the adaptive engine works

State lives in `localStorage` under `trainer_v2::<CERT-ID>` — one independent record
per path:

```js
{ v, seq,
  questions: { [id]: {attempts, correct, lastSeen} },
  topics:    { "domain :: topic": {attempts, correct} },
  missed:    [id, …],
  history:   [ {ts, total, correct, score, passed, byDomain}, … ] }
```

`weightFor(q)` produces a selection weight:

| Condition | Effect |
|---|---|
| Topic never attempted | baseline 1.2 |
| Topic attempted | `0.25 + (1 − accuracy) × 2.0` |
| Question never seen | × 1.8 |
| Question accuracy below 50% | × 1.5 |
| Question seen within the last 12 answers | damped toward 0.05 |

`pickWeighted()` then samples the pool by weight. In testing, a subject at 0% accuracy
is served about **9.9× more often** than uniform selection would, while the picker
still reaches every question in the bank. Each path computes this from its own
statistics only.

Mock exam answers are recorded through the same `record()` path, so mocks feed the
adaptive model rather than sitting outside it.

**When editing the engine, preserve:** the `trainer_v2::<id>` key scheme and state
shape (or existing progress is lost), the exact domain strings in `certs.js`, and the
`window.BANKS` / `window.CERTS` globals. Progress from the original single-path
version (`saa_trainer_v1`) is migrated into the SAA path automatically on first load.

---

## Chart conventions

The dashboard follows one rule set so the charts read as a system: a single series
colour for magnitude bars, fixed status colours (mastered / getting there / needs
work / not started) that **always** carry a text label rather than relying on colour
alone, hairline recessive grid and axes, selective direct labels only, a hover
tooltip on every chart, and a table-view twin for every chart. The palette was
validated against this app's actual `#171a21` chart surface — all colours clear 3:1
contrast.

The four path identity colours are categorical slots 1–4 and were validated as a set
on the same surface: lightness band, chroma floor, colour-blind separation (worst
adjacent pair ΔE 8.4 protan) and contrast all pass.

---

## Current status

- **149 syllabus subjects** across the four paths (SAA 53, DVA 33, SAP 32, DOP 31).
- **190 questions**: 149 SAA-C03 (all 59 subjects), 8 DVA-C02 (8 of 33), 16 SAP-C02
  (16 of 32), 17 DOP-C02 (17 of 31). Every path is practiceable.
- SAA domain mix matches the real blueprint exactly (30/26/24/20) and builds a
  full-length 65-question mock.
- Verified end to end against the running container: **122 jsdom UI checks** and
  **12 empirical engine checks**, including that each path keeps entirely separate
  progress and adapts on its own statistics. No page errors.

Next: deepen SAA-C03 toward 5–8 questions per subject (~250–400) so consecutive mocks
never repeat, then fill DVA-C02. SAP-C02 and DOP-C02 cover roughly half their subjects
and their domain mix is within about 3 points of blueprint — both even out as they grow.


---

## Using this yourself

MIT licensed, and it needs nothing but a browser — open the live link, or clone and open
`index.html`. Progress is per browser in `localStorage`; nothing is sent anywhere.

To adapt it to a different certification, edit `certs.js` (domains, weights, exam rules,
syllabus) and add a matching `bank-<id>.js`. The engine, dashboard, mock exam and subject
browser are all driven from that configuration, so nothing else needs changing.

Contributions of well-formed original questions are welcome. Run
`node tests/validate-bank.js` before opening a pull request — CI runs the same check.
