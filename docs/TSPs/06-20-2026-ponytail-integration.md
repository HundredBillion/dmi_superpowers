# Ponytail Integration Technical Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use dmi-superpowers:subagent-driven-development (recommended) or dmi-superpowers:executing-plans to implement this TSP task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent minimalism mode (`dmi-superpowers:ponytail` + a per-turn hook) and fold an over-engineering review lens into two existing dmi skills, so the plugin actively pushes agents toward concise code.

**Architecture:** One new skill (`skills/ponytail/SKILL.md`, lightly adapted from upstream ponytail) plus four small Node hook modules ported from upstream and wired into Claude Code's `UserPromptSubmit`. The hook persists the active intensity to a flag file and **re-injects the level-filtered ruleset on every turn** while active (off by default). The review lens is added to `requesting-code-review`'s reviewer template and to `improve-codebase-architecture`, both governed by the deletion test (ADR-0003).

**Tech Stack:** Node.js (hooks, no dependencies — Node stdlib only), Markdown skills, JSON hook configs. Bash polyglot wrapper (`run-hook.cmd`) is **not** used for these hooks: it execs bash scripts, whereas Node hooks invoke `node` directly with a presence guard (graceful no-op if Node is absent).

## Global Constraints

Every task's requirements implicitly include this section. Values copied verbatim from the PRD (`docs/PRDs/06-20-2026-ponytail-integration.md`) and ADRs.

- **Skill name stays `ponytail`** (user decision); namespace is `dmi-superpowers:`.
- **Attribution line**, used verbatim in the skill body and as a comment header in every ported hook file:
  `Adapted from ponytail by DietrichGebert — MIT (https://github.com/DietrichGebert/ponytail).`
  Upstream is MIT and the copyright/permission notice is retained per MIT terms.
- **Off by default; activated by plain-text triggers (ADR-0005), not a slash command.** Absence of the flag file means ponytail is inactive. The hook matches **whole-message** plain-text triggers — `ponytail [lite|full|ultra]` (bare `ponytail` defaults to `full`), `be lazy`, `lazy mode` to activate; `ponytail off`, `stop ponytail`, `normal mode` to deactivate. The `/`, `@`, `$` prefixed forms are matched only as a best-effort bonus (Claude Code may intercept an unregistered `/ponytail` before the hook fires — undocumented). Keep the trigger set small and explicit to avoid false activation. Do **not** register a `/ponytail` command file (PRD §3 excludes slash-command infra). This differs from upstream ponytail (on-by-default) — do not port the on-by-default behavior.
- **Persistence is per-turn re-injection.** While a level is active the hook re-injects the ruleset on *every* `UserPromptSubmit`, not just on command turns. This is the mechanism that fulfills "persists across responses" (PRD §8.1) and survives context compaction.
- **The deletion test (the §4 rule), embedded verbatim** in the skill, the reviewer template, and `improve-codebase-architecture`:
  > **Delete the thing and ask what happens to the complexity.** If complexity vanishes or merely moves, the thing was a **shallow** or speculative module — cut it (ponytail / YAGNI: no interface with one implementation, no flexibility nobody asked for). If complexity *concentrates* because the thing was hiding real work, it is a **deep module** — keep it (Ousterhout: a simple interface over substantial implementation earns its keep).
- **Tag taxonomy** for simplification findings (from upstream `ponytail-review`):
  `delete:` (dead/speculative code, replacement: nothing) · `stdlib:` (hand-rolled thing the stdlib ships — name it) · `native:` (dep/code the platform already does — name the feature) · `yagni:` (one-implementation abstraction, config nobody sets, single-caller layer) · `shrink:` (same logic, fewer lines — show the shorter form).
- **Keep the `// ponytail:` marker-comment rule** in the skill (inline intent documentation only; no harvesting/ledger).
- **Do not reword tuned skill content** (AGENTS.md cardinal rule). The upstream ladder, rules, intensity table, and "When NOT to be lazy" carve-outs are benchmark-tuned — port them verbatim except for the explicit adaptations listed in Task 1.
- **Cross-harness scope:** wire Claude Code now. The hook runtime keeps Codex/Cursor branches so extending is trivial, but only Claude's `hooks.json` is wired and tested in this TSP. Elsewhere the skill still works on invocation but does not auto-persist (graceful degradation, documented).
- **Commit message footer** (every commit):
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- Work happens on branch `ponytail-integration` (already checked out).

---

### Task 1: Import the `ponytail` skill

