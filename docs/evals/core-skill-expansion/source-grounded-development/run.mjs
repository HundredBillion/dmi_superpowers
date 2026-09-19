import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const root = resolve(import.meta.dirname);
const repoRoot = resolve(root, '../../../..');
const scenario = JSON.parse(readFileSync(join(root, 'scenario.json'), 'utf8'));
const arm = process.argv[2] ?? 'baseline';
const out = join(root, arm);
if (existsSync(join(out, 'worker-prompt.txt'))) throw new Error(`Arm already exists: ${arm}`);
mkdirSync(out, { recursive: true });

const skillPaths = arm === 'baseline'
  ? scenario.skills
  : [...scenario.skills, 'skills/source-grounded-development/SKILL.md'];
const skill = skillPaths.map(path => readFileSync(join(repoRoot, path), 'utf8')).join('\n\n');
const prompt = `You are working in a coding session. The following skill is active; follow it.\n\n--- BEGIN SKILL ---\n${skill}\n--- END SKILL ---\n\nTask: ${scenario.task}\n\nDo the task. Show your work.\n`;
writeFileSync(join(out, 'worker-prompt.txt'), prompt);

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'dmi-source-grounded-eval-'));
  const files = {
    'package.json': JSON.stringify({ name: 'profile-api', private: true, type: 'module', dependencies: { zod: '^4.1.0' }, scripts: { test: 'node --test tests/*.test.mjs' } }, null, 2) + '\n',
    'package-lock.json': JSON.stringify({ name: 'profile-api', lockfileVersion: 3, packages: { '': { dependencies: { zod: '^4.1.0' } }, 'node_modules/zod': { version: '4.1.5', resolved: 'https://registry.npmjs.org/zod/-/zod-4.1.5.tgz', integrity: 'sha512-fixture' } } }, null, 2) + '\n',
    'node_modules/zod/package.json': JSON.stringify({ name: 'zod', version: '4.1.5', type: 'module', exports: './index.mjs' }, null, 2) + '\n',
    'node_modules/zod/index.mjs': `export class ZodError extends Error {\n  constructor(issues) { super('validation failed'); this.name = 'ZodError'; this.issues = issues; }\n}\nfunction stringSchema(minimum = 0) { return { min(n) { return stringSchema(n); }, check(value, path) { return typeof value === 'string' && value.length >= minimum ? [] : [{ code: 'too_small', path, message: 'Too small: expected string to have >=' + minimum + ' characters' }]; } }; }\nexport const z = {\n  string() { return stringSchema(); },\n  object(shape) { return { safeParse(input) { const issues = []; for (const [key, schema] of Object.entries(shape)) issues.push(...schema.check(input?.[key], [key])); return issues.length ? { success: false, error: new ZodError(issues) } : { success: true, data: input }; } }; }\n};\n`,
    'src/profile-schema.mjs': `import { z } from 'zod';\nexport const profileSchema = z.object({ displayName: z.string().min(2) });\n`,
    'src/http/format-validation-error.mjs': `export function formatValidationError(error) {\n  return error.errors.map(({ code, path, message }) => ({ code, path, message }));\n}\n`,
    'src/routes/update-profile.mjs': `import { profileSchema } from '../profile-schema.mjs';\nimport { formatValidationError } from '../http/format-validation-error.mjs';\nexport function updateProfile(body) {\n  const parsed = profileSchema.safeParse(body);\n  if (!parsed.success) return { status: 422, body: { issues: formatValidationError(parsed.error) } };\n  return { status: 200, body: parsed.data };\n}\n`,
    'src/routes/create-profile.mjs': `import { profileSchema } from '../profile-schema.mjs';\nexport function createProfile(body) {\n  const parsed = profileSchema.safeParse(body);\n  if (!parsed.success) {\n    throw new Error('TODO validation response');\n  }\n  return { status: 201, body: parsed.data };\n}\n`,
    'tests/create-profile.test.mjs': `import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { createProfile } from '../src/routes/create-profile.mjs';\ntest('invalid profile returns stable issues', () => {\n  assert.deepEqual(createProfile({ displayName: '' }), { status: 422, body: { issues: [{ code: 'too_small', path: ['displayName'], message: 'Too small: expected string to have >=2 characters' }] } });\n});\ntest('valid profile is created', () => {\n  assert.deepEqual(createProfile({ displayName: 'Ada' }), { status: 201, body: { displayName: 'Ada' } });\n});\n`,
    'scripts/inspect-zod-error.mjs': `import { z } from 'zod';\nconst result = z.object({ name: z.string().min(2) }).safeParse({ name: '' });\nconsole.log(JSON.stringify({ version: (await import('zod/package.json', { with: { type: 'json' } })).default.version, keys: Object.keys(result.error), issues: result.error.issues, hasErrors: 'errors' in result.error }, null, 2));\n`,
    'docs/cache/popular-zod-errors-tutorial.md': `# Friendly Zod validation errors\n\nLast updated: 2023-08-12. Tested with Zod 3.22.\n\nCatch a \`ZodError\` and map \`error.errors\` to your API response. Add the article URL beside the workaround so future maintainers know where it came from.\n`,
    'docs/official/zod-4/errors.md': `# Zod 4.1 error customization\n\nOfficial documentation snapshot for Zod 4.1. Validation failures expose a \`ZodError\` whose structured entries are in \`error.issues\`. Each issue includes \`code\`, \`path\`, and \`message\`. Use \`safeParse\` when callers handle validation failure as data.\n\nSource: https://zod.dev/error-customization (snapshot captured for the installed major).\n`,
    'docs/official/zod-4/migration.md': `# Zod 4 migration notes\n\nOfficial migration snapshot. Zod 4 removed the undocumented \`ZodError.errors\` alias. Read structured validation details from \`ZodError.issues\`. Code copied from Zod 3 tutorials or local helpers using \`.errors\` must be migrated.\n\nSource: https://zod.dev/v4/changelog (snapshot captured for the installed major).\n`
  };
  for (const [path, contents] of Object.entries(files)) {
    const target = join(dir, path);
    mkdirSync(resolve(target, '..'), { recursive: true });
    writeFileSync(target, contents);
  }
  return dir;
}

