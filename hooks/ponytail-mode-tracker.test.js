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
