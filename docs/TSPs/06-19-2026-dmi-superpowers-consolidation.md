# dmi_superpowers Consolidation — Implementation Plan (TSP)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `dmi_superpowers` repo by copying obra/superpowers as a base, swapping in selected mattpocock/skills, merging the two debugging skills, renaming spec/plan→PRD/TSP, wiring grill-with-docs into the workflow, and rebranding the namespace to `dmi-superpowers`.

**Architecture:** This is a content-consolidation project, not a code project. "Tests" are **verification commands** (grep/find/jq checks) that assert the repo reached the intended state. Each task: define the check → confirm it currently fails → do the work → confirm it passes → commit. Source repos remain untouched; all work happens in `/Users/davidlee/Projects/dmi_superpowers`.

**Tech Stack:** Markdown skills, JSON plugin manifests, bash hooks. No build system, no runtime deps. Verification via `grep`, `find`, `jq`, `git`.

## Global Constraints

- Target repo: `/Users/davidlee/Projects/dmi_superpowers` (git already initialized, branch `main`, contains `docs/PRDs/06-19-2026-dmi-superpowers-consolidation.md`).
- Source repos are READ-ONLY: `/Users/davidlee/Projects/superpowers`, `/Users/davidlee/Projects/matt_pocock_skills`.
- Authoritative design: `docs/PRDs/06-19-2026-dmi-superpowers-consolidation.md` (this repo).
- Plugin/namespace name: `dmi-superpowers` (hyphenated). All internal skill cross-references use `dmi-superpowers:<skill>`.
- PRD/TSP doc paths: `docs/PRDs/MM-DD-YYYY-<topic>.md` and `docs/TSPs/MM-DD-YYYY-<feature>.md`.
- Version reset to `0.1.0` across all 7 manifests listed in `.version-bump.json`.
- Author metadata → `David Lee <dalee@dminc.com>`; homepage/repository → DMI's repo URL (placeholder `https://github.com/dminc/dmi_superpowers` until confirmed).
- Final skill inventory = exactly 22 skills (see PRD §5): 14 superpowers directories (incl. `dispatching-parallel-agents`, `test-driven-development` with Matt's content, and the merged `systematic-debugging`) + 8 added Matt directories.
- Commit after every task. Use `git -c user.name="David Lee" -c user.email="dalee@dminc.com"`.
- DO NOT copy: upstream `.git`, `docs/` (upstream specs/plans/notes), `evals/`, `node_modules/`, `tests/` (eval harness is out of scope per PRD §10).

---

### Task 1: Scaffold repo + copy the superpowers base

**Files:**
- Source: `/Users/davidlee/Projects/superpowers/{skills,hooks,scripts,assets,.claude-plugin,.codex-plugin,.cursor-plugin,.kimi-plugin,.opencode,.pi,.github}` + top-level files
- Create (in target): the above, minus exclusions in Global Constraints

**Interfaces:**
- Produces: a working tree under `dmi_superpowers/` containing all 14 superpowers skills, packaging, hooks, scripts — still un-rebranded. Later tasks mutate this in place.

- [ ] **Step 1: Write the check** — define what "base copied" means.

```bash
# check.sh (run from target repo root)
test -d skills/brainstorming && test -d skills/systematic-debugging && \
test -f hooks/session-start && test -f .claude-plugin/plugin.json && \
test -f scripts/bump-version.sh && ! test -d docs/superpowers && \
echo "PASS" || echo "FAIL"
```

- [ ] **Step 2: Run check to confirm it fails**

Run the check above from `/Users/davidlee/Projects/dmi_superpowers`.
Expected: `FAIL` (nothing copied yet).

- [ ] **Step 3: Copy the curated base** (preserves the existing `docs/PRDs` and `docs/TSPs`)

```bash
cd /Users/davidlee/Projects/dmi_superpowers
SRC=/Users/davidlee/Projects/superpowers
# Directories to bring wholesale:
for d in skills hooks scripts assets .claude-plugin .codex-plugin .cursor-plugin .kimi-plugin .opencode .pi .github; do
  rsync -a --exclude='.git' "$SRC/$d/" "./$d/"
done
# Top-level files:
for f in .gitattributes .gitignore .pre-commit-config.yaml .version-bump.json \
         AGENTS.md CLAUDE.md CODE_OF_CONDUCT.md gemini-extension.json GEMINI.md \
         LICENSE package.json README.md RELEASE-NOTES.md; do
  cp "$SRC/$f" "./$f"
done
# Remove the eval-harness tests dir if rsync pulled it (it was not in the loop, but guard):
rm -rf ./tests
```

- [ ] **Step 4: Run check to confirm it passes**

Run the check from Step 1. Expected: `PASS`.
Also confirm 14 skills copied: `ls skills | wc -l` → expect `14`.

- [ ] **Step 5: Commit**

```bash
git add -A && git -c user.name="David Lee" -c user.email="dalee@dminc.com" \
  commit -m "feat: copy superpowers base into dmi_superpowers"
```

---

### Task 2: Swap in Matt's TDD content under the existing skill name

**Files:**
- Modify: `skills/test-driven-development/SKILL.md` (replace body with Matt's `tdd` content)
- Source: `/Users/davidlee/Projects/matt_pocock_skills/skills/engineering/tdd/SKILL.md`
- Delete (if present and unreferenced by new content): `skills/test-driven-development/testing-anti-patterns.md`

**Interfaces:**
- Produces: `skills/test-driven-development/SKILL.md` with `name: test-driven-development` frontmatter but Matt's TDD body. The directory name is unchanged so all `superpowers:test-driven-development` refs (8 of them) keep resolving (they get rebranded in Task 7).

- [ ] **Step 1: Write the check**

```bash
# Matt's body contains his red-green-refactor phrasing; superpowers' does not use this exact heading set.
grep -q 'codebase-design' skills/test-driven-development/SKILL.md && \
grep -q '^name: test-driven-development' skills/test-driven-development/SKILL.md && \
echo "PASS" || echo "FAIL"
```

- [ ] **Step 2: Run check to confirm it fails**

Expected: `FAIL` (current SKILL.md is superpowers' content; no `codebase-design` reference).

- [ ] **Step 3: Replace the body, preserving the directory name**

```bash
cd /Users/davidlee/Projects/dmi_superpowers
MATT=/Users/davidlee/Projects/matt_pocock_skills/skills/engineering/tdd/SKILL.md
# Copy Matt's content, then force the frontmatter name to the existing dir name:
cp "$MATT" skills/test-driven-development/SKILL.md
# Rewrite the frontmatter name line from 'tdd' to 'test-driven-development':
perl -0pi -e 's/^name:\s*tdd\s*$/name: test-driven-development/m' skills/test-driven-development/SKILL.md
# Drop superpowers' anti-patterns helper only if Matt's content does not reference it:
grep -q 'testing-anti-patterns' skills/test-driven-development/SKILL.md || rm -f skills/test-driven-development/testing-anti-patterns.md
```

- [ ] **Step 4: Run check to confirm it passes**

Run the Step 1 check. Expected: `PASS`. Manually skim `skills/test-driven-development/SKILL.md` to confirm it is Matt's content with the corrected name.

- [ ] **Step 5: Commit**

```bash
git add -A && git -c user.name="David Lee" -c user.email="dalee@dminc.com" \
  commit -m "feat: swap in Matt's TDD content under test-driven-development"
```

---

### Task 3: Copy Matt's 8 added skills

**Files:**
- Create: `skills/{codebase-design,domain-modeling,improve-codebase-architecture,prototype,resolving-merge-conflicts,to-prd,grill-with-docs,grilling}/` (with SKILL.md + any supporting files/scripts)
- Source: `matt_pocock_skills/skills/engineering/*` (7 of them) and `matt_pocock_skills/skills/productivity/grilling`

**Interfaces:**
- Produces: 8 new skill directories. Combined with the 14 superpowers directories from Task 1 (incl. the swapped `test-driven-development` and merged `systematic-debugging`), this completes the 22-skill inventory.

- [ ] **Step 1: Write the check**

```bash
for s in codebase-design domain-modeling improve-codebase-architecture prototype \
         resolving-merge-conflicts to-prd grill-with-docs grilling; do
  test -f "skills/$s/SKILL.md" || { echo "FAIL: $s"; exit 1; }
done; echo "PASS"
```

- [ ] **Step 2: Run check to confirm it fails**

Expected: `FAIL: codebase-design` (none copied yet).

- [ ] **Step 3: Copy the 8 skill directories**

```bash
cd /Users/davidlee/Projects/dmi_superpowers
MENG=/Users/davidlee/Projects/matt_pocock_skills/skills/engineering
MPROD=/Users/davidlee/Projects/matt_pocock_skills/skills/productivity
for s in codebase-design domain-modeling improve-codebase-architecture prototype \
         resolving-merge-conflicts to-prd grill-with-docs; do
  rsync -a "$MENG/$s/" "skills/$s/"
done
rsync -a "$MPROD/grilling/" "skills/grilling/"
```

- [ ] **Step 4: Run check to confirm it passes**

Run Step 1 check → `PASS`. Confirm total inventory: `ls skills | wc -l` → expect `22` (14 base + 8 added).

> **Note on count:** the base copied 14 superpowers skill directories (Task 1). Adding 8 Matt directories = 22 directories total, which equals the 22 logical skills in PRD §5. Matt's `tdd` does NOT become a new directory — its content was swapped into the existing `test-driven-development` dir in Task 2. No directories are removed in later tasks.

- [ ] **Step 5: Commit**

```bash
git add -A && git -c user.name="David Lee" -c user.email="dalee@dminc.com" \
  commit -m "feat: add 8 skills from matt_pocock_skills (incl. grilling dependency)"
```

---

### Task 4: Author the merged `systematic-debugging` skill

**Files:**
- Overwrite: `skills/systematic-debugging/SKILL.md` (new merged content per PRD §7)
- Keep (already copied from superpowers): `root-cause-tracing.md`, `defense-in-depth.md`, `condition-based-waiting.md`, `condition-based-waiting-example.ts`, `find-polluter.sh`
- Add: Matt's `scripts/` (incl. `hitl-loop.template.sh`) from `matt_pocock_skills/skills/engineering/diagnosing-bugs/scripts/`
- Delete: `skills/systematic-debugging/{test-pressure-1.md,test-pressure-2.md,test-pressure-3.md,test-academic.md,CREATION-LOG.md}` (eval-only)

**Interfaces:**
- Produces: a single `systematic-debugging` skill enforcing both Iron Laws, with the 7-phase structure + always-on guardrails. Referenced by the workflow as `dmi-superpowers:systematic-debugging` after Task 7.

**Source material (assemble, do not invent):**
- Matt phases → `matt_pocock_skills/skills/engineering/diagnosing-bugs/SKILL.md` (Phase 1 feedback-loop, Phase 2 minimise, Phase 3 hypotheses, Phase 4 instrument, Phase 5 fix+seam, Phase 6 cleanup/post-mortem).
- SP material → `superpowers/skills/systematic-debugging/SKILL.md` (Iron Law framing, Phase 0 "read errors / check recent changes", multi-component boundary instrumentation, Pattern Analysis, 3+-fixes escalation, Red Flags, human-partner signals, Common Rationalizations table, "no root cause" handling).

- [ ] **Step 1: Write the check** — assert the merged structure is present.

```bash
F=skills/systematic-debugging/SKILL.md
grep -q 'No hypothesis without a feedback loop' "$F" && \
grep -q 'No fix without root cause' "$F" && \
grep -q 'Build a feedback loop' "$F" && \
grep -q 'minimise' "$F" && \
grep -qi 'ranked' "$F" && grep -qi 'falsifiable' "$F" && \
grep -qi 'Common Rationalizations' "$F" && \
grep -qi 'post-mortem' "$F" && \
test -f skills/systematic-debugging/root-cause-tracing.md && \
test -f skills/systematic-debugging/scripts/hitl-loop.template.sh && \
! test -f skills/systematic-debugging/CREATION-LOG.md && \
echo "PASS" || echo "FAIL"
```

- [ ] **Step 2: Run check to confirm it fails**

Expected: `FAIL` (current file is superpowers-only; no feedback-loop Iron Law, no hitl script, CREATION-LOG still present).

- [ ] **Step 3: Author the merged SKILL.md**

Write `skills/systematic-debugging/SKILL.md` following PRD §7's table exactly, in this order:
1. Frontmatter: `name: systematic-debugging`; description merging both trigger sets ("any bug, test failure, unexpected behavior, or performance regression; before proposing fixes").
2. **Two Iron Laws** section (both gates) + CONTEXT.md/ADR awareness line.
3. **Phase 0 — Orient** (from SP: read errors/stack traces fully; check recent changes/git diff; read CONTEXT.md + ADRs). Add the explicit line: "Orientation only — does NOT license a fix."
4. **Phase 1 — Build a feedback loop** (Matt's full section: 10 ways, tighten-the-loop, non-deterministic, completion checklist). Insert SP's multi-component boundary-instrumentation block as a labelled sub-technique ("Locating *where* it breaks in a multi-component system").
5. **Phase 2 — Reproduce + minimise** (Matt).
6. **Phase 3 — Hypothesise** (Matt's 3–5 ranked falsifiable + show-to-user) with SP's Pattern Analysis folded in as the hypothesis-generation aid; cross-reference `root-cause-tracing.md`.
7. **Phase 4 — Instrument** (Matt; one-variable, debugger>logs, `[DEBUG-xxxx]` tags, perf branch); cross-reference `condition-based-waiting.md`.
8. **Phase 5 — Fix + regression test** (Matt's correct-seam) + SP's "3+ fixes → question architecture" escalation; cross-reference `defense-in-depth.md`.
9. **Phase 6 — Cleanup + post-mortem** (Matt; remove tagged logs, delete throwaways, record winning hypothesis, hand off to `improve-codebase-architecture`).
10. **Guardrails (always-on)** (SP: Red Flags list, human-partner signals, Common Rationalizations table, "no root cause" handling).

Then manage supporting files:

```bash
cd /Users/davidlee/Projects/dmi_superpowers
# Bring Matt's HITL scripts:
rsync -a /Users/davidlee/Projects/matt_pocock_skills/skills/engineering/diagnosing-bugs/scripts/ skills/systematic-debugging/scripts/
# Drop eval-only files:
rm -f skills/systematic-debugging/{test-pressure-1.md,test-pressure-2.md,test-pressure-3.md,test-academic.md,CREATION-LOG.md}
```

- [ ] **Step 4: Run check to confirm it passes**

Run Step 1 check → `PASS`. Read the file top-to-bottom to confirm all 8 phases + guardrails are present and coherent (no dangling references to dropped files).

- [ ] **Step 5: Commit**

```bash
git add -A && git -c user.name="David Lee" -c user.email="dalee@dminc.com" \
  commit -m "feat: merge diagnosing-bugs into systematic-debugging (best of both)"
```

---

### Task 5: Terminology rename — spec→PRD, plan→TSP

**Files (modify):** the 8 SKILL.md files that reference the terms/paths:
`skills/{brainstorming,writing-plans,executing-plans,subagent-driven-development,requesting-code-review,verification-before-completion,using-superpowers,writing-skills}/SKILL.md`
Plus: `skills/to-prd/SKILL.md` (adapt output target — see Step 3b).

**Interfaces:**
- Produces: skills that write/read PRDs at `docs/PRDs/` and TSPs at `docs/TSPs/`, using PRD/TSP vocabulary. `to-prd` writes to `docs/PRDs/` instead of an issue tracker.

- [ ] **Step 1: Write the check**

```bash
# No skill should reference the old doc-path dirs anymore:
! grep -rn 'docs/superpowers/specs\|docs/superpowers/plans' skills && \
grep -rq 'docs/PRDs' skills/brainstorming/SKILL.md && \
grep -rq 'docs/TSPs' skills/writing-plans/SKILL.md && \
echo "PASS" || echo "FAIL"
```

- [ ] **Step 2: Run check to confirm it fails**

Expected: `FAIL` (skills still say `docs/superpowers/specs` / `plans`).

- [ ] **Step 3a: Rename paths + vocabulary**

Edit each of the 8 files. Path replacements (apply with care — review each diff):
- `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` → `docs/PRDs/MM-DD-YYYY-<topic>.md`
- `docs/superpowers/plans/YYYY-MM-DD-<feature>.md` → `docs/TSPs/MM-DD-YYYY-<feature>.md`

Vocabulary replacements (prose, checklists, graphviz node labels) — **manual, context-aware** (do NOT blanket-sed, to avoid mangling words like "planning" or "respect"):
- "spec" / "the spec" / "design doc" (when meaning the brainstorming output) → "PRD"
- "plan" / "implementation plan" (when meaning the writing-plans output) → "TSP"

Suggested locator to find every hit to review:

```bash
grep -rniE '\bspec\b|\bplan\b|design doc|docs/superpowers/(specs|plans)' skills/brainstorming/SKILL.md skills/writing-plans/SKILL.md skills/executing-plans/SKILL.md skills/subagent-driven-development/SKILL.md skills/requesting-code-review/SKILL.md skills/verification-before-completion/SKILL.md skills/using-superpowers/SKILL.md skills/writing-skills/SKILL.md
```

> **Care:** `writing-plans` and `executing-plans` are *skill names*, not the word "plan" — do NOT rename the skill directories or `superpowers:writing-plans` references. Only the noun "plan" (the artifact) becomes "TSP". Skill identity stays `writing-plans`.

- [ ] **Step 3b: Adapt `to-prd` to write to `docs/PRDs/`**

`matt_pocock_skills`' `to-prd` publishes the PRD to an issue tracker. Rewrite its output instruction to: "Write the PRD to `docs/PRDs/MM-DD-YYYY-<topic>.md` and commit." Remove issue-tracker publishing steps (out of scope per PRD §10).

```bash
grep -niE 'issue tracker|publish' skills/to-prd/SKILL.md   # locate the lines to rewrite
```

- [ ] **Step 4: Run check to confirm it passes**

Run Step 1 check → `PASS`. Also: `! grep -rniE 'issue tracker' skills/to-prd/SKILL.md` → no output.

- [ ] **Step 5: Commit**

```bash
git add -A && git -c user.name="David Lee" -c user.email="dalee@dminc.com" \
  commit -m "feat: rename spec/plan vocabulary to PRD/TSP; retarget to-prd output"
```

---

### Task 6: Wire grill-with-docs into the workflow chain

**Files (modify):**
- `skills/brainstorming/SKILL.md` (terminal step)
- `skills/writing-plans/SKILL.md` (terminal step)
- `skills/grill-with-docs/SKILL.md` (frontmatter)

**Interfaces:**
- Consumes: `grill-with-docs` (invokable in-flow), which itself calls `grilling` + `domain-modeling`.
- Produces: the chain `brainstorming → PRD → grill-with-docs → writing-plans → TSP → grill-with-docs → implementation`.

- [ ] **Step 1: Write the check**

```bash
grep -q 'grill-with-docs' skills/brainstorming/SKILL.md && \
grep -q 'grill-with-docs' skills/writing-plans/SKILL.md && \
! grep -q 'disable-model-invocation' skills/grill-with-docs/SKILL.md && \
echo "PASS" || echo "FAIL"
```

- [ ] **Step 2: Run check to confirm it fails**

Expected: `FAIL` (neither workflow skill mentions grill-with-docs; grill-with-docs still has `disable-model-invocation: true`).

- [ ] **Step 3: Make the three edits**

3a. In `skills/brainstorming/SKILL.md`, change the terminal step (currently "invoke writing-plans") to: after the user approves + the PRD is written, **invoke `dmi-superpowers:grill-with-docs` to harden the PRD, THEN invoke `dmi-superpowers:writing-plans`.** Update the checklist item, the process-flow graphviz, and the "terminal state" prose to match.

3b. In `skills/writing-plans/SKILL.md`, change the execution-handoff step to: after the TSP is written + self-reviewed, **invoke `dmi-superpowers:grill-with-docs` to harden the TSP, THEN offer the execution choice** (subagent-driven / inline).

3c. In `skills/grill-with-docs/SKILL.md`, remove the `disable-model-invocation: true` frontmatter line so it is invokable in-flow.

```bash
perl -0pi -e 's/^disable-model-invocation:\s*true\s*\n//m' skills/grill-with-docs/SKILL.md
```

- [ ] **Step 4: Run check to confirm it passes**

Run Step 1 check → `PASS`. Read both terminal sections to confirm the chain reads correctly and the graphviz in brainstorming includes a grill-with-docs node.

- [ ] **Step 5: Commit**

```bash
git add -A && git -c user.name="David Lee" -c user.email="dalee@dminc.com" \
  commit -m "feat: wire grill-with-docs into PRD and TSP handoffs"
```

---

### Task 7: Namespace rebrand — superpowers → dmi-superpowers

**Files (modify):**
- Manifests (7): `package.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`, `.kimi-plugin/plugin.json`, `gemini-extension.json`
- Bootstrap/hooks: `hooks/session-start`, `hooks/session-start-codex`, `hooks/hooks*.json`
- Runtime extensions: `.pi/extensions/superpowers.ts`, `.opencode/plugins/superpowers.js` (+ rename the files)
- All skill bodies containing `superpowers:` refs (~13 SKILL.md + reference files)
- `.version-bump.json` (unchanged structure; values updated via the manifests)

**Interfaces:**
- Produces: a plugin named `dmi-superpowers` with every internal cross-reference resolving to `dmi-superpowers:<skill>`, version `0.1.0`, DMI author metadata.

- [ ] **Step 1: Write the check**

```bash
# No 'superpowers:' namespace refs remain in skills (brand-name prose mentions are fine, but the colon form must be gone):
! grep -rn 'superpowers:' skills hooks .pi .opencode && \
jq -e '.name=="dmi-superpowers" and .version=="0.1.0"' .claude-plugin/plugin.json >/dev/null && \
echo "PASS" || echo "FAIL"
```

- [ ] **Step 2: Run check to confirm it fails**

Expected: `FAIL` (many `superpowers:` refs; plugin.json name still `superpowers` / version `6.0.3`).

- [ ] **Step 3a: Rebrand the namespace refs**

```bash
cd /Users/davidlee/Projects/dmi_superpowers
# Replace the namespaced skill refs everywhere they appear (colon form only — safe):
grep -rl 'superpowers:' skills hooks .pi .opencode | while read -r f; do
  perl -pi -e 's/\bsuperpowers:/dmi-superpowers:/g' "$f"
done
# Normalize Matt's bare slash refs to the namespaced form (in the 9 added skills):
for s in tdd improve-codebase-architecture grill-with-docs; do
  perl -pi -e 's{(?<![\w-])/(codebase-design|domain-modeling|grilling)\b}{dmi-superpowers:$1}g' "skills/$s/SKILL.md" 2>/dev/null || true
done
```

> Handle `dmi-superpowers:code-reviewer` and `dmi-superpowers:skill-name`: `code-reviewer` is an agent reference — confirm whether dmi ships that agent; if not, leave the rebranded ref but note it in Task 9. `skill-name` is a placeholder in `writing-skills` examples — leave as-is (now `dmi-superpowers:skill-name`).

- [ ] **Step 3b: Update the 7 manifests + version**

Set `name`→`dmi-superpowers` (where a name field exists), `version`→`0.1.0`, author→`David Lee <dalee@dminc.com>`, homepage/repository→DMI URL. Example for the Claude manifest:

```bash
tmp=$(mktemp)
jq '.name="dmi-superpowers"
    | .version="0.1.0"
    | .description="DMI core skills library: brainstorm→PRD→TSP→TDD workflow, merged debugging, collaboration patterns"
    | .author={name:"David Lee",email:"dalee@dminc.com"}
    | .homepage="https://github.com/dminc/dmi_superpowers"
    | .repository="https://github.com/dminc/dmi_superpowers"' \
  .claude-plugin/plugin.json > "$tmp" && mv "$tmp" .claude-plugin/plugin.json
```

Repeat the `name`/`version`/author edits for the other 6 manifests (use the same `jq` pattern; `marketplace.json` uses `.plugins[0].name` and `.plugins[0].version`).

- [ ] **Step 3c: Rebrand the bootstrap text + rename runtime files**

```bash
# Bootstrap banner in hooks/session-start (and -codex): "You have superpowers" + skill name.
perl -pi -e 's/superpowers:using-superpowers/dmi-superpowers:using-superpowers/g' hooks/session-start hooks/session-start-codex
# Rename runtime extension files to match the new plugin name:
git mv .pi/extensions/superpowers.ts .pi/extensions/dmi-superpowers.ts
git mv .opencode/plugins/superpowers.js .opencode/plugins/dmi-superpowers.js
```

> Review `hooks/session-start` line ~27 banner copy ("You have superpowers…") and reword to dmi-superpowers branding as desired. Functional refs (`PLUGIN_ROOT`, `using-superpowers/SKILL.md` path) stay — the `using-superpowers` skill directory keeps its name.

- [ ] **Step 4: Run check to confirm it passes**

Run Step 1 check → `PASS`. Spot-check: `grep -rn 'superpowers:' .pi .opencode` returns nothing; `jq .version .claude-plugin/plugin.json` → `"0.1.0"`.

- [ ] **Step 5: Commit**

```bash
git add -A && git -c user.name="David Lee" -c user.email="dalee@dminc.com" \
  commit -m "feat: rebrand namespace superpowers -> dmi-superpowers, reset version to 0.1.0"
```

---

### Task 8: Rebrand top-level docs & metadata

**Files (modify):** `README.md`, `CLAUDE.md`, `AGENTS.md` (symlink — verify target), `RELEASE-NOTES.md`, `GEMINI.md`, `package.json` (`name` field), `gemini-extension.json` (`contextFileName` stays `GEMINI.md`).

**Interfaces:**
- Produces: top-level docs that describe dmi_superpowers (purpose, install, the PRD/TSP workflow, the 22 skills), with upstream-specific governance (94%-rejection PR policy, Prime Radiant sales) removed or replaced.

- [ ] **Step 1: Write the check**

```bash
grep -qi 'dmi_superpowers\|dmi-superpowers' README.md && \
jq -e '.name=="dmi-superpowers"' package.json >/dev/null && \
! grep -qi 'Prime Radiant\|sales@primeradiant' README.md && \
echo "PASS" || echo "FAIL"
```

- [ ] **Step 2: Run check to confirm it fails**

Expected: `FAIL` (README is upstream superpowers').

- [ ] **Step 3: Rewrite the docs**

- `README.md`: replace with a dmi_superpowers overview — what it is, the PRD→TSP→TDD workflow, the 22 skills (table grouped: kept / swapped / added / merged), multi-harness install commands rebranded, and a pointer to `docs/PRDs/`. Remove Prime Radiant commercial blurb.
- `CLAUDE.md` / `AGENTS.md`: replace upstream contributor governance with dmi's own (or trim to a short "this is a personal/DMI skills repo" note). If `AGENTS.md` is a symlink to `CLAUDE.md`, leave the symlink.
- `RELEASE-NOTES.md`: reset to a single `v0.1.0 — initial dmi_superpowers consolidation` entry.
- `package.json`: set `name`→`dmi-superpowers` (Task 7 may have done this; confirm).

- [ ] **Step 4: Run check to confirm it passes**

Run Step 1 check → `PASS`.

- [ ] **Step 5: Commit**

```bash
git add -A && git -c user.name="David Lee" -c user.email="dalee@dminc.com" \
  commit -m "docs: rebrand README/CLAUDE/release-notes for dmi_superpowers"
```

---

### Task 9: Final integration verification

**Files:** none modified (verification + fix-ups only).

**Interfaces:**
- Consumes: the whole repo. Produces: a green end-to-end verification.

- [ ] **Step 1: Skill inventory present (22 dirs / 22 logical skills)**

```bash
ls skills | sort | tee /tmp/skills.txt
ls skills | wc -l    # expect 22 directories
# Confirm all 22 expected skills exist:
for s in brainstorming writing-plans executing-plans subagent-driven-development \
  dispatching-parallel-agents requesting-code-review receiving-code-review \
  finishing-a-development-branch using-git-worktrees verification-before-completion \
  writing-skills using-superpowers systematic-debugging test-driven-development \
  codebase-design domain-modeling improve-codebase-architecture prototype \
  resolving-merge-conflicts to-prd grill-with-docs grilling; do
  test -d "skills/$s" || echo "MISSING: $s"
done
```

- [ ] **Step 2: Dependency closure resolves within the repo**

```bash
# Every dmi-superpowers:<skill> reference must point to an existing skill dir:
grep -rho 'dmi-superpowers:[a-z-]*' skills | sed 's/dmi-superpowers://' | sort -u | while read -r s; do
  [ -z "$s" ] && continue
  case "$s" in skill-name|code-reviewer) echo "REVIEW (non-skill ref): $s"; continue;; esac
  test -d "skills/$s" || echo "DANGLING REF: $s"
done
```

- [ ] **Step 3: No stale vocabulary or namespace leaks**

```bash
! grep -rn 'superpowers:' skills hooks .pi .opencode && echo "namespace clean"
! grep -rn 'docs/superpowers/' skills && echo "paths clean"
```

- [ ] **Step 4: Manifest version consistency**

```bash
for f in .claude-plugin/plugin.json .cursor-plugin/plugin.json .codex-plugin/plugin.json \
         .kimi-plugin/plugin.json gemini-extension.json package.json; do
  printf "%s -> " "$f"; jq -r '.version' "$f"
done   # all should print 0.1.0
jq -r '.plugins[0].version' .claude-plugin/marketplace.json   # 0.1.0
```

- [ ] **Step 5: Fix any failures, then final commit**

Resolve anything flagged (dangling refs, version mismatches, the `code-reviewer` agent decision). Then:

```bash
git add -A && git -c user.name="David Lee" -c user.email="dalee@dminc.com" \
  commit -m "chore: final consolidation verification + fix-ups" --allow-empty
```

---

## Self-Review

**Spec coverage (PRD → task):**
- §3.1 base = superpowers → Task 1 ✓
- §3.2 multi-harness packaging kept → Task 1 (copied) + Task 7 (rebranded) ✓
- §3.3 clean break, no upstream → Task 1 (no remote added) ✓
- §4 spec→PRD/plan→TSP rename + paths → Task 5 ✓
- §5 21-skill inventory → Tasks 1, 3 (+ Task 9 verifies) ✓
- §6 TDD swap → Task 2 ✓
- §7 merged systematic-debugging → Task 4 ✓
- §8 grill-with-docs wired into both handoffs → Task 6 ✓
- §9 namespacing + version reset + author metadata → Tasks 7, 8 ✓
- §10 out-of-scope (no Jira/OPIE, no issue-tracker loop, no eval harness) → honored: `tests/` excluded (Task 1), `to-prd` issue-tracker stripped (Task 5) ✓
- §11 success criteria → Task 9 verification covers each ✓

**Placeholder scan:** Two intentional placeholders remain and are flagged for the implementer to confirm: the DMI repo URL (`https://github.com/dminc/dmi_superpowers`) and the `code-reviewer` agent decision (Task 7/9). These require a human input, not invented values.

**Type/name consistency:** Skill directory names are used consistently across tasks (e.g., `test-driven-development` keeps its dir name in Tasks 2, 5, 7, 9; `systematic-debugging` in Tasks 4, 7, 9). Namespace form `dmi-superpowers:<skill>` is used uniformly from Task 6 onward.

## Execution Handoff

After review, choose an execution approach:
**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks.
**2. Inline Execution** — execute tasks in this session with checkpoints.
