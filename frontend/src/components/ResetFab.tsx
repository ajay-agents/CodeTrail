import { useConfirmReset } from '../hooks/useConfirmReset';

export function ResetFab() {
  const confirmReset = useConfirmReset();

  return (
    <button
      className="reset-fab"
      aria-label="Reset progress"
      title="Reset progress"
      type="button"
      onClick={confirmReset}
      dangerouslySetInnerHTML={{
        __html:
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 108-8 8 8 0 00-5.7 2.4L4 8.7"/><path d="M4 4v4.7h4.7"/></svg>',
      }}
    />
  );
}
