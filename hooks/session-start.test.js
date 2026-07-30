// dmi-superpowers — runnable check for the SessionStart boot injection.
// Run: node hooks/session-start.test.js
//
// The hook injects a hand-trimmed summary of skills/using-superpowers/SKILL.md
// rather than the whole file (that file is already in the skill listing and
// loadable via the Skill tool). Because the summary is hand-authored, it can
// drift from the skill. This guard asserts the summary still carries the
// load-bearing rules AND stays small, so it can neither silently lose a rule
// nor silently regress to dumping the full ~5.9KB file back into every session.
const { execFileSync } = require('child_process');
const path = require('path');
const assert = require('assert');

const SCRIPT = path.join(__dirname, 'session-start');
const PLUGIN_ROOT = path.join(__dirname, '..');

// Run the hook under a given platform env and return parsed JSON + the injected
// context string, wherever that platform places it.
function run(extraEnv) {
  const env = { ...process.env };
  delete env.CLAUDE_PLUGIN_ROOT;
  delete env.CURSOR_PLUGIN_ROOT;
  delete env.COPILOT_CLI;
  Object.assign(env, extraEnv);
  const out = execFileSync('bash', [SCRIPT], { input: '', env, encoding: 'utf8' });
  const json = JSON.parse(out); // throws (fails the test) if the hook emits invalid JSON
  const ctx =
    json.hookSpecificOutput?.additionalContext ??
    json.additional_context ??
    json.additionalContext ??
    '';
  return { json, ctx };
}

// The rules the boot message MUST keep in sync with using-superpowers/SKILL.md.
// If you change a core rule in that skill, update the message in ./session-start
// and this list together.
const INVARIANTS = [
  /Skill tool/i,                    // the invocation mechanism
  /1%/,                             // the "even a ~1% chance" threshold
  /before ANY (response|action)/i, // invoke-before-acting
  /process skills first/i,         // ordering: process before implementation
  /user'?s instructions/i,         // priority order: user > skills > default
  /using-superpowers/,             // pointer to the full guide
];

const MAX_CTX_CHARS = 2500; // current ~1.2KB; full SKILL.md is ~5.9KB — catches a regression to the file dump

for (const [label, extraEnv] of [
  ['claude', { CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT }],
  ['cursor', { CURSOR_PLUGIN_ROOT: PLUGIN_ROOT }],
  ['copilot', { CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT, COPILOT_CLI: '1' }],
]) {
  const { ctx } = run(extraEnv);
  assert.ok(ctx.length > 0, `[${label}] injects some context`);
  assert.ok(
    ctx.length <= MAX_CTX_CHARS,
    `[${label}] injection is ${ctx.length} chars (max ${MAX_CTX_CHARS}) — did it regress to dumping the full SKILL.md?`
  );
  for (const re of INVARIANTS) {
    assert.match(ctx, re, `[${label}] boot message keeps invariant ${re}`);
  }
}

console.log('session-start boot injection: all invariants present, all 3 platform branches valid, size within budget.');
