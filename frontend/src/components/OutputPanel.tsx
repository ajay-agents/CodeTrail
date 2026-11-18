import { useEffect, useRef } from 'react';
import { SqlTable } from './SqlTable';

export interface RunResult {
  out?: string;
  error?: string | null;
  unsupported?: boolean;
  msg?: string;
  // sql
  results?: { cols: string[]; rows: unknown[][] }[];
  // git
  transcript?: { cmd: string; out: string }[];
  // jsx
  host?: HTMLElement;
  rt?: { logs: string[]; logEl: HTMLElement | null };
}

const UNSUPPORTED_MSG: Record<string, (msg?: string) => string> = {
  python: () =>
    "This runner handles print(), variables, math and f-strings. Loops, functions and lists are on the roadmap.",
  jsx: () =>
    'This React runner handles function components, JSX, props, lists with map, useState and events. Classes and other libraries are on the roadmap.',
  sql: (msg) => msg || 'This part of SQL is not supported yet.',
  java: () =>
    'This Java runner handles variables, math, strings, System.out.println and printf. Loops, methods, arrays and objects are on the roadmap.',
  js: () =>
    'This JavaScript runner handles variables, functions, arrays, objects, loops and console.log. Classes, async code and the DOM are on the roadmap.',
  git: () => 'This practice terminal simulates a single local repository. That command is not part of it yet.',
};

function unsupportedMsg(lang: string, msg?: string) {
  if (UNSUPPORTED_MSG[lang]) return UNSUPPORTED_MSG[lang](msg);
  return `This compiler handles variables, math, ${lang === 'c' ? 'printf' : 'cout'} and strings. Loops, functions and pointers are on the roadmap.`;
}

export function OutputPanel({ lang, result }: { lang: string; result: RunResult | null }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lang !== 'jsx' || !result || result.error || !result.host) return;
    const container = hostRef.current;
    if (!container) return;
    container.innerHTML = '';
    container.appendChild(result.host);
    const con = document.createElement('pre');
    con.className = 'console';
    con.hidden = !result.rt || result.rt.logs.length === 0;
    con.textContent = result.rt ? result.rt.logs.join('\n') : '';
    if (result.rt) result.rt.logEl = con;
    container.appendChild(con);
  }, [lang, result]);

  if (!result) {
    const empty =
      lang === 'sql'
        ? 'Write a query first, then press Run.'
        : lang === 'git'
          ? 'Type some commands first, then press Run commands.'
          : 'Press Run to see the output here.';
    return (
      <div className="out">
        <p className="out-empty">{empty}</p>
      </div>
    );
  }

  if (result.unsupported) {
    return (
      <div className="out">
        <div className="out-info">{unsupportedMsg(lang, result.msg)}</div>
      </div>
    );
  }

  if (lang === 'git') {
    if (!result.transcript || !result.transcript.length) {
      return (
        <div className="out">
          <p className="out-empty">Type some commands first, then press Run commands.</p>
        </div>
      );
    }
    return (
      <div className="out">
        <span className="out-label">Terminal</span>
        <div className="term">
          {result.transcript.map((x, i) => (
            <div key={i}>
              <div className="tl">
                <span className="ps">$</span> {x.cmd}
              </div>
              {x.out && <pre className={`to${/^(fatal|error|bash|cat:|rm:)/.test(x.out) ? ' err' : ''}`}>{x.out}</pre>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (lang === 'jsx') {
    return (
      <div className="out">
        <span className="out-label">Live preview</span>
        {result.error ? (
          <>
            <pre className="out-err">{result.error}</pre>
            <p className="out-tip">Read the message first. It names the problem and often the line.</p>
          </>
        ) : (
          <div ref={hostRef} />
        )}
      </div>
    );
  }

  if (lang === 'sql') {
    if (result.error) {
      return (
        <div className="out">
          <pre className="out-err">{result.error}</pre>
          <p className="out-tip">SQL errors quote the word near the problem. Check spelling of keywords, table and column names.</p>
        </div>
      );
    }
    if (!result.results || !result.results.length) {
      return (
        <div className="out">
          <p className="out-empty">Write a query first, then press Run.</p>
        </div>
      );
    }
    return (
      <div className="out">
        {result.results.map((r, i) => (
          <div key={i}>
            <span className="out-label">Result{result.results!.length > 1 ? ` ${i + 1}` : ''}</span>
            <SqlTable r={r} />
          </div>
        ))}
      </div>
    );
  }

  const tip =
    lang === 'python'
      ? 'Read the last line first. It names the error and what went wrong.'
      : lang === 'js'
        ? 'Read the error name first, then the line number.'
        : 'Compiler errors name a line number. Fix the first error first, because later ones are often side effects.';
  const noOutputHint =
    lang === 'python' ? 'a print()' : lang === 'c' ? 'a printf' : lang === 'java' ? 'a System.out.println' : lang === 'js' ? 'a console.log' : 'a cout';

  return (
    <div className="out">
      {result.out && (
        <>
          <span className="out-label">Output</span>
          <pre>{result.out.replace(/\n$/, '')}</pre>
        </>
      )}
      {result.error && (
        <>
          <pre className="out-err">{result.error}</pre>
          <p className="out-tip">{tip}</p>
        </>
      )}
      {!result.out && !result.error && <p className="out-empty">Ran with no output. Add {noOutputHint} to see something.</p>}
    </div>
  );
}
