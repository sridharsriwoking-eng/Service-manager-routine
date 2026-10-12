import { useEffect } from 'react';

export default function ConfirmReset({ onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="overlay" role="presentation">
      <div className="modal modal-small" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" data-testid="confirm-reset">
        <div className="modal-body">
          <h3 id="reset-title">Reset today's checklist?</h3>
          <p className="modal-focus">All completed statuses will be cleared.</p>
        </div>
        <div className="modal-actions">
          <div className="modal-row">
            <button type="button" className="btn btn-danger" onClick={onConfirm}>
              Yes, reset
            </button>
            <button type="button" className="btn btn-outline" onClick={onCancel} autoFocus>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
