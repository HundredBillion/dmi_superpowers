import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const scripts = path.resolve(__dirname, '../skills/subagent-driven-development/scripts');
const polluter = path.resolve(__dirname, '../skills/systematic-debugging/find-polluter.sh');
function fixture(t) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'dmi-helpers-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const run = (cmd, args, env = {}) => spawnSync(cmd, args, { cwd, encoding: 'utf8', env: { ...process.env, ...env } });
  const write = (name, text) => { fs.mkdirSync(path.dirname(path.join(cwd, name)), { recursive: true }); fs.writeFileSync(path.join(cwd, name), text); };
  const git = (...args) => { const r = run('git', args); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };
  git('init', '-q'); git('config', 'user.email', 'test@example.com'); git('config', 'user.name', 'Test');
  write('plan.md', '### Task 1: First\nDo first.\n### Task 2: Second\nDo second.\n');
  git('add', '.'); git('commit', '-qm', 'Initial');
  return { cwd, run, write, git, helper: (name, ...args) => run('bash', [path.join(scripts, name), ...args]) };
}

test('workspaces isolate same-basename plans and normalize aliases without touching legacy data', t => {
  const f = fixture(t);
  f.write('alpha/plan.md', 'alpha'); f.write('beta/plan.md', 'beta');
  f.write('.superpowers/sdd/ledger.md', 'legacy'); f.write('.superpowers/sdd/plan/ledger.md', 'unknown owner');
  const a = f.helper('sdd-workspace', 'alpha/plan.md'); const b = f.helper('sdd-workspace', 'beta/plan.md');
  assert.equal(a.status, 0, a.stderr); assert.equal(b.status, 0, b.stderr);
  assert.notEqual(a.stdout, b.stdout);
  assert.equal(f.helper('sdd-workspace', path.join(f.cwd, 'alpha/../alpha/plan.md')).stdout, a.stdout);
  fs.symlinkSync('alpha/plan.md', path.join(f.cwd, 'alias.md'));
  assert.equal(f.helper('sdd-workspace', 'alias.md').stdout, a.stdout);
  assert.equal(fs.readFileSync(path.join(f.cwd, '.superpowers/sdd/plan/ledger.md'), 'utf8'), 'unknown owner');
  assert.equal(fs.readFileSync(path.join(f.cwd, '.superpowers/sdd/ledger.md'), 'utf8'), 'legacy');
});

test('brief handoff is a path inside the owning plan workspace, even without executable bits', t => {
  const f = fixture(t);
  const copy = path.join(f.cwd, 'helpers'); fs.cpSync(scripts, copy, { recursive: true });
  fs.chmodSync(path.join(copy, 'sdd-workspace'), 0o644);
  const r = f.run('bash', [path.join(copy, 'task-brief'), 'plan.md', '1']);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(path.dirname(r.stdout.trim()), f.helper('sdd-workspace', 'plan.md').stdout.trim());
  assert.equal(fs.readFileSync(r.stdout.trim(), 'utf8'), '### Task 1: First\nDo first.\n');
});

test('an unknown-owner hashed workspace is preserved and its replacement is reused', t => {
  const f = fixture(t);
  const initial = f.helper('sdd-workspace', 'plan.md'); assert.equal(initial.status, 0, initial.stderr);
  const original = initial.stdout.trim();
  fs.unlinkSync(path.join(original, 'plan-path'));
  fs.writeFileSync(path.join(original, 'ledger.md'), 'unknown owner');
  const replacement = f.helper('sdd-workspace', 'plan.md'); assert.equal(replacement.status, 0, replacement.stderr);
  assert.notEqual(replacement.stdout, initial.stdout);
  assert.equal(f.helper('sdd-workspace', 'plan.md').stdout, replacement.stdout);
  assert.equal(fs.readFileSync(path.join(original, 'ledger.md'), 'utf8'), 'unknown owner');
  assert.equal(fs.existsSync(path.join(original, 'plan-path')), false);
});

test('brief rejects non-positive, non-integer and pattern/path task numbers', t => {
  const f = fixture(t);
  for (const number of ['0', '-1', '1.5', '1|2', '../escape', '1/../../escape']) {
    const r = f.helper('task-brief', 'plan.md', number);
    assert.notEqual(r.status, 0); assert.match(r.stderr, /invalid task number/);
  }
  assert.equal(fs.existsSync(path.join(f.cwd, '.superpowers')), false);
});

