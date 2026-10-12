const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeeklyHistory({ history }) {
  if (!history || !history.length) return null;

  return (
    <section className="weekly-history" aria-label="Last 7 days completion history">
      <h3 className="week-heading">📅 Last 7 Days</h3>
      <div className="week-bars">
        {history.map(({ key, date, pct, completed, total, isToday }) => (
          <div
            key={key}
            className={[
              'week-col',
              isToday ? 'week-today' : '',
              pct === 100 ? 'week-perfect' : '',
              pct === 0 && !isToday ? 'week-zero' : '',
            ].filter(Boolean).join(' ')}
          >
            <div className="week-pct-label">{pct > 0 ? `${pct}%` : ''}</div>
            <div className="week-bar-track" title={`${completed}/${total} tasks`}>
              <div className="week-bar-fill" style={{ height: `${pct}%` }} />
            </div>
            <div className="week-day-name">{isToday ? 'Today' : DAYS[date.getDay()]}</div>
            <div className="week-date-num">
              {date.getDate()}/{date.getMonth() + 1}
            </div>
            {pct === 100 && <div className="week-star" aria-label="Perfect">🌟</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
