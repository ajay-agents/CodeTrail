import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { Chapter } from '../types/content';
import type { ChapterStatus } from '../lib/progressSelectors';
import { chIc } from '../lib/chIc';
import { ICON } from '../lib/icons.js';

const XS = [50, 74, 50, 26, 50, 74, 50, 26];

interface TrailProps {
  chapters: Chapter[];
  statusOf: (i: number) => ChapterStatus;
  currentIdx: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

interface PathInfo {
  d: string;
  done: boolean;
}

export function Trail({ chapters, statusOf, currentIdx, selectedId, onSelect }: TrailProps) {
  const trailRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [paths, setPaths] = useState<PathInfo[]>([]);
  const [viewBox, setViewBox] = useState({ w: 0, h: 0 });

  const recompute = useCallback(() => {
    const trail = trailRef.current;
    if (!trail) return;
    const tr = trail.getBoundingClientRect();
    const pts = nodeRefs.current.filter(Boolean).map((n) => {
      const r = n!.getBoundingClientRect();
      return { x: r.left - tr.left + r.width / 2, y: r.top - tr.top + r.height / 2 };
    });
    setViewBox({ w: tr.width, h: tr.height });
    const next: PathInfo[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const my = (a.y + b.y) / 2;
      const d = `M${a.x} ${a.y} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
      next.push({ d, done: statusOf(i) === 'done' });
    }
    setPaths(next);
  }, [statusOf]);

  useLayoutEffect(() => {
    recompute();
    const trail = trailRef.current;
    if (!trail || !window.ResizeObserver) return;
    const ro = new ResizeObserver(recompute);
    ro.observe(trail);
    return () => ro.disconnect();
  }, [recompute, chapters]);

  return (
    <div className="trail" id="trail" ref={trailRef}>
      <svg id="trailSvg" aria-hidden="true" viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} width={viewBox.w} height={viewBox.h}>
        {paths.map((p, i) =>
          p.done ? (
            <g key={i}>
              <path d={p.d} className="seg-done" />
              <path d={p.d} className="seg-dots" />
            </g>
          ) : (
            <path key={i} d={p.d} className="seg-todo" />
          ),
        )}
      </svg>
      <ol>
        {chapters.map((c, i) => {
          const st = statusOf(i);
          const x = XS[i % XS.length];
          const nx = XS[(i + 1) % XS.length];
          const side = x > 50 ? 'l' : x < 50 ? 'r' : nx > x ? 'l' : 'r';
          const label = st === 'soon' ? 'Coming in the full app' : c.alias;
          const stLabel =
            st === 'done' ? 'Completed' : st === 'current' ? 'Up next' : st === 'locked' ? 'Locked' : 'Coming in the full app';
          return (
            <li className="stop" key={c.id} style={{ ['--x' as string]: `${x}%` }}>
              <button
                className={`node ${st}${selectedId === c.id ? ' sel' : ''}`}
                aria-label={`Chapter ${i + 1}: ${c.title}. ${stLabel}`}
                type="button"
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                onClick={() => onSelect(c.id)}
              >
                {i === currentIdx && <span dangerouslySetInnerHTML={{ __html: ICON.head }} />}
                <span className="emo" aria-hidden="true" dangerouslySetInnerHTML={{ __html: chIc(c) }} />
                <span className="n" aria-hidden="true">
                  {i + 1}
                </span>
                {st === 'done' && <span className="tick" dangerouslySetInnerHTML={{ __html: ICON.check }} />}
                {st === 'locked' && <span className="lk" dangerouslySetInnerHTML={{ __html: ICON.lock }} />}
              </button>
              <div className={`stop-label ${side}`}>
                <strong>{c.title}</strong>
                <span>{label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
