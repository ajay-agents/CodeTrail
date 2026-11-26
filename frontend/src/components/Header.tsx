import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { COURSES, GCOL, courseOf } from '../data/courses';
import { ic, LOGO } from '../lib/icons.js';
import { esc } from '../lib/highlight.js';
import { level } from '../lib/levels';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import { useConfirmReset } from '../hooks/useConfirmReset';

export function Header() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { data } = useProgress();
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState(false);
  const [acctMenu, setAcctMenu] = useState(false);
  const confirmReset = useConfirmReset();
  const lv = level(data.xp);
  const current = courseId ? courseOf(courseId) : undefined;

  return (
    <header className="hdr" id="hdr">
      <div className="hdr-in">
        <button className="brand" aria-label="CodeTrail, back to the dashboard" type="button" onClick={() => navigate('/')}>
          <span dangerouslySetInnerHTML={{ __html: LOGO }} />
          <span>CodeTrail</span>
        </button>
        <div className="cmenu">
          <button
            className="cm-btn"
            type="button"
            aria-haspopup="menu"
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
          >
            {current ? (
              <>
                <span className="glyph xs" style={{ ['--g' as string]: GCOL[current.id as keyof typeof GCOL] }}>
                  {current.glyph}
                </span>
                {current.name}
              </>
            ) : (
              <>
                <span dangerouslySetInnerHTML={{ __html: ic('table') }} />
                Courses
              </>
            )}
            <svg className="cm-chev" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {menu && (
            <div className="cm-pop" role="menu" onMouseLeave={() => setMenu(false)}>
              <button
                role="menuitem"
                type="button"
                aria-current={!courseId ? 'page' : undefined}
                onClick={() => {
                  setMenu(false);
                  navigate('/');
                }}
              >
                <span className="cm-ico" dangerouslySetInnerHTML={{ __html: ic('table') }} />
                Dashboard
              </button>
              {COURSES.map((c) => (
                <button
                  key={c.id}
                  role="menuitem"
                  type="button"
                  style={{ ['--g' as string]: GCOL[c.id as keyof typeof GCOL] }}
                  aria-current={current?.id === c.id ? 'page' : undefined}
                  onClick={() => {
                    setMenu(false);
                    navigate(`/course/${c.id}`);
                  }}
                >
                  <span className="glyph xs">{esc(c.glyph)}</span>
                  {esc(c.name)}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="hdr-right">
          <div className="hdr-stats">
            <div className="stat" title="Days in a row you've practised">
              <span dangerouslySetInnerHTML={{ __html: ic('flame', 'ic-flame') }} />
              <b>{data.streak}</b>
              <span className="muted">day streak</span>
            </div>
            <div className="stat" title="Your level">
              <span dangerouslySetInnerHTML={{ __html: ic('bolt', 'ic-bolt') }} />
              <b>{data.xp} XP</b>
              <span className="muted lvl">{lv.name}</span>
              <i className="xpbar" aria-hidden="true">
                <u style={{ width: `${lv.pct}%` }} />
              </i>
            </div>
          </div>
          <div className="cmenu acct">
            <button
              className="cm-btn"
              type="button"
              aria-haspopup="menu"
              aria-expanded={acctMenu}
              onClick={() => setAcctMenu((m) => !m)}
            >
              <span className="glyph xs" aria-hidden="true">
                {(user?.display_name || '?').slice(0, 1).toUpperCase()}
              </span>
              <span className="acct-name">{user?.display_name}</span>
              <svg className="cm-chev" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {acctMenu && (
              <div className="cm-pop" role="menu" onMouseLeave={() => setAcctMenu(false)}>
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setAcctMenu(false);
                    confirmReset();
                  }}
                >
                  <span className="cm-ico" dangerouslySetInnerHTML={{ __html: ic('reset') }} />
                  Reset progress
                </button>
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setAcctMenu(false);
                    logout();
                    navigate('/login', { replace: true });
                  }}
                >
                  <span className="cm-ico" dangerouslySetInnerHTML={{ __html: ic('logout') }} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
