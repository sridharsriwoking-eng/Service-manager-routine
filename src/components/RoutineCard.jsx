import { useState, useEffect } from 'react';
import { cap, fmt12, getTaskTimer } from '../utils/reminderEngine.js';

export default function RoutineCard({
  task,
  now,
  phase,
  isNext,
  completedAt,
  note,
  onComplete,
  onPending,
  onEdit,
  onSaveNote,
}) {
  const done = phase === 'done';
  const cls = ['row'];
  if (done) cls.push('done');
  if (phase === 'overdue') cls.push('overdue');
  if (phase === 'now') cls.push('now');
  if (isNext) cls.push('next');

  const doneAt = completedAt
    ? new Date(completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // Quick live countdown timer
  const timer = getTaskTimer(task, now, done);

  // Note editing state
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [draftNote, setDraftNote] = useState(note || '');

  useEffect(() => {
    setDraftNote(note || '');
  }, [note]);

  const handleSaveNote = () => {
    onSaveNote(task.id, draftNote);
    setIsEditingNote(false);
  };

  const handleCancelNote = () => {
    setDraftNote(note || '');
    setIsEditingNote(false);
  };

  return (
    <article className={cls.join(' ')} data-testid={`task-${task.id}`}>
      <div className="cell c-time">
        <div className="t-big">{fmt12(task.time)}</div>
        <div className="t-range">{task.displayTime}</div>
        <div className="t-timer">
          <span className={`timer-chip timer-${timer.type}`}>{timer.text}</span>
        </div>
        <div className="badges">
          {phase === 'now' && (
            <span className="badge b-now">
              <i className="dot" /> NOW
            </span>
          )}
          {isNext && <span className="badge b-next">NEXT UP</span>}
          {phase === 'overdue' && <span className="badge b-overdue">Overdue</span>}
        </div>
      </div>

      <div className="cell c-area">
        <span className="area-chip">{cap(task.area)}</span>
      </div>

      <div className="cell c-task">{cap(task.task)}</div>

      <div className="cell c-remarks">
        <div className="remarks-text">{cap(task.remarks)}</div>

        {/* Task Notes Section */}
        {isEditingNote ? (
          <div className="note-editor">
            <textarea
              className="note-input"
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              placeholder="Jot quick note (e.g. Warranty pending for KL09)..."
              rows={2}
              autoFocus
            />
            <div className="note-editor-actions">
              <button type="button" className="btn btn-small btn-primary" onClick={handleSaveNote}>
                Save
              </button>
              <button type="button" className="btn btn-small btn-outline" onClick={handleCancelNote}>
                Cancel
              </button>
            </div>
          </div>
        ) : note ? (
          <div className="note-card">
            <span className="note-icon" aria-hidden="true">📝</span>
            <span className="note-text">{note}</span>
            <div className="note-btns">
              <button
                type="button"
                className="note-btn-action"
                onClick={() => setIsEditingNote(true)}
                title="Edit note"
                aria-label="Edit note"
              >
                ✏️
              </button>
              <button
                type="button"
                className="note-btn-action"
                onClick={() => onSaveNote(task.id, '')}
                title="Delete note"
                aria-label="Delete note"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn-add-note"
            onClick={() => setIsEditingNote(true)}
          >
            + Note
          </button>
        )}
      </div>

      <div className="cell c-status">
        {done ? (
          <>
            <span className="pill pill-done">✓ Completed</span>
            {doneAt && <span className="done-at">at {doneAt}</span>}
          </>
        ) : (
          <span className="pill pill-pending">○ Pending</span>
        )}
      </div>

      <div className="cell c-action">
        {done ? (
          <button type="button" className="btn btn-outline" onClick={() => onPending(task.id)}>
            Mark as Pending
          </button>
        ) : (
          <button type="button" className="btn btn-success" onClick={() => onComplete(task.id)}>
            ✓ Mark Completed
          </button>
        )}
      </div>

      <div className="cell c-edit">
        <button
          type="button"
          className="edit-btn"
          onClick={() => onEdit(task)}
          aria-label={`Edit ${task.task}`}
        >
          ✏️ Edit
        </button>
      </div>
    </article>
  );
}
