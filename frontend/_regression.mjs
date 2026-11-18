import { writeFileSync, readFileSync, existsSync } from 'fs';
import { COURSES } from './src/data/content.js';
import { runCode } from './src/engine/interpreters.js';

// Note: 'react' (jsx) is excluded — runJSX() needs a real browser `document` for its host render tree, which isn't available under plain Node.
const RISK_LANGS = { python: 'python', c: 'c', cpp: 'cpp', java: 'java', js: 'js', dsa: 'js', sql: 'sql', git: 'git' };

function collectSamples() {
  const out = [];
  for (const cid of Object.keys(RISK_LANGS)) {
    const course = COURSES.find((c) => c.id === cid);
    for (const ch of course.chapters) {
      if (!ch.sections) continue;
      for (const sec of ch.sections) {
        out.push({ key: `${cid}/${ch.id}/sec:${sec.title}`, lang: course.lang, code: sec.code });
      }
      if (ch.challenge) {
        out.push({ key: `${cid}/${ch.id}/challenge-starter`, lang: course.lang, code: ch.challenge.starter });
      }
    }
  }
  return out;
}

const mode = process.argv[2] || 'check';
const samples = collectSamples();
const results = samples.map((s) => ({ key: s.key, lang: s.lang, result: runCode(s.lang, s.code) }));

if (mode === 'baseline') {
  writeFileSync('_regression_baseline.json', JSON.stringify(results, null, 1));
  console.log('Baseline saved:', results.length, 'samples');
} else {
  if (!existsSync('_regression_baseline.json')) {
    console.error('No baseline found. Run with "baseline" first.');
    process.exit(1);
  }
  const baseline = JSON.parse(readFileSync('_regression_baseline.json', 'utf8'));
  const baseMap = new Map(baseline.map((b) => [b.key, b.result]));
  let fails = 0, checked = 0;
  for (const r of results) {
    if (!baseMap.has(r.key)) continue; // new sample, not in baseline, nothing to compare
    checked++;
    const a = JSON.stringify(baseMap.get(r.key));
    const b = JSON.stringify(r.result);
    if (a !== b) {
      fails++;
      console.log('--- MISMATCH:', r.key, '---');
      console.log('before:', a);
      console.log('after: ', b);
    }
  }
  console.log(fails === 0 ? `OK: all ${checked} baseline samples still match (${results.length - checked} new samples not in baseline)` : `${fails} / ${checked} baseline samples regressed`);
}
