import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const root = resolve(import.meta.dirname);
const arm = process.argv[2];
const runNumber = Number(process.argv[3]);
if (!arm || !Number.isInteger(runNumber)) throw new Error('usage: regrade-one.mjs ARM RUN');
const evidence = JSON.parse(readFileSync(join(root, arm, 'transcripts.json'), 'utf8'));
const run = evidence.runs.find(item => item.run === runNumber);
if (!run) throw new Error(`missing run ${runNumber}`);
const prompt = `Below is a transcript of an agent doing a task. Answer each checklist item\nstrictly PASS or FAIL based only on what the transcript shows.\n\nChecklist:\n${evidence.checklist.join('\n')}\n\nTranscript:\n${run.worker.response}\n\nOutput: one line per checklist item, PASS or FAIL, then a one-line reason.\n`;
const cwd = mkdtempSync(join(tmpdir(), 'dmi-migration-regrade-'));
const child = spawn('codex', ['exec', '--ignore-user-config', '--ephemeral', '--skip-git-repo-check', '-C', cwd, '-s', 'read-only', '--json', '-']);
let stdout = '';
let stderr = '';
child.stdout.on('data', chunk => { stdout += chunk; });
child.stderr.on('data', chunk => { stderr += chunk; });
child.stdin.end(prompt);
const code = await new Promise((resolvePromise, reject) => {
  child.on('error', reject);
  child.on('close', resolvePromise);
});
if (code !== 0) throw new Error(`grader exited ${code}: ${stderr}`);
const events = stdout.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
const response = events.filter(event => event.type === 'item.completed' && event.item?.type === 'agent_message').map(event => event.item.text).join('\n\n');
writeFileSync(join(root, arm, `run${runNumber}-regrade.json`), JSON.stringify({
  arm,
  run: runNumber,
  reason: 'Original grader returned fewer checklist decisions than requested',
  response,
  checks: [...response.matchAll(/\b(PASS|FAIL)\b/g)].map(match => match[1]),
  thread_id: events.find(event => event.type === 'thread.started')?.thread_id,
  usage: events.find(event => event.type === 'turn.completed')?.usage,
  stderr
}, null, 2) + '\n');
process.stdout.write(response + '\n');
