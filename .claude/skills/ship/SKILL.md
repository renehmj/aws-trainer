---
name: ship
description: Validate the banks, run both test suites, measure question fidelity, then commit, push and confirm CI and the live site. Use when changes to the trainer are ready to go out.
---

# Ship

The full verify-and-deploy loop for aws-trainer. Run every step; do not skip to the commit.

## 1. Validate and test

```bash
cd /root/projects/saa-trainer
docker run --rm --network host -v /root/projects/saa-trainer:/w -w /w node:22-alpine sh -c \
  'node tests/validate-bank.js 2>&1 | tail -3
   npm install --no-audit --no-fund --silent >/dev/null 2>&1
   BASE_URL=http://192.168.66.4:8080 node tests/ui.test.js 2>&1 | grep -E "^--- (PASS|FAIL)|^  FAIL|no page|HARNESS"
   BASE_URL=http://192.168.66.4:8080 node tests/engine.test.js 2>&1 | grep -E "^--- (PASS|FAIL)|^  FAIL"'
rm -rf node_modules package-lock.json
```

**Read the output.** Do not chain the commit off this command — Docker exits 0 even when the
suite fails. Stop and fix anything that is not PASS with zero failures.

## 2. If questions changed, measure fidelity

Check the new batch against the spec before shipping: stem median ~73 words, ~38% qualifier,
~16% multi-answer, and the correct answer as the single longest option no more than ~25% of the
time. The last one has regressed twice — trim justification out of the correct option and into
`explanation`, then re-measure. Report the numbers rather than asserting they are fine.

## 3. Commit and push

```bash
export GIT_SSH_COMMAND="ssh -i /home/renehmj/.ssh/id_ed25519 -o IdentitiesOnly=yes -o BatchMode=yes"
git add -A && git commit -q -m "<type>: <what changed and why>" && git push -q origin main
```

Explain the reasoning in the message — it is the one place detail is welcome.

## 4. Confirm it actually landed

```bash
SHA=$(git rev-parse HEAD)
until [ "$(gh run list --limit 2 --json status,headSha -q '[.[]|select(.headSha=="'$SHA'" and .status!="completed")]|length')" = "0" ] \
   && [ "$(gh run list --limit 2 --json headSha -q '[.[]|select(.headSha=="'$SHA'")]|length')" = "2" ]; do sleep 10; done
gh run list --limit 2 --json name,conclusion -q '.[] | "  \(.name): \(.conclusion)"'
curl -s "https://renehmj.github.io/aws-trainer/bank-saa-c03.js?x=$RANDOM" | grep -c "^    domain:"
git status --porcelain | wc -l
```

Both workflows must read `success`, the live question count must match what you expect, and the
working tree must be clean.

## 5. Report

Two or three lines: what shipped, the live count, and the one thing he should do next. If a test
failed or you skipped something, say so plainly.
