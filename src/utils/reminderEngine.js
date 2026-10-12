// Time + reminder logic. Uses the browser's local time only.
export const GRACE_MS = 5 * 60 * 1000; // a reminder is only shown within 5 min of its start time
export const SNOOZE_MS = 5 * 60 * 1000; // "Remind me" = 5 minutes

// Capitalize first letter of a string for consistent display.
export function cap(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Auto-generate a human-readable display time from HH:MM start and end.
export function genDisplayTime(time, end) {
  if (!time || !end) return '';
  const fmt = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    const suffix = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}.${String(m).padStart(2, '0')} ${suffix}`;
  };
  const [h1] = time.split(':').map(Number);
  const [h2] = end.split(':').map(Number);
  const t1 = fmt(time);
  const t2 = fmt(end);
  if ((h1 >= 12) === (h2 >= 12)) {
    return `${t1.replace(/ (am|pm)$/, '')} - ${t2}`;
  }
  return `${t1} - ${t2}`;
}


export function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Date object for an "HH:MM" time on the same day as `base`.
export function atTime(base, hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

export function fmt12(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

// 'done' | 'now' | 'overdue' | 'upcoming'
export function taskPhase(task, now, isDone) {
  if (isDone) return 'done';
  if (now >= atTime(now, task.end)) return 'overdue';
  if (now >= atTime(now, task.time)) return 'now';
  return 'upcoming';
}

// Live countdown timer calculation for each task:
// - If done: returns { type: 'done', text: '✓ Done' }
// - If currently happening ('now'): countdown to task.end
// - If upcoming: countdown to task.time
// - If overdue: time elapsed since task.end
export function getTaskTimer(task, now, isDone) {
  if (isDone) {
    return { type: 'done', text: '✓ Done' };
  }
  const startTime = atTime(now, task.time);
  const endTime = atTime(now, task.end);
  const nowMs = now.getTime();
  const startMs = startTime.getTime();
  const endMs = endTime.getTime();

  if (nowMs >= startMs && nowMs < endMs) {
    const diffSec = Math.max(0, Math.floor((endMs - nowMs) / 1000));
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    return {
      type: 'now',
      text: `⏱️ ${m}m ${String(s).padStart(2, '0')}s left`,
    };
  }

  if (nowMs < startMs) {
    const diffSec = Math.max(0, Math.floor((startMs - nowMs) / 1000));
    const h = Math.floor(diffSec / 3600);
    const m = Math.floor((diffSec % 3600) / 60);
    const s = diffSec % 60;
    if (h > 0) {
      return { type: 'upcoming', text: `⏳ Starts in ${h}h ${m}m` };
    }
    return { type: 'upcoming', text: `⏳ Starts in ${m}m ${String(s).padStart(2, '0')}s` };
  }

  const diffSec = Math.floor((nowMs - endMs) / 1000);
  const h = Math.floor(diffSec / 3600);
  const m = Math.floor((diffSec % 3600) / 60);
  if (h > 0) {
    return { type: 'overdue', text: `⚠️ Overdue by ${h}h ${m}m` };
  }
  return { type: 'overdue', text: `⚠️ Overdue by ${m}m` };
}


// Next job that has not started yet and is not completed.
export function getNext(tasks, now, completed) {
  return tasks.find((t) => !completed[t.id] && atTime(now, t.time) > now) || null;
}

// Jobs whose reminder should pop up right now. Old (missed) jobs never pop up again.
export function findDueReminders(tasks, now, day) {
  const due = [];
  for (const t of tasks) {
    if (day.completed[t.id]) continue;
    const snoozeAt = day.snoozed[t.id];
    if (snoozeAt) {
      if (now.getTime() >= snoozeAt && now.getTime() - snoozeAt < GRACE_MS * 2) due.push(t);
      continue;
    }
    if (day.notified[t.id]) continue;
    const diff = now.getTime() - atTime(now, t.time).getTime();
    if (diff >= 0 && diff < GRACE_MS) due.push(t);
  }
  return due;
}

/* ---------- Browser Notification API (optional; in-app modal is always shown) ---------- */
export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getPermission() {
  return notificationsSupported() ? Notification.permission : 'unsupported';
}

export async function askPermission() {
  if (!notificationsSupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function showBrowserNotification(task) {
  if (getPermission() !== 'granted') return;
  try {
    const n = new Notification(`Routine reminder - ${fmt12(task.time)}`, {
      body: `${task.task}\n${task.area}: ${task.remarks}`,
      tag: `sm-routine-${task.id}`,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    /* some mobile browsers only allow notifications via service workers - modal still shows */
  }
}
