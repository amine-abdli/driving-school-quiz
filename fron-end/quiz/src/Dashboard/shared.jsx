import { useEffect, useState } from 'react';

export const OPTION_NUMBERS = ['1', '2', '3', '4'];

export function Icon({ name, size = 20 }) {
  const paths = {
    arrowLeft: (
      <>
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </>
    ),
    arrowRight: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    close: (
      <>
        <path d="m18 6-12 12" />
        <path d="m6 6 12 12" />
      </>
    ),
    flag: (
      <>
        <path d="M4 22V4" />
        <path d="M4 4c6-4 10 4 16 0v12c-6 4-10-4-16 0" />
      </>
    ),
    image: (
      <>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-4-4L5 21" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="m19 6-1 14H6L5 6" />
        <path d="M10 11v5M14 11v5" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] || paths.book}
    </svg>
  );
}

export function QuestionImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) {
    return src ? <div className="image-fallback" role="status">Image indisponible</div> : null;
  }
  return <img className="question-image" src={src} alt={alt} onError={() => setFailed(true)} />;
}

export function Header({ onHome, onManage, onData, screen }) {
  return (
    <header className="app-header">
      <button
        className="brand"
        type="button"
        onClick={onHome}
        aria-label="Accueil"
      >
        <span className="brand-mark">r</span>
        <span className="brand-copy">
          <strong>
            route<span>40</span>
          </strong>
          <small>LE CODE, EN CONFIANCE</small>
        </span>
      </button>
      <nav className="header-nav" aria-label="Navigation principale">
        <button
          className={screen === 'home' ? 'nav-link active' : 'nav-link'}
          type="button"
          onClick={onHome}
        >
          Mes séries
        </button>
        <button
          className={screen === 'manage' ? 'nav-link active' : 'nav-link'}
          type="button"
          onClick={onManage}
        >
          Gestion
        </button>
        <button
          className={screen === 'data' ? 'nav-link active' : 'nav-link'}
          type="button"
          onClick={onData}
        >
          Données JSON
        </button>
      </nav>
      <div className="header-profile">
        <span className="profile-avatar">A</span>
        <span>Mon espace</span>
      </div>
    </header>
  );
}

export function StatusPill({ children, tone = 'neutral' }) {
  return (
    <span className={`status-pill ${tone}`}>
      {children}
    </span>
  );
}
