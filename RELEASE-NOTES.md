# dmi_superpowers Release Notes

## v0.1.0 (2026-06-19)

### Initial dmi_superpowers consolidation

This is the first release of `dmi_superpowers` — a personal consolidation of the
superpowers plugin (v6.0.3) and Matt Pocock's skills, tailored for David Lee / DMI workflows.

**What was consolidated:**

- All core superpowers skills (brainstorming, writing-plans, executing-plans,
  subagent-driven-development, systematic-debugging, verification-before-completion,
  requesting-code-review, receiving-code-review, using-git-worktrees,
  finishing-a-development-branch, using-superpowers, writing-skills)
- Matt Pocock's skills (grill-with-docs, improve-codebase-architecture, to-prd,
  to-issues, triage, say, deep-research, jav-story, prototype)
- TDD skill replacing the built-in test-driven-development with the `tdd` skill variant

**What was changed:**

- Package name, author, and repository metadata updated to `dmi-superpowers` / `HundredBillion/dmi_superpowers`
- Skill namespace prefixed as `superpowers:` for harness compatibility
- All top-level docs and metadata rebranded to dmi_superpowers
- Upstream contributor governance removed (this is a private personal repo)
- Design documents (PRDs, TSPs) preserved in `docs/PRDs/` and `docs/TSPs/` for reference
