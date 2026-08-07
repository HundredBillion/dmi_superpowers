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
optional house style; it is the format this repo reviews against.

**That skill is the only statement of the PR format.** This file deliberately does not
restate it. A second copy is a copy that drifts, and this one did: it asked for an analogy
in the Summary long after the skill, the PR template, and the `pretooluse-pr-reminder` hook
had all settled on the opposite rule. Read the skill; do not learn the format from here.

Repo-specific expectations on top of the skill:

- **One concern per PR.** Split unrelated changes.
- **Skill behavior changes need evaluation evidence** (see the cardinal rule above). The
  method is in `docs/evals/README.md` and ADR-0006: dispatch subagents against the current
  skill text to establish a baseline, make the change, then re-run and report both arms.
- **Confirm it belongs in core.** Project-, tool-, or domain-specific skills belong in a
  standalone plugin, not here.
- **Disclose your environment.** Note the model, harness, and harness version used to produce
  the contribution.

## Validating a change

- CI runs everything below on every PR — see `.github/workflows/validate.yml`
- Hook tests: `node hooks/session-start.test.js` · `node hooks/ponytail-mode-tracker.test.js`
- Shell: `scripts/lint-shell.sh` (shellcheck)
- Codex plugin mirror: `scripts/sync-to-codex-plugin.sh` after changes that affect it
- Version bump: `scripts/bump-version.sh` — syncs all seven manifests; `--audit` finds strays
- **Skill edits are not testable in the session that makes them.** Per ADR-0002, working-tree
  changes under `skills/` are not invokable — not even by dispatched subagents, which inherit
  the parent session's already-loaded skills. Verify by content-simulation in-session (paste
  the amended text into a subagent's prompt), then confirm live after `/plugin` reinstall.

## Facts

- Skill namespace: `dmi-superpowers:`  ·  26 skills — see README for the inventory
- Plugin manifest: `.claude-plugin/plugin.json` / `marketplace.json`
