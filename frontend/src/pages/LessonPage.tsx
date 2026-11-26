import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { courseOf } from '../data/courses';
import { useProgress } from '../context/ProgressContext';
import { useDialog } from '../context/DialogContext';
import { chDone, getChapterProgress, hasContent, learnDone, quizDone } from '../lib/progressSelectors';
import { chIc } from '../lib/chIc';
import { ICON, ic } from '../lib/icons.js';
import { burst } from '../lib/burst';
import { LearnStage } from '../components/stages/LearnStage';
import { QuizStage } from '../components/stages/QuizStage';
import { ChallengeStage } from '../components/stages/ChallengeStage';

type Stage = 'learn' | 'quiz' | 'challenge';

export function LessonPage() {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const { data, loading, setLast, completeChapter, toggleSectionDone } = useProgress();
  const { showDialog, closeDialog } = useDialog();

  const course = courseId ? courseOf(courseId) : undefined;
  const chapter = course?.chapters.find((c) => c.id === chapterId);

  const [stage, setStage] = useState<Stage>('learn');
  const [sec, setSec] = useState(0);
  const [completionCheck, setCompletionCheck] = useState(false);
  const mountedFor = useRef<string | null>(null);

  useEffect(() => {
    // Wait for saved progress, otherwise a refreshed page always opens at the first lesson.
    if (!course || !chapter || loading) return;
    const key = `${course.id}/${chapter.id}`;
    if (mountedFor.current === key) return;
    mountedFor.current = key;
    const s = getChapterProgress(data, chapter.id);
    if (!learnDone(data, chapter)) {
      setStage('learn');
      const firstTodo = (chapter.sections || []).findIndex((_, k) => !s.sec[k]);
      setSec(Math.max(0, firstTodo));
    } else if (!quizDone(data, chapter)) {
      setStage('quiz');
    } else if (!s.challenge) {
      setStage('challenge');
    } else {
      setStage('learn');
      setSec(0);
    }
    setLast(course.id, chapter.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id, chapter?.id, loading]);

  // The quiz/challenge stages request a check; it runs here once their progress update has rendered.
  useEffect(() => {
    if (!completionCheck || !course || !chapter) return;
    setCompletionCheck(false);
    if (getChapterProgress(data, chapter.id).done || !chDone(data, chapter)) return;
    completeChapter(chapter.id);
    showCompletion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completionCheck, data]);

  function showCompletion() {
    if (!course || !chapter) return;
    const i = course.chapters.indexOf(chapter);
    const nx = course.chapters[i + 1];
    const nextOpen = nx && hasContent(nx);
    showDialog(
      <div className="scrim" onClick={(e) => e.target === e.currentTarget && closeDialog()}>
        <div className="dlg" role="dialog" aria-modal="true" aria-labelledby="dlgT">
          <button className="dlg-x" aria-label="Close" type="button" onClick={closeDialog}>
            <span dangerouslySetInnerHTML={{ __html: ICON.cross }} />
          </button>
          <div className="party" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ic('trophy') }} />
          <h2 id="dlgT">Chapter {i + 1} complete</h2>
          <p>
            {nextOpen
              ? `Chapter ${i + 2}, ${nx.title}, is now open.`
              : nx
                ? `Chapter ${i + 2} is coming soon.`
                : 'You finished the whole course.'}
          </p>
          <div className="nav-row">
            <button
              className="btn sec"
              type="button"
              onClick={() => {
                closeDialog();
                navigate(`/course/${course.id}`);
              }}
            >
              Course map
            </button>
            {nextOpen ? (
              <button
                className="btn"
                type="button"
                onClick={() => {
                  closeDialog();
                  navigate(`/course/${course.id}/chapter/${nx.id}`);
                }}
              >
                Start chapter {i + 2}
              </button>
            ) : (
              <button
                className="btn"
                type="button"
                onClick={() => {
                  closeDialog();
                  navigate('/');
                }}
              >
                All courses
              </button>
            )}
          </div>
        </div>
      </div>,
    );
    burst(window.innerWidth / 2, window.innerHeight / 2);
  }

  if (!course || !chapter || !hasContent(chapter)) return <Navigate to={course ? `/course/${course.id}` : '/'} replace />;

  const i = course.chapters.indexOf(chapter);
  const s = getChapterProgress(data, chapter.id);

  const tab = (key: Stage, label: string, done: boolean) => (
    <button className="tab" role="tab" aria-selected={stage === key} type="button" onClick={() => setStage(key)}>
      <span className={`ico ${done ? 'ok' : ''}`}>{done && <span dangerouslySetInnerHTML={{ __html: ICON.check }} />}</span>
      {label}
    </button>
  );

  return (
    <div className="wrap">
      <button className="back" type="button" onClick={() => navigate(`/course/${course.id}`)}>
        <span dangerouslySetInnerHTML={{ __html: ICON.left }} /> {course.name} course map
      </button>
      <div className="l-head">
        <div className="big" aria-hidden="true" dangerouslySetInnerHTML={{ __html: chIc(chapter) }} />
        <div>
          <h1>{chapter.title}</h1>
          <p>
            {course.name}, chapter {i + 1} of {course.chapters.length}: {chapter.alias}
          </p>
        </div>
      </div>
      <div className="tabs" role="tablist" aria-label="Chapter steps">
        {tab('learn', 'Learn', learnDone(data, chapter))}
        {tab('quiz', 'Quiz', quizDone(data, chapter))}
        {tab('challenge', 'Challenge', !!s.challenge)}
      </div>
      {stage === 'learn' && (
        <LearnStage
          course={course}
          chapter={chapter}
          sectionIndex={sec}
          onSelectSection={setSec}
          onPrev={() => setSec((v) => Math.max(0, v - 1))}
          onNext={() => {
            toggleSectionDone(chapter.id, sec);
            if (sec < chapter.sections!.length - 1) {
              setSec(sec + 1);
            } else {
              setStage('quiz');
            }
          }}
        />
      )}
      {stage === 'quiz' && (
        <QuizStage
          key={chapter.id}
          chapter={chapter}
          onGoToLearn={() => setStage('learn')}
          onGoToChallenge={() => setStage('challenge')}
          onFinished={() => setCompletionCheck(true)}
        />
      )}
      {stage === 'challenge' && (
        <ChallengeStage key={chapter.id} course={course} chapter={chapter} onCompleted={() => setCompletionCheck(true)} />
      )}
    </div>
  );
}
