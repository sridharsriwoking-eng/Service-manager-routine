import { useEffect, useState } from 'react';
import { cap, genDisplayTime } from '../utils/reminderEngine.js';

export default function EditTaskModal({ task, defaultTask, onSave, onCancel }) {
  const [form, setForm] = useState({
    time: task.time,
    end: task.end,
    displayTime: task.displayTime,
    area: task.area,
    task: task.task,
    remarks: task.remarks,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const set = (field) => (e) => {
    const val = e.target.value;
    setError('');
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      // Auto-regenerate display time when start or end time changes
      if (field === 'time' || field === 'end') {
        next.displayTime = genDisplayTime(
          field === 'time' ? val : prev.time,
          field === 'end' ? val : prev.end,
        );
      }
      return next;
    });
  };

  const resetToDefault = () => {
    setError('');
    setForm({
      time: defaultTask.time,
      end: defaultTask.end,
      displayTime: defaultTask.displayTime,
      area: defaultTask.area,
      task: defaultTask.task,
      remarks: defaultTask.remarks,
    });
  };

  const handleSave = () => {
    if (!form.time || !form.end) { setError('Start and End time are required.'); return; }
    if (!form.task.trim()) { setError('Task name cannot be empty.'); return; }
    onSave({
      ...task,
      time: form.time,
      end: form.end,
      displayTime: form.displayTime || genDisplayTime(form.time, form.end),
      area: cap(form.area.trim()),
      task: cap(form.task.trim()),
      remarks: cap(form.remarks.trim()),
    });
  };

  return (
    <div className="overlay" role="presentation">
      <div className="modal modal-edit" role="dialog" aria-modal="true" aria-labelledby="edit-title">
        <div className="modal-head">
          <span>✏️ EDIT TASK</span>
          <button type="button" className="edit-reset-link" onClick={resetToDefault} title="Reset this task to its original default values">
            ↺ Reset to default
          </button>
        </div>
        <div className="modal-body edit-form">
          <div className="edit-row">
            <label>
              Start Time
              <input type="time" value={form.time} onChange={set('time')} />
            </label>
            <label>
              End Time
              <input type="time" value={form.end} onChange={set('end')} />
            </label>
          </div>
          <label>
            Display Time
            <input
              type="text"
              value={form.displayTime}
              onChange={set('displayTime')}
              placeholder="e.g. 9.00 - 9.15 am"
            />
            <span className="edit-hint">Auto-filled from times above — edit if needed</span>
          </label>
          <label>
            Area
            <input type="text" value={form.area} onChange={set('area')} placeholder="e.g. Floor" />
          </label>
          <label>
            Task Name
            <input type="text" value={form.task} onChange={set('task')} placeholder="Task name" />
          </label>
          <label>
            Remarks / Focus
            <textarea value={form.remarks} onChange={set('remarks')} rows={3} placeholder="Remarks or focus area" />
          </label>
          {error && <p className="edit-error">{error}</p>}
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary btn-block" onClick={handleSave}>
            ✓ Save Changes
          </button>
          <button type="button" className="btn btn-outline btn-block" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
