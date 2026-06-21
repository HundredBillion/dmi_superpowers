# dmi_superpowers — Agent Guide

An open-source, continuously distilled collection of the best skills and concepts for
giving coding agents the discipline to write high-quality code. The repo is a methodology
engine — brainstorm → plan → TDD → review → finish — packaged as skills that work across
many agent harnesses (Claude Code, Codex, Gemini, Kimi, OpenCode, Pi, Antigravity).

The bar for what lives here is high: a skill earns its place by measurably improving how an
agent writes code, not by being a nice idea. Contributions should sharpen that distillation.

## The cardinal rule: skills are code, not prose

Files under `skills/*/SKILL.md` shape agent behavior. Do not reword, restructure, or
"clean up" a skill on instinct. To change one, use the `dmi-superpowers:writing-skills` skill
and pressure-test with subagents (see `skills/writing-skills/testing-skills-with-subagents.md`).
The bar for touching tuned content (Red Flags tables, rationalization lists, the
"your human partner" terminology) is high — change it only with evidence it improves outcomes,
and show that evidence in the PR.

## Cross-harness portability

This plugin ships to many harnesses, so skills speak in *actions* ("dispatch a subagent",
"read a file"), never one runtime's tool names. Hooks and session-start bootstraps are
per-harness: `hooks/hooks.json` (Claude), `hooks-codex.json`, `hooks-cursor.json`,
`session-start*`. A change that helps one harness must not break the bootstrap on another.

## Contributing — submitting a pull request

**Write every PR with the `dmi-superpowers:creating-a-pull-request` skill.** It is not
optional house style; it is the format this repo reviews against. In short:

- **Title** — a plain-language *outcome*, never a mechanism.
  - ✅ "Stop agents from skipping the test-first step on quick fixes"
  - ❌ "Add RED-state guard to tdd SKILL.md"
- **Summary** (always) — for a non-developer. What this PR does in plain language, with an
  analogy to make the concept land. Two to four sentences.
- **TLDR for developers** (always) — what changed (files, skills, mechanisms) and *why it was
  written this way*, not just a restatement of the diff.
- **Evidence** (when meaningful) — for skill changes, before/after agent behavior from
  subagent pressure-testing; otherwise before/after logs or screenshots. Say so if you omit it.

Repo-specific expectations on top of the skill:

- **One concern per PR.** Split unrelated changes.
- **Skill behavior changes need evaluation evidence** (see the cardinal rule above).
- **Confirm it belongs in core.** Project-, tool-, or domain-specific skills belong in a
  standalone plugin, not here.
- **Disclose your environment.** Note the model, harness, and harness version used to produce
  the contribution.

## Validating a change

- Shell: `scripts/lint-shell.sh`
- Codex plugin mirror: `scripts/sync-to-codex-plugin.sh` after changes that affect it
- Version bump: `scripts/bump-version.sh` (version lives in `.claude-plugin/plugin.json`)
- No automated test suite — verify skill changes by running them in a real session.

## Facts

- Skill namespace: `dmi-superpowers:`  ·  ~23 skills — see README for the inventory
- Plugin manifest: `.claude-plugin/plugin.json` / `marketplace.json`
