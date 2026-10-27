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
