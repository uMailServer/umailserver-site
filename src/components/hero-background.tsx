'use client';

import { useEffect, useRef, useState } from 'react';
import {
  backingScale,
  isSceneTap,
  MailScene,
  SceneLoop,
  type ScenePointerSample,
} from '@/lib/mail-scene';

const interactive =
  'a,button,input,select,textarea,summary,[role="button"],[role="radio"],h1,p,code,.hero-checks,.diagram-overline,.diagram-caption';

/** A full-section mail fabric. The canvas never receives pointer events or keyboard focus. */
export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pauseControl = useRef<((paused: boolean) => void) | null>(null);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.closest<HTMLElement>('[data-mail-scene]') ?? canvas?.parentElement;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !host || !ctx) return;
    const scene = new MailScene();
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    let inView = false;
    let userPaused = false;
    let disposed = false;
    let ratio = 1;
    let previousBurstCount = -1;
    let gesture: ScenePointerSample | null = null;

    const syncCounts = () => {
      if (previousBurstCount !== scene.bursts.length) {
        canvas.dataset.bursts = String(scene.bursts.length);
        previousBurstCount = scene.bursts.length;
      }
    };
    const paint = (seconds = 0) => {
      if (disposed) return;
      scene.advance(seconds);
      scene.draw(ctx);
      syncCounts();
    };
    const loop = new SceneLoop({
      request: (callback) => window.requestAnimationFrame(callback),
      cancel: (id) => window.cancelAnimationFrame(id),
      fps: () => scene.fps,
      paint,
    });
    const isAnimating = () => inView && !document.hidden && !scene.reduced && !userPaused;
    const syncActivity = () => {
      loop.setActive(isAnimating());
      canvas.dataset.sceneState = scene.reduced ? 'reduced' : isAnimating() ? 'running' : 'paused';
    };
    const appearance = () => {
      const value = document.documentElement.dataset.theme;
      scene.setTheme(
        value === 'dark' || (value !== 'light' && systemTheme.matches),
        !isAnimating(),
      );
      if (!isAnimating()) paint();
    };
    const reducedMotion = () => {
      scene.setReduced(motion.matches);
      setReduced(motion.matches);
      appearance();
      syncActivity();
      if (scene.reduced) paint();
    };
    const geometry = () => {
      const bounds = host.getBoundingClientRect();
      if (bounds.width < 1 || bounds.height < 1) return;
      const nextRatio = backingScale(bounds.width, bounds.height, window.devicePixelRatio || 1);
      if (bounds.width !== scene.width || bounds.height !== scene.height || nextRatio !== ratio) {
        ratio = nextRatio;
        scene.resize(bounds.width, bounds.height);
        canvas.width = Math.floor(bounds.width * ratio);
        canvas.height = Math.floor(bounds.height * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        canvas.dataset.packets = String(scene.packets.length);
      }
      scene.protectedAreas = [...host.querySelectorAll<HTMLElement>('[data-scene-protect]')].map(
        (el) => {
          const rect = el.getBoundingClientRect();
          return {
            x: rect.left - bounds.left - 12,
            y: rect.top - bounds.top - 12,
            width: rect.width + 24,
            height: rect.height + 24,
            weight: Number(el.dataset.sceneProtect) || 0.13,
          };
        },
      );
      paint();
    };
    const position = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      return {
        x: ((event.clientX - bounds.left) * scene.width) / bounds.width,
        y: ((event.clientY - bounds.top) * scene.height) / bounds.height,
      };
    };
    const ignored = (target: EventTarget | null) =>
      target instanceof Element && !!target.closest(interactive);
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !event.isPrimary || userPaused) return;
      const point = position(event);
      scene.movePointer(point.x, point.y);
    };
    const down = (event: PointerEvent) => {
      if (
        !event.isPrimary ||
        event.button !== 0 ||
        ignored(event.target) ||
        scene.reduced ||
        userPaused
      )
        return;
      gesture = {
        x: event.clientX,
        y: event.clientY,
        time: event.timeStamp,
        id: event.pointerId,
        scroll: window.scrollY,
      };
    };
    const up = (event: PointerEvent) => {
      const start = gesture;
      gesture = null;
      if (
        !start ||
        start.id !== event.pointerId ||
        ignored(event.target) ||
        userPaused ||
        scene.reduced
      )
        return;
      if (
        !isSceneTap(start, {
          x: event.clientX,
          y: event.clientY,
          time: event.timeStamp,
          id: event.pointerId,
          scroll: window.scrollY,
        }) ||
        window.getSelection()?.toString()
      )
        return;
      const point = position(event);
      if (scene.tap(point.x, point.y)) {
        syncCounts();
        canvas.dataset.interactions = String(Number(canvas.dataset.interactions || 0) + 1);
      }
    };
    const leave = () => {
      scene.leavePointer();
      gesture = null;
    };
    const visibility = () => {
      if (document.hidden) leave();
      syncActivity();
    };
    pauseControl.current = (value) => {
      userPaused = value;
      leave();
      syncActivity();
    };

    geometry();
    reducedMotion();
    setReady(true);
    const sizeObserver = new ResizeObserver(geometry);
    sizeObserver.observe(host);
    host.querySelectorAll('[data-scene-protect]').forEach((el) => sizeObserver.observe(el));
    const themeObserver = new MutationObserver(appearance);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    const viewportObserver = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        if (!inView) leave();
        syncActivity();
      },
      { threshold: 0 },
    );
    viewportObserver.observe(host);
    const passive = { passive: true } as const;
    host.addEventListener('pointermove', move, passive);
    host.addEventListener('pointerdown', down, passive);
    host.addEventListener('pointerup', up, passive);
    host.addEventListener('pointerleave', leave, passive);
    host.addEventListener('pointercancel', leave, passive);
    window.addEventListener('resize', geometry, passive);
    document.addEventListener('visibilitychange', visibility);
    motion.addEventListener('change', reducedMotion);
    systemTheme.addEventListener('change', appearance);
    document.fonts.ready.then(() => {
      if (!disposed) geometry();
    });

    return () => {
      disposed = true;
      loop.dispose();
      pauseControl.current = null;
      sizeObserver.disconnect();
      themeObserver.disconnect();
      viewportObserver.disconnect();
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerdown', down);
      host.removeEventListener('pointerup', up);
      host.removeEventListener('pointerleave', leave);
      host.removeEventListener('pointercancel', leave);
      window.removeEventListener('resize', geometry);
      document.removeEventListener('visibilitychange', visibility);
      motion.removeEventListener('change', reducedMotion);
      systemTheme.removeEventListener('change', appearance);
    };
  }, []);

  return (
    <>
      <canvas className="hero-background" ref={canvasRef} aria-hidden="true" />
      <button
        type="button"
        className="hero-motion-toggle"
        hidden={!ready || reduced}
        aria-label={paused ? 'Resume background animation' : 'Pause background animation'}
        aria-pressed={paused}
        onClick={() => {
          const next = !paused;
          setPaused(next);
          pauseControl.current?.(next);
        }}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          {paused ? (
            <path d="m5 3 8 5-8 5V3Z" stroke="currentColor" strokeLinejoin="round" />
          ) : (
            <path
              d="M5 3v10M11 3v10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )}
        </svg>
        <span>{paused ? 'Resume motion' : 'Pause motion'}</span>
      </button>
    </>
  );
}
