/** A saved choice overrides the device default; invalid/missing values follow the device. */
export const ANIMATION_KEY = 'umail-animations';
export function resolveAnimationPreference(saved: string | null, reduced: boolean) {
  return saved === 'on' ? true : saved === 'off' ? false : !reduced;
}
export type AnimationPreferenceHost = {
  read: () => string | null;
  write: (value: string) => void;
  reduced: () => boolean;
  listen: (storage: (value: string | null) => void, motion: () => void) => () => void;
};
export function createAnimationPreferenceStore(host: AnimationPreferenceHost) {
  let loaded = false;
  let saved: string | null = null;
  let disconnect: (() => void) | undefined;
  const listeners = new Set<() => void>();
  const refresh = () => {
    try {
      saved = host.read();
    } catch {
      /* Preserve the in-memory choice when storage is blocked. */
    }
    loaded = true;
  };
  const emit = () => listeners.forEach((listener) => listener());
  return {
    getSnapshot() {
      if (!loaded) refresh();
      return resolveAnimationPreference(saved, host.reduced());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (!disconnect) {
        refresh();
        disconnect = host.listen((value) => {
          saved = value;
          loaded = true;
          emit();
        }, emit);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          disconnect?.();
          disconnect = undefined;
        }
      };
    },
    setEnabled(enabled: boolean) {
      saved = enabled ? 'on' : 'off';
      loaded = true;
      try {
        host.write(saved);
      } catch {
        /* The switch still works for this page session. */
      }
      emit();
    },
  };
}
// All browser access is lazy: importing this module during static export is safe.
let media: MediaQueryList | undefined;
const reducedMedia = () => (media ??= window.matchMedia('(prefers-reduced-motion: reduce)'));
export const animationPreference = createAnimationPreferenceStore({
  read: () => localStorage.getItem(ANIMATION_KEY),
  write: (value) => localStorage.setItem(ANIMATION_KEY, value),
  reduced: () => reducedMedia().matches,
  listen(storage, motion) {
    const onStorage = (event: StorageEvent) => {
      if (event.key === ANIMATION_KEY || event.key === null) storage(event.newValue);
    };
    const query = reducedMedia();
    window.addEventListener('storage', onStorage);
    query.addEventListener('change', motion);
    return () => {
      window.removeEventListener('storage', onStorage);
      query.removeEventListener('change', motion);
    };
  },
});
