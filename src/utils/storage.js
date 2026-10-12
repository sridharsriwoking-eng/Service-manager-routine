// localStorage helpers. One key per day: smRoutine_YYYY-MM-DD
const PREFIX = 'smRoutine_';
const DAY_KEY = /^smRoutine_\d{4}-\d{2}-\d{2}$/;
const BANNER_KEY = 'smRoutine_bannerDismissed';
const CUSTOM_ROUTINE_KEY = 'smRoutine_customRoutine';

export function emptyDay() {
  return { completed: {}, notified: {}, snoozed: {}, notes: {} };
}

export function loadDay(dayKey) {
  try {
    const raw = localStorage.getItem(PREFIX + dayKey);
    if (!raw) return emptyDay();
    const p = JSON.parse(raw);
    return {
      completed: p.completed && typeof p.completed === 'object' ? p.completed : {},
      notified:  p.notified  && typeof p.notified  === 'object' ? p.notified  : {},
      snoozed:   p.snoozed   && typeof p.snoozed   === 'object' ? p.snoozed   : {},
      notes:     p.notes     && typeof p.notes     === 'object' ? p.notes     : {},
    };
  } catch {
    return emptyDay();
  }
}

export function saveDay(dayKey, data) {
  try {
    localStorage.setItem(PREFIX + dayKey, JSON.stringify(data));
  } catch {
    /* storage unavailable (private mode / full) - app keeps working in memory */
  }
}

// Keep last 7 days so the Weekly History view has data.
// Anything older than 7 days is pruned.
export function pruneOldDays(currentKey) {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cy = cutoff.getFullYear();
    const cm = String(cutoff.getMonth() + 1).padStart(2, '0');
    const cd = String(cutoff.getDate()).padStart(2, '0');
    const cutoffStr = `${cy}-${cm}-${cd}`; // "YYYY-MM-DD"
    const stale = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && DAY_KEY.test(k)) {
        const dayStr = k.slice(PREFIX.length); // strip "smRoutine_"
        if (dayStr < cutoffStr) stale.push(k);
      }
    }
    stale.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

// Build last-7-days history for the Weekly History view.
// If todayCompletedCount is provided, today's entry uses the live count directly.
export function getWeekHistory(totalTasks, todayCompletedCount = null) {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y  = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${mo}-${dy}`;
    const data = loadDay(key);
    const isToday = i === 0;
    const completed = isToday && todayCompletedCount !== null
      ? todayCompletedCount
      : Object.keys(data.completed).length;
    const pct = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
    result.push({ key, date: d, completed, total: totalTasks, pct, isToday });
  }
  return result;
}

// Calculate completion streak of 100% days.
// - If today is 100%, streak starts at 1 and counts backwards consecutive 100% days.
// - If today is not 100% yet (in progress), streak counts consecutive 100% days ending yesterday.
export function calculateStreak(history) {
  if (!history || !history.length) return 0;
  const todayEntry = history.find((h) => h.isToday);
  const pastDays = history.filter((h) => !h.isToday).reverse();

  let streak = 0;
  if (todayEntry && todayEntry.pct === 100) {
    streak = 1;
    for (const day of pastDays) {
      if (day.pct === 100) {
        streak++;
      } else {
        break;
      }
    }
  } else {
    for (const day of pastDays) {
      if (day.pct === 100) {
        streak++;
      } else {
        break;
      }
    }
  }
  return streak;
}


export function isBannerDismissed(dayKey) {
  try {
    return localStorage.getItem(BANNER_KEY) === dayKey;
  } catch {
    return false;
  }
}

export function dismissBanner(dayKey) {
  try {
    localStorage.setItem(BANNER_KEY, dayKey);
  } catch {
    /* ignore */
  }
}

// Custom routine edits (SM can edit task fields; stored per-device)
export function loadCustomRoutine() {
  try {
    const raw = localStorage.getItem(CUSTOM_ROUTINE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCustomRoutine(routine) {
  try {
    localStorage.setItem(CUSTOM_ROUTINE_KEY, JSON.stringify(routine));
  } catch {
    /* ignore */
  }
}
