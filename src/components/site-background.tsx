'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  AMBIENT,
  AmbientScene,
  isSceneTap,
  SceneLoop,
  type ScenePointerSample,
} from '@/lib/ambient-scene';

const slots = Array.from({ length: AMBIENT.maxObjects }, (_, i) => i);
const burstSlots = Array.from({ length: AMBIENT.maxBursts }, (_, i) => i);
const sparks = Array.from({ length: AMBIENT.sparks }, (_, i) => i);
const controls =
  'a,button,input,select,textarea,summary,label,[role="button"],[role="link"],[role="radio"],[role="tab"],[role="menuitem"],[contenteditable]:not([contenteditable="false"]),[data-background-ignore]';
const text = 'h1,h2,h3,h4,h5,h6,p,li,pre,code,blockquote,dt,dd,figcaption,td,th,caption';
const protectedContent = `${controls},${text},[data-scene-protect],article,table,.control-illustration,.pipeline,.studio,.docs-sidebar,.hero-checks,.stack-strip,.footer-bottom,.eyebrow,.mini-label,.architecture-notes,.hero-command,.install-tabs,.code-panel`;
const svgNS = 'http://www.w3.org/2000/svg';

/** A single decorative SVG viewport shared by every route. React never renders an animation frame. */
export function SiteBackground() {
  const svgRef = useRef<SVGSVGElement>(null);
  const maskRef = useRef<SVGGElement>(null);
  const pauseControl = useRef<((paused: boolean) => void) | null>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const id = `ambient-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useEffect(() => {
    const svg = svgRef.current,
      mask = maskRef.current;
    if (!svg || !mask) return;
    const scene = new AmbientScene();
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const nodes = [...svg.querySelectorAll<SVGGElement>('[data-object]')];
    const waves = [...svg.querySelectorAll<SVGGElement>('[data-wave]')].map((group) => ({
      group,
      rings: [...group.querySelectorAll('circle')],
      particles: [...group.querySelectorAll('use')],
    }));
    const keys: string[] = [];
    let dirty = true,
      disposed = false,
      inView = false;
    let layoutFrame: number | null = null;
    let gesture: ScenePointerSample | null = null;
    let protectedRects: DOMRect[] = [];
    let previousCount = -1;
    let interactions = 0;
    let previousVisible = -1;
    const canAnimate = () => inView && !document.hidden && !scene.reduced && !pausedRef.current;
    const refreshGeometry = () => {
      dirty = false;
      const width = document.documentElement.clientWidth,
        height = window.innerHeight;
      scene.viewport(width, height, window.scrollY);
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      // Layout is measured only on scroll/resize/content changes, never on motion frames.
      const elements = [...document.querySelectorAll(protectedContent)].filter(
        (el) => !svg.contains(el),
      );
      protectedRects = elements
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0 && r.bottom > -20 && r.top < height + 20);
      const fragment = document.createDocumentFragment();
      for (const r of protectedRects) {
        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x', String(r.left - 10));
        rect.setAttribute('y', String(r.top - 8));
        rect.setAttribute('width', String(r.width + 20));
        rect.setAttribute('height', String(r.height + 16));
        rect.setAttribute('rx', '10');
        fragment.append(rect);
      }
      mask.replaceChildren(fragment);
      svg.dataset.objects = String(scene.objects.length);
    };
    const paint = (seconds = 0) => {
      if (disposed) return;
      if (dirty) refreshGeometry();
      scene.advance(seconds);
      let visible = 0;
      for (let i = 0; i < nodes.length; i++) {
        const o = scene.objects[i],
          node = nodes[i];
        const covered =
          o &&
          protectedRects.some(
            (r) =>
              o.x - 65 > r.left && o.x + 65 < r.right && o.y - 65 > r.top && o.y + 65 < r.bottom,
          );
        if (!o?.visible || covered) {
          if (node.style.display !== 'none') node.style.display = 'none';
          continue;
        }
        visible++;
        if (node.style.display) node.style.display = '';
        if (keys[i] !== o.key) {
          node.firstElementChild!.setAttribute('href', `#${id}-shape-${o.kind}`);
          keys[i] = o.key;
        }
        node.setAttribute(
          'transform',
          `translate(${o.x.toFixed(2)} ${o.y.toFixed(2)}) rotate(${o.rotation.toFixed(2)}) scale(${o.size.toFixed(2)})`,
        );
        node.setAttribute('opacity', o.opacity.toFixed(3));
      }
      if (visible !== previousVisible) {
        svg.dataset.visibleObjects = String(visible);
        previousVisible = visible;
      }
      for (let i = 0; i < waves.length; i++) {
        const wave = waves[i],
          burst = scene.bursts[i];
        if (!burst) {
          if (wave.group.style.display !== 'none') wave.group.style.display = 'none';
          continue;
        }
        wave.group.style.display = '';
        const progress = burst.age / AMBIENT.burstLife;
        const radius = (scene.mobile ? 140 : 215) * (1 - (1 - progress) ** 2);
        const alpha = Math.sin(Math.PI * progress) * (1 - progress) * burst.power;
        wave.group.setAttribute(
          'transform',
          `translate(${burst.x} ${burst.worldY - scene.scroll})`,
        );
        wave.group.setAttribute('opacity', (alpha * 0.8).toFixed(3));
        wave.rings.forEach((ring, n) =>
          ring.setAttribute('r', Math.max(0, radius - n * 15).toFixed(2)),
        );
        wave.particles.forEach((particle, n) => {
          const angle = (n / AMBIENT.sparks) * Math.PI * 2 + burst.seed * 3;
          const travel = radius * (0.45 + (n % 3) * 0.12);
          particle.setAttribute(
            'transform',
            `translate(${(Math.cos(angle) * travel).toFixed(2)} ${(Math.sin(angle) * travel).toFixed(2)}) rotate(${angle * 30}) scale(${0.22 * (1 - progress) + 0.08})`,
          );
        });
      }
      if (previousCount !== scene.bursts.length) {
        svg.dataset.bursts = String(scene.bursts.length);
        previousCount = scene.bursts.length;
      }
    };
    const loop = new SceneLoop({
      request: (cb) => requestAnimationFrame(cb),
      cancel: (frame) => window.cancelAnimationFrame(frame),
      fps: () => scene.fps,
      paint,
    });
    const syncActivity = () => {
      loop.setActive(canAnimate());
      svg.dataset.sceneState = scene.reduced ? 'reduced' : canAnimate() ? 'running' : 'paused';
    };
    const invalidate = () => {
      dirty = true;
      if (!canAnimate() && layoutFrame === null && !document.hidden) {
        layoutFrame = requestAnimationFrame(() => {
          layoutFrame = null;
          paint();
        });
      }
    };
    const leave = () => {
      scene.leavePointer();
      gesture = null;
    };
    const preference = () => {
      scene.setReduced(motion.matches);
      setReduced(motion.matches);
      leave();
      dirty = true;
      syncActivity();
      paint();
    };
    const ignored = (target: EventTarget | null) =>
      target instanceof Element && !!target.closest(`${controls},${text}`);
    const move = (event: PointerEvent) => {
      if (
        gesture &&
        Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > AMBIENT.tap.distance
      )
        gesture = null;
      if (event.pointerType === 'touch' || !event.isPrimary || !canAnimate()) return;
      if (ignored(event.target)) {
        scene.leavePointer();
        return;
      }
      scene.movePointer(event.clientX, event.clientY);
    };
    const down = (event: PointerEvent) => {
      gesture = null;
      if (!event.isPrimary || event.button !== 0 || ignored(event.target) || !canAnimate()) return;
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
      if (!start || !canAnimate() || ignored(event.target) || getSelection()?.toString()) return;
      if (
        !isSceneTap(start, {
          x: event.clientX,
          y: event.clientY,
          time: event.timeStamp,
          id: event.pointerId,
          scroll: window.scrollY,
        })
      )
        return;
      if (scene.tap(event.clientX, event.clientY))
        svg.dataset.interactions = String(++interactions);
    };
    const scroll = () => {
      leave();
      invalidate();
    };
    const visibility = () => {
      leave();
      // Stale effects never reappear after returning to a background tab.
      if (document.hidden) scene.clearEffects();
      else dirty = true;
      syncActivity();
      if (!document.hidden) paint();
    };
    const layoutChanged = (event: Event) => {
      if (event.target instanceof Element && !svg.contains(event.target)) invalidate();
    };
    pauseControl.current = (value) => {
      pausedRef.current = value;
      scene.clearEffects();
      leave();
      syncActivity();
      paint();
    };
    preference();
    setReady(true);
    svg.dataset.ready = 'true';
    const sizes = new ResizeObserver(invalidate);
    sizes.observe(document.body);
    const viewport = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      if (!inView) scene.clearEffects();
      syncActivity();
    });
    viewport.observe(svg);
    // Accordion changes and font loads can reposition protection without a route change.
    const content = new MutationObserver(invalidate);
    const main = document.querySelector('main');
    if (main)
      content.observe(main, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['open'],
      });
    const passive = { passive: true } as const;
    window.addEventListener('pointermove', move, passive);
    window.addEventListener('pointerdown', down, passive);
    window.addEventListener('pointerup', up, passive);
    document.documentElement.addEventListener('pointerleave', leave, passive);
    window.addEventListener('pointercancel', leave, passive);
    window.addEventListener('scroll', scroll, passive);
    window.addEventListener('resize', invalidate, passive);
    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('transitionend', layoutChanged, passive);
    motion.addEventListener('change', preference);
    document.fonts.ready.then(() => {
      if (!disposed) invalidate();
    });
    return () => {
      disposed = true;
      loop.dispose();
      if (layoutFrame !== null) cancelAnimationFrame(layoutFrame);
      pauseControl.current = null;
      sizes.disconnect();
      viewport.disconnect();
      content.disconnect();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointercancel', leave);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', invalidate);
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('transitionend', layoutChanged);
      motion.removeEventListener('change', preference);
    };
  }, [pathname, id]);

  return (
    <>
      <svg
        ref={svgRef}
        className="site-background"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth=".8"
      >
        <defs>
          <g id={`${id}-shape-0`}>
            <circle r="17" />
            <path d="M-29 0h5M24 0h5M0-29v5M0 24v5" />
          </g>
          <g id={`${id}-shape-1`}>
            <path d="m0-15 15 15-15 15L-15 0Z M0-7l7 7-7 7-7-7Z" />
          </g>
          <g id={`${id}-shape-2`}>
            <path d="M-9 0H9M0-9V9" />
            <circle r="2" />
          </g>
          <g id={`${id}-shape-3`}>
            <path d="M-42 12h36Q6 12 6 0T18-12h24" />
            <circle cx="-44" cy="12" r="2" />
            <circle cx="44" cy="-12" r="2" />
          </g>
          <g id={`${id}-shape-4`}>
            <rect x="-12" y="-12" width="24" height="24" rx="6" />
            <path d="M-19 19h12M-19 7v12" />
          </g>
          <g id={`${id}-shape-5`}>
            <rect x="-10" y="-7" width="20" height="14" rx="2" />
            <path d="m-9-6 9 8 9-8M-9 6l6-6m12 6L3 0" />
          </g>
          <g id={`${id}-shape-6`}>
            <ellipse rx="29" ry="10" transform="rotate(-30)" />
            <circle r="3" />
            <path d="M-8-25v7m0-7h7" />
          </g>
          <mask
            id={`${id}-mask`}
            maskUnits="userSpaceOnUse"
            style={{ maskType: 'luminance' }}
            x="0"
            y="0"
            width="100%"
            height="100%"
          >
            <rect width="100%" height="100%" fill="white" stroke="none" />
            <g ref={maskRef} fill="black" stroke="none" />
          </mask>
        </defs>
        <g mask={`url(#${id}-mask)`}>
          {slots.map((i) => (
            <g key={i} data-object="" style={{ display: 'none' }}>
              <use href={`#${id}-shape-0`} />
            </g>
          ))}
          <g className="ambient-waves" strokeWidth="1">
            {burstSlots.map((i) => (
              <g key={i} data-wave="" style={{ display: 'none' }}>
                <circle r="0" />
                <circle r="0" strokeDasharray="2 10" />
                {sparks.map((n) => (
                  <use key={n} href={`#${id}-shape-${n % 2 ? 2 : 5}`} />
                ))}
              </g>
            ))}
          </g>
        </g>
      </svg>
      <button
        type="button"
        className="site-motion-toggle"
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