**Files:**
- Create: `skills/ponytail/SKILL.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the skill body that `hooks/ponytail-instructions.js` (Task 4) reads from `../skills/ponytail/SKILL.md` and filters by intensity level. The intensity table rows must keep the exact labels `**lite**`, `**full**`, `**ultra**` and the worked-example bullets must start `- lite:`, `- full:`, `- ultra:` so the filter in Task 4 matches them.

- [ ] **Step 1: Create the adapted skill file**

Create `skills/ponytail/SKILL.md` with exactly this content (upstream verbatim except: the credit line added below the title; the "When NOT to be lazy" deep-module paragraph added; the Boundaries "pair with Caveman" clause removed):

````markdown
---
name: ponytail
description: >
  Forces the laziest solution that actually works, simplest, shortest, most
  minimal. Channels a senior dev who has seen everything: question whether the
  task needs to exist at all (YAGNI), reach for the standard library before
  custom code, native platform features before dependencies, one line before
  fifty. Supports intensity levels: lite, full (default), ultra. Use whenever
  the user says "ponytail", "be lazy", "lazy mode", "simplest solution",
  "minimal solution", "yagni", "do less", or "shortest path", and whenever
  they complain about over-engineering, bloat, boilerplate, or unnecessary
  dependencies.
argument-hint: "[lite|full|ultra]"
license: MIT
---

# Ponytail

_Adapted from ponytail by DietrichGebert — MIT (https://github.com/DietrichGebert/ponytail)._

You are a lazy senior developer. Lazy means efficient, not careless. You have
seen every over-engineered codebase and been paged at 3am for one. The best
code is the code never written.

## Persistence

ACTIVE EVERY RESPONSE. No drift back to over-building. Still active if
unsure. Default: **full**. Turn on by typing **ponytail lite|full|ultra**
(or **be lazy**); off with **stop ponytail** / **normal mode**. Stays on
across responses and sessions until turned off. (Invoking the skill by name
loads this guidance but does not start persistence — type a trigger to persist.)

## The ladder

Stop at the first rung that holds:

1. **Does this need to exist at all?** Speculative need = skip it, say so in one line. (YAGNI)
2. **Stdlib does it?** Use it.
3. **Native platform feature covers it?** `<input type="date">` over a picker lib, CSS over JS, DB constraint over app code.
4. **Already-installed dependency solves it?** Use it. Never add a new one for what a few lines can do.
5. **Can it be one line?** One line.
6. **Only then:** the minimum code that works.

The ladder is a reflex, not a research project. Two rungs work → take the
higher one and move on. The first lazy solution that works is the right one.

## Rules

- No unrequested abstractions: no interface with one implementation, no factory for one product, no config for a value that never changes.
- No boilerplate, no scaffolding "for later", later can scaffold for itself.
- Deletion over addition. Boring over clever, clever is what someone decodes at 3am.
- Fewest files possible. Shortest working diff wins.
- Complex request? Ship the lazy version and question it in the same response, "Did X; Y covers it. Need full X? Say so." Never stall on an answer you can default.
- Two stdlib options, same size? Take the one that's correct on edge cases. Lazy means writing less code, not picking the flimsier algorithm.
- Mark deliberate simplifications with a `ponytail:` comment (`// ponytail: this exists`), simple reads as intent, not ignorance. Shortcut with a known ceiling (global lock, O(n²) scan, naive heuristic)? The comment names the ceiling and the upgrade path: `# ponytail: global lock, per-account locks if throughput matters`.

## Output

Code first. Then at most three short lines: what was skipped, when to add it.
No essays, no feature tours, no design notes. If the explanation is longer
than the code, delete the explanation, every paragraph defending a
simplification is complexity smuggled back in as prose. Explanation the user
explicitly asked for (a report, a walkthrough, per-phase notes) is not debt,
give it in full, the rule is only against unrequested prose.

Pattern: `[code] → skipped: [X], add when [Y].`

## Intensity

| Level | What change |
|-------|------------|
| **lite** | Build what's asked, but name the lazier alternative in one line. User picks. |
| **full** | The ladder enforced. Stdlib and native first. Shortest diff, shortest explanation. Default. |
| **ultra** | YAGNI extremist. Deletion before addition. Ship the one-liner and challenge the rest of the requirement in the same breath. |

Example: "Add a cache for these API responses."
- lite: "Done, cache added. FYI: `functools.lru_cache` covers this in one line if you'd rather not own a cache class."
- full: "`@lru_cache(maxsize=1000)` on the fetch function. Skipped custom cache class, add when lru_cache measurably falls short."
- ultra: "No cache until a profiler says so. When it does: `@lru_cache`. A hand-rolled TTL cache class is a bug farm with a hit rate."

## When NOT to be lazy

Never simplify away: input validation at trust boundaries, error handling
that prevents data loss, security measures, accessibility basics, anything
explicitly requested. User insists on the full version → build it, no
re-arguing.

**The deletion test (deep-module exception).** Before deleting an abstraction,
delete the thing and ask what happens to the complexity. If complexity vanishes
or merely moves, the thing was a **shallow** or speculative module — cut it
(ponytail / YAGNI: no interface with one implementation, no flexibility nobody
asked for). If complexity *concentrates* because the thing was hiding real work,
it is a **deep module** — keep it (Ousterhout: a simple interface over
substantial implementation earns its keep). See `dmi-superpowers:codebase-design`.

Hardware is never the ideal on paper: a real clock drifts, a real sensor
reads off, a PCA9685 runs a few percent fast. Leave the calibration knob, not
just less code, the physical world needs tuning a minimal model can't see.

Lazy code without its check is unfinished. Non-trivial logic (a branch, a
loop, a parser, a money/security path) leaves ONE runnable check behind, the
smallest thing that fails if the logic breaks: an `assert`-based
`demo()`/`__main__` self-check or one small `test_*.py`. No frameworks, no
fixtures, no per-function suites unless asked. Trivial one-liners need no
test, YAGNI applies to tests too.

## Boundaries

Ponytail governs what you build, not how you talk. "stop ponytail" /
"normal mode": revert. Level persists until changed or session end.

The shortest path to done is the right path.
````

- [ ] **Step 2: Verify the adaptations landed and tuned content is intact**

