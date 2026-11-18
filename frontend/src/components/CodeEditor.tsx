import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { highlight } from '../lib/highlight.js';
import { ICON } from '../lib/icons.js';

interface CodeEditorProps {
  id: string;
  initialCode: string;
  lang: string;
  file: string;
  runLabel?: string;
  onRun: (code: string) => void;
  onReset?: () => void;
  output?: ReactNode;
}

export function CodeEditor({ id, initialCode, lang, file, runLabel, onRun, onReset, output }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const escapedRef = useRef(false);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') {
      escapedRef.current = true;
      return;
    }
    if (e.key === 'Tab' && !e.shiftKey && !escapedRef.current) {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.slice(0, start) + '    ' + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
      return;
    }
    if (e.key !== 'Shift') escapedRef.current = false;
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun(code);
    }
  }

  const lineCount = code.split('\n').length;
  const gutter = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  return (
    <div className="ed" data-ed={id} data-lang={lang}>
      <div className="ed-bar">
        <span className="file">
          <i />
          {file}
        </span>
        <span className="ed-actions">
          <button
            className="btn ghost sm"
            type="button"
            onClick={() => {
              setCode(initialCode);
              onReset?.();
            }}
          >
            Reset
          </button>
          <button className="btn run sm" type="button" onClick={() => onRun(code)}>
            <span dangerouslySetInnerHTML={{ __html: ICON.play }} />
            {runLabel || (lang === 'sql' ? 'Run query' : lang === 'git' ? 'Run commands' : 'Run')}
          </button>
        </span>
      </div>
      <div className="ed-body">
        <div className="gutter" aria-hidden="true">
          {gutter}
        </div>
        <div className="ed-scroll">
          <div className="stack">
            <pre className="hl" aria-hidden="true" dangerouslySetInnerHTML={{ __html: highlight(code, lang) + '\n' }} />
            <textarea
              className="inp"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              aria-label="Code editor. Press Control and Enter to run."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>
      {output}
    </div>
  );
}
