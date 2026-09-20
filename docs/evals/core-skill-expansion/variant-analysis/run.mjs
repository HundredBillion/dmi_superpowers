import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const root = resolve(import.meta.dirname);
const scenario = JSON.parse(readFileSync(join(root, 'scenario.json'), 'utf8'));
const arm = process.argv[2] ?? 'baseline';
const checklist = /clarified|refined/.test(arm)
  ? JSON.parse(readFileSync(join(root, 'clarified-checklist.json'), 'utf8'))
  : scenario.checklist;
const out = join(root, arm);
if (existsSync(join(out, 'worker-prompt.txt'))) throw new Error(`Arm already exists: ${arm}`);
mkdirSync(out, { recursive: true });

const skillPaths = arm === 'baseline'
  ? scenario.skills
  : [...scenario.skills, 'skills/variant-analysis/SKILL.md'];
const skill = skillPaths.map(path => readFileSync(resolve(root, '../../../..', path), 'utf8')).join('\n\n');
const prompt = `You are working in a coding session. The following skill is active; follow it.\n\n--- BEGIN SKILL ---\n${skill}\n--- END SKILL ---\n\nTask: ${scenario.task}\n\nDo the task. Show your work.\n`;
writeFileSync(join(out, 'worker-prompt.txt'), prompt);

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'dmi-variant-eval-'));
  const files = {
    'INCIDENT.md': '# Payment capture incident\n\nConfirmed root cause: `Number.parseInt(req.body.amount, 10)` accepts a numeric prefix and ignores trailing junk.\n\n```text\n$ node --test tests/capture.test.js\nnot ok 1 - capture rejects a numeric prefix with trailing characters\nExpected exception, received 125\n```\n',
    'package.json': '{"type":"module","scripts":{"test":"node --test tests/*.test.js"}}\n',
    'src/payments/capture.js': 'export function captureAmount(req) {\n  const cents = Number.parseInt(req.body.amount, 10);\n  if (!Number.isFinite(cents) || cents <= 0) throw new Error("invalid amount");\n  return cents;\n}\n',
    'src/payments/refund.js': 'export function refundAmount(req) {\n  const cents = Number.parseInt(req.body.amount, 10);\n  if (!Number.isFinite(cents) || cents <= 0) throw new Error("invalid amount");\n  return cents;\n}\n',
    'src/wallet/top-up.js': 'export function topUpAmount(payload) {\n  const cents = Number.parseInt(payload.amount, 10);\n  if (!Number.isFinite(cents) || cents <= 0) throw new Error("invalid amount");\n  return cents;\n}\n',
    'src/payouts/create.js': 'export function payoutAmount(req) {\n  const cents = parseInt(req.body.amount, 10);\n  if (!Number.isFinite(cents) || cents <= 0) throw new Error("invalid amount");\n  return cents;\n}\n',
    'src/http/pagination.js': 'export function pageNumber(req) {\n  const raw = req.query.page ?? "1";\n  if (!/^[1-9]\\d*$/.test(raw)) throw new Error("invalid page");\n  return Number.parseInt(raw, 10);\n}\n',
    'src/orders/load.js': 'export function orderId(req) {\n  const raw = req.params.id;\n  if (!/^\\d+$/.test(raw)) throw new Error("invalid order id");\n  return parseInt(raw, 10);\n}\n',
    'tests/capture.test.js': 'import test from "node:test";\nimport assert from "node:assert/strict";\nimport { captureAmount } from "../src/payments/capture.js";\n\ntest("capture rejects a numeric prefix with trailing characters", () => {\n  assert.throws(() => captureAmount({ body: { amount: "125junk" } }), /invalid amount/);\n});\n'
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
  const graderPrompt = `Below is a transcript of an agent doing a task. Answer each checklist item\nstrictly PASS or FAIL based only on what the transcript shows.\n\nChecklist:\n${checklist.join('\n')}\n\nTranscript:\n${worker.response}\n\nOutput: one line per checklist item, PASS or FAIL, then a one-line reason.\n`;
  const graded = await invoke(fixture(), graderPrompt);
  writeFileSync(join(out, `checkpoint-grader-${worker.run}.json`), JSON.stringify({ run: worker.run, prompt: graderPrompt, response: graded.response, stderr: graded.stderr, events: graded.events }, null, 2) + '\n');
  process.stdout.write(`grader ${worker.run}/5 complete\n`);
  return { run: worker.run, prompt: graderPrompt, ...graded };
});

const packedRuns = workers.map(worker => {
  const grader = grades.find(item => item.run === worker.run);
  return {
    run: worker.run,
    worker: {
      response: worker.response,
      thread_id: worker.events.find(e => e.type === 'thread.started')?.thread_id,
      usage: worker.events.find(e => e.type === 'turn.completed')?.usage,
      stderr: worker.stderr
    },
    grader: {
      response: grader.response,
      checks: [...grader.response.matchAll(/\b(PASS|FAIL)\b/g)].map(match => match[1]),
      thread_id: grader.events.find(e => e.type === 'thread.started')?.thread_id,
      usage: grader.events.find(e => e.type === 'turn.completed')?.usage,
      prompt_sha256: createHash('sha256').update(grader.prompt).digest('hex'),
      stderr: grader.stderr
    }
  };
});
const version = spawnSync('codex', ['--version'], { encoding: 'utf8' }).stdout.trim();
const evidence = {
  scenario: scenario.id,
  arm,
  source: 'working-tree baseline without proposed variant-analysis skill',
  environment: { harness: 'Codex CLI fresh ephemeral sessions', version, sandbox: 'read-only', model: 'CLI default', reasoning: 'CLI default' },
  skill_sha256: createHash('sha256').update(skill).digest('hex'),
  worker_prompt: 'worker-prompt.txt',
  worker_prompt_sha256: createHash('sha256').update(prompt).digest('hex'),
  grader_prompt_template: 'docs/evals/README.md GRADER_TEMPLATE',
  checklist,
  runs: packedRuns
};
writeFileSync(join(out, 'transcripts.json'), JSON.stringify(evidence, null, 2) + '\n');
writeFileSync(join(out, 'results.json'), JSON.stringify({
  scenario: scenario.id,
  arm,
  runs: packedRuns.map(item => ({ run: item.run, checks: item.grader.checks, pass: item.grader.checks.length === checklist.length && item.grader.checks.every(check => check === 'PASS') }))
}, null, 2) + '\n');
for (const run of [1, 2, 3, 4, 5]) {
  unlinkSync(join(out, `checkpoint-worker-${run}.json`));
  unlinkSync(join(out, `checkpoint-grader-${run}.json`));
}
process.stdout.write(`${JSON.stringify(JSON.parse(readFileSync(join(out, 'results.json'), 'utf8')), null, 2)}\n`);
