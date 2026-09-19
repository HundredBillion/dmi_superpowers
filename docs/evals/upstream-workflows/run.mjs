import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, copyFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtempSync } from 'node:fs';

// Archive generated evaluation artifacts, not repository source edits.
const [scenarioId = 'B', arm = 'baseline', mode = 'run'] = process.argv.slice(2);
const root = resolve(import.meta.dirname);
const scenario = JSON.parse(readFileSync(join(root, `${scenarioId}.json`), 'utf8'));
const source = scenario.skills.map(path => {
  if (arm !== 'baseline') return readFileSync(path, 'utf8');
  const frozen = spawnSync('git', ['show', `a293803:${path}`], { encoding: 'utf8' });
  if (frozen.status !== 0) throw new Error(`Cannot read frozen skill ${path}: ${frozen.stderr}`);
  return frozen.stdout;
}).join('\n\n');
const out = join(root, scenarioId, arm);
const promptPath = join(out, 'worker-prompt.txt');
if (mode !== 'regrade' && existsSync(promptPath)) throw new Error(`Arm already exists: ${scenarioId}/${arm}; choose a new arm name to preserve evidence`);
const prompt = mode === 'regrade'
  ? readFileSync(promptPath, 'utf8')
  : `You are working in a coding session. The following skill is active; follow it.\n\n--- BEGIN SKILL ---\n${source}\n--- END SKILL ---\n\nTask: ${scenario.task}\n\nDo the task. Show your work.\n`;
mkdirSync(out, { recursive: true });
if (mode === 'regrade') {
  const original = join(out, 'original-grading');
  const prior = existsSync(original) ? join(out, `prior-grading-${Date.now()}`) : original;
  mkdirSync(prior, {recursive: true});
  for (let run = 1; run <= 5; run++) {
    for (const suffix of ['grader.txt', 'grader.jsonl', 'grader.stderr.txt', 'grader-prompt.txt']) {
      const file = `${run}-${suffix}`;
      if (existsSync(join(out, file)) && !existsSync(join(prior, file))) copyFileSync(join(out, file), join(prior, file));
    }
  }
  if (existsSync(join(out, 'results.json')) && !existsSync(join(prior, 'results.json'))) copyFileSync(join(out, 'results.json'), join(prior, 'results.json'));
}
if (mode !== 'regrade') writeFileSync(promptPath, prompt);
const results = [];
for (let run = 1; run <= 5; run++) {
  const dir = mkdtempSync(join(tmpdir(), `dmi-eval-${scenarioId}-`));
  function invoke(kind, text) {
    const response = spawnSync('codex', ['exec', '--ignore-user-config', '--ephemeral', '--skip-git-repo-check', '-C', dir, '-s', 'read-only', '--json', '-'], {input: text, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 300000});
    writeFileSync(join(out, `${run}-${kind}.jsonl`), response.stdout);
    writeFileSync(join(out, `${run}-${kind}.stderr.txt`), response.stderr);
    if (response.status !== 0) throw new Error(`${kind} run ${run} exited ${response.status}: ${response.stderr}`);
    const events = response.stdout.trim().split('\n').map(line => JSON.parse(line));
    const answer = events.filter(e => e.type === 'item.completed' && e.item?.type === 'agent_message').map(e => e.item.text).join('\n\n');
    writeFileSync(join(out, `${run}-${kind}.txt`), answer);
    return answer;
  }
  const transcript = mode === 'regrade' ? readFileSync(join(out, `${run}-worker.txt`), 'utf8') : invoke('worker', prompt);
  const graderPrompt = `Below is a transcript of an agent doing a task. Answer each checklist item\nstrictly PASS or FAIL based only on what the transcript shows.\n\nChecklist:\n${scenario.checklist.join('\n')}\n\nTranscript:\n${transcript}\n\nOutput: one line per checklist item, PASS or FAIL, then a one-line reason.\n`;
  writeFileSync(join(out, `${run}-grader-prompt.txt`), graderPrompt);
  const grade = invoke('grader', graderPrompt);
  results.push({ run, grade, pass: !/\bFAIL\b/.test(grade), checks: [...grade.matchAll(/\b(PASS|FAIL)\b/g)].map(m => m[1]) });
  writeFileSync(join(out, 'results.json'), JSON.stringify({scenario: scenarioId, arm, model: 'gpt-6-astra (CLI default; verified by non-JSON probe)', reasoning: 'none (CLI default)', harness: 'Codex CLI fresh ephemeral sessions', version: spawnSync('codex', ['--version'], {encoding:'utf8'}).stdout.trim(), source: arm === 'baseline' ? 'a293803' : 'working-tree', results}, null, 2) + '\n');
  console.log(`${scenarioId} ${arm} ${run}/5: ${grade}`);
}
