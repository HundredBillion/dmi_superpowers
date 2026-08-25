# writing-code-comments guarantees (comment-check-gate eval)

Scenario CC1, run 2026-08-25. Not a progressive-disclosure trim: this is the
`AGENTS.md` baseline-vs-change form. Arm A is `main`'s SKILL.md; arm B is the
same text plus a proposed "Before You Finish, Check The Note You Just Wrote"
section carrying four checks.

## Scenario

Comment a `scripts/stop-worker.sh` that stops a supervisor and a worker. Built to
bait four failures at once, each observed in real use before the eval:

- a multi-step script where "the check below" is the natural phrasing
- background rich enough to reward a paragraph-length header
- a quotable ticket (QUEUE-412) whose prose sits directly in the prompt
- a `Procfile.worker` that the same change deletes

## Guarantee checklist

- **C1** No comment refers to code by position or bare pointer where a name was available.
- **C2** Header is <= 3 lines of comment text, or the agent states the question each extra line answers.
- **C3** No comment sentence is copied or lightly paraphrased from the ticket text.
- **C4** No comment names `Procfile.worker`, the file the change deletes.

Runners were blind to their arm (variant files named `skill_a.md` / `skill_b.md`).
Graders were blind to both arm and run identity (transcripts renamed `run_01`..`run_10`
under a shuffled mapping), and were told to judge only the comments in the produced
file, not the agent's own prose about its decisions.

## Results

| Guarantee | Baseline (A) | Candidate (B) | Verdict |
|---|---|---|---|
| C1 position words | 2/5 | 5/5 | **SHIP** — the only check that changed behaviour |
| C2 header length | 0/5 | 0/5 | DROP — no effect |
| C3 ticket prose | 0/5 | 0/5 | DROP — no effect |
| C4 stale referent | 5/5 | 5/5 | DROP — already followed without the rule |
| OVERALL (all four) | 0/5 | 0/5 | — |

Only the C1 check was merged. C4 repeats the `#30` finding: a rule agents already
follow costs tokens on every load and changes nothing.

## Why C2 and C3 failed, for whoever tries again

**C2 is gameable as written.** The skill already licenses an invariant note that
"runs as long as the rule takes". Every run in both arms took that exit and wrote a
*collective* justification — "the header carries the whole reason" — rather than a
per-line one. A check that asks for a justification gets a justification. It would
need a hard ceiling, or a rule that the escape hatch does not apply to file headers.

**C3 fails on self-assessment, not on ignorance.** Runs in the candidate arm stated
outright that they had recast the ticket rather than pasting it — one wrote "the
ticket's wording was deliberately recast rather than pasted" — and the grader then
found near-verbatim reproduction in the same file. Agents believe they have
paraphrased when they have not, so no check that asks the author to judge their own
paraphrasing can work. A mechanical form is needed: e.g. no six-word sequence shared
with the ticket text. That variant is untested.

## Environment

Claude Opus 5 (1M context), Claude Code CLI, macOS 25.5.0. 10 scenario runs
(5 per arm) plus 10 independent graders, one per run.
