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
