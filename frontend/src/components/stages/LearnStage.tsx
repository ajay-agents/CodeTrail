import { useEffect, useState } from 'react';
import { ICON } from '../../lib/icons.js';
import { useProgress } from '../../context/ProgressContext';
import { getChapterProgress } from '../../lib/progressSelectors';
import type { Chapter, Course } from '../../types/content';
import { CodeEditor } from '../CodeEditor';
import { OutputPanel, type RunResult } from '../OutputPanel';
import { RefOutput } from '../RefOutput';
import { DbCard } from '../SqlTable';
import { DsaLangBar } from '../DsaLangBar';
import { dsaLang, DSA_LANGS } from '../../data/dsaLangs';
import { useRunCode } from '../../hooks/useRunCode';

interface LearnStageProps {
  course: Course;
  chapter: Chapter;
  sectionIndex: number;
  onSelectSection: (i: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function LearnStage({ course, chapter: c, sectionIndex, onSelectSection, onPrev, onNext }: LearnStageProps) {
  const { data, award, recordRun } = useProgress();
  const s = getChapterProgress(data, c.id);
  const sections = c.sections!;
  const sec = sections[sectionIndex];
  const last = sectionIndex === sections.length - 1;
  const run = useRunCode();
  const [result, setResult] = useState<RunResult | null>(null);
  const [refEdited, setRefEdited] = useState<boolean | null>(null);

  const isDsa = course.id === 'dsa';
  const curLang = dsaLang(data.dsaLang);
  const variant = isDsa ? sec.variants?.[curLang] : undefined;
  const isRef = isDsa && curLang !== 'js' && !!variant;

  const editorLang = isRef ? DSA_LANGS[curLang].hl : isDsa ? 'js' : course.lang;
  const editorFile = isRef ? DSA_LANGS[curLang].file : isDsa ? DSA_LANGS.js.file : course.file;
  const editorCode = isRef ? variant!.code : sec.code;
  const editorId = `${c.id}-s${sectionIndex}${isRef ? '-' + curLang : ''}`;

  useEffect(() => {
    setResult(null);
    setRefEdited(null);
  }, [editorId]);

  return (
    <div className="l-grid">
      <nav className="sec-nav" aria-label="Lessons">
        {sections.map((x, k) => (
          <button
            key={k}
            className="sec-btn"
            aria-current={k === sectionIndex ? 'step' : undefined}
            type="button"
            onClick={() => onSelectSection(k)}
          >
            <span className={`ico ${s.sec[k] ? 'ok' : ''}`}>{s.sec[k] && <span dangerouslySetInnerHTML={{ __html: ICON.check }} />}</span>
            {x.title}
          </button>
        ))}
      </nav>
      <div className="lesson-body">
        <h2>{sec.title}</h2>
        <div className="prose" dangerouslySetInnerHTML={{ __html: sec.body }} />
        <DsaLangBar courseId={course.id} />
        <p className="try">
          <b>Try it.</b> {sec.tryIt}
        </p>
        <DbCard lang={course.lang} />
        <CodeEditor
          key={editorId}
          id={editorId}
          initialCode={editorCode}
          lang={editorLang}
          file={editorFile}
          onRun={(code) => {
            if (isRef) {
              award('first');
              recordRun();
              setRefEdited(code.trim() !== editorCode.trim());
            } else {
              setResult(run(editorLang, code));
            }
          }}
          onReset={() => {
            setResult(null);
            setRefEdited(null);
          }}
          output={
            isRef ? (
              refEdited === null ? (
                <OutputPanel lang={editorLang} result={null} />
              ) : (
                <RefOutput output={variant!.out} edited={refEdited} langName={DSA_LANGS[curLang].name} runtime={DSA_LANGS[curLang].rt} />
              )
            ) : (
              <OutputPanel lang={editorLang} result={result} />
            )
          }
        />
        <div className="callout" dangerouslySetInnerHTML={{ __html: sec.callout }} />
        <div className="nav-row">
          {sectionIndex > 0 && (
            <button className="btn sec" type="button" onClick={onPrev}>
              <span dangerouslySetInnerHTML={{ __html: ICON.left }} /> Back
            </button>
          )}
          <button className="btn" type="button" onClick={onNext}>
            {last ? 'Start the quiz' : `Next: ${sections[sectionIndex + 1].title}`} <span dangerouslySetInnerHTML={{ __html: ICON.right }} />
          </button>
        </div>
      </div>
    </div>
  );
}
