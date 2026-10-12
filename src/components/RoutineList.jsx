import RoutineCard from './RoutineCard.jsx';
import { taskPhase } from '../utils/reminderEngine.js';

export default function RoutineList({
  routine,
  now,
  day,
  next,
  perm,
  onEnable,
  onComplete,
  onPending,
  onReset,
  onEdit,
  onSaveNote,
}) {
  return (
    <section className="routine" aria-label="Routine jobs">
      <div className="toolbar">
        <h2>Today's routine jobs</h2>
        <div className="toolbar-actions">
          {perm === 'granted' && <span className="chip chip-ok">🔔 Notifications on</span>}
          {perm === 'denied' && (
            <span className="chip chip-warn" title="Allow notifications in your browser site settings to turn them on">
              🔕 Browser alerts blocked - in-app reminders still work
            </span>
          )}
          {perm === 'default' && (
            <button type="button" className="btn btn-small btn-primary" onClick={onEnable}>
              🔔 Enable Notifications
            </button>
          )}
          <button type="button" className="btn btn-small btn-reset" onClick={onReset}>
            Reset Today's Checklist
          </button>
        </div>
      </div>

      <div className="list-head" aria-hidden="true">
        <span>Time</span>
        <span>Area</span>
        <span>Task</span>
        <span>Remarks</span>
        <span>Status</span>
        <span>Action</span>
        <span>Edit</span>
      </div>

      <div className="rows">
        {routine.map((task) => (
          <RoutineCard
            key={task.id}
            task={task}
            now={now}
            phase={taskPhase(task, now, !!day.completed[task.id])}
            isNext={!!next && next.id === task.id}
            completedAt={day.completed[task.id]}
            note={day.notes?.[task.id]}
            onComplete={onComplete}
            onPending={onPending}
            onEdit={onEdit}
            onSaveNote={onSaveNote}
          />
        ))}
      </div>
    </section>
  );
}
