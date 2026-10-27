# Systematic Debugging — Examples & Technique Menus

Mechanics, worked examples, and technique menus deferred from `SKILL.md`:
orientation mechanics, ways to construct a feedback loop, locating where a
multi-component bug breaks, tightening the loop, non-deterministic bugs, and
instrumentation tool preference. See [SKILL.md](SKILL.md) for the enforced
gates these support.

## Phase 0 — Orient

Before anything else, get your bearings. **Orientation only — this does NOT license a fix.**

1. **Read error messages and stack traces completely.**
   - Don't skip past errors or warnings; they often contain the exact solution.
   - Note line numbers, file paths, error codes.

2. **Check recent changes.**
   - What changed that could cause this? `git diff`, recent commits.
   - New dependencies, config changes, environmental differences.

3. **Read `CONTEXT.md` and relevant ADRs** for the modules you're touching, to ground your mental model before you start probing.

Orientation gives you the shape of the problem. It does **not** entitle you to a fix — proceed to Phase 1 to build a loop.

## Ways to construct a loop

### Ways to construct one — try them in roughly this order

1. **Failing test** at whatever seam reaches the bug — unit, integration, e2e.
2. **Curl / HTTP script** against a running dev server.
3. **CLI invocation** with a fixture input, diffing stdout against a known-good snapshot.
4. **Headless browser script** (Playwright / Puppeteer) — drives the UI, asserts on DOM/console/network.
5. **Replay a captured trace.** Save a real network request / payload / event log to disk; replay it through the code path in isolation.
6. **Throwaway harness.** Spin up a minimal subset of the system (one service, mocked deps) that exercises the bug code path with a single function call.
7. **Property / fuzz loop.** If the bug is "sometimes wrong output", run 1000 random inputs and look for the failure mode.
8. **Bisection harness.** If the bug appeared between two known states (commit, dataset, version), automate "boot at state X, check, repeat" so you can `git bisect run` it.
9. **Differential loop.** Run the same input through old-version vs new-version (or two configs) and diff outputs.
10. **HITL bash script.** Last resort. If a human must click, drive _them_ with `scripts/hitl-loop.template.sh` so the loop is still structured. Captured output feeds back to you.

Build the right feedback loop, and the bug is 90% fixed.

### Locating *where* it breaks in a multi-component system

A sub-technique for building the loop when the bug spans **multiple components** (CI → build → signing, API → service → database). Before you can assert on the symptom, you often need to find which boundary fails. Add diagnostic instrumentation at each component boundary, then run **once** to gather evidence showing *where* it breaks:

```
For EACH component boundary:
  - Log what data enters component
  - Log what data exits component
  - Verify environment/config propagation
  - Check state at each layer

Run once to gather evidence showing WHERE it breaks
THEN analyze evidence to identify failing component
THEN narrow the feedback loop to that specific component
```

**Example (multi-layer system):**
```bash
# Layer 1: Workflow
echo "=== Secrets available in workflow: ==="
echo "IDENTITY: ${IDENTITY:+SET}${IDENTITY:-UNSET}"

# Layer 2: Build script
echo "=== Env vars in build script: ==="
env | grep IDENTITY || echo "IDENTITY not in environment"

# Layer 3: Signing script
echo "=== Keychain state: ==="
security list-keychains
security find-identity -v

# Layer 4: Actual signing
codesign --sign "$IDENTITY" --verbose=4 "$APP"
```

**This reveals:** which layer fails (secrets → workflow ✓, workflow → build ✗) — letting you point the feedback loop at the right component.

## Tighten the loop

### Tighten the loop

Treat the loop as a product. Once you have _a_ loop, **tighten** it:

- Can I make it faster? (Cache setup, skip unrelated init, narrow the test scope.)
- Can I make the signal sharper? (Assert on the specific symptom, not "didn't crash".)
- Can I make it more deterministic? (Pin time, seed RNG, isolate filesystem, freeze network.)

A 30-second flaky loop is barely better than no loop; a 2-second deterministic one is tight — a debugging superpower.

### Non-deterministic bugs

The goal is not a clean repro but a **higher reproduction rate**. Loop the trigger 100×, parallelise, add stress, narrow timing windows, inject sleeps. A 50%-flake bug is debuggable; 1% is not — keep raising the rate until it's debuggable.

## Tool preference

Tool preference:

1. **Debugger / REPL inspection** if the env supports it. One breakpoint beats ten logs.
2. **Targeted logs** at the boundaries that distinguish hypotheses.
3. Never "log everything and grep".

**Perf branch.** For performance regressions, logs are usually wrong. Instead: establish a baseline measurement (timing harness, `performance.now()`, profiler, query plan), then bisect. Measure first, fix second.