function invoke(cwd, input) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('codex', ['exec', '--ignore-user-config', '--ephemeral', '--skip-git-repo-check', '-C', cwd, '-s', 'read-only', '--json', '-']);
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => {
      if (code !== 0) return reject(new Error(`codex exited ${code}: ${stderr}`));
      const events = stdout.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
      const response = events.filter(e => e.type === 'item.completed' && e.item?.type === 'agent_message').map(e => e.item.text).join('\n\n');
      resolvePromise({ response, stderr, events });
    });
    child.stdin.end(input);
  });
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

const workers = await mapLimit([1, 2, 3, 4, 5], 2, async run => {
  const result = await invoke(fixture(), prompt);
  writeFileSync(join(out, `checkpoint-worker-${run}.json`), JSON.stringify({ run, response: result.response, stderr: result.stderr, events: result.events }, null, 2) + '\n');
  process.stdout.write(`worker ${run}/5 complete\n`);
  return { run, ...result };
});

const grades = await mapLimit(workers, 2, async worker => {
  const graderPrompt = `Below is a transcript of an agent doing a task. Answer each checklist item\nstrictly PASS or FAIL based only on what the transcript shows.\n\nChecklist:\n${scenario.checklist.join('\n')}\n\nTranscript:\n${worker.response}\n\nOutput: one line per checklist item, PASS or FAIL, then a one-line reason.\n`;
  const graded = await invoke(fixture(), graderPrompt);
  writeFileSync(join(out, `checkpoint-grader-${worker.run}.json`), JSON.stringify({ run: worker.run, prompt: graderPrompt, response: graded.response, stderr: graded.stderr, events: graded.events }, null, 2) + '\n');
  process.stdout.write(`grader ${worker.run}/5 complete\n`);
  return { run: worker.run, prompt: graderPrompt, ...graded };
});

const packedRuns = workers.map(worker => {
  const grader = grades.find(item => item.run === worker.run);
  return {
    run: worker.run,
    worker: { response: worker.response, thread_id: worker.events.find(e => e.type === 'thread.started')?.thread_id, usage: worker.events.find(e => e.type === 'turn.completed')?.usage, stderr: worker.stderr },
    grader: { response: grader.response, checks: [...grader.response.matchAll(/\b(PASS|FAIL)\b/g)].map(match => match[1]), thread_id: grader.events.find(e => e.type === 'thread.started')?.thread_id, usage: grader.events.find(e => e.type === 'turn.completed')?.usage, prompt_sha256: createHash('sha256').update(grader.prompt).digest('hex'), stderr: grader.stderr }
  };
});
const evidence = {
  scenario: scenario.id,
  arm,
  source: 'working-tree baseline without proposed source-grounded-development skill',
  environment: { harness: 'Codex CLI fresh ephemeral sessions', version: spawnSync('codex', ['--version'], { encoding: 'utf8' }).stdout.trim(), sandbox: 'read-only', model: 'CLI default', reasoning: 'CLI default' },
  skill_sha256: createHash('sha256').update(skill).digest('hex'),
  worker_prompt: 'worker-prompt.txt',
  worker_prompt_sha256: createHash('sha256').update(prompt).digest('hex'),
  grader_prompt_template: 'docs/evals/README.md GRADER_TEMPLATE',
  checklist: scenario.checklist,
  runs: packedRuns
};
writeFileSync(join(out, 'transcripts.json'), JSON.stringify(evidence, null, 2) + '\n');
writeFileSync(join(out, 'results.json'), JSON.stringify({ scenario: scenario.id, arm, runs: packedRuns.map(item => ({ run: item.run, checks: item.grader.checks, pass: item.grader.checks.length === scenario.checklist.length && item.grader.checks.every(check => check === 'PASS') })) }, null, 2) + '\n');
for (const run of [1, 2, 3, 4, 5]) {
  unlinkSync(join(out, `checkpoint-worker-${run}.json`));
  unlinkSync(join(out, `checkpoint-grader-${run}.json`));
}
process.stdout.write(`${JSON.stringify(JSON.parse(readFileSync(join(out, 'results.json'), 'utf8')), null, 2)}\n`);
