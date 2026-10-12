import { useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import RoutineList from './components/RoutineList.jsx';
import ReminderModal from './components/ReminderModal.jsx';
import ConfirmReset from './components/ConfirmReset.jsx';
import NotificationBanner from './components/NotificationBanner.jsx';
import EditTaskModal from './components/EditTaskModal.jsx';
import Confetti from './components/Confetti.jsx';
import Footer from './components/Footer.jsx';
import { ROUTINE as DEFAULT_ROUTINE } from './data/routineData.js';
import {
  loadDay,
  saveDay,
  pruneOldDays,
  isBannerDismissed,
  dismissBanner,
  loadCustomRoutine,
  saveCustomRoutine,
  getWeekHistory,
  calculateStreak,
} from './utils/storage.js';
import {
  SNOOZE_MS,
  askPermission,
  atTime,
  dateKey,
  findDueReminders,
  getNext,
  getPermission,
  showBrowserNotification,
  taskPhase,
} from './utils/reminderEngine.js';

const freshDay = (key) => ({ key, ...loadDay(key) });

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('smRoutine_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
  } catch {
    /* ignore */
  }
  return 'light';
};

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [showConfetti, setShowConfetti] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const celebratedRef = useRef(false);

  // Listen for native PWA installation prompt
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const [now, setNow] = useState(() => new Date());
  const [day, setDay] = useState(() => {
    const key = dateKey(new Date());
    pruneOldDays(key);
    return freshDay(key);
  });
  // Routine: use SM-edited version from localStorage, falling back to defaults
  const [routine, setRoutine] = useState(() => loadCustomRoutine() || DEFAULT_ROUTINE);
  const [editingTask, setEditingTask] = useState(null); // task object currently being edited

  const [queue, setQueue] = useState([]); // ids waiting to be shown in the reminder modal
  const [confirmReset, setConfirmReset] = useState(false);
  const [perm, setPerm] = useState(getPermission);
  const [bannerOff, setBannerOff] = useState(() => isBannerDismissed(dateKey(new Date())));
  const fired = useRef(new Set()); // synchronous duplicate guard (also covers React StrictMode)

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Theme synchronization with HTML document and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('smRoutine_theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  // Listen to system theme changes if user hasn't set an explicit preference
  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      const saved = localStorage.getItem('smRoutine_theme');
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Persist today's state (including notes)
  useEffect(() => {
    saveDay(day.key, {
      completed: day.completed,
      notified: day.notified,
      snoozed: day.snoozed,
      notes: day.notes,
    });
  }, [day]);

  // Every tick: handle midnight rollover and trigger due reminders
  useEffect(() => {
    setPerm(getPermission());
    const key = dateKey(now);
    if (key !== day.key) {
      pruneOldDays(key);
      setDay(freshDay(key));
      setBannerOff(isBannerDismissed(key));
      setQueue([]);
      fired.current.clear();
      return;
    }
    const due = findDueReminders(routine, now, day).filter((t) => {
      const k = `${day.key}:${t.id}:${day.snoozed[t.id] || 0}`;
      if (fired.current.has(k)) return false;
      fired.current.add(k);
      return true;
    });
    if (!due.length) return;
    setDay((d) => {
      const notified = { ...d.notified };
      const snoozed = { ...d.snoozed };
      due.forEach((t) => {
        notified[t.id] = true;
        delete snoozed[t.id];
      });
      return { ...d, notified, snoozed };
    });
    setQueue((q) => [...q, ...due.map((t) => t.id).filter((id) => !q.includes(id))]);
    due.forEach(showBrowserNotification);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const complete = (id) => {
    setDay((d) => {
      const snoozed = { ...d.snoozed };
      delete snoozed[id];
      return { ...d, completed: { ...d.completed, [id]: new Date().toISOString() }, snoozed };
    });
    setQueue((q) => q.filter((x) => x !== id));
  };

  const markPending = (id) => {
    setDay((d) => {
      const completed = { ...d.completed };
      delete completed[id];
      return { ...d, completed };
    });
  };

  const snooze = (id) => {
    setDay((d) => ({ ...d, snoozed: { ...d.snoozed, [id]: Date.now() + SNOOZE_MS } }));
    setQueue((q) => q.filter((x) => x !== id));
  };

  const closeModal = (id) => setQueue((q) => q.filter((x) => x !== id));

  const doReset = () => {
    const notified = {};
    routine.forEach((t) => {
      if (atTime(now, t.time) <= now) notified[t.id] = true; // no popups for jobs already started
    });
    setDay((d) => ({ ...d, completed: {}, snoozed: {}, notified }));
    setQueue([]);
    setConfirmReset(false);
  };

  // Save SM edits to a task and persist to localStorage
  const handleSaveEdit = (updatedTask) => {
    setRoutine((r) => {
      const newRoutine = r.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      saveCustomRoutine(newRoutine);
      return newRoutine;
    });
    setEditingTask(null);
  };

  // Save quick note for a task
  const handleSaveNote = (taskId, text) => {
    setDay((d) => {
      const notes = { ...d.notes };
      if (text && text.trim()) {
        notes[taskId] = text.trim();
      } else {
        delete notes[taskId];
      }
      return { ...d, notes };
    });
  };

  const enableNotifications = async () => {
    setPerm(await askPermission());
  };

  const laterBanner = () => {
    dismissBanner(day.key);
    setBannerOff(true);
  };

  const next = getNext(routine, now, day.completed);
  const completed = routine.filter((t) => day.completed[t.id]).length;
  const total = routine.length;
  const stats = {
    total,
    completed,
    pending: total - completed,
    pct: Math.round((completed / total) * 100),
    overdue: routine.filter((t) => taskPhase(t, now, !!day.completed[t.id]) === 'overdue').length,
  };

  // 100% Celebration Confetti Trigger
  useEffect(() => {
    if (stats.pct === 100 && stats.total > 0 && !celebratedRef.current) {
      celebratedRef.current = true;
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5500);
      return () => clearTimeout(timer);
    }
    if (stats.pct < 100) {
      celebratedRef.current = false;
      setShowConfetti(false);
    }
  }, [stats.pct, stats.total]);

  // Weekly history & streak
  const weekHistory = getWeekHistory(total, completed);
  const streak = calculateStreak(weekHistory);

  const waiting = queue.filter((id) => !day.completed[id]);
  const current = waiting.length ? routine.find((t) => t.id === waiting[0]) : null;

  return (
    <div className="app">
      <Confetti active={showConfetti} />
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        installPrompt={installPrompt}
        onInstall={handleInstallApp}
      />
      {perm === 'default' && !bannerOff && (
        <NotificationBanner onEnable={enableNotifications} onLater={laterBanner} />
      )}
      <main className="container main">
        <Dashboard
          now={now}
          next={next}
          stats={stats}
          weekHistory={weekHistory}
          streak={streak}
        />
        <RoutineList
          routine={routine}
          now={now}
          day={day}
          next={next}
          perm={perm}
          onEnable={enableNotifications}
          onComplete={complete}
          onPending={markPending}
          onReset={() => setConfirmReset(true)}
          onEdit={setEditingTask}
          onSaveNote={handleSaveNote}
        />
      </main>
      <Footer />
      {current && (
        <ReminderModal
          task={current}
          more={waiting.length - 1}
          onComplete={complete}
          onSnooze={snooze}
          onClose={() => closeModal(current.id)}
        />
      )}
      {confirmReset && <ConfirmReset onConfirm={doReset} onCancel={() => setConfirmReset(false)} />}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          defaultTask={DEFAULT_ROUTINE.find((t) => t.id === editingTask.id)}
          onSave={handleSaveEdit}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
