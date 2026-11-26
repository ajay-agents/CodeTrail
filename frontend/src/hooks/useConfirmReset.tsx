import { useNavigate } from 'react-router-dom';
import { useDialog } from '../context/DialogContext';
import { useProgress } from '../context/ProgressContext';
import { ic } from '../lib/icons.js';

/** Returns a function that asks for confirmation, then resets all progress. */
export function useConfirmReset() {
  const { showDialog, closeDialog } = useDialog();
  const { resetAll } = useProgress();
  const navigate = useNavigate();

  return function confirmReset() {
    showDialog(
      <div className="scrim" onClick={(e) => e.target === e.currentTarget && closeDialog()}>
        <div className="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dlgT">
          <button className="dlg-x" aria-label="Close" type="button" onClick={closeDialog}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
          <div className="party warn" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ic('reset') }} />
          <h2 id="dlgT">Reset all progress?</h2>
          <p>This clears your XP, streak, badges, quests and chapter progress. You can't undo it.</p>
          <div className="nav-row">
            <button className="btn sec" type="button" onClick={closeDialog}>
              Cancel
            </button>
            <button
              className="btn danger"
              type="button"
              onClick={() => {
                resetAll();
                closeDialog();
                navigate('/');
              }}
            >
              Reset everything
            </button>
          </div>
        </div>
      </div>,
    );
  };
}
