import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { courseOf, TIPS_MAP } from '../data/courses';
import { useProgress } from '../context/ProgressContext';
import { currentIdx, statusOf } from '../lib/progressSelectors';
import { Trail } from '../components/Trail';
import { ChapterPanel } from '../components/ChapterPanel';
import { ICON } from '../lib/icons.js';

export function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data } = useProgress();
  const course = courseId ? courseOf(courseId) : undefined;
  const chapters = useMemo(() => course?.chapters ?? [], [course]);

  const statusFn = useMemo(() => (i: number) => statusOf(data, chapters, i), [data, chapters]);
  const cur = useMemo(() => currentIdx(data, chapters), [data, chapters]);

  const [selected, setSelected] = useState<string | null>(null);
  const tips = course ? TIPS_MAP[course.id] : undefined;
  const [tip, setTip] = useState(0);

  useEffect(() => {
    if (!chapters.length) return;
    setSelected(chapters[cur >= 0 ? cur : 0].id);
    if (tips) setTip(Math.floor(Math.random() * tips.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id]);

  if (!course) return <Navigate to="/" replace />;

  const selectedChapter = chapters.find((c) => c.id === selected) || chapters[0];
  const selectedIdx = chapters.indexOf(selectedChapter);

  return (
    <div className="wrap home">
      <section className="map-col">
        <button className="back" type="button" onClick={() => navigate('/')}>
          <span dangerouslySetInnerHTML={{ __html: ICON.left }} /> All courses
        </button>
        <div className="course-head">
          <span className="glyph">{course.glyph}</span>
          <h1>{course.title}</h1>
        </div>
        <p className="lede">{course.intro}</p>
        <Trail chapters={chapters} statusOf={statusFn} currentIdx={cur} selectedId={selected} onSelect={setSelected} />
      </section>
      <aside className="side">
        <div className="panel" id="panel">
          {selectedChapter && (
            <ChapterPanel course={course} chapter={selectedChapter} index={selectedIdx} status={statusFn(selectedIdx)} />
          )}
        </div>
        {tips && (
          <div className="extras">
            <div className="zen">
              <q id="zenQ">{tips[tip % tips.length]}</q>
              <small>{course.id === 'python' ? 'From the Zen of Python' : 'Quick tip'}</small>
              <button type="button" onClick={() => setTip((t) => t + 1)}>
                Show another
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
