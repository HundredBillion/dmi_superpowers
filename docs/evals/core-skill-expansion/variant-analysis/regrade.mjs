import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtempSync } from 'node:fs';

const root = resolve(import.meta.dirname);
const sourceArm = process.argv[2] ?? 'baseline';
const arm = process.argv[3] ?? 'baseline-clarified';
const sourceDir = join(root, sourceArm);
const out = join(root, arm);
if (existsSync(join(out, 'worker-prompt.txt'))) throw new Error(`Arm already exists: ${arm}`);
mkdirSync(out, { recursive: true });

const source = JSON.parse(readFileSync(join(sourceDir, 'transcripts.json'), 'utf8'));
const checklist = JSON.parse(readFileSync(join(root, 'clarified-checklist.json'), 'utf8'));
const workerPrompt = readFileSync(join(sourceDir, 'worker-prompt.txt'), 'utf8');
writeFileSync(join(out, 'worker-prompt.txt'), workerPrompt);

function fixture() {
  return mkdtempSync(join(tmpdir(), 'dmi-variant-regrade-'));
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

const grades = await mapLimit(source.runs, 2, async run => {
  const prompt = `Below is a transcript of an agent doing a task. Answer each checklist item\nstrictly PASS or FAIL based only on what the transcript shows.\n\nChecklist:\n${checklist.join('\n')}\n\nTranscript:\n${run.worker.response}\n\nOutput: one line per checklist item, PASS or FAIL, then a one-line reason.\n`;
  const graded = await invoke(fixture(), prompt);
  writeFileSync(join(out, `checkpoint-grader-${run.run}.json`), JSON.stringify({ run: run.run, prompt, response: graded.response, stderr: graded.stderr, events: graded.events }, null, 2) + '\n');
  process.stdout.write(`grader ${run.run}/5 complete\n`);
  return { run: run.run, prompt, ...graded };
});

const packedRuns = source.runs.map(run => {
  const grader = grades.find(item => item.run === run.run);
  return {
    run: run.run,
    worker: run.worker,
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
  scenario: source.scenario,
  arm,
  source: `existing ${sourceArm} worker outputs; graders are fresh`,
  environment: { harness: 'Codex CLI fresh ephemeral grader sessions', version, sandbox: 'read-only', model: 'CLI default', reasoning: 'CLI default' },
  skill_sha256: source.skill_sha256,
  worker_prompt: 'worker-prompt.txt',
  worker_prompt_sha256: source.worker_prompt_sha256,
  grader_prompt_template: 'docs/evals/README.md GRADER_TEMPLATE',
  checklist,
  runs: packedRuns
};
writeFileSync(join(out, 'transcripts.json'), JSON.stringify(evidence, null, 2) + '\n');
writeFileSync(join(out, 'results.json'), JSON.stringify({
  scenario: source.scenario,
  arm,
  runs: packedRuns.map(item => ({ run: item.run, checks: item.grader.checks, pass: item.grader.checks.length === checklist.length && item.grader.checks.every(check => check === 'PASS') }))
}, null, 2) + '\n');
for (const run of source.runs) unlinkSync(join(out, `checkpoint-grader-${run.run}.json`));
process.stdout.write(`${JSON.stringify(JSON.parse(readFileSync(join(out, 'results.json'), 'utf8')), null, 2)}\n`);
