# Contributing to the Frontend Engineering Bootcamp

This repository is a one-person training programme with a mentor reviewing Pull Requests. The workflow below is the same one used on professional frontend teams, deliberately.

## Ground rules

- `main` is protected. Never push to it directly.
- One challenge per branch and per Pull Request.
- Do not edit public tests to make a solution pass. If a test is genuinely wrong, say so in the PR with evidence.
- Do not commit `node_modules`, build output, `.env` files or anything in `data/processed`.
- Do not modify or regenerate `data/raw` unless the challenge explicitly asks for it. The data is an input contract.
- Every PR must pass CI before review.

## Branch naming

```text
challenge/week-01-day-01
challenge/week-01-day-02
fix/<short-description>
docs/<short-description>
```

## Step-by-step workflow

### 1. Start from the latest `main`

```bash
git switch main
git pull
git switch -c challenge/week-01-day-01
```

### 2. Read before coding

Read the challenge README and the relevant sections of `data/DATA_DICTIONARY.md`. Spend the first 10 minutes writing down:

- what the function receives and returns;
- which data sources are involved;
- which edge cases the tests describe;
- what is explicitly out of scope.

### 3. Implement in small steps

Run the focused test suite while you work:

```bash
npm run test:watch
```

Keep the implementation readable. Prefer clear names over clever one-liners. Add comments only where the intent is not obvious from the code.

### 4. Run the full local validation

```bash
npm run typecheck
npm run lint
npm run data:validate
npm test
```

All four must pass. `npm run validate` runs them in sequence.

### 5. Commit

Write commits that describe intent, not file names:

```text
feat(day-01): implement token-based name search

Handles query trimming, case folding and all-token matching.
```

```text
test(day-01): activate acceptance suite
docs(day-01): explain normalisation decisions
fix(day-01): preserve original product order
```

Do not mix unrelated changes in one commit.

### 6. Push and open a Pull Request

```bash
git push -u origin challenge/week-01-day-01
gh pr create --base main --fill
```

Then complete `.github/PULL_REQUEST_TEMPLATE.md` properly. A PR that only says "implemented the function" will be sent back.

### 7. Wait for CI

The `Validate` workflow runs on every pull request:

- dependency install (`npm ci`);
- TypeScript strict type check;
- ESLint;
- dataset validation;
- determinism check (regenerate data and fail on diff);
- Vitest.

If CI fails, read the log, fix the cause locally, and push again. Do not re-run the workflow hoping for a different result.

### 8. Code review

Expect comments on correctness first, then readability, then tests, then performance. Reply to every comment — either with a change or with a reasoned explanation. Resolve conversations only after the reviewer agrees.

### 9. Merge

Squash-merge after approval and a green CI run. Delete the branch afterwards. Do not merge your own PR without approval.

## What a strong PR description contains

The template asks for:

- **What was implemented** — scope, in one paragraph.
- **How it works** — the algorithm, in your own words, including normalisation decisions.
- **Alternatives considered** — and why you rejected them.
- **Complexity** — time and space, with the variables defined.
- **Tests** — what you ran and what you added, if anything.
- **Difficulties** — what was hard, what you are unsure about.
- **Production improvements** — what you would change for 10× the data or 10× the traffic.

## Using AI tools

AI assistance is allowed and expected. The standard is simple: you must be able to explain, test and modify the submitted code live, without the tool. If you cannot, the submission is not complete.

When you use AI, verify the output against the tests and the dataset. "The model said so" is not evidence.

## Definition of done for a challenge

- [ ] The focused acceptance suite passes (not skipped).
- [ ] `npm run validate` passes locally.
- [ ] No test files were weakened or edited to fit the implementation.
- [ ] The PR template is fully answered.
- [ ] CI is green.
- [ ] All review conversations are resolved.

## Reporting problems with the repository

If the dataset, generator, loader or CI is broken, open a separate PR or issue with a minimal reproduction. Do not hide infrastructure problems inside a challenge PR.
