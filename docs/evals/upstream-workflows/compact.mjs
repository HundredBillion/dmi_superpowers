import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, renameSync, mkdtempSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';

// Run only once every arm is finished. Retain raw generated artifacts in /tmp.
const root = resolve(import.meta.dirname);
if (existsSync(join(root, 'index.json'))) throw new Error('Evidence already compacted; refusing to overwrite archives');
const archive = mkdtempSync(join(tmpdir(), 'dmi-upstream-eval-raw-'));
const index = [];
for (const scenario of readdirSync(root, {withFileTypes:true}).filter(e => e.isDirectory()).map(e => e.name)) {
  for (const arm of readdirSync(join(root, scenario), {withFileTypes:true}).filter(e => e.isDirectory()).map(e => e.name)) {
    const dir = join(root, scenario, arm);
    if (!existsSync(join(dir, 'results.json'))) continue;
    const result = JSON.parse(readFileSync(join(dir, 'results.json'), 'utf8'));
    if (result.results.length !== 5) throw new Error(`Incomplete arm: ${scenario}/${arm}`);
    const historyDirs = readdirSync(dir, {withFileTypes:true}).filter(e => e.isDirectory() && /grading/.test(e.name)).map(e => e.name);
    const prompt = readFileSync(join(dir, 'worker-prompt.txt'), 'utf8');
    function evidence(base, run, kind) {
      const textPath = join(base, `${run}-${kind}.txt`);
      if (!existsSync(textPath)) return null;
      const eventsPath = join(base, `${run}-${kind}.jsonl`);
      const events = existsSync(eventsPath) ? readFileSync(eventsPath, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
      const answer = readFileSync(textPath, 'utf8');
      const entry = { response: answer, thread_id: events.find(e => e.type === 'thread.started')?.thread_id, usage: events.find(e => e.type === 'turn.completed')?.usage, exit_code: 0 };
      if (kind === 'grader') {
        const gradePrompt = readFileSync(join(base, `${run}-grader-prompt.txt`), 'utf8');
        entry.checklist = gradePrompt.split('Checklist:\n')[1].split('\n\nTranscript:\n')[0];
        entry.prompt_sha256 = createHash('sha256').update(gradePrompt).digest('hex');
        entry.checks = [...answer.matchAll(/\b(PASS|FAIL)\b/g)].map(m => m[1]);
      }
      return entry;
    }
    const packed = {
      scenario, arm, source: result.source, environment: '../../environment.txt',
      worker_prompt: 'worker-prompt.txt', worker_prompt_sha256: createHash('sha256').update(prompt).digest('hex'),
      grader_prompt_template: 'Below is a transcript of an agent doing a task. Answer each checklist item\nstrictly PASS or FAIL based only on what the transcript shows.\n\nChecklist:\n{checklist}\n\nTranscript:\n{worker.response}\n\nOutput: one line per checklist item, PASS or FAIL, then a one-line reason.\n',
      runs: result.results.map(r => ({run:r.run, worker:evidence(dir,r.run,'worker'), grader:evidence(dir,r.run,'grader'), prior_grading:historyDirs.map(name => ({archive:name, ...evidence(join(dir,name),r.run,'grader')}))}))
    };
    for (const run of packed.runs) {
      for (const grade of [run.grader, ...run.prior_grading]) {
        if (!grade?.prompt_sha256) continue;
        const reconstructed = packed.grader_prompt_template.replace('{checklist}', () => grade.checklist).replace('{worker.response}', () => run.worker.response);
        if (createHash('sha256').update(reconstructed).digest('hex') !== grade.prompt_sha256) throw new Error(`Grader prompt reconstruction failed: ${scenario}/${arm}/${run.run}`);
      }
    }
    writeFileSync(join(dir, 'transcripts.json'), JSON.stringify(packed, null, 2) + '\n');
    const target = join(archive, scenario, arm);
    mkdirSync(target, {recursive:true});
    for (const name of readdirSync(dir)) {
      if (/^\d+-(worker|grader)/.test(name) || historyDirs.includes(name)) renameSync(join(dir,name),join(target,name));
    }
    index.push({scenario, arm, runs:result.results.length, passed:result.results.filter(r=>r.pass).length, prompt_sha256:packed.worker_prompt_sha256, raw_archive:target});
  }
}
writeFileSync(join(root,'index.json'),JSON.stringify({raw_archive:archive, arms:index},null,2)+'\n');
console.log(JSON.stringify({archive, arms:index},null,2));
