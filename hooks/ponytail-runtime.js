// dmi-superpowers ponytail — mode-flag persistence + per-harness hook output.
// Adapted from ponytail by DietrichGebert — MIT (https://github.com/DietrichGebert/ponytail).

const fs = require('fs');
const path = require('path');
const { getClaudeDir } = require('./ponytail-config');

const STATE_FILE = '.ponytail-active';

// Harness detection comes from the same table hooks/emit-context reads, so the
// two runtimes cannot disagree about which harness they are on. Before this,
// Codex was detected here from PLUGIN_DATA and nowhere else — no bash hook ever
// looked at that variable — so one Codex session could be "codex" to node and
// "unknown" to bash at the same moment.
const SHAPES = require('./harness-shapes.json');

function detect(name) {
  const entry = SHAPES.harnesses.find((h) => h.name === name);
  if (!entry) return false;
  if (!entry.detect.some((v) => Boolean(process.env[v]))) return false;
  return !entry.absent.some((v) => Boolean(process.env[v]));
}

const isCursor = detect('cursor');
const isCodex = !isCursor && detect('codex');

let stateDir = getClaudeDir();
// PLUGIN_DATA is Codex's writable state dir; PLUGIN_ROOT is read-only, so it is
// a valid detector but not a valid place to keep the flag.
if (isCodex && process.env.PLUGIN_DATA) stateDir = process.env.PLUGIN_DATA;
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