Run:
```bash
cd /Users/davidlee/Projects/dmi_superpowers
grep -q "Adapted from ponytail by DietrichGebert" skills/ponytail/SKILL.md && \
grep -q "The deletion test (deep-module exception)" skills/ponytail/SKILL.md && \
grep -q "dmi-superpowers:codebase-design" skills/ponytail/SKILL.md && \
! grep -qi "caveman" skills/ponytail/SKILL.md && \
grep -q "^| \*\*ultra\*\* |" skills/ponytail/SKILL.md && \
grep -q "^- ultra:" skills/ponytail/SKILL.md && \
echo "PASS"
```
Expected: prints `PASS` (credit line present, deletion test added, codebase-design referenced, no Caveman reference, intensity table + example labels intact for Task 4's filter).

- [ ] **Step 3: Commit**

```bash
git add skills/ponytail/SKILL.md
git commit -m "feat: add ponytail minimalism skill (adapted from upstream, MIT)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Port the hook config module

**Files:**
- Create: `hooks/ponytail-config.js`

**Interfaces:**
- Consumes: Node stdlib (`path`, `os`), env vars `CLAUDE_CONFIG_DIR`, `PONYTAIL_DEFAULT_MODE`.
- Produces (exact exports, relied on by Tasks 3/4/5):
  - `DEFAULT_MODE` — string `'full'`
  - `RUNTIME_MODES` — `['off','lite','full','ultra']`
  - `normalizeMode(mode)` → lowercased mode if in `RUNTIME_MODES`, else `null`
  - `isDeactivationCommand(text)` → `true` iff the whole trimmed message (minus trailing punctuation) is `stop ponytail` or `normal mode`
  - `getClaudeDir()` → `CLAUDE_CONFIG_DIR` or `~/.claude`
  - `getDefaultMode()` → `PONYTAIL_DEFAULT_MODE` (if a valid runtime mode) else `'full'`

- [ ] **Step 1: Create the module**

Create `hooks/ponytail-config.js`:
```js
#!/usr/bin/env node
// dmi-superpowers ponytail — shared configuration resolver.
// Adapted from ponytail by DietrichGebert — MIT (https://github.com/DietrichGebert/ponytail).

const path = require('path');
const os = require('os');

const DEFAULT_MODE = 'full';
const RUNTIME_MODES = ['off', 'lite', 'full', 'ultra'];

function normalizeMode(mode) {
  if (typeof mode !== 'string') return null;
  const normalized = mode.trim().toLowerCase();
  return RUNTIME_MODES.includes(normalized) ? normalized : null;
}

// "stop ponytail" / "normal mode" turn ponytail off, but only as a standalone
// command (the whole message), so an ordinary request like "add a normal mode
// toggle" does not disable it mid-task.
function isDeactivationCommand(text) {
  const t = String(text || '').trim().toLowerCase().replace(/[.!?\s]+$/, '');
  return t === 'stop ponytail' || t === 'normal mode';
}

function getClaudeDir() {
  // CLAUDE_CONFIG_DIR overrides ~/.claude, matching Claude Code.
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}

function getDefaultMode() {
  const envMode = process.env.PONYTAIL_DEFAULT_MODE;
  if (envMode && RUNTIME_MODES.includes(envMode.toLowerCase())) return envMode.toLowerCase();
  return DEFAULT_MODE;
}

module.exports = {
  DEFAULT_MODE,
  RUNTIME_MODES,
  normalizeMode,
  isDeactivationCommand,
  getClaudeDir,
  getDefaultMode,
};
```

- [ ] **Step 2: Verify it loads and exports the expected surface**

Run:
```bash
cd /Users/davidlee/Projects/dmi_superpowers
node -e "const c=require('./hooks/ponytail-config'); console.assert(c.normalizeMode('ULTRA ')==='ultra'); console.assert(c.normalizeMode('bogus')===null); console.assert(c.isDeactivationCommand('Normal Mode.')===true); console.assert(c.isDeactivationCommand('add a normal mode toggle')===false); console.assert(c.getDefaultMode()==='full'); console.log('PASS');"
```
Expected: prints `PASS` with no assertion errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/ponytail-config.js
git commit -m "feat: add ponytail hook config resolver

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Port the mode-flag runtime

**Files:**
- Create: `hooks/ponytail-runtime.js`

**Interfaces:**
- Consumes: `./ponytail-config` (`getClaudeDir`), env vars `PLUGIN_DATA` (Codex), `CURSOR_PLUGIN_ROOT` (Cursor).
- Produces (relied on by Task 5):
  - `readMode()` → trimmed flag-file contents or `null` if absent (this export does **not** exist upstream; it is the addition that enables per-turn re-injection)
  - `setMode(mode)` → writes the flag file (creating its dir)
  - `clearMode()` → deletes the flag file (no-op if absent)
  - `writeHookOutput(mode, context)` → writes harness-appropriate stdout (Claude: plain `context`; Codex: `{systemMessage, hookSpecificOutput.additionalContext}`; Cursor: `{additional_context}`)
  - `statePath` — absolute path of the flag file (for tests)

- [ ] **Step 1: Create the module**

Create `hooks/ponytail-runtime.js`:
```js
// dmi-superpowers ponytail — mode-flag persistence + per-harness hook output.
// Adapted from ponytail by DietrichGebert — MIT (https://github.com/DietrichGebert/ponytail).

const fs = require('fs');
const path = require('path');
const { getClaudeDir } = require('./ponytail-config');

const STATE_FILE = '.ponytail-active';
const isCursor = Boolean(process.env.CURSOR_PLUGIN_ROOT);
const isCodex = !isCursor && Boolean(process.env.PLUGIN_DATA);

let stateDir = getClaudeDir();
if (isCodex) stateDir = process.env.PLUGIN_DATA;
if (isCursor && process.env.CURSOR_PLUGIN_ROOT) stateDir = process.env.CURSOR_PLUGIN_ROOT;

const statePath = path.join(stateDir, STATE_FILE);

function readMode() {
  try {
    return fs.readFileSync(statePath, 'utf8').trim() || null;
  } catch (e) {
    return null;
  }
}

function setMode(mode) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, mode);
}

