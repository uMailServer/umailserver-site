export function Icon({
  name,
  size = 20,
  className = '',
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const paths: Record<string, React.ReactNode> = {
    arrow: (
      <>
        <path d="M4 12h15M13 5l7 7-7 7" />
      </>
    ),
    external: (
      <>
        <path d="M7 17 17 7M7 7h10v10" />
      </>
    ),
    chevron: <path d="m6 9 6 6 6-6" />,
    github: (
      <>
        <path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7m12 5v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.6-1.3 5.6-6a4.7 4.7 0 0 0-1.3-3.3A4.3 4.3 0 0 0 18.4 3S17.3 2.7 15 4a11.5 11.5 0 0 0-6 0C6.7 2.7 5.6 3 5.6 3a4.3 4.3 0 0 0-.1 3.3A4.7 4.7 0 0 0 4.2 9.6c0 4.7 2.9 5.7 5.6 6A3 3 0 0 0 9 18v3.3" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" />
      </>
    ),
    moon: <path d="M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z" />,
    monitor: (
      <>
        <rect x="3" y="3" width="18" height="13" rx="2" />
        <path d="M8 21h8m-4-5v5" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2" />
        <path d="M15 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    server: (
      <>
        <rect x="3" y="3" width="18" height="7" rx="2" />
        <rect x="3" y="14" width="18" height="7" rx="2" />
        <path d="M7 6.5h.01M7 17.5h.01M12 7h5m-5 10h5" />
      </>
    ),
    terminal: (
      <>
        <path d="m4 5 6 6-6 6m9 1h7" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    box: (
      <>
        <path d="m12 3 9 5v9l-9 5-9-5V8l9-5ZM3 8l9 5 9-5m-9 5v9M7 5.8l10 5.5" />
      </>
    ),
    code: (
      <>
        <path d="m7 6-6 6 6 6m10-12 6 6-6 6M14 3l-4 18" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 10 6-10 6L2 9l10-6Zm-10 12 10 6 10-6M2 12l10 6 10-6" />
      </>
    ),
    activity: <path d="M2 12h5l3-9 4 18 3-9h5" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    book: (
      <>
        <path d="M12 5v16m0-16C8 2 3 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-1-1-6-2-10 1Z" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name] || paths.mail}
    </svg>
  );
}

export function Logo({ markOnly = false }: { markOnly?: boolean }) {
  return (
    <span className="brand">
      <svg viewBox="0 0 66 50" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="3.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M45 15H5v31h45v-4M6 16l17 17a6 6 0 0 0 8 0l14-16M6 45l14-14m13 1 14 13" />
          <path d="m58 3-18 24h9l-4 14 18-24H53l5-14Z" fill="var(--bg)" />
        </g>
      </svg>
      {!markOnly && (
        <span>
          uMail<span className="brand-light">Server</span>
        </span>
      )}
    </span>
  );
}

export function OxogLogo() {
  return (
    <svg viewBox="0 0 200 130" fill="none" aria-hidden="true" className="oxog-mark oxog-symbol">
      <path
        d="M93 56 72 35C49 13 14 24 9 53 3 84 23 104 46 103"
        stroke="var(--oxog-pink)"
        strokeWidth="12"
      />
      <path
        d="M146 25c24-7 45 10 47 34 3 26-16 46-39 44-14-1-24-11-41-27"
        stroke="var(--oxog-pink)"
        strokeWidth="12"
      />
      <path
        d="M76 18c30-20 75 1 77 40 1 12-1 24-6 33M53 36c-19 41 14 84 50 79 9-1 16-3 22-7"
        stroke="var(--oxog-purple)"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path d="m74 87 54-51" stroke="var(--oxog-pink)" strokeWidth="12" strokeLinecap="square" />
    </svg>
  );
}

export function StepLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="eyebrow">
      <span className="eyebrow-number">{n}</span>
      {children}
    </p>
  );
}
