import { useNavigate } from 'react-router-dom';
import type { Chapter, Course } from '../types/content';
import { useProgress } from '../context/ProgressContext';
import { chDone, getChapterProgress, hasContent, learnDone, passMark, quizDone, type ChapterStatus } from '../lib/progressSelectors';
import { chIc } from '../lib/chIc';
import { ICON } from '../lib/icons.js';
import { DsaLangBar } from './DsaLangBar';

interface ChapterPanelProps {
  course: Course;
  chapter: Chapter;
  index: number;
  status: ChapterStatus;
}

export function ChapterPanel({ course, chapter: c, index: i, status: st }: ChapterPanelProps) {
  const navigate = useNavigate();
  const { data } = useProgress();

  const head = (
    <>
      <div className="panel-top">
        <div className="big" aria-hidden="true" dangerouslySetInnerHTML={{ __html: chIc(c) }} />
        <div>
          <h2>{c.title}</h2>
          <p className="alias">
            Chapter {i + 1}: {c.alias}
          </p>
        </div>
      </div>
      <p className="blurb">{c.blurb}</p>
      <DsaLangBar courseId={course.id} />
    </>
  );

  if (!hasContent(c)) {
    return (
      <>
        {head}
        <ul className="topics">
          {(c.topics || []).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="soon-note">This chapter's lessons are coming soon.</p>
        <div className="time">
          <span dangerouslySetInnerHTML={{ __html: ICON.clock }} />
          <span>About {c.minutes} minutes</span>
        </div>
      </>
    );
  }

  const s = getChapterProgress(data, c.id);
  const n = c.sections!.length;
  const secDone = c.sections!.filter((_, k) => s.sec[k]).length;
  const started = secDone > 0 || s.quiz >= 0 || s.challenge;

  const row = (ok: boolean, t: string, d: string) => (
    <li>
      <span className={`ico ${ok ? 'ok' : ''}`}>{ok && <span dangerouslySetInnerHTML={{ __html: ICON.check }} />}</span>
      <div>
        <b>{t}</b>
        <small>{d}</small>
      </div>
    </li>
  );

  return (
    <>
      {head}
      <ul className="steps">
        {row(learnDone(data, c), 'Learn', `${secDone} of ${n} lessons done`)}
        {row(
          quizDone(data, c),
          'Quiz',
          `${c.quiz!.length} questions, pass with ${passMark(c)}${s.quiz >= 0 ? ` (best: ${s.quiz})` : ''}`,
        )}
        {row(!!s.challenge, 'Challenge', s.challenge ? 'Tests passed' : `1 coding challenge: ${c.challenge!.title.toLowerCase()}`)}
      </ul>
      {st === 'locked' ? (
        <button className="btn block" disabled type="button">
          <span dangerouslySetInnerHTML={{ __html: ICON.lock }} /> Finish chapter {i} first
        </button>
      ) : (
        <button className="btn block" type="button" onClick={() => navigate(`/course/${course.id}/chapter/${c.id}`)}>
          {chDone(data, c) ? 'Review chapter' : started ? 'Continue' : 'Start chapter'}
        </button>
      )}
      <div className="time">
        <span dangerouslySetInnerHTML={{ __html: ICON.clock }} />
        <span>About {c.minutes} minutes</span>
      </div>
    </>
  );
}