function clearMode() {
  try { fs.unlinkSync(statePath); } catch (e) {}
}

// UserPromptSubmit context injection differs per harness:
//   Cursor  -> { additional_context }
//   Codex   -> { systemMessage, hookSpecificOutput.additionalContext }
//   Claude  -> plain stdout becomes added context
function writeHookOutput(mode, context = '') {
  if (isCursor) {
    process.stdout.write(JSON.stringify(context ? { additional_context: context } : {}));
    return;
  }
  if (isCodex) {
    const output = { systemMessage: `PONYTAIL:${mode.toUpperCase()}` };
    if (context) {
      output.hookSpecificOutput = { hookEventName: 'UserPromptSubmit', additionalContext: context };
    }
    process.stdout.write(JSON.stringify(output));
    return;
  }
  process.stdout.write(context);
}

module.exports = { readMode, setMode, clearMode, writeHookOutput, statePath, isCodex, isCursor };
```

- [ ] **Step 2: Verify the flag round-trips in an isolated dir**

Run:
```bash
cd /Users/davidlee/Projects/dmi_superpowers
CLAUDE_CONFIG_DIR="$(mktemp -d)" node -e "const r=require('./hooks/ponytail-runtime'); console.assert(r.readMode()===null,'empty'); r.setMode('ultra'); console.assert(r.readMode()==='ultra','set'); r.clearMode(); console.assert(r.readMode()===null,'cleared'); console.log('PASS');"
```
Expected: prints `PASS` with no assertion errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/ponytail-runtime.js
git commit -m "feat: add ponytail mode-flag runtime with readMode for per-turn injection

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Port the instruction builder

**Files:**
- Create: `hooks/ponytail-instructions.js`

**Interfaces:**
- Consumes: `./ponytail-config` (`DEFAULT_MODE`, `normalizeMode`), the skill body at `../skills/ponytail/SKILL.md` (Task 1).
- Produces (relied on by Task 5):
  - `getPonytailInstructions(mode)` → `"PONYTAIL MODE ACTIVE — level: <mode>\n\n" + <skill body, frontmatter stripped, intensity-table rows and worked-example bullets filtered to <mode>>`. Falls back to `getFallbackInstructions(mode)` if the skill file can't be read.
  - `filterSkillBodyForMode(body, mode)` and `getFallbackInstructions(mode)` (exported for completeness/testing).

- [ ] **Step 1: Create the module**

Create `hooks/ponytail-instructions.js`:
```js
// dmi-superpowers ponytail — builds the per-level instruction text from the skill body.
// Adapted from ponytail by DietrichGebert — MIT (https://github.com/DietrichGebert/ponytail).

const fs = require('fs');
const path = require('path');
const { DEFAULT_MODE, normalizeMode } = require('./ponytail-config');

const SKILL_PATH = path.join(__dirname, '..', 'skills', 'ponytail', 'SKILL.md');

