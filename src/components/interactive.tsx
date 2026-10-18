'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon, Logo } from './icons';
import Link from 'next/link';

type Theme = 'light' | 'dark' | 'system';
const themeIcon = { light: 'sun', dark: 'moon', system: 'monitor' };

export function Header() {
  const [theme, setTheme] = useState<Theme>('system');
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const picker = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('umail-theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') setTheme(saved);
    } catch {}
    const close = (e: PointerEvent) => {
      if (!picker.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  useEffect(() => {
    if (open)
      picker.current?.querySelector<HTMLButtonElement>(`[data-theme-option="${theme}"]`)?.focus();
  }, [open, theme]);
  function choose(value: Theme) {
    setTheme(value);
    try {
      localStorage.setItem('umail-theme', value);
    } catch {}
    if (value === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = value;
  }
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" aria-label="uMailServer home" className="home-link">
          <Logo />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/#features">Why uMailServer</Link>
          <Link href="/#architecture">How it works</Link>
          <Link href="/docs/">Documentation</Link>
        </nav>
        <div className="header-actions">
          <div
            className="theme-picker"
            ref={picker}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setOpen(false);
                trigger.current?.focus();
              }
            }}
          >
            <button
              ref={trigger}
              className="theme-trigger"
              aria-label={`Color theme: ${theme}`}
              aria-expanded={open}
              aria-haspopup="dialog"
              aria-controls="theme-dialog"
              onClick={() => setOpen(!open)}
            >
              <Icon name={themeIcon[theme]} size={17} />
              <span>{theme}</span>
              <Icon name="chevron" size={13} />
            </button>
            {open && (
              <div
                className="theme-popover"
                id="theme-dialog"
                role="dialog"
                aria-label="Appearance"
              >
                <strong>Appearance</strong>
                <p>A little more you.</p>
                <div role="group" aria-label="Color theme" className="theme-options">
                  {(['light', 'dark', 'system'] as Theme[]).map((value, i) => (
                    <button
                      key={value}
                      data-theme-option={value}
                      aria-pressed={theme === value}
                      onClick={() => choose(value)}
                      onKeyDown={(e) => {
                        if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
                          e.preventDefault();
                          const next =
                            e.key === 'Home'
                              ? 0
                              : e.key === 'End'
                                ? 2
                                : (i + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
                          picker.current
                            ?.querySelector<HTMLButtonElement>(
                              `[data-theme-option="${['light', 'dark', 'system'][next]}"]`,
                            )
                            ?.focus();
                        }
                      }}
                    >
                      <Icon name={themeIcon[value]} size={21} />
                      <span>{value}</span>
                    </button>
                  ))}
                </div>
                <small>
                  {theme === 'system'
                    ? 'In sync with your device.'
                    : `${theme === 'light' ? 'A brighter' : 'A quieter'} view of your infrastructure.`}
                </small>
              </div>
            )}
          </div>
          <a className="github-header" href="https://github.com/uMailServer/uMailServer">
            <Icon name="github" size={19} />
            <span>GitHub</span>
            <Icon name="external" size={13} />
          </a>
          <button
            className="mobile-toggle"
            ref={menuButton}
            aria-label={mobile ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobile}
            aria-controls="mobile-navigation"
            onClick={() => setMobile(!mobile)}
          >
            <Icon name={mobile ? 'close' : 'menu'} />
          </button>
        </div>
        {mobile && (
          <nav
            className="mobile-nav"
            id="mobile-navigation"
            aria-label="Mobile navigation"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setMobile(false);
                menuButton.current?.focus();
              }
            }}
          >
            {[
              ['Why uMailServer', '/#features'],
              ['How it works', '/#architecture'],
              ['Documentation', '/docs/'],
              ['Get started', '/docs/getting-started/'],
            ].map(([title, href]) => (
              <Link key={href} href={href} onClick={() => setMobile(false)}>
                {title}
                <Icon name="arrow" size={16} />
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

export function CopyButton({ text, label = 'Copy command' }: { text: string; label?: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <button
      className="copy-button"
      aria-label={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setStatus('copied');
        } catch {
          setStatus('error');
        }
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setStatus('idle'), 2500);
      }}
    >
      <Icon name={status === 'copied' ? 'check' : 'copy'} size={17} />
      <span role="status">
        {status === 'copied' ? 'Copied!' : status === 'error' ? 'Select & copy' : 'Copy'}
      </span>
    </button>
  );
}

const snippets = {
  source: {
    label: 'Build from source',
    file: 'terminal',
    code: 'git clone https://github.com/uMailServer/uMailServer.git\ncd uMailServer\nmake build\nsudo ./umailserver quickstart admin@example.com\nsudo ./umailserver serve --config /etc/umailserver/umailserver.yaml',
    note: 'Linux / macOS · Go 1.25+, Node.js 20+, npm and make. Review the generated configuration before starting.',
  },
  docker: {
    label: 'Docker',
    file: 'terminal',
    code: 'git clone https://github.com/uMailServer/uMailServer.git\ncd uMailServer\ndocker build -t umailserver:local .\n# Review the production Compose configuration first:\ncat deploy/docker/production/docker-compose.yml',
    note: 'Build the image locally. The production Compose example also includes a TLS reverse proxy; review its volumes, secrets and ports before use.',
  },
};
export function InstallTabs() {
  const [tab, setTab] = useState<'source' | 'docker'>('source');
  const current = snippets[tab];
  return (
    <div className="install-panel">
      <div className="install-tabs" role="tablist" aria-label="Installation method">
        {(['source', 'docker'] as const).map((key, i) => (
          <button
            key={key}
            id={`tab-${key}`}
            role="tab"
            aria-selected={tab === key}
            aria-controls={`panel-${key}`}
            tabIndex={tab === key ? 0 : -1}
            onClick={() => setTab(key)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const next = i === 0 ? 'docker' : 'source';
                setTab(next);
                document.getElementById(`tab-${next}`)?.focus();
              }
            }}
          >
            <Icon name={key === 'source' ? 'terminal' : 'box'} size={16} />
            {snippets[key].label}
          </button>
        ))}
        <span className="install-platform">YOUR SERVER. YOUR RULES.</span>
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0}>
        <div className="code-toolbar">
          <span>
            <i />
            <i />
            <i />
          </span>
          <small>{current.file}</small>
          <CopyButton text={current.code} />
        </div>
        <pre>
          <code>
            {current.code.split('\n').map((line, i) => (
              <span className={line.startsWith('#') ? 'code-comment' : ''} key={i}>
                <span className="line-number">{String(i + 1).padStart(2, '0')}</span>
                {line}
                <br />
              </span>
            ))}
          </code>
        </pre>
        <p className="code-note">
          <Icon name="book" size={16} />
          {current.note}
        </p>
      </div>
    </div>
  );
}

export function MotionObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll('.reveal, .oxog-symbol').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
