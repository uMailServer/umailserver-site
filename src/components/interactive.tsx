'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { Icon, Logo } from './icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimationToggle } from './animation-control';
import { sourceCheckout } from '@/lib/product';

type Theme = 'light' | 'dark' | 'system';
const themeIcon = { light: 'sun', dark: 'moon', system: 'monitor' };

function readTheme(): Theme {
  const value = document.documentElement.dataset.theme;
  return value === 'light' || value === 'dark' ? value : 'system';
}

function applyTheme(value: string | null) {
  if (value === 'light' || value === 'dark') document.documentElement.dataset.theme = value;
  else delete document.documentElement.dataset.theme;
}

function subscribeTheme(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === 'umail-theme' || event.key === null) {
      applyTheme(event.newValue);
      onChange();
    }
  };
  window.addEventListener('umail:theme-change', onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener('umail:theme-change', onChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function Header() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => 'system' as Theme);
  const themeLabel = theme[0].toUpperCase() + theme.slice(1);
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const picker = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const mobileMenu = useRef<HTMLElement>(null);
  const themeId = useId();
  useEffect(() => {
    if (!open) return;
    picker.current?.querySelector<HTMLInputElement>('input:checked')?.focus();
    const close = (e: PointerEvent | FocusEvent) => {
      if (!picker.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('focusin', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('focusin', close);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  useEffect(() => {
    if (!mobile) return;
    const breakpoint = window.matchMedia('(max-width: 820px)');
    const dismiss = (event: PointerEvent | FocusEvent) => {
      const target = event.target as Node;
      if (!mobileMenu.current?.contains(target) && !menuButton.current?.contains(target))
        setMobile(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobile(false);
        menuButton.current?.focus();
      }
    };
    const resize = () => {
      if (!breakpoint.matches) setMobile(false);
    };
    mobileMenu.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    document.addEventListener('keydown', escape);
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('focusin', dismiss);
    breakpoint.addEventListener('change', resize);
    return () => {
      document.removeEventListener('keydown', escape);
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('focusin', dismiss);
      breakpoint.removeEventListener('change', resize);
    };
  }, [mobile]);
  function choose(value: Theme) {
    applyTheme(value);
    try {
      localStorage.setItem('umail-theme', value);
    } catch {}
    window.dispatchEvent(new Event('umail:theme-change'));
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
          <div className="theme-picker" ref={picker}>
            <button
              type="button"
              ref={trigger}
              className="theme-trigger"
              aria-label={`Color theme: ${themeLabel}`}
              aria-expanded={open}
              aria-haspopup="dialog"
              aria-controls={themeId}
              onClick={() => {
                setMobile(false);
                setOpen(!open);
              }}
            >
              <Icon name={themeIcon[theme]} size={17} />
              <span>{themeLabel}</span>
              <Icon name="chevron" className="theme-chevron" size={13} />
            </button>
            {open && (
              <div className="theme-panel" id={themeId} role="dialog" aria-label="Appearance">
                <div className="theme-panel-heading">
                  <span>Appearance</span>
                  <span className="theme-panel-hint">Your space, your style.</span>
                </div>
                <fieldset className="theme-options">
                  <legend className="sr-only">Color theme</legend>
                  {(['light', 'dark', 'system'] as Theme[]).map((value) => (
                    <label className="theme-option" key={value}>
                      <input
                        type="radio"
                        name={`${themeId}-theme`}
                        value={value}
                        checked={theme === value}
                        onChange={() => choose(value)}
                      />
                      <span className={`theme-preview theme-preview-${value}`} aria-hidden="true">
                        <span className="theme-preview-window">
                          <span className="theme-preview-sidebar" />
                          <span className="theme-preview-content">
                            <i />
                            <i />
                            <i />
                          </span>
                        </span>
                        <span className="theme-choice-icon">
                          <Icon name={themeIcon[value]} />
                        </span>
                        <span className="theme-choice-check">
                          <Icon name="check" />
                        </span>
                      </span>
                      <span className="theme-option-label">
                        {value[0].toUpperCase() + value.slice(1)}
                      </span>
                    </label>
                  ))}
                </fieldset>
                <p className="theme-panel-status" aria-live="polite">
                  <Icon name={themeIcon[theme]} />
                  {theme === 'system'
                    ? 'Matches your device’s appearance.'
                    : `${themeLabel} mode, just how you like it.`}
                </p>
              </div>
            )}
          </div>
          <AnimationToggle />
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
            onClick={() => {
              setOpen(false);
              setMobile(!mobile);
            }}
          >
            <Icon name={mobile ? 'close' : 'menu'} />
          </button>
        </div>
        {mobile && (
          <nav
            className="mobile-nav"
            ref={mobileMenu}
            id="mobile-navigation"
            aria-label="Mobile navigation"
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
    code: `${sourceCheckout}\nmake build\nsudo ./umailserver quickstart admin@example.com\nsudo ./umailserver serve --config /etc/umailserver/umailserver.yaml`,
    note: 'Linux / macOS · Go 1.25+, Node.js 20+, npm and make. Review the generated configuration before starting.',
  },
  docker: {
    label: 'Docker',
    file: 'terminal',
    code: `${sourceCheckout}\ndocker build -t umailserver:local .\n# Review the production Compose configuration first:\ncat deploy/docker/production/docker-compose.yml`,
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
        <pre tabIndex={0}>
          <code>
            {current.code.split('\n').map((line, i) => (
              <span className={line.startsWith('#') ? 'code-comment' : ''} key={i}>
                <span className="line-number" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
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
  const pathname = usePathname();
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const logos = document.querySelectorAll<SVGElement>('.oxog-symbol');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const visible = new Map<SVGElement, boolean>();
    const updateLogo = (logo: SVGElement) => {
      if (motion.matches) delete logo.dataset.motion;
      else logo.dataset.motion = visible.get(logo) && !document.hidden ? 'drawing' : 'paused';
    };
    const updateLogos = () => logos.forEach(updateLogo);
    updateLogos();
    motion.addEventListener('change', updateLogos);
    document.addEventListener('visibilitychange', updateLogos);
    const logoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const logo = entry.target as SVGElement;
          visible.set(logo, entry.isIntersecting);
          updateLogo(logo);
        });
      },
      { threshold: 0.12 },
    );
    logos.forEach((logo) => logoObserver.observe(logo));
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
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      logoObserver.disconnect();
      motion.removeEventListener('change', updateLogos);
      document.removeEventListener('visibilitychange', updateLogos);
      logos.forEach((logo) => {
        delete logo.dataset.motion;
      });
    };
  }, [pathname]);
  return null;
}
