# dmi_superpowers

An open-source, continuously distilled collection of the best skills and concepts for giving coding agents the discipline to write high-quality code — consolidating ideas from the superpowers plugin, Matt Pocock's skills, Ponytail, and Cursor's Thermos plugin into a single coherent methodology engine.

Contributions are welcome. See [AGENTS.md](AGENTS.md) for what belongs here and how to write a pull request.

## What It Is

`dmi_superpowers` packages 30 skills that guide coding agents through a disciplined workflow:

**brainstorm → PRD → grill-with-docs → TSP → grill → TDD → review → finish**

Planning scales to the work: a feasibility spike produces an answer, a bounded
change uses a short approved design in chat, and architectural work follows the
full document workflow. Implementation keeps behavioral tests, verification, and
review on every production path.

## The 30 Skills

### Kept from superpowers (core workflow)

| Skill | Purpose |
|---|---|
| `brainstorming` | Socratic design refinement before any code |
| `writing-plans` | Detailed implementation plans with task breakdown |
| `executing-plans` | Inline implementation with durable progress and a final independent review |
| `dispatching-parallel-agents` | Concurrent subagent workflows |
| `requesting-code-review` | Pre-review checklist and dispatch |
| `receiving-code-review` | Responding to feedback with rigor |
| `resolving-merge-conflicts` | Resolve an in-progress git merge/rebase conflict |
| `using-git-worktrees` | Parallel development branches |
| `finishing-a-development-branch` | Merge/PR decision workflow |
| `creating-a-pull-request` | PR title/body for non-developer + developer audiences |
| `subagent-driven-development` | Fresh implementers with task-scoped spec and quality review |
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
| `codebase-design` | Shared vocabulary for designing deep modules — interfaces, seams, depth |
| `domain-modeling` | Build and sharpen the domain model; record architectural decisions (ADRs) |
| `grill-with-docs` | Challenge plans against CONTEXT.md and ADRs |
| `grilling` | Relentlessly interview to stress-test a plan or design before building |
| `improve-codebase-architecture` | Find deepening/refactor opportunities |
| `say` | Communicate code findings in plain + technical pairs, and rewrite prose for human readers |
| `to-prd` | Convert rough ideas to structured PRDs |

### Merged / unified (debugging consolidated)

| Skill | Purpose |
|---|---|
| `prototype` | Rapid prototyping skill |

### Added coding-quality skills

| Skill | Purpose |
|---|---|
| `variant-analysis` | Find sibling defects after confirming a root cause |
| `source-grounded-development` | Ground version-sensitive decisions in official sources |
| `migrating-safely` | Plan expand–migrate–contract changes with rollback gates |
| `property-based-testing` | Test domain-wide properties with generators and shrinking |

### Utility / mode skills

| Skill | Purpose |
|---|---|
| `writing-code-comments` | Keep developer notes short — one plain sentence about intent or reason, not a walkthrough of the code |
| `ponytail` | persistent minimalism mode: defaults every solution to the simplest thing that works (YAGNI, stdlib/native first, shortest diff), at intensity lite/full/ultra. Off by default; type `ponytail [level]` or `be lazy` to activate with plain text. |

## Installation

Install dmi-superpowers separately for each harness you use.

### Claude Code

```bash
/plugin install dmi-superpowers@dmi-marketplace
```

Or from this repository directly:

```bash
/plugin marketplace add HundredBillion/dmi_superpowers
/plugin install dmi-superpowers@dmi-marketplace
```

### Antigravity

```bash
agy plugin install https://github.com/HundredBillion/dmi_superpowers
```

### Codex CLI

- Open the plugin search interface:

  ```bash
  /plugins
  ```

- Search for dmi-superpowers and select `Install Plugin`.

### Gemini CLI

```bash
gemini extensions install https://github.com/HundredBillion/dmi_superpowers
```

Update later:

```bash
gemini extensions update dmi-superpowers
```

### Kimi Code

```text
/plugins install https://github.com/HundredBillion/dmi_superpowers
```

Detailed docs: [docs/README.kimi.md](docs/README.kimi.md)

### OpenCode

```
Fetch and follow instructions from https://raw.githubusercontent.com/HundredBillion/dmi_superpowers/refs/heads/main/.opencode/INSTALL.md
```

Detailed docs: [docs/README.opencode.md](docs/README.opencode.md)

### Pi

```bash
pi install git:github.com/HundredBillion/dmi_superpowers
```

For local development:

```bash
pi -e /path/to/dmi_superpowers
```

## The Workflow

For architectural work:

1. **brainstorming** — Refines the intended outcome, explores alternatives, and presents a design for validation. Saves a PRD. Bounded changes instead use an approved in-chat design and proceed to implementation and review.

2. **to-prd** — Converts conversation output into a structured PRD. Produces `docs/PRDs/`.

3. **grill-with-docs** — Challenges the PRD against CONTEXT.md and ADRs. Sharpens terminology, updates domain docs.

4. **writing-plans** — Breaks work into independently verifiable tasks with small steps. Every task has explicit prerequisites, exact file paths, interfaces, and verification steps. Produces `docs/TSPs/`.

5. **grill** *(second pass)* — A second grill run validates the TSP against the domain model and prior decisions.

6. **test-driven-development** — Enforces RED-GREEN-REFACTOR during implementation. Write failing test, watch it fail, write minimal code, pass, commit.

7. **subagent-driven-development** / **executing-plans** — Choose fresh implementers with task-level spec and quality review, or implementation in the current session with one independent review at the end. Both keep a plan-specific progress record and continue through authorized work. Without subagent capability, inline execution discloses its self-review fallback.

8. **requesting-code-review** — Reviews against plan, reports issues by severity. Critical issues block progress.

9. **finishing-a-development-branch** — Verifies tests, presents options (merge/PR/keep/discard), cleans up.

**Design documents live in `docs/PRDs/` and `docs/TSPs/`.**

See [upstream workflow adoption](docs/upstream-workflows.md) for the source
revisions, task-graph explanation, and the boundary between dependency-aware
planning and a future parallel executor.

## Philosophy

- **Test-Driven Development** — write tests first, always
- **Systematic over ad-hoc** — process over guessing
- **Complexity reduction** — simplicity as primary goal
- **Evidence over claims** — verify before declaring success
- **Domain language first** — grill against CONTEXT.md before building

## License

MIT — see LICENSE file for details.

## Acknowledgements

`dmi_superpowers` builds on ideas and workflows from several open-source projects:

- [obra/superpowers](https://github.com/obra/superpowers) provides the core brainstorming, planning, TDD, debugging, review, and branch-completion workflow.
- [mattpocock/skills](https://github.com/mattpocock/skills) provides the domain-modeling, architecture, PRD, grilling, communication, and prototyping skills consolidated here.
- [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail), created by Dietrich Gebert, is the source of the `ponytail` minimalism skill and persistence hook, adapted here under the MIT License.
- Cursor's [Thermos plugin](https://github.com/cursor/plugins/tree/main/thermos), particularly `thermo-nuclear-code-quality-review`, inspired the structural-quality lens in `requesting-code-review`: code-judo reframing, large-file decomposition, abstraction quality, and aggressive simplification without changing behavior. The rubric originated in Cursor's built-in code-quality review prompt with additional constraints requested by Sualeh Asif; Eric Zakariasson contributed the public plugin version. Cursor's plugin repository is available under the MIT License.

These are influences incorporated into `dmi-superpowers`; users install this plugin as one package rather than installing each source plugin separately.