test('review rejects identical commits, non-commit objects, and divergent ranges', t => {
  const f = fixture(t);
  const identical = f.helper('review-package', 'plan.md', 'HEAD', 'HEAD');
  assert.notEqual(identical.status, 0); assert.match(identical.stderr, /same commit/);
  const blob = f.git('rev-parse', 'HEAD:plan.md');
  const noncommit = f.helper('review-package', 'plan.md', blob, 'HEAD');
  assert.notEqual(noncommit.status, 0); assert.match(noncommit.stderr, /bad BASE/);
  const base = f.git('rev-parse', 'HEAD');
  f.git('commit', '--allow-empty', '-qm', 'left'); const left = f.git('rev-parse', 'HEAD');
  const empty = f.helper('review-package', 'plan.md', base, left);
  assert.notEqual(empty.status, 0); assert.match(empty.stderr, /no net changes/);
  f.git('checkout', '--detach', base); f.git('commit', '--allow-empty', '-qm', 'right');
  const divergent = f.helper('review-package', 'plan.md', left, 'HEAD');
  assert.notEqual(divergent.status, 0); assert.match(divergent.stderr, /ancestor/);
});

test('review resolves annotated tags to commits and includes the whole task range', t => {
  const f = fixture(t);
  f.git('tag', '-am', 'base', 'base-tag');
  f.write('one.txt', 'one'); f.git('add', '.'); f.git('commit', '-qm', 'First change');
  f.write('two.txt', 'two'); f.git('add', '.'); f.git('commit', '-qm', 'Second change');
  const copy = path.join(f.cwd, 'helpers'); fs.cpSync(scripts, copy, { recursive: true });
  fs.chmodSync(path.join(copy, 'sdd-workspace'), 0o644);
  const r = f.run('bash', [path.join(copy, 'review-package'), 'plan.md', 'base-tag', 'HEAD']);
  assert.equal(r.status, 0, r.stderr);
  const content = fs.readFileSync(r.stdout.trim(), 'utf8');
  assert.match(content, /First change/); assert.match(content, /Second change/);
  assert.match(content, /one.txt/); assert.match(content, /two.txt/);
});

test('review refuses an add-and-revert range with an empty net diff', t => {
  const f = fixture(t); const base = f.git('rev-parse', 'HEAD');
  f.write('change.txt', 'change'); f.git('add', '.'); f.git('commit', '-qm', 'Change');
  f.git('revert', '--no-edit', 'HEAD');
  const r = f.helper('review-package', 'plan.md', base, 'HEAD');
  assert.notEqual(r.status, 0); assert.match(r.stderr, /no net changes/);
  assert.equal(fs.existsSync(path.join(f.cwd, '.superpowers')), false);
});

function polluterFixture(t, npmBody) {
  const f = fixture(t);
  f.write('bin/npm', '#!/usr/bin/env bash\n' + npmBody + '\n');
  fs.chmodSync(path.join(f.cwd, 'bin/npm'), 0o755);
  f.poll = pattern => f.run('bash', [polluter, 'pollution', pattern], { PATH: path.join(f.cwd, 'bin') + path.delimiter + process.env.PATH });
  return f;
}
test('polluter discovers top-level and nested tests and preserves spaces', t => {
  const f = polluterFixture(t, 'printf "%s\\n" "$2" >> calls');
  f.write('src/top test.test.ts', ''); f.write('src/nested/deep.test.ts', '');
  for (const pattern of ['src/**/*.test.ts', './src/**/*.test.ts']) {
    const r = f.poll(pattern); assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /Found 2 test files/);
  }
  assert.equal(fs.readFileSync(path.join(f.cwd, 'calls'), 'utf8').trim().split('\n').length, 4);
  assert.match(fs.readFileSync(path.join(f.cwd, 'calls'), 'utf8'), /\.\/src\/top test.test.ts/);
});
test('polluter cannot report clean with zero matches or failed test execution', t => {
  const f = polluterFixture(t, 'touch called\nexit 4');
  let r = f.poll('src/**/*.test.ts'); assert.notEqual(r.status, 0); assert.doesNotMatch(r.stdout, /all tests clean/);
  assert.match(r.stdout, /Found 0 test files/); assert.equal(fs.existsSync(path.join(f.cwd, 'called')), false);
  f.write('src/a.test.ts', ''); r = f.poll('src/**/*.test.ts'); assert.notEqual(r.status, 0); assert.doesNotMatch(r.stdout, /all tests clean/);
  assert.equal(fs.existsSync(path.join(f.cwd, 'called')), true);
});
test('polluter identifies pollution even when the polluting test fails', t => {
  const f = polluterFixture(t, 'touch pollution\nexit 4'); f.write('src/a.test.ts', '');
  const r = f.poll('src/**/*.test.ts'); assert.notEqual(r.status, 0); assert.match(r.stdout, /FOUND POLLUTER/);
});
test('preexisting pollution is an inconclusive run', t => {
  const f = polluterFixture(t, 'exit 0'); f.write('src/a.test.ts', ''); f.write('pollution', '');
  const r = f.poll('src/**/*.test.ts'); assert.notEqual(r.status, 0); assert.doesNotMatch(r.stdout, /all tests clean/);
});
test('polluter expands mixed zero-depth recursive segments', t => {
  const f = polluterFixture(t, 'exit 0');
  f.write('src/a/target/top.test.ts', ''); f.write('src/target/b/deep.test.ts', '');
  const r = f.poll('src/**/target/**/*.test.ts');
  assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /Found 2 test files/);
});
