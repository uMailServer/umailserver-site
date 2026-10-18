'use client';

import { useSyncExternalStore } from 'react';
import { animationPreference } from '@/lib/animation-preference';

const serverPreference = () => null;
export function useAnimationPreference() {
  return useSyncExternalStore(
    animationPreference.subscribe,
    animationPreference.getSnapshot,
    serverPreference,
  );
}

export function AnimationToggle() {
  const enabled = useAnimationPreference();
  const label = enabled ? 'Animasyonları kapat' : 'Animasyonları aç';
  return (
    <button
      type="button"
      className="animation-toggle"
      lang="tr"
      data-ready={enabled !== null}
      disabled={enabled === null}
      aria-pressed={enabled === true}
      aria-label={label}
      title={label}
      onClick={() => animationPreference.setEnabled(!enabled)}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="5" y="2" width="14" height="20" rx="7" />
        <path d="M12 6v4" />
        {!enabled && <path className="mouse-slash" d="M3 3l18 18" />}
      </svg>
    </button>
  );
}
