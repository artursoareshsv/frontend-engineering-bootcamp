# Interview Guidelines

This document defines how the mentor runs the technical interview built on the bootcamp. It is a structured evaluation of **understanding**, not memory.

## Principles

1. **The work is public.** Everything the candidate wrote is in the PR, with public tests. There are no hidden tests and no separate mentor repository.
2. **Explanation beats recall.** A candidate who can derive an algorithm is stronger than one who recites it.
3. **Tools are allowed.** Documentation and AI assistants are permitted. The candidate must be able to verify the output and change it live without tools.
4. **Evidence over impressions.** Every score must point to something the candidate said, wrote or did.
5. **One topic until it is exhausted.** Follow-ups matter more than covering many questions superficially.

## Roles

| Role | Responsibilities |
| --- | --- |
| Mentor / interviewer | Runs the agenda, asks questions, introduces the live change, scores, gives feedback |
| Candidate | Explains the implementation, answers questions, makes the live change, asks questions |

Avoid interviewing alone: if possible, a second reviewer observes and compares notes.

## Before the session

- [ ] The candidate's PR is merged or available with green CI.
- [ ] The interviewer has read the diff, the tests and the PR description.
- [ ] The interviewer has chosen **two** live-change scenarios from the bank below (one primary, one fallback).
- [ ] The dataset and repository are running locally for both parties.
- [ ] A timer and the rubric are open.

## Session structure (75 minutes)

| Time | Segment | Purpose |
| ---: | --- | --- |
| 0–5 | Framing | Agenda, expectations, permission to think aloud |
| 5–15 | Candidate walkthrough | Understand the solution in their own words |
| 15–30 | Conceptual deep dive | Probe JS/TS, data, testing and design understanding |
| 30–50 | Live change | Observe problem-solving under realistic pressure |
| 50–60 | Complexity and scale | Big O, memory, production trade-offs |
| 60–70 | Feedback | Specific, evidence-based, rubric-linked |
| 70–75 | Candidate questions and next steps | Candidate experience and plan |

### 5–15: Walkthrough prompts

- "Walk me through the request from the UI to the returned products."
- "Which files does your code read, and what does it assume about them?"
- "Why did you choose this normalisation point?"
- "What behaviour here is specified, and what did you decide yourself?"
- "Show me the test that would fail if this line were wrong."

Do not interrupt the first five minutes. Note questions and ask them afterwards.

### 15–30: Conceptual deep dive

Theme A — JavaScript and TypeScript (choose 2–3):

- Difference between `==` and `===` in the code you wrote.
- When does `Array.prototype.sort` mutate, and what does stability mean?
- `Map` vs plain object vs `Set` in your pipeline.
- What does `readonly` actually guarantee? Where does it stop?
- How would you type a filter that may be absent?
- `structuredClone` vs spread: what is shared and what is copied?

Theme B — Data handling:

- Which join is a left join here, and what happens if you used an inner join?
- How do you aggregate stock across warehouses, and how do duplicate rows affect it?
- How do you calculate an average rating when some ratings are `null`?
- Where do mixed date formats break your assumptions?
- What do you do with products that reference a category that does not exist?

Theme C — Testing and quality:

- What does your test suite *not* cover? Why is that acceptable today?
- How would you test this if the dataset were unavailable?
- Which test would catch a regression in ordering?
- What would make you split this function?

Theme D — Design and React-adjacent reasoning:

- Where would this run in a React app: client, hook, or server?
- How would you debounce the query without losing the last keystroke?
- What would you put in the URL and why?
- Where would you cache and how would you invalidate?
- What is the boundary between "data layer" and "view layer" here?

### 30–50: Live change

Pick one scenario and ask the candidate to implement it in the repository, with tests. The fallback is used only if the primary is finished early or blocks for environment reasons.

The interviewer should:

- state the requirement precisely, including edge cases;
- give the candidate two minutes to plan before typing;
- allow documentation and AI tools, but ask them to narrate what they accept;
- ask for a test before or alongside the change;
- stop at 20 minutes even if incomplete, and ask what they would do next.

### 50–60: Complexity and scale

