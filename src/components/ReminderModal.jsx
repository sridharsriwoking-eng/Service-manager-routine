import { useEffect } from 'react';
import { fmt12 } from '../utils/reminderEngine.js';

export default function ReminderModal({ task, more, onComplete, onSnooze, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="rem-title" data-testid="reminder-modal">
        <div className="modal-head">
          <span>🔔 ROUTINE REMINDER</span>
          {more > 0 && <span className="modal-more">+{more} more</span>}
        </div>
        <div className="modal-body">
          <div className="modal-time">{fmt12(task.time)}</div>
          <h3 id="rem-title">{task.task}</h3>
          <div className="modal-area">{task.area}</div>
          <p className="modal-focus-label">Focus</p>
          <p className="modal-focus">{task.remarks}</p>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-success btn-block" onClick={() => onComplete(task.id)} autoFocus>
            ✓ MARK COMPLETED
          </button>
          <div className="modal-row">
            <button type="button" className="btn btn-orange" onClick={() => onSnooze(task.id)}>
              ⏰ REMIND ME (5 min)
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
