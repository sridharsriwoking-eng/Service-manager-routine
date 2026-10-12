import { fmt12 } from '../utils/reminderEngine.js';
import WeeklyHistory from './WeeklyHistory.jsx';

export default function Dashboard({ now, next, stats, weekHistory, streak }) {
  const date = now.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const time = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const allDone = stats.pending === 0;

  return (
    <section className="dashboard" aria-label="Dashboard">
      <div className="hero">
        <div className="card today">
          <div className="app-tag-wrapper">
            <span className="dealership-pill">Hyundai Dealership</span>
            <p className="app-tag">Service Manager Daily Operations</p>
          </div>
          <h1>Daily Checklist & Timeline</h1>
          <div className="today-meta">
            <div>
              <span className="meta-label">Today's Date</span>
              <span className="meta-value" data-testid="today-date">{date}</span>
            </div>
            <div>
              <span className="meta-label">Current Clock</span>
              <span className="clock" data-testid="clock">{time}</span>
            </div>
          </div>
        </div>

        <div className="next-card" data-testid="next-card">
          <div className="next-label">
            <span className="pulse-dot" aria-hidden="true" />
            NEXT UP ROUTINE
          </div>
          {next ? (
            <>
              <div className="next-time" data-testid="next-time">{fmt12(next.time)}</div>
              <div className="next-task">{next.task}</div>
              <div className="next-area">📍 Area: {next.area}</div>
            </>
          ) : (
            <>
              <div className="next-time next-time-small">{allDone ? 'All Done ✓' : 'No More Start Times'}</div>
              <div className="next-task">
                {allDone
                  ? 'All 13 routine jobs are completed for today.'
                  : 'Review any pending jobs marked Overdue below.'}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="stats">
        <div className="stat stat-total">
          <div className="stat-header">
            <span className="stat-label">TOTAL JOBS</span>
            <span className="stat-icon" aria-hidden="true">📋</span>
          </div>
          <span className="stat-num" data-testid="stat-total">{stats.total}</span>
        </div>
        <div className="stat stat-done">
          <div className="stat-header">
            <span className="stat-label">COMPLETED</span>
            <span className="stat-icon" aria-hidden="true">✅</span>
          </div>
          <span className="stat-num" data-testid="stat-completed">{stats.completed}</span>
        </div>
        <div className="stat stat-pending">
          <div className="stat-header">
            <span className="stat-label">PENDING</span>
            <span className="stat-icon" aria-hidden="true">⏳</span>
          </div>
          <span className="stat-num" data-testid="stat-pending">{stats.pending}</span>
        </div>
        <div className="stat stat-progress">
          <div className="stat-header">
            <span className="stat-label">PROGRESS</span>
            <span className="stat-icon" aria-hidden="true">📈</span>
          </div>
          <span className="stat-num" data-testid="stat-pct">{stats.pct}%</span>
        </div>
      </div>

      <div className="progress-wrap">
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={stats.pct}
          aria-label="Completion progress"
        >
          <div className="progress-fill" style={{ width: `${stats.pct}%` }} />
        </div>
        <span className="progress-note">
          {stats.overdue > 0 ? `⚠️ ${stats.overdue} Overdue` : '✅ All on track'}
        </span>
      </div>

      {/* 100% Celebration Banner */}
      {stats.pct === 100 && stats.total > 0 && (
        <div className="celebration-banner" role="status">
          <div className="celebration-icon" aria-hidden="true">🎉</div>
          <div className="celebration-content">
            <h3 className="celebration-title">100% Checklist Accomplished!</h3>
            <p className="celebration-desc">
              All {stats.total} routine jobs completed today. Outstanding leadership and dealership performance!
            </p>
          </div>
          <div className="celebration-badge">🏆 Perfect Score</div>
        </div>
      )}

      {/* Streak banner */}
      {streak > 0 && (
        <div className="streak-banner" role="status" aria-live="polite">
          <span className="streak-fire" aria-hidden="true">🔥</span>
          <div className="streak-content">
            <span className="streak-title">{streak}-Day 100% Streak!</span>
            <span className="streak-text">
              {streak >= 5 ? 'Elite consistency — Top dealership performance! 🏆' : streak >= 3 ? 'Remarkable focus — Keep up the momentum! 💪' : 'Consistent execution every single day!'}
            </span>
          </div>
        </div>
      )}

      {/* Weekly history chart */}
      <WeeklyHistory history={weekHistory} />
    </section>
  );
}
