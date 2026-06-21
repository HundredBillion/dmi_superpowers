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
