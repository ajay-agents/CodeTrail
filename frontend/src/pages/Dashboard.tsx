import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { BADGES, COURSES, courseOf } from '../data/courses';
import { QUESTS } from '../data/quests';
import { level } from '../lib/levels';
import { chaptersDone, stagesDone } from '../lib/progressSelectors';
import { ic } from '../lib/icons.js';
import { highlight } from '../lib/highlight.js';

type Vibe = [string, string];
type Use = [string, string];

const META: Record<string, { vibe: Vibe; uses: Use[]; bolts: number }> = {
  python: { vibe: ['star', 'Most popular'], uses: [['ai', 'AI'], ['globe', 'Web'], ['chart', 'Data']], bolts: 1 },
  c: { vibe: ['mountain', 'Hard mode'], uses: [['cpu', 'Embedded'], ['server', 'Systems'], ['cap', 'CS basics']], bolts: 2 },
  cpp: { vibe: ['gamepad', 'Game dev energy'], uses: [['gamepad', 'Games'], ['bolt', 'Speed'], ['cpu', 'Robotics']], bolts: 3 },
  react: { vibe: ['atom', 'Build real UIs'], uses: [['globe', 'Web apps'], ['layers', 'Components'], ['bolt', 'Fast UIs']], bolts: 2 },
  sql: { vibe: ['database', 'Data superpower'], uses: [['chart', 'Analytics'], ['server', 'Backends'], ['cap', 'Interviews']], bolts: 1 },
  java: { vibe: ['coffee', 'Job magnet'], uses: [['server', 'Backend'], ['cpu', 'Android'], ['cap', 'Enterprise']], bolts: 2 },
  js: { vibe: ['globe', 'Runs everywhere'], uses: [['globe', 'Web'], ['layers', 'Frontend'], ['cloud', 'Node and APIs']], bolts: 1 },
  dsa: { vibe: ['target', 'Interview prep'], uses: [['cap', 'Interviews'], ['bolt', 'Faster code'], ['braces', '5 languages']], bolts: 3 },
  git: { vibe: ['branch', 'Every dev needs it'], uses: [['branch', 'Branching'], ['link', 'Teamwork'], ['cloud', 'Open source']], bolts: 1 },
};

