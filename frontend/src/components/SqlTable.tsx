import { DB, sqlFmt } from '../engine/interpreters.js';

export interface SqlResultSet {
  cols: string[];
  rows: unknown[][];
}

export function SqlTable({ r, caption = true }: { r: SqlResultSet; caption?: boolean }) {
  return (
    <>
      <div className="sql-wrap">
        <table>
          <thead>
            <tr>
              {r.cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {r.rows.map((row, i) => (
              <tr key={i}>
                {row.map((v, j) => (
                  <td key={j} className={v === null ? 'nul' : typeof v === 'number' ? 'num' : ''}>
                    {sqlFmt(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <p className="sql-cap">
          {r.rows.length} row{r.rows.length === 1 ? '' : 's'}
        </p>
      )}
    </>
  );
}

export function DbCard({ lang }: { lang: string }) {
  if (lang !== 'sql') return null;
  const tb = DB.students as SqlResultSet;
  return (
    <div className="dbcard">
      <div className="dbhead">
        <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <ellipse className="f" cx="12" cy="6" rx="8" ry="3" />
          <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
        </svg>
        <span className="t">students</span>
        <span>
          {tb.rows.length} rows, {tb.cols.length} columns
        </span>
      </div>
      <SqlTable r={tb} caption={false} />
    </div>
  );
}
