import { useState } from 'react';
import type { Chapter, Course } from '../../types/content';
import { getChapterProgress } from '../../lib/progressSelectors';
import { useProgress } from '../../context/ProgressContext';
import { useRunCode } from '../../hooks/useRunCode';
import { bareCode, runJSX, jsxApi } from '../../engine/interpreters.js';
import { CodeEditor } from '../CodeEditor';
import { OutputPanel, type RunResult } from '../OutputPanel';
import { DbCard } from '../SqlTable';
import { DsaLangBar } from '../DsaLangBar';
import { dsaLang, DSA_LANGS } from '../../data/dsaLangs';
import { ICON } from '../../lib/icons.js';

interface ChallengeStageProps {
  course: Course;
  chapter: Chapter;
  onCompleted: () => void;
}

export function ChallengeStage({ course, chapter: c, onCompleted }: ChallengeStageProps) {
  const { data, setChallengeDone, setDsaLang } = useProgress();
  const ch = c.challenge!;
  const s = getChapterProgress(data, c.id);
  const run = useRunCode();

  const isDsa = course.id === 'dsa';
  const curLang = dsaLang(data.dsaLang);
  const isRefMode = isDsa && curLang !== 'js';

  const editorLang = isRefMode ? DSA_LANGS[curLang].hl : course.lang;
  const editorFile = isRefMode ? DSA_LANGS[curLang].file : course.file;
  const editorCode = isRefMode ? ch.starters![curLang] : ch.starter!;
  const editorId = `${c.id}-chal${isRefMode ? '-' + curLang : ''}`;

  const [result, setResult] = useState<RunResult | null>(null);
  const [testResults, setTestResults] = useState<boolean[] | null>(null);
  const [testsMsg, setTestsMsg] = useState('');
  const [hintShown, setHintShown] = useState(false);

  function handleRunTests(code: string) {
    if (isRefMode) {
      setTestsMsg(
        `Live tests run in JavaScript. Switch to JavaScript to take this challenge. ${DSA_LANGS[curLang].name} challenges are checked once a real ${DSA_LANGS[curLang].rt} is wired up.`,
      );
      return;
    }
    const res = run(course.lang, code);
    setResult(res);
    const bare = bareCode(course.lang, code);
    const ran = !res.error && !res.unsupported;
    const results = ch.tests.map((t) => {
      if (!ran) return false;
      try {
        if (course.lang === 'jsx') {
          const r = runJSX(code);
          return !r.error && !!r.host && !!t.check(bare, r.host.textContent, jsxApi(r));
        }
        if (course.lang === 'sql') {
          return !!t.check(bare, '', { results: res.results, last: res.results?.[res.results.length - 1] });
        }
        if (course.lang === 'js') {
          const callable = res as unknown as { call: (n: string, ...a: unknown[]) => unknown };
          return !!t.check(bare, res.out || '', { call: (n: string, ...a: unknown[]) => callable.call(n, ...a), out: res.out });
        }
        if (course.lang === 'git') {
          return !!t.check(bare, res.out || '', { repo: (res as unknown as { repo: unknown }).repo });
        }
        return !!t.check(bare, res.out || '');
      } catch {
        return false;
      }
    });
    setTestResults(results);
    const passed = results.filter(Boolean).length;
    const all = passed === ch.tests.length;
    setTestsMsg(all ? 'All checks passed. Nice work.' : !ran ? 'Fix the error above, then run the tests again.' : `${passed} of ${ch.tests.length} checks passed. Keep going.`);
    if (all && !s.challenge) {
      setChallengeDone(c.id);
      setTimeout(onCompleted, 900);
    }
  }

  return (
    <div className="chal">
      <div className="chal-head">
        <h2>{ch.title}</h2>
        {s.challenge && <span className="pill ok">Completed</span>}
      </div>
      <div className="prose" dangerouslySetInnerHTML={{ __html: ch.prompt }} />
      <ul className="tests" id="tests">
        {ch.tests.map((t, k) => (
          <li key={k} className={`test ${testResults ? (testResults[k] ? 'ok' : 'fail') : ''}`}>
            <span className="tk" dangerouslySetInnerHTML={{ __html: testResults ? (testResults[k] ? ICON.check : ICON.cross) : '' }} />
            <span>{t.label}</span>
          </li>
        ))}
      </ul>
      <DsaLangBar courseId={course.id} />
      <DbCard lang={course.lang} />
      {isRefMode && (
        <div className="refnote">
          Challenges run live in JavaScript. You can read and edit the {DSA_LANGS[curLang].name} starter below.
          <button className="btn sec sm" type="button" onClick={() => setDsaLang('js')}>
            Switch to JavaScript
          </button>
        </div>
      )}
      <CodeEditor
        key={editorId}
        id={editorId}
        initialCode={editorCode}
        lang={editorLang}
        file={editorFile}
        runLabel="Run tests"
        onRun={handleRunTests}
        onReset={() => {
          setResult(null);
          setTestResults(null);
          setTestsMsg('');
        }}
        output={<OutputPanel lang={editorLang} result={result} />}
      />
      <p className="tests-msg" id="testsMsg" aria-live="polite">
        {testsMsg}
      </p>
      <div className="hint-row">
        <button className="btn ghost sm" type="button" onClick={() => setHintShown((h) => !h)}>
          {hintShown ? 'Hide hint' : 'Show a hint'}
        </button>
      </div>
      {hintShown && <div className="callout" dangerouslySetInnerHTML={{ __html: ch.hint }} />}
    </div>
  );
}