const RIVALS = [
  { n: 'pixel_panda', h: 330, xp: 420 },
  { n: 'sudo_sara', h: 24, xp: 365 },
  { n: 'null_ninja', h: 262, xp: 290 },
  { n: 'byte.me', h: 188, xp: 210 },
  { n: 'loop_larry', h: 140, xp: 120 },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { data, loading, claimQuest } = useProgress();
  const coursesRef = useRef<HTMLDivElement>(null);

  if (loading || !data.daily) return <div className="page-loading">Loading your progress…</div>;

  const lv = level(data.xp);
  const d = data.daily;
  const hr = new Date().getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const chapN = COURSES.reduce((a, c) => a + chaptersDone(data, c), 0);
  const badgeN = Object.keys(data.badges).length;
  const week = [...Array(7)].map((_, k) => {
    const i = 6 - k;
    const dt = new Date(Date.now() - i * 86_400_000);
    return { on: i < data.streak, today: i === 0, letter: 'SMTWTFS'[dt.getDay()] };
  });
  const lastCourse = data.last && courseOf(data.last.course);
  const lastChapter = lastCourse && lastCourse.chapters.find((c) => c.id === data.last!.ch);
  const board = [...RIVALS, { n: 'You', xp: data.xp, you: true as const }].sort((a, b) => b.xp - a.xp);

  return (
    <div className="wrap dash">
      <section className="hero">
        <div>
          <span className="hi">
            <span dangerouslySetInnerHTML={{ __html: ic('ai') }} />
            {greet}
          </span>
          <h1>
            Learn to code. <span className="mark">Level up.</span> Repeat.
          </h1>
          <p className="lede">
            Bite-sized chapters, quizzes that pay out XP, and a streak worth protecting. Pick a course and get your
            first win today.
          </p>
          <div className="hero-cta">
            {lastChapter ? (
              <button className="btn pop" type="button" onClick={() => navigate(`/course/${lastCourse!.id}/chapter/${lastChapter.id}`)}>
                Jump back in
              </button>
            ) : (
              <button className="btn pop" type="button" onClick={() => coursesRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                Choose a course
              </button>
            )}
          </div>
          <p className="last-line">
            {lastChapter ? `Last time: ${lastCourse!.name}, ${lastChapter.title}` : 'Your first chapter takes about 25 minutes.'}
          </p>
        </div>
        <aside className="player" aria-label="Your progress">
          <div className="p-top">
            <span className="avatar" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ic(lv.icon) }} />
            <div className="p-name">
              <b>{lv.name}</b>
              <span>{lv.hi ? `${lv.hi - data.xp} XP to ${lv.nextName}` : 'Max level reached'}</span>
            </div>
          </div>
          <div className="xp-track" role="img" aria-label={`${lv.pct} percent to the next level`}>
            <u style={{ width: `${lv.pct}%` }} />
          </div>
          <div className="xp-meta">
            <span>{data.xp} XP</span>
            <span>{lv.hi ? `${lv.hi} XP` : ''}</span>
          </div>
          <div className="streak">
            <span className="flame" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ic('flame') }} />
            <div>
              <b>{data.streak}</b>
              <small> day streak</small>
            </div>
            <div className="week" role="img" aria-label="Last 7 days">
              {week.map((w, i) => (
                <i key={i} className={`${w.on ? 'on' : ''}${w.today ? ' today' : ''}`}>
                  {w.letter}
                </i>
              ))}
            </div>
          </div>
          <div className="p-stats">
            <div>
              <b>{chapN}</b>
              <small>chapters done</small>
            </div>
            <div>
              <b>{badgeN}</b>
              <small>badges</small>
            </div>
            <div>
              <b>{COURSES.length}</b>
              <small>courses</small>
            </div>
          </div>
        </aside>
      </section>

      <div className="sec-h" id="courses" ref={coursesRef}>
        <h2>Pick your path</h2>
        <p>Nine courses, one XP bar.</p>
      </div>
      <div className="courses">
        {COURSES.map((c) => {
          const sd = stagesDone(data, c);
          const total = c.chapters.length * 3;
          const pct = Math.round((sd / total) * 100);
          const done = chaptersDone(data, c);
          const m = META[c.id];
          const hrs = Math.round(c.chapters.reduce((a, x) => a + x.minutes, 0) / 60);
          return (
            <article className="course" data-course={c.id} key={c.id}>
              <div className="c-top">
                <span className="vibe">
                  <span dangerouslySetInnerHTML={{ __html: ic(m.vibe[0]) }} />
                  {m.vibe[1]}
                </span>
                <span className="glyph">{c.glyph}</span>
                <pre className="c-code" aria-hidden="true" dangerouslySetInnerHTML={{ __html: highlight(c.sample, c.lang) }} />
              </div>
              <div className="c-body">
                <div>
                  <h3>{c.name}</h3>
                  <p className="tag">{c.tag}</p>
                </div>
                <ul className="uses" aria-label="Good for">
                  {m.uses.map((u) => (
                    <li key={u[1]}>
                      <span dangerouslySetInnerHTML={{ __html: ic(u[0]) }} />
                      {u[1]}
                    </li>
                  ))}
                </ul>
                <div className="meta-row">
                  <span className="bolts" role="img" aria-label={`Difficulty ${m.bolts} of 3`}>
                    {[1, 2, 3].map((n) => (
                      <i key={n} className={n <= m.bolts ? 'on' : ''} dangerouslySetInnerHTML={{ __html: ic('bolt') }} />
                    ))}
                  </span>
                  <span>{c.chapters.length} chapters</span>
                  <span>About {hrs} hours</span>
                </div>
                <div className="c-prog">
                  <div className="bar" role="img" aria-label={`${pct} percent complete`}>
                    <u style={{ width: `${pct}%` }} />
                  </div>
                  <span>
                    {done} of {c.chapters.length} chapters done
                  </span>
                </div>
                <button className="btn pop block" type="button" onClick={() => navigate(`/course/${c.id}`)}>
                  {sd > 0 ? 'Keep going' : "Let's go"}
                </button>
              </div>
            </article>
          );
        })}
        <article className="course soon-card">
          <span className="glyph" dangerouslySetInnerHTML={{ __html: ic('ai') }} />
          <h3>What should we add next?</h3>
          <p className="tag">TypeScript, Rust, Go and Docker are on the list. Vote for the next course from your account.</p>
          <ul className="uses">
            <li>TypeScript</li>
            <li>Rust</li>
            <li>Go</li>
            <li>Docker</li>
          </ul>
        </article>
      </div>

      <div className="sec-h">
        <h2>Keep the momentum</h2>
        <p>Quests reset every day.</p>
      </div>
      <div className="duo">
        <section className="card2">
          <h3>
            <span dangerouslySetInnerHTML={{ __html: ic('target') }} /> Today's quests
          </h3>
          <p className="sub">Finish them for bonus XP.</p>
          <div className="quests">
            {QUESTS.map((q) => {
              const v = Math.min(q.get(d), q.target);
              const done = v >= q.target;
              const claimed = !!d.claimed[q.id];
              return (
                <div className="quest" key={q.id}>
                  <span className="q-ico" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ic(q.icon) }} />
                  <div className="q-body">
                    <b>{q.t}</b>
                    <div className="q-bar" role="img" aria-label={`${v} of ${q.target}`}>
                      <u style={{ width: `${Math.round((v / q.target) * 100)}%` }} />
                    </div>
                  </div>
                  {claimed ? (
                    <span className="q-ok">Claimed</span>
                  ) : done ? (
                    <button className="btn claim" type="button" onClick={() => claimQuest(q.id)}>
                      Claim +{q.xp} XP
                    </button>
                  ) : (
                    <span className="q-xp">+{q.xp} XP</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        <section className="card2 lg">
          <h3>
            <span dangerouslySetInnerHTML={{ __html: ic('trophy') }} /> This week's league
          </h3>
          <p className="sub">Sample players, to show how the league will look.</p>
          <div className="league">
            {board.map((r, i) => (
              <div className={`row${'you' in r && r.you ? ' you' : ''}`} key={r.n}>
                <span className={`rk r${i + 1}`}>{i + 1}</span>
                {'you' in r && r.you ? (
                  <span className="mono you" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ic(lv.icon) }} />
                ) : (
                  <span className="mono" style={{ ['--h' as string]: (r as { h: number }).h }} aria-hidden="true">
                    {r.n.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className="nm">{r.n}</span>
                <span className="xpn">{r.xp} XP</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="sec-h">
        <h2>Badge collection</h2>
        <p>
          {badgeN} of {BADGES.length} unlocked.
        </p>
      </div>
      <div className="bgrid six">
        {BADGES.map((b) => (
          <div className={`bdg ${data.badges[b.id] ? '' : 'off'}`} key={b.id}>
            <i aria-hidden="true" dangerouslySetInnerHTML={{ __html: ic(data.badges[b.id] ? b.icon : 'lock') }} />
            <b>{b.name}</b>
            <small>{b.desc}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
