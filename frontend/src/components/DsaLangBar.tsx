import { DSA_LANGS, dsaLang } from '../data/dsaLangs';
import { useProgress } from '../context/ProgressContext';

export function DsaLangBar({ courseId }: { courseId: string }) {
  const { data, setDsaLang } = useProgress();
  if (courseId !== 'dsa') return null;
  const cur = dsaLang(data.dsaLang);

  return (
    <>
      <div className="langbar" role="radiogroup" aria-label="Programming language">
        <span className="lb-l">Your language</span>
        {Object.keys(DSA_LANGS).map((k) => (
          <button
            key={k}
            className={`lb-b${k === cur ? ' on' : ''}`}
            role="radio"
            aria-checked={k === cur}
            type="button"
            style={{ ['--g' as string]: DSA_LANGS[k].col }}
            onClick={() => setDsaLang(k)}
          >
            {DSA_LANGS[k].name}
          </button>
        ))}
      </div>
      {cur !== 'js' && (
        <p className="lb-note">
          JavaScript runs live in this app. {DSA_LANGS[cur].name} examples show their real, checked output, and
          challenges are checked against JavaScript. Switch to JavaScript to run and edit code live.
        </p>
      )}
    </>
  );
}
