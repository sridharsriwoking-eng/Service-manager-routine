export default function Header({ theme, onToggleTheme, installPrompt, onInstall }) {
  return (
    <header className="header">
      <div className="container header-inner">
        {/* Left: brand */}
        <div className="brand-left">
          <div className="brand-hyundai">HYUNDAI</div>
          <span className="brand-sub">Official Dealership</span>
        </div>

        {/* Center: title (hidden on small mobile) */}
        <div className="header-center">
          <strong>ROUTINE JOB / SERVICE MANAGER</strong>
          <span>SM Daily Operations Checklist</span>
        </div>

        {/* Right: dealership + actions */}
        <div className="header-right">
          <div className="brand-dealership">
            <div className="brand-kovai">KOVAI HYUNDAI</div>
            <div className="brand-ss">SS AUTOMARTS</div>
          </div>

          <div className="header-actions">
            {installPrompt && (
              <button
                type="button"
                className="header-btn install-btn"
                onClick={onInstall}
                title="Install as native app on your phone or desktop"
              >
                📲 <span className="theme-text">Install</span>
              </button>
            )}

            <a
              href="./sm-daily-routine.apk"
              download="sm-daily-routine.apk"
              className="header-btn apk-btn"
              title="Download Android APK file directly"
            >
              🤖 <span className="theme-text">APK</span>
            </a>

            <button
              type="button"
              className="theme-toggle-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              <span className="theme-icon" aria-hidden="true">
                {theme === 'dark' ? '☀️' : '🌙'}
              </span>
              <span className="theme-text">
                {theme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
