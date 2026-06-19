# dmi_superpowers

A personal consolidation of the superpowers plugin and Matt Pocock's skills, tailored for David Lee / DMI workflows.

This repo is **not** intended for external contribution. It is a private skills plugin, maintained and evolved for internal use.

## What It Is

`dmi_superpowers` packages 22 skills that guide coding agents through a disciplined workflow:

**brainstorm → PRD → grill-with-docs → TSP → grill → TDD → review → finish**

The agent never just starts coding. It steps back, refines requirements, validates against domain language, plans carefully, writes tests first, reviews its own work, and closes out cleanly.

## The 22 Skills

### Kept from superpowers (core workflow)

| Skill | Purpose |
|---|---|
| `brainstorming` | Socratic design refinement before any code |
| `writing-plans` | Detailed implementation plans with task breakdown |
| `executing-plans` | Batch execution with human checkpoints |
| `dispatching-parallel-agents` | Concurrent subagent workflows |
| `requesting-code-review` | Pre-review checklist and dispatch |
| `receiving-code-review` | Responding to feedback with rigor |
| `using-git-worktrees` | Parallel development branches |
| `finishing-a-development-branch` | Merge/PR decision workflow |
| `subagent-driven-development` | Fast iteration with two-stage review |
| `using-superpowers` | Introduction to the skills system |
| `writing-skills` | Create new skills following best practices |

### TDD-swapped (superpowers TDD replaced with tdd skill)

| Skill | Purpose |
|---|---|
| `test-driven-development` | RED-GREEN-REFACTOR cycle (from tdd skill) |
| `systematic-debugging` | 4-phase root cause process |
| `verification-before-completion` | Ensure it's actually fixed |

### Added from Matt Pocock's skills

| Skill | Purpose |
|---|---|
| `grill-with-docs` | Challenge plans against CONTEXT.md and ADRs |
| `improve-codebase-architecture` | Find deepening/refactor opportunities |
| `to-prd` | Convert rough ideas to structured PRDs |
| `to-issues` | Convert specs/PRDs to issue lists |
| `triage` | Investigate and prioritize issues |
| `say` | Draft/rewrite prose for human readers |
| `deep-research` | Multi-source fact-checked research |
| `jav-story` | Generate story artifacts |

### Merged / unified (debugging consolidated)

| Skill | Purpose |
|---|---|
| `prototype` | Rapid prototyping skill |

## Installation

Install dmi-superpowers separately for each harness you use.

### Claude Code

```bash
/plugin install dmi-superpowers@dmi-superpowers-marketplace
```

Or from this repository directly:

```bash
/plugin marketplace add dminc/dmi_superpowers
/plugin install dmi-superpowers@dmi-superpowers-marketplace
```

### Antigravity

```bash
agy plugin install https://github.com/dminc/dmi_superpowers
```

### Codex CLI

- Open the plugin search interface:

  ```bash
  /plugins
  ```

- Search for dmi-superpowers and select `Install Plugin`.

### Gemini CLI

```bash
gemini extensions install https://github.com/dminc/dmi_superpowers
```

Update later:

```bash
gemini extensions update dmi-superpowers
```

### Kimi Code

```text
/plugins install https://github.com/dminc/dmi_superpowers
```

Detailed docs: [docs/README.kimi.md](docs/README.kimi.md)

### OpenCode

```
Fetch and follow instructions from https://raw.githubusercontent.com/dminc/dmi_superpowers/refs/heads/main/.opencode/INSTALL.md
```

Detailed docs: [docs/README.opencode.md](docs/README.opencode.md)

### Pi

```bash
pi install git:github.com/dminc/dmi_superpowers
```

For local development:

```bash
pi -e /path/to/dmi_superpowers
```

## The Workflow

1. **brainstorming** — Activates before writing code. Refines rough ideas through questions, explores alternatives, presents design in sections for validation. Saves design document.

2. **to-prd** — Converts conversation output into a structured PRD. Produces `docs/PRDs/`.

3. **grill-with-docs** — Challenges the PRD against CONTEXT.md and ADRs. Sharpens terminology, updates domain docs.

4. **writing-plans** — Breaks work into bite-sized tasks (2–5 min each). Every task has exact file paths, interfaces, and verification steps. Produces `docs/TSPs/`.

5. **grill** *(second pass)* — A second grill run validates the TSP against the domain model and prior decisions.

6. **test-driven-development** — Enforces RED-GREEN-REFACTOR during implementation. Write failing test, watch it fail, write minimal code, pass, commit.

7. **subagent-driven-development** / **executing-plans** — Dispatches fresh subagents per task with two-stage review (spec compliance then quality), or executes inline with human checkpoints.

8. **requesting-code-review** — Reviews against plan, reports issues by severity. Critical issues block progress.

9. **finishing-a-development-branch** — Verifies tests, presents options (merge/PR/keep/discard), cleans up.

**Design documents live in `docs/PRDs/` and `docs/TSPs/`.**

## Philosophy

- **Test-Driven Development** — write tests first, always
- **Systematic over ad-hoc** — process over guessing
- **Complexity reduction** — simplicity as primary goal
- **Evidence over claims** — verify before declaring success
- **Domain language first** — grill against CONTEXT.md before building

## License

MIT — see LICENSE file for details.