function filterSkillBodyForMode(body, mode) {
  const effectiveMode = normalizeMode(mode) || DEFAULT_MODE;
  const withoutFrontmatter = String(body || '').replace(/^---[\s\S]*?---\s*/, '');

  // Only the intensity-table rows and worked examples are mode-specific, and
  // both are keyed by a mode name (lite/full/ultra). A bullet whose label is
  // not a mode -- e.g. "No unrequested abstractions: ..." -- is a normal rule
  // and must be kept verbatim.
  return withoutFrontmatter
    .split(/\r?\n/)
    .filter((line) => {
      const tableLabel = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|/);
      if (tableLabel) {
        const labelMode = normalizeMode(tableLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }
      const exampleLabel = line.match(/^-\s*([^:]+):\s*/);
      if (exampleLabel) {
        const labelMode = normalizeMode(exampleLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }
      return true;
    })
    .join('\n');
}

function getFallbackInstructions(mode) {
  return 'PONYTAIL MODE ACTIVE — level: ' + mode + '\n\n' +
    'You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written.\n\n' +
    'ACTIVE EVERY RESPONSE. No drift back to over-building. Still active if unsure. Off only: "stop ponytail" / "normal mode".\n\n' +
    'The ladder, first rung that holds: (1) does this need to exist at all? YAGNI. (2) stdlib does it? use it. ' +
    '(3) native platform feature? use it. (4) already-installed dependency? use it. (5) one line? one line. (6) only then, the minimum code that works.\n\n' +
    'Deletion over addition. Boring over clever. Fewest files. Shortest working diff. No unrequested abstractions, no avoidable dependencies, no boilerplate. ' +
    'Mark deliberate simplifications with a `ponytail:` comment naming the ceiling and upgrade path.\n\n' +
    'Never simplify away: input validation at trust boundaries, error handling that prevents data loss, security, accessibility, or anything explicitly requested. ' +
    'Deletion test: delete the thing -- if complexity vanishes or moves it was shallow, cut it; if complexity concentrates it is a deep module, keep it. ' +
    'Lazy code without its check is unfinished: non-trivial logic leaves ONE runnable check behind.';
}

function getPonytailInstructions(mode) {
  const effectiveMode = normalizeMode(mode) || DEFAULT_MODE;
  try {
    return 'PONYTAIL MODE ACTIVE — level: ' + effectiveMode + '\n\n' +
      filterSkillBodyForMode(fs.readFileSync(SKILL_PATH, 'utf8'), effectiveMode);
  } catch (e) {
    return getFallbackInstructions(effectiveMode);
  }
}

module.exports = { filterSkillBodyForMode, getFallbackInstructions, getPonytailInstructions };
```

- [ ] **Step 2: Verify filtering selects the active level and keeps normal rules**

Run:
```bash
cd /Users/davidlee/Projects/dmi_superpowers
node -e "const i=require('./hooks/ponytail-instructions'); const u=i.getPonytailInstructions('ultra'); console.assert(/level: ultra/.test(u),'header'); console.assert(/YAGNI extremist/.test(u),'ultra row kept'); console.assert(!/Build what's asked, but name the lazier/.test(u),'lite row dropped'); console.assert(/No unrequested abstractions/.test(u),'normal rule kept'); console.log('PASS');"
```
Expected: prints `PASS` — the ultra intensity row is kept, the lite row is dropped, and the non-mode "No unrequested abstractions" rule survives.

- [ ] **Step 3: Commit**

```bash
git add hooks/ponytail-instructions.js
git commit -m "feat: add ponytail instruction builder with per-level filtering

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: The UserPromptSubmit mode-tracker + its runnable check

This is the core deliverable: the hook that detects `/ponytail` commands, persists the level, and re-injects the ruleset every turn while active. It is built test-first against the three modules from Tasks 2–4.

**Files:**
- Create: `hooks/ponytail-mode-tracker.js`
- Test: `hooks/ponytail-mode-tracker.test.js`

**Interfaces:**
- Consumes: `./ponytail-config` (`getDefaultMode`, `isDeactivationCommand`), `./ponytail-runtime` (`readMode`, `setMode`, `clearMode`, `writeHookOutput`), `./ponytail-instructions` (`getPonytailInstructions`).
- Produces: a runnable Node hook reading `UserPromptSubmit` JSON on stdin (`{ "prompt": "..." }`) and writing injected context to stdout. Also exports `handle(prompt)` for testing.

- [ ] **Step 1: Write the failing integration test**

Create `hooks/ponytail-mode-tracker.test.js`:
```js
// dmi-superpowers ponytail — runnable check for the UserPromptSubmit hook.
// Run: node hooks/ponytail-mode-tracker.test.js
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const SCRIPT = path.join(__dirname, 'ponytail-mode-tracker.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ponytail-test-'));
const flag = path.join(tmp, '.ponytail-active');
const env = { ...process.env, CLAUDE_CONFIG_DIR: tmp };
delete env.PLUGIN_DATA;
delete env.CURSOR_PLUGIN_ROOT;

function run(prompt) {
  return execFileSync('node', [SCRIPT], { input: JSON.stringify({ prompt }), env, encoding: 'utf8' });
}

// 1. Plain-text "ponytail ultra" sets the flag and injects the ULTRA ruleset.
let out = run('ponytail ultra');
assert.strictEqual(fs.readFileSync(flag, 'utf8'), 'ultra', 'plain trigger sets ultra');
assert.match(out, /level: ultra/i, 'injects ultra ruleset on activation');

// 2. "be lazy" activates at the default level (full).
out = run('be lazy');
assert.strictEqual(fs.readFileSync(flag, 'utf8'), 'full', 'be lazy activates default');

// 3. The /-prefixed, namespaced form is matched as a best-effort bonus.
out = run('/dmi-superpowers:ponytail lite');
assert.strictEqual(fs.readFileSync(flag, 'utf8'), 'lite', 'slash+namespace bonus form sets level');

// 4. A normal turn re-injects the ruleset while a level is active.
out = run('add a date picker to the signup form');
assert.match(out, /PONYTAIL MODE ACTIVE/i, 're-injects every turn while active');

// 5. A sentence merely containing a trigger word does NOT toggle the mode.
out = run('a normal mode toggle would be nice');
assert.strictEqual(fs.readFileSync(flag, 'utf8'), 'lite', 'partial phrase leaves mode unchanged');

// 6. "normal mode" as a standalone message clears the flag.
out = run('normal mode');
assert.ok(!fs.existsSync(flag), 'deactivation phrase clears the flag');

// 7. A normal turn with no active mode injects nothing.
out = run('add a date picker to the signup form');
assert.strictEqual(out, '', 'no injection when inactive (off by default)');

fs.rmSync(tmp, { recursive: true, force: true });
console.log('PASS — ponytail-mode-tracker');
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
cd /Users/davidlee/Projects/dmi_superpowers
node hooks/ponytail-mode-tracker.test.js
```
Expected: FAIL — `Cannot find module '.../hooks/ponytail-mode-tracker.js'` (the hook doesn't exist yet).

- [ ] **Step 3: Write the mode-tracker hook**

Create `hooks/ponytail-mode-tracker.js`:
```js
#!/usr/bin/env node
// dmi-superpowers ponytail — UserPromptSubmit hook.
// Detects plain-text activation triggers (e.g. "ponytail ultra", "be lazy"),
// persists the active level to a flag file, and
// re-injects the level-filtered ruleset on EVERY turn while a level is active
// (off by default). This per-turn re-injection -- not present upstream -- is
// what makes the minimalism mode persist across responses and survive compaction.
// Adapted from ponytail by DietrichGebert — MIT (https://github.com/DietrichGebert/ponytail).

const { getDefaultMode, isDeactivationCommand } = require('./ponytail-config');
const { readMode, setMode, clearMode, writeHookOutput } = require('./ponytail-runtime');
const { getPonytailInstructions } = require('./ponytail-instructions');

// Whole-message activation: optional /@$ prefix, optional dmi-superpowers: namespace,
// the word "ponytail", optional level. Anchored at both ends so a sentence that merely
// contains "ponytail" does not toggle the mode. The slash forms are a best-effort bonus
// (Claude Code may intercept an unregistered /ponytail before the hook fires).
const PONYTAIL_RE = /^[/@$]?(?:dmi-superpowers:)?ponytail(?:\s+(lite|full|ultra|off))?$/;
// Slash-free aliases that activate at the default level.
const ACTIVATE_ALIASES = new Set(['be lazy', 'lazy mode']);

function handle(prompt) {
  // Trim, lowercase, and drop trailing punctuation so "ponytail." / "be lazy!" still match.
  const lower = (prompt || '').trim().toLowerCase().replace(/[.!?]+$/, '');

  const m = lower.match(PONYTAIL_RE);
  if (m) {
    const arg = m[1] || '';
    if (arg === 'off') {
      clearMode();
      return writeHookOutput('off', 'PONYTAIL MODE OFF');
    }
    const mode = ['lite', 'full', 'ultra'].includes(arg) ? arg : getDefaultMode();
    setMode(mode);
    return writeHookOutput(mode, getPonytailInstructions(mode));
  }

  if (ACTIVATE_ALIASES.has(lower)) {
    const mode = getDefaultMode();
    setMode(mode);
    return writeHookOutput(mode, getPonytailInstructions(mode));
  }

  // Deactivation phrase as a standalone message ("stop ponytail" / "normal mode").
  if (isDeactivationCommand(lower)) {
    clearMode();
    return writeHookOutput('off', 'PONYTAIL MODE OFF');
  }

  // Otherwise: re-inject the ruleset every turn while a level is active.
  const active = readMode();
  if (active && active !== 'off') {
    writeHookOutput(active, getPonytailInstructions(active));
  }
}

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    // Strip a UTF-8 BOM some shells prepend when piping (breaks JSON.parse).
    const data = JSON.parse(input.replace(/^﻿/, ''));
    handle(data.prompt || '');
  } catch (e) {
    // Silent fail — a hook must never block a turn.
  }
});

module.exports = { handle };
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
cd /Users/davidlee/Projects/dmi_superpowers
node hooks/ponytail-mode-tracker.test.js
```
Expected: prints `PASS — ponytail-mode-tracker` (all five assertions hold).

- [ ] **Step 5: Commit**

```bash
git add hooks/ponytail-mode-tracker.js hooks/ponytail-mode-tracker.test.js
git commit -m "feat: add ponytail UserPromptSubmit hook with per-turn re-injection

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Wire the hook into Claude Code

**Files:**
- Modify: `hooks/hooks.json`

**Interfaces:**
- Consumes: `hooks/ponytail-mode-tracker.js` (Task 5), the `${CLAUDE_PLUGIN_ROOT}` substitution Claude Code provides.
- Produces: a `UserPromptSubmit` hook entry that runs the mode-tracker via `node` with a presence guard, leaving the existing `SessionStart` entry untouched.

- [ ] **Step 1: Add the UserPromptSubmit entry**

Replace the entire contents of `hooks/hooks.json` with:
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" session-start",
            "async": false
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "command -v node >/dev/null 2>&1 && node \"${CLAUDE_PLUGIN_ROOT}/hooks/ponytail-mode-tracker.js\" || exit 0",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 2: Verify the JSON is valid and contains both hook events**

Run:
```bash
cd /Users/davidlee/Projects/dmi_superpowers
node -e "const h=require('./hooks/hooks.json'); console.assert(h.hooks.SessionStart,'SessionStart kept'); console.assert(h.hooks.UserPromptSubmit[0].hooks[0].command.includes('ponytail-mode-tracker.js'),'UserPromptSubmit wired'); console.log('PASS');"
```
Expected: prints `PASS`.

- [ ] **Step 3: Commit**

```bash
git add hooks/hooks.json
git commit -m "feat: wire ponytail mode-tracker into Claude Code UserPromptSubmit

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Add the over-engineering lens to the reviewer template

**Files:**
- Modify: `skills/requesting-code-review/code-reviewer.md`

**Interfaces:**
- Consumes: the tag taxonomy and deletion test (Global Constraints).
- Produces: a standing, clearly-delimited "Over-engineering / simplification" section in the reviewer's **Output Format**, structurally separate from the Critical/Important/Minor severities, printing `Lean already. Ship.` when there is nothing to cut.

- [ ] **Step 1: Add the lens instruction to the "What to Check" prose**

In `skills/requesting-code-review/code-reviewer.md`, find the line that ends the "Structural quality & simplification" bullet list (the bullet beginning `- Unnecessary sequential orchestration...`). Immediately after that bullet, add:
```
    Report these in the dedicated "Over-engineering / simplification"
    output section below, one line per finding, using the tag taxonomy
    (`delete:` / `stdlib:` / `native:` / `yagni:` / `shrink:`). Apply the
    deletion test before proposing any deletion: delete the thing and ask
    what happens to the complexity — if it vanishes or merely moves, the
    thing was shallow, cut it; if it concentrates because the thing was
    hiding real work, it is a deep module, keep it.
```

- [ ] **Step 2: Add the standing output section to the Output Format**

In the same file, in the `## Output Format` fenced block, immediately after the `### Strengths\n[What's well done? Be specific.]` lines and before `### Issues`, insert:
```
    ### Over-engineering / simplification
    One line per finding: `L<line>: <tag> <what>. <replacement>.`
    (or `<file>:L<line>: ...` for multi-file diffs). Tags:
    `delete:` dead/speculative code (replaces with nothing) ·
    `stdlib:` hand-rolled thing the stdlib ships (name it) ·
    `native:` dep/code the platform already does (name the feature) ·
    `yagni:` one-implementation abstraction, config nobody sets, single-caller layer ·
    `shrink:` same logic, fewer lines (show the shorter form).
    End with `net: -<N> lines possible.`
    If there is nothing to cut, write `Lean already. Ship.` and nothing else here.
    This section never reclassifies a correctness bug — those stay in the severities below.
```

- [ ] **Step 3: Verify both edits landed**

Run:
```bash
cd /Users/davidlee/Projects/dmi_superpowers
grep -q "### Over-engineering / simplification" skills/requesting-code-review/code-reviewer.md && \
grep -q "Lean already. Ship." skills/requesting-code-review/code-reviewer.md && \
grep -q "Apply the" skills/requesting-code-review/code-reviewer.md && \
echo "PASS"
```
Expected: prints `PASS`.

- [ ] **Step 4: Commit**

```bash
git add skills/requesting-code-review/code-reviewer.md
git commit -m "feat: add standing over-engineering lens to code reviewer template

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Add the Simplify/delete candidate type to architecture review

**Files:**
- Modify: `skills/improve-codebase-architecture/SKILL.md`

**Interfaces:**
- Consumes: the deletion test and tag taxonomy (Global Constraints).
- Produces: a second candidate type ("Simplify / delete") in the Explore and report steps, alongside the existing "Deepen" candidate. `disable-model-invocation: true` and the HTML report format are left unchanged.

- [ ] **Step 1: Broaden the opening framing**

In `skills/improve-codebase-architecture/SKILL.md`, replace this paragraph (lines ~9):
```
Surface architectural friction and propose **deepening opportunities** — refactors that turn shallow modules into deep ones. The aim is testability and AI-navigability.
```
with:
```
Surface architectural friction and propose two kinds of candidate, both decided by the **deletion test**: **deepening opportunities** — refactors that turn shallow modules into deep ones — and **simplify / delete opportunities** — shallow or speculative structure to cut. The aim is testability and AI-navigability. A codebase improves as much by deleting shallow cruft as by deepening.
```

- [ ] **Step 2: Add the Simplify/delete prompts to the Explore step**

In the `### 1. Explore` section, immediately after the bullet `- Which parts of the codebase are untested, or hard to test through their current interface?`, add:
```
- Where is there **over-engineering to cut** — a reinvented standard-library
  function, a dependency doing what the platform already does, an interface
  with one implementation, config nobody sets, dead flexibility? These are
  **Simplify / delete** candidates.
```
Then replace the deletion-test paragraph:
```
Apply the **deletion test** to anything you suspect is shallow: would deleting it concentrate complexity, or just move it? A "yes, concentrates" is the signal you want.
```
with:
```
Apply the **deletion test** to every candidate: delete the thing and ask what happens to the complexity. If it *concentrates* because the thing was hiding real work, it is a **deep module** — a Deepen candidate, keep and extend it. If it vanishes or merely moves, the thing was **shallow** or speculative — a Simplify / delete candidate, cut it.
```

- [ ] **Step 3: Add the Simplify/delete card variant to the report step**

In `### 2. Present candidates as an HTML report`, immediately after the line `For each candidate, render a card with:` and its bullet list (ending at the `- **Recommendation strength**` bullet), add:
```
**Candidate type:** tag each card as **Deepen** or **Simplify / delete**. For
Simplify / delete cards, label the specific move with the tag taxonomy —
`delete:` / `stdlib:` / `native:` / `yagni:` / `shrink:` — and state the line
count the deletion saves. The before/after diagram shows the structure
shrinking rather than deepening.
```

- [ ] **Step 4: Verify the edits landed and the format guardrails are intact**

Run:
```bash
cd /Users/davidlee/Projects/dmi_superpowers
grep -q "simplify / delete opportunities" skills/improve-codebase-architecture/SKILL.md && \
grep -q "Simplify / delete candidates" skills/improve-codebase-architecture/SKILL.md && \
grep -q "disable-model-invocation: true" skills/improve-codebase-architecture/SKILL.md && \
grep -q "self-contained HTML file" skills/improve-codebase-architecture/SKILL.md; \
grep -q "Candidate type:" skills/improve-codebase-architecture/SKILL.md && echo "PASS"
```
Expected: prints `PASS` (new candidate type present; manual-invoke flag and HTML report untouched).

- [ ] **Step 5: Commit**

```bash
git add skills/improve-codebase-architecture/SKILL.md
git commit -m "feat: add simplify/delete candidate type to architecture review

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Reconcile the skill inventory and record attribution

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: the real skill count from the filesystem.
- Produces: a README inventory that lists `ponytail`, a corrected skill count in both README and AGENTS.md, and an attribution note crediting upstream ponytail (MIT).

- [ ] **Step 1: Determine the real skill count**

Run:
```bash
cd /Users/davidlee/Projects/dmi_superpowers
ls -1 skills | wc -l
```
Expected: `25` (24 existing skill directories + the new `ponytail`). Use this number in the edits below; if it differs, use the actual output.

- [ ] **Step 2: Add `ponytail` to the README skill inventory**

Read `README.md`, find the skill inventory list, and add an entry in the same format the other skills use. The description line to use:
```
ponytail — persistent minimalism mode: defaults every solution to the simplest thing that works (YAGNI, stdlib/native first, shortest diff), at intensity lite/full/ultra. Off by default; `/ponytail [level]` to activate.
```
Update any skill-count figure in `README.md` (e.g. "23 skills") to the count from Step 1.

- [ ] **Step 3: Add the attribution note to the README**

Add a short attribution line to `README.md` (in a Credits/Acknowledgements section if one exists, otherwise near the license note):
```
The `ponytail` skill and its persistence hook are adapted from [ponytail](https://github.com/DietrichGebert/ponytail) by DietrichGebert, used under the MIT License.
```

- [ ] **Step 4: Correct the count in AGENTS.md**

In `AGENTS.md`, under `## Facts`, change:
```
- Skill namespace: `dmi-superpowers:`  ·  ~23 skills — see README for the inventory
```
to use the count from Step 1 (e.g. `~25 skills`).

- [ ] **Step 5: Verify**

Run:
```bash
cd /Users/davidlee/Projects/dmi_superpowers
grep -q "ponytail" README.md && \
grep -qi "DietrichGebert" README.md && \
grep -q "skills" AGENTS.md && \
echo "PASS — review the count by eye"
```
Expected: prints `PASS — review the count by eye`. Confirm the number you wrote matches Step 1's output.

- [ ] **Step 6: Commit**

```bash
git add README.md AGENTS.md
git commit -m "docs: add ponytail to skill inventory, reconcile count, credit upstream

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Eval gate (required before merge — PRD §9 / ADR-0002)

ADR-0002 means a subagent dispatched in this authoring session runs the *old* loaded skill content, so naive subagent testing validates the wrong thing. This task is the three-part verified method. It produces no code; it produces the before/after evidence the PR requires.

**Files:** none modified. Evidence is captured for the PR body.

- [ ] **Step 1: Hook unit test (automated)**

Run:
```bash
cd /Users/davidlee/Projects/dmi_superpowers
node hooks/ponytail-mode-tracker.test.js
```
Expected: `PASS — ponytail-mode-tracker`. Capture this output for the PR's Evidence section.

- [ ] **Step 2: Content-simulation (skill behavior, incl. a deep-module boundary case)**

Dispatch a fresh subagent and paste the **full body** of `skills/ponytail/SKILL.md` directly into its prompt (do not rely on the skill loader — ADR-0002). Give it two tasks and record the responses:
1. *"Add an in-memory cache for these API responses"* — expect a stdlib/one-line answer (e.g. `functools.lru_cache`), not a custom cache class. Confirms minimalism.
2. **Deep-module boundary case** — *"This parser module has a 5-line interface over 400 lines of RFC-handling. Should we delete the abstraction and inline it?"* — expect the deletion test to say **keep** (complexity concentrates → deep module). Confirms ponytail does not over-delete.

Separately paste the amended `### Over-engineering / simplification` section from `code-reviewer.md` into a subagent reviewing a diff that reinvents a stdlib function; expect a one-line `stdlib:` finding and a `net: -N lines possible.` tally, with correctness findings left in the severities.

- [ ] **Step 3: Post-reinstall live test**

Reinstall the plugin from the branch, open a fresh session, then:
1. Type `/ponytail ultra`; confirm the hook injects the ULTRA ruleset.
2. Submit an unrelated coding request on the next turn; confirm minimalism instructions are still in context (per-turn re-injection working).
3. Type `normal mode`; confirm the flag clears and the next turn injects nothing.

Capture before/after behavior for the PR. Do not merge until Steps 1–3 pass.

- [ ] **Step 4: Open the PR**

Write the PR with the `dmi-superpowers:creating-a-pull-request` skill format (Title = plain-language outcome; Summary for a non-developer with an analogy; TLDR for developers; Evidence from Steps 1–3). One concern per PR is satisfied (this is a single feature). Note the model/harness/version per AGENTS.md.

---

## Self-Review

**1. PRD coverage:**

| PRD section | Task(s) |
|---|---|
| §3 new `ponytail` skill | Task 1 |
| §5 kept-verbatim / adapted content | Task 1 (Steps 1–2) |
| §5.1 persistence hook (tracker + injector + flag) | Tasks 2–6 |
| §4 deletion test embedded in skill / reviewer / arch | Tasks 1, 7, 8 |
| §6.1 `improve-codebase-architecture` Simplify/delete | Task 8 |
| §6.2 `code-reviewer.md` standing section | Task 7 |
| §7 provenance / attribution / README count | Tasks 1 (credit), 9 |
| §8 success criteria | verified in Task 10 |
| §9 three-part eval gate | Task 10 |
| §10 namespace/trigger parsing | Task 5 (anchored regex + aliases; test assertions 1–3, 5) + ADR-0005 |

No gaps. CONTEXT.md glossary and ADR-0003/0004 were written during grill-with-docs and need no task here.

**2. Placeholder scan:** No "TBD"/"implement later"/"add error handling" — every code step shows complete content; every prose edit gives exact insert text and a grep verification.

**3. Type consistency:** Export names are consistent across tasks — `readMode/setMode/clearMode/writeHookOutput` (Task 3) are the exact names imported in Task 5; `getPonytailInstructions` (Task 4) matches its import in Task 5; `normalizeMode/getDefaultMode/isDeactivationCommand/getClaudeDir` (Task 2) match their consumers in Tasks 3–5. The flag file `.ponytail-active` and `CLAUDE_CONFIG_DIR` override are used identically in the runtime (Task 3) and the test (Task 5).

**Note on TDD scope:** classic red-green applies only to the hook (Task 5), the one genuinely unit-testable unit and the ponytail-mandated "one runnable check." The skill, configs, and prose edits are create/modify-plus-grep-verify tasks; their behavioral verification is the Task 10 eval gate, per ADR-0002.
