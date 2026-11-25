# Evaluation Rubric

A consistent, evidence-based rubric for scoring the bootcamp interview. Nine criteria, a five-point scale, explicit weights, and concrete examples of weak, acceptable and strong performance.

Use it together with [`interview-guidelines.md`](./interview-guidelines.md).

---

## 1. Scale

| Score | Label | Meaning |
| ---: | --- | --- |
| 1 | Absent / misleading | No evidence, or confidently wrong |
| 2 | Weak | Partial, fragile, or requires heavy prompting |
| 3 | Acceptable | Correct and defensible for a junior, with minor gaps |
| 4 | Strong | Complete, well-reasoned, handles edge cases unprompted |
| 5 | Exceptional | Would raise the bar for a junior hire; teaches the interviewer something |

**Score what you observed, not what you assume.** A candidate who wrote correct code but cannot explain it scores low on communication and autonomy, not on correctness.

---

## 2. Criteria and weights

| # | Criterion | Weight | What it measures |
| ---: | --- | ---: | --- |
| 1 | Problem understanding | 10 | Restating the requirement, scope control, assumptions |
| 2 | Correctness | 20 | Matches the contract, handles edge cases, no regressions |
| 3 | Code quality | 10 | Readability, naming, structure, cohesion |
| 4 | TypeScript usage | 10 | Type safety, nullability, avoiding `any`, API typing |
| 5 | Testing | 10 | Test design, coverage of failure modes, test quality |
| 6 | Problem-solving | 15 | Debugging, live change, adapting without rewriting |
| 7 | Complexity analysis | 10 | Big O with defined variables, memory, measurement |
| 8 | Communication | 10 | Explanation, trade-offs, listening, precision |
| 9 | Autonomy and research | 5 | Independent investigation, verification of tools/docs |

Total: **100 points**. Weighted contribution = `weight × (score / 5)`.

```text
overall = Σ (weight_i × score_i / 5)
```

Example: correctness 4, everything else 3 → `20×0.8 + 80×0.6 = 16 + 48 = 64`.

---

## 3. Descriptors

Each criterion describes performance at 2 (weak), 3 (acceptable) and 4 (strong). Use 1 for absence or harmful misunderstanding, and 5 only for performance clearly beyond the strong anchor.

### 3.1 Problem understanding (10)

| Level | Descriptor | Day 01 example |
| --- | --- | --- |
| Weak (2) | Starts coding before restating the contract; ignores stated scope | Implements ranking or filtering in Day 01, or misses "every token must match" |
| Acceptable (3) | Restates the requirement correctly; identifies main edge cases when prompted | Lists empty query, ordering, immutability after a nudge |
| Strong (4) | Restates the contract precisely, separates specified vs chosen behaviour, flags data assumptions | Explains that only `name` is searched, that accents are not folded, and why the loader trims names |

### 3.2 Correctness (20)

| Level | Descriptor | Day 01 example |
| --- | --- | --- |
| Weak (2) | Passes some tests; fails a core rule | Case-sensitive matching, or returns unsorted-by-query tokens, or mutates input |
| Acceptable (3) | All public tests pass; one edge case still shaky or unexplained | Handles spaces but not tabs until asked |
| Strong (4) | All tests pass and additional self-written cases hold; can explain why each rule is satisfied | Adds a test for a name containing the query twice, or for a 1-character token |

### 3.3 Code quality (10)

| Level | Descriptor | Signals |
| --- | --- | --- |
| Weak (2) | Hard to follow, misleading names, duplicated logic, dead code | Nested ternaries, single-letter variables, commented-out attempts |
| Acceptable (3) | Readable, reasonably named, one clear responsibility | A normalisation step and a filtering step, each understandable in isolation |
| Strong (4) | Simple structure, intention-revealing names, no premature abstraction | Helper names state intent; no framework introduced for a 20-line function |

### 3.4 TypeScript usage (10)

| Level | Descriptor | Signals |
| --- | --- | --- |
| Weak (2) | `any`, unsafe assertions, ignores strict-mode errors | `as any` to silence a complaint, unchecked array access |
| Acceptable (3) | Types describe the data; no unnecessary assertions | `Product[]` in and out, `string` query, no `any` |
| Strong (4) | Uses the type system to prevent invalid states; explains trade-offs | Chooses `readonly`/immutability deliberately, knows when a type cannot help, avoids over-typing |

### 3.5 Testing (10)

| Level | Descriptor | Signals |
| --- | --- | --- |
| Weak (2) | Relies only on the provided tests; cannot write a new one; weakens tests to pass | Deletes or edits an assertion instead of fixing the code |
| Acceptable (3) | Runs the suite, understands failures, can add a basic test | Adds a case for an empty product list |
| Strong (4) | Designs tests for failure modes, not just happy paths; tests behaviour, not implementation | Adds an order-preservation or frozen-input test and explains what it protects |

### 3.6 Problem-solving (15)

Live change is the main evidence.

| Level | Descriptor | Signals |
| --- | --- | --- |
| Weak (2) | Cannot make progress without step-by-step guidance; rewrites unrelated code | Breaks Day 01 tests while implementing the change, or edits the dataset |
| Acceptable (3) | Completes the change with some prompting; keeps tests green | Implements the requirement, adds a test after being reminded |
| Strong (4) | Plans briefly, isolates the change, adds tests, explains impact | Identifies the minimal diff, checks regressions, notes what they would defer |

### 3.7 Complexity analysis (10)

