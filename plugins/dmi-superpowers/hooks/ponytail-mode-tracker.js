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
