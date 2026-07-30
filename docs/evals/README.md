# Skill progressive-disclosure eval runbook (ADR-0006)

## Scenario dispatch (SCENARIO_TEMPLATE)

Dispatch a fresh general-purpose subagent. Its prompt is ONLY:

> You are working in a coding session. The following skill is active; follow it.
>
> --- BEGIN SKILL ---
> {full text of the SKILL.md variant under test — "full" or "trimmed"}
> --- END SKILL ---
>
> Task: {scenario task text}
>
> Do the task. Show your work.

The subagent must NOT be told what is being measured. Run each scenario 5×
against the `full` variant and 5× against the `trimmed` variant (10 runs/scenario).

## Grading (GRADER_TEMPLATE)

Dispatch a separate grader subagent per run. Its prompt is ONLY:

> Below is a transcript of an agent doing a task. Answer each checklist item
> strictly PASS or FAIL based only on what the transcript shows.
>
> Checklist:
> {the skill's guarantee checklist, one line per guarantee}
>
> Transcript:
> {the run transcript}
>
> Output: one line per checklist item, `PASS` or `FAIL`, then a one-line reason.

A run passes a scenario iff every checklist item the scenario covers is PASS.

## Results format (RESULTS_TABLE)

| Scenario | Guarantee(s) covered | Full pass-rate | Trimmed pass-rate | Verdict |
|----------|----------------------|----------------|-------------------|---------|
| ...      | ...                  | n/5            | n/5               | PASS / REGRESSION |

Verdict = PASS iff trimmed ≥ full AND (full 5/5 ⇒ trimmed 5/5). Any guarantee
with full < 5/5: mark it FLAGGED, pin its mapped blocks resident, and require
trimmed to match full run-for-run.