- Define `n`, `q`, `k`, `t` explicitly before answering.
- Ask for worst case, average case and memory.
- Ask what changes at 100× data and 100× traffic.
- Ask which optimisation they would reject and why.
- Challenge one number: "You said 12 ms — measured or estimated? On what input?"

### 60–70: Feedback

Use the rubric. Give at least:

- two specific strengths with evidence;
- two specific gaps with evidence;
- one concrete action for the next challenge;
- the overall score band and what it means for interview readiness.

Avoid vague praise ("good job") and vague criticism ("needs improvement").

## Live-change scenario bank

Choose according to the day's challenge. Each scenario lists only the requirement — the candidate designs the solution.

| # | Scenario | Probes |
| --- | --- | --- |
| 1 | Make the **last** query token optional (a prefix still matches) | Scoring, token handling, test design |
| 2 | Switch from substring to **whole-word** matching | Tokenisation, word boundaries, Unicode |
| 3 | Add an `AND`/`OR` mode for tokens | API design, composition, backwards compatibility |
| 4 | Exclude `discontinued` products from results | Data plumbing, hidden coupling, defaults |
| 5 | Sort matches so that names starting with the query rank first | Comparators, stability, performance |
| 6 | Support multiple categories in one filter | Type changes, refactoring cost, tests |
| 7 | Fold accents (`café` matches `cafe`) | Unicode normalisation, scope, trade-offs |
| 8 | Return a paginated result object instead of an array | API design, migration of callers, edge cases |
| 9 | Add a second data source (brands) to the result model | Loader changes, joins, fixture updates |
| 10 | Move normalisation from search into the loader | Layer boundaries, duplicated logic, performance |

### Scenario integrity

- Do not give implementation hints beyond the requirement.
- If the candidate asks a clarifying question, answer it precisely; that is good engineering.
- If the candidate is stuck for more than five minutes, narrow the requirement, not the standard.
- Record whether the candidate wrote a test first, after, or not at all.

## Working with AI tools during the session

Allowed, with three conditions:

1. **Declare it.** "I'm asking the assistant for the regex" is fine.
2. **Verify it.** The candidate must run the tests and read the output.
3. **Own it.** After the change, the candidate must explain every line, including code they did not type.

If the candidate cannot explain accepted AI output, treat that part of the solution as not demonstrated. A candidate who uses AI effectively and verifies it should not be penalised.

## Question bank: follow-ups

Use these to go deeper when an answer is shallow.

- "Why that, and not the alternative?"
- "What breaks if the array is empty?"
- "What if the same product appears twice?"
- "What if the name is 4 KB long?"
- "Where does this fail silently?"
- "How would you prove that to me?"
- "What would you measure first?"
- "Which line would you delete to test your own understanding?"

## Signals

### Green flags

- States assumptions before coding.
- Writes or updates a failing test first.
- Explains trade-offs with concrete consequences.
- Notices data quality issues without being prompted.
- Uses named complexity variables and keeps them consistent.
- Says "I don't know, but I would find out by…" and proposes a method.
- Keeps the diff focused during the live change.

### Red flags

- Cannot explain own code or AI-generated code.
- Changes tests to make failures disappear.
- Claims complexity without defining variables.
- Adds unrelated features to a scoped task.
- Hand-waves data issues ("it probably works").
- Ignores failing CI or blames the environment without checking.
- Cannot make a small change without rewriting the module.

## After the session

1. Complete the rubric within 24 hours, while notes are fresh.
2. Send written feedback using the template below.
3. Agree one or two concrete actions for the next day/challenge.
4. If the candidate is re-interviewed, use a different live-change scenario.

### Feedback template

```text
Overall: <score band> (<total>/100)

Strengths
- <criterion>: <specific evidence>

Gaps
- <criterion>: <specific evidence and consequence>

Live change
- Requirement: <scenario>
- Outcome: <completed / partially / not completed>
- Evidence: <test added? edge cases? explanation?>

Next actions
1. <concrete action>
2. <concrete action>
```

## Fairness and consistency

- Use the same rubric for every candidate and every day.
- Do not score tool usage itself; score the resulting understanding.
- Do not penalise accent, fluency or typing speed. Judge technical clarity.
- If two interviewers disagree by more than one point on a criterion, discuss the evidence before finalising.
- Keep notes factual and shareable; the candidate may read them.