| Level | Descriptor | Signals |
| --- | --- | --- |
| Weak (2) | No complexity, or wrong with no self-correction; undefined variables | "It's O(n)" for an algorithm with a nested scan, when asked for space |
| Acceptable (3) | Correct time complexity with defined variables; space approximate | `O(n × q)` time, `O(r)` output, where `n` products, `q` query length, `r` results |
| Strong (4) | Correct time and space, distinguishes best/average/worst, relates to measurements | Explains why early exit helps typical queries but not worst case; cites a measured number |

### 3.8 Communication (10)

| Level | Descriptor | Signals |
| --- | --- | --- |
| Weak (2) | Vague, defensive, cannot answer "why"; ignores clarifying questions | "It just works"; long detours away from the question |
| Acceptable (3) | Clear explanation of the solution and main decisions | Describes the algorithm and one alternative considered |
| Strong (4) | Structured, precise, names trade-offs and uncertainty honestly | "I chose X because Y; Z would be faster but harder to test; I'm unsure about accented input" |

### 3.9 Autonomy and research (5)

| Level | Descriptor | Signals |
| --- | --- | --- |
| Weak (2) | Waits for instructions; accepts AI output unverified; does not read error messages | Pastes a suggested fix that fails tests, without reading the failure |
| Acceptable (3) | Uses docs and tools independently; verifies results | Looks up `split`/regex behaviour and confirms with a test |
| Strong (4) | Investigates the data and codebase proactively; documents findings | Notices duplicate inventory rows or dirty names unprompted and records the decision |

---

## 4. Hard gates

These override the arithmetic:

| Condition | Effect |
| --- | --- |
| Correctness ≤ 2 | Overall capped at 64 ("Developing") regardless of other scores |
| Candidate cannot explain code they submitted | Correctness evidence is reduced to observed behaviour only; communication ≤ 2 |
| Tests were weakened or `.only` committed | Testing = 1; overall capped at 49 |
| Live change completed by interviewer dictation | Problem-solving ≤ 2 |

---

## 5. Score bands

| Total | Band | Interpretation |
| ---: | --- | --- |
| 90–100 | Exceptional | Ready for international junior interviews; strong on explanation and trade-offs |
| 80–89 | Strong junior | Interview-ready with normal preparation; minor gaps only |
| 65–79 | Interview-ready (borderline) | Solid fundamentals; needs more practice on complexity or live changes |
| 50–64 | Developing | Understands parts of the work; repeat the relevant day before interviewing |
| < 50 | Not ready | Return to fundamentals and redo the challenge with closer mentoring |

Interpretation notes:

- A junior hire is usually **65+ with correctness ≥ 3**.
- 80+ is achievable in a bootcamp week; do not inflate scores to be encouraging.
- 90+ requires clear evidence on the live change and on complexity, not just a complete PR.

---

## 6. Scoring sheet

Copy this into the review notes.

```text
Candidate: ____________________   Date: ____________
Challenge: Week 01 — Day ____     Scenario: ________

#  Criterion                  Weight  Score (1-5)  Weighted
1  Problem understanding         10      ___          ___
2  Correctness                   20      ___          ___
3  Code quality                  10      ___          ___
4  TypeScript usage              10      ___          ___
5  Testing                       10      ___          ___
6  Problem-solving               15      ___          ___
7  Complexity analysis           10      ___          ___
8  Communication                 10      ___          ___
9  Autonomy and research          5      ___          ___
                                        TOTAL        ___/100

Gate applied: none / correctness / integrity / live-change
Band: ______________

Evidence (link to code, test, or quote)
- Strength:
- Gap:
- Live change outcome:

Next actions
1.
2.
```

---

## 7. Worked examples

### Profile A — "Tests pass, explanation thin"

Correctness 4, problem understanding 3, quality 3, TypeScript 3, testing 3, problem-solving 3, complexity 2, communication 2, autonomy 2.

```text
16 + 6 + 6 + 6 + 6 + 9 + 4 + 4 + 2 = 59
```

Band: **Developing**. The code works, but the candidate cannot defend complexity or adapt the solution. Action: repeat Day 01 with explanation drills and a second live change.

### Profile B — "Solid junior, one weak area"

Correctness 4, understanding 4, quality 3, TypeScript 4, testing 3, problem-solving 4, complexity 3, communication 3, autonomy 3.

```text
16 + 8 + 6 + 8 + 6 + 12 + 6 + 6 + 3 = 71
```

Band: **Interview-ready (borderline)**. Action: practise complexity statements and test-first habits; the rest is on track.

### Profile C — "Strong across the board"

Correctness 5, understanding 4, quality 4, TypeScript 4, testing 4, problem-solving 4, complexity 4, communication 4, autonomy 4.

```text
20 + 8 + 8 + 8 + 8 + 12 + 8 + 8 + 4 = 84
```

Band: **Strong junior**. Note that 84 requires 4s everywhere plus perfect correctness; 90+ needs demonstrated exceptional reasoning, not just tidy code.

---

## 8. Calibration checklist

Before finalising a score:

- [ ] Every score points to a concrete observation (quote, line, test, live-change step).
- [ ] Correctness was checked against the public suite, not against how confident the candidate sounded.
- [ ] Communication was judged on technical clarity, not accent or fluency.
- [ ] AI-assisted work was scored on verification and explanation, not on whether a tool was used.
- [ ] The live change was completed within the time box, or the time box was respected.
- [ ] Feedback names one thing to keep and one thing to change.
