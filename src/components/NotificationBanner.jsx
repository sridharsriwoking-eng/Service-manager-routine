export default function NotificationBanner({ onEnable, onLater }) {
  return (
    <div className="banner" role="region" aria-label="Enable notifications">
      <div className="container banner-inner">
        <div className="banner-text">
          <strong>🔔 Enable desktop reminders</strong>
          <span>Allow notifications so the SM receives routine job reminders.</span>
        </div>
        <div className="banner-actions">
          <button type="button" className="btn btn-primary" onClick={onEnable}>
            Enable Notifications
          </button>
          <button type="button" className="btn btn-ghost" onClick={onLater}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
