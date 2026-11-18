import { useState } from 'react';
import type { Chapter } from '../../types/content';
import { passMark } from '../../lib/progressSelectors';
import { useProgress } from '../../context/ProgressContext';
import { ICON } from '../../lib/icons.js';

interface QuizState {
  i: number;
  picked: number | null;
  checked: boolean;
  correct: number;
  done: boolean;
}

const INITIAL: QuizState = { i: 0, picked: null, checked: false, correct: 0, done: false };

interface QuizStageProps {
  chapter: Chapter;
  onGoToLearn: () => void;
  onGoToChallenge: () => void;
  onFinished: () => void;
}

export function QuizStage({ chapter: c, onGoToLearn, onGoToChallenge, onFinished }: QuizStageProps) {
  const { recordQuizCorrect, finishQuiz } = useProgress();
  const [q, setQ] = useState<QuizState>(INITIAL);
  const quiz = c.quiz!;
  const n = quiz.length;

  if (q.done) {
    const pass = q.correct >= passMark(c);
    const title = q.correct === n ? 'Flawless run' : pass ? 'Nicely done' : 'Almost there';
    const msg = pass
      ? `You got ${q.correct} of ${n}.`
      : `You got ${q.correct} of ${n}. You need ${passMark(c)} to pass, so give the lessons another look.`;
    return (
      <div className="result">
        <div className="ring" style={{ ['--p' as string]: Math.round((q.correct / n) * 100) }}>
          <b>
            {q.correct}/{n}
          </b>
        </div>
        <div>
          <h2>{title}</h2>
          <p>{msg}</p>
          <div className="nav-row">
            <button className="btn sec" type="button" onClick={() => setQ(INITIAL)}>
              Try again
            </button>
            {pass ? (
              <button className="btn" type="button" onClick={onGoToChallenge}>
                Go to the challenge <span dangerouslySetInnerHTML={{ __html: ICON.right }} />
              </button>
            ) : (
              <button className="btn" type="button" onClick={onGoToLearn}>
                Back to the lessons
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const qq = quiz[q.i];
  const right = q.picked === qq.answer;

  return (
    <div className="quiz">
      <div className="q-prog" role="img" aria-label={`Question ${q.i + 1} of ${n}`}>
        {quiz.map((_, k) => (
          <i key={k} className={k < q.i ? 'done' : k === q.i ? 'now' : ''} />
        ))}
      </div>
      <h2 className="q-text" dangerouslySetInnerHTML={{ __html: qq.q }} />
      <div className="opts" role="radiogroup" aria-label="Answers">
        {qq.options.map((o, k) => {
          let cls = '';
          if (q.checked) cls = k === qq.answer ? 'good' : k === q.picked ? 'bad' : '';
          else if (q.picked === k) cls = 'sel';
          return (
            <button
              key={k}
              className={`opt ${cls}`}
              role="radio"
              aria-checked={q.picked === k}
              disabled={q.checked}
              type="button"
              onClick={() => setQ((prev) => ({ ...prev, picked: k }))}
            >
              <span className="ltr" aria-hidden="true">
                {'ABCD'[k]}
              </span>
              <span dangerouslySetInnerHTML={{ __html: o }} />
            </button>
          );
        })}
      </div>
      {q.checked && (
        <div className={`why ${right ? 'good' : 'bad'}`}>
          <b>{right ? 'Correct.' : 'Not quite.'}</b> <span dangerouslySetInnerHTML={{ __html: qq.why }} />
        </div>
      )}
      <div className="q-actions">
        {q.checked ? (
          <button
            className="btn"
            type="button"
            onClick={() => {
              if (q.i < n - 1) {
                setQ((prev) => ({ ...prev, i: prev.i + 1, picked: null, checked: false }));
              } else {
                finishQuiz(c.id, q.correct, n);
                setQ((prev) => ({ ...prev, done: true }));
                onFinished();
              }
            }}
          >
            {q.i === n - 1 ? 'See my score' : 'Next question'} <span dangerouslySetInnerHTML={{ __html: ICON.right }} />
          </button>
        ) : (
          <button
            className="btn"
            type="button"
            disabled={q.picked === null}
            onClick={() => {
              const correctNow = q.picked === qq.answer;
              if (correctNow) recordQuizCorrect();
              setQ((prev) => ({ ...prev, checked: true, correct: prev.correct + (correctNow ? 1 : 0) }));
            }}
          >
            Check answer
          </button>
        )}
      </div>
    </div>
  );
}
