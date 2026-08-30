# aws-trainer

Adaptive AWS certification practice trainer. Static single-page app — no framework, no build
step, no backend. All progress lives in the browser's `localStorage`.

Live: https://renehmj.github.io/aws-trainer/ · Local: http://192.168.66.4:8080

## Files that matter

| File | Role |
|---|---|
| `index.html` | The entire app — markup, inline CSS, inline adaptive engine |
| `certs.js` | Certification paths: domains, blueprint weights, canonical `topics` |
| `bank-<cert>.js` | One question bank per path, keyed into `window.BANKS` |
| `tests/validate-bank.js` | Pure Node bank validator — no server needed |
| `tests/ui.test.js` | jsdom UI suite (~147 checks) |
| `tests/engine.test.js` | Adaptive-engine suite (12 checks) |

`/root/projects/inbox/` holds his paid practice material. It is **outside this repo and
gitignored**. Never commit it, never publish it, never quote it into a question.

## Commands

Everything runs in a throwaway container — nothing is installed on the host.

```bash
# validate banks (fast, no server)
docker run --rm -v /root/projects/saa-trainer:/w -w /w node:22-alpine node tests/validate-bank.js

# full suites against the running container
docker run --rm --network host -v /root/projects/saa-trainer:/w -w /w node:22-alpine sh -c \
  'npm install --no-audit --no-fund --silent >/dev/null 2>&1
   BASE_URL=http://192.168.66.4:8080 node tests/ui.test.js
   BASE_URL=http://192.168.66.4:8080 node tests/engine.test.js'
rm -rf node_modules package-lock.json   # always clean up, they are gitignored
```

Git needs `GIT_SSH_COMMAND="ssh -i /home/renehmj/.ssh/id_ed25519 -o IdentitiesOnly=yes"`.

## Rules that have bitten before

**Never chain `git push` off a Docker exit code.** `docker run ... && git push` keys off the
container exiting, not the suite passing, so a failing test still ships. Read the output first.

**Never hard-code counts in tests.** Assertions like `bank.length === 177` or "four paths" have
broken three times as the project grew. Derive them.

**Two answer tells have to stay dead.** The correct answer used to sit at position A 93% of the
time — options are now shuffled at render. The correct option was the single longest 75% of the
time, because it carried a justifying clause the distractors lacked. Put justification in
`explanation`, never in the option text, and re-measure after every batch; the Measure tab reports
both.

**Write questions to the measured spec**, not to feel — see `memory/aws-trainer-question-spec.md`.
Stems ~73 words with competing constraints, ~38% carrying a MOST/LEAST qualifier, ~16%
multi-answer, distractors at comparable length to the answer.

**Copy `topic` strings verbatim from `certs.js`.** The engine tracks accuracy per
`"domain :: topic"`, so a near-miss label silently creates a second subject and the validator
fails on the orphan.

**Domain mix must stay within 3 points of the blueprint weights.** Adding a batch to one domain
alone will trip the validator — spread it.

**GitHub Pages caches HTML for 10 minutes.** The deploy workflow stamps the commit onto script
URLs so a fresh page never pairs with stale JS. If a change "hasn't shipped", check that before
assuming the code is wrong.

## Working style

Answers to him: **very short, with the recommended action immediately after.** He reads to decide,
not to study. Detail belongs in commit messages and in the app, not in chat.
