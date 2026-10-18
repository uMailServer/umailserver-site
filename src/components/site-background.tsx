'use client';

import { useEffect, useId, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAnimationPreference, useReducedMotionPreference } from './animation-control';
import {
  AMBIENT,
  AmbientScene,
  isSceneTap,
  waveRadius,
  relayRadius,
  SceneLoop,
  type ScenePointerSample,
} from '@/lib/ambient-scene';

const slots = Array.from({ length: AMBIENT.maxObjects }, (_, i) => i);
const burstSlots = Array.from({ length: AMBIENT.maxBursts }, (_, i) => i);
const sparks = Array.from({ length: AMBIENT.sparks }, (_, i) => i);
const controls =
  'a,button,input,select,textarea,summary,label,[role="button"],[role="link"],[role="radio"],[role="tab"],[role="menuitem"],[contenteditable]:not([contenteditable="false"]),[data-background-ignore]';
/** A single decorative SVG viewport shared by every route. React never renders an animation frame. */
export function SiteBackground() {
  const enabled = useAnimationPreference();
  const reduced = useReducedMotionPreference();
  if (enabled === null || reduced === null) return null;
  // An explicit opt-in can override the system default, as before.
  return <AnimatedBackground interactive={enabled} reduced={reduced && !enabled} />;
}

// Keep the quiet scene alive when mouse effects are disabled.
function AnimatedBackground({ interactive, reduced }: { interactive: boolean; reduced: boolean }) {
  const configureRef = useRef<((interactive: boolean, reduced: boolean) => void) | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathname = usePathname();
  const id = `ambient-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const scene = new AmbientScene();
    const nodes = [...svg.querySelectorAll<SVGGElement>('[data-object]')];
    const responseNodes = [...svg.querySelectorAll<SVGGElement>('[data-response-object]')];
    const halo = svg.querySelector<SVGGElement>('[data-pointer-field]')!;
    const haloOrbit = halo.querySelector<SVGGElement>('[data-pointer-orbit]')!;
    const trailNodes = [...svg.querySelectorAll<SVGPathElement>('[data-trail]')];
    const tetherNodes = [...svg.querySelectorAll<SVGPathElement>('[data-tether]')];
    const waves = [...svg.querySelectorAll<SVGGElement>('[data-wave]')].map((group) => ({
      group,
      rings: [...group.querySelectorAll('circle')],
      particles: [...group.querySelectorAll('use')],
    }));
    const relayNodes = [...svg.querySelectorAll<SVGGElement>('[data-relay]')].map((group) => ({
      group,
      ring: group.querySelector('circle')!,
      link: group.querySelector('path')!,
    }));
    const keys: string[] = [];
    let dirty = true,
      disposed = false,
      inView = false;
    let layoutFrame: number | null = null;
    let gesture: ScenePointerSample | null = null;
    let previousCount = -1;
    let previousRelays = -1;
    let interactions = Number(svg.dataset.interactions || 0);
    let previousVisible = -1;
    const canAnimate = () => inView && !document.hidden && !scene.reduced;
    const refreshGeometry = () => {
      dirty = false;
      const width = document.documentElement.clientWidth,
        height = window.innerHeight;
      scene.viewport(width, height, window.scrollY);
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
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
        const response = responseNodes[i];
        if (!o?.visible) {
          if (node.style.display !== 'none') node.style.display = 'none';
          if (response.style.display !== 'none') response.style.display = 'none';
          continue;
        }
        visible++;
        if (node.style.display) node.style.display = '';
        if (keys[i] !== o.key) {
          node.firstElementChild!.setAttribute('href', `#${id}-shape-${o.kind}`);
          response.firstElementChild!.setAttribute('href', `#${id}-shape-${o.kind}`);
          keys[i] = o.key;
        }
        const transform = `translate(${o.x.toFixed(2)} ${o.y.toFixed(2)}) rotate(${o.rotation.toFixed(2)}) scale(${(o.size * (1 + o.reaction * 0.12)).toFixed(2)})`;
        node.setAttribute('transform', transform);
        if (o.reaction > 0.008) {
          response.style.display = '';
          response.setAttribute('transform', transform);
          response.setAttribute('opacity', (o.reaction * 0.7).toFixed(3));
        } else if (response.style.display !== 'none') response.style.display = 'none';
        node.setAttribute('opacity', o.opacity.toFixed(3));
      }
      if (visible !== previousVisible) {
        svg.dataset.visibleObjects = String(visible);
        previousVisible = visible;
      }
      // The pointer lives in client space: it remains under the cursor while the document scrolls.
      if (scene.pointer.strength > 0.001) {
        halo.style.display = '';
        halo.setAttribute('transform', `translate(${scene.pointer.x} ${scene.pointer.y})`);
        halo.setAttribute('opacity', scene.pointer.strength.toFixed(3));
        haloOrbit.setAttribute('transform', `rotate(${(scene.clock * 12).toFixed(2)})`);
      } else if (halo.style.display !== 'none') halo.style.display = 'none';
      for (let i = 0; i < trailNodes.length; i++) {
        const a = scene.trail[i],
          b = scene.trail[i + 1],
          path = trailNodes[i];
        if (!a || !b) {
          if (path.style.display !== 'none') path.style.display = 'none';
          continue;
        }
        path.style.display = '';
        path.setAttribute('d', `M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${a.y} ${b.x} ${b.y}`);
        path.setAttribute('opacity', (0.5 * (1 - a.age / AMBIENT.trailLife) ** 2).toFixed(3));
      }
      const nearby =
        scene.pointer.strength > 0.01
          ? scene.objects
              .filter(
                (o) =>
                  o.visible &&
                  Math.hypot(o.x - scene.pointer.x, o.y - scene.pointer.y) <
                    (scene.mobile ? AMBIENT.mobilePointerRadius : AMBIENT.pointerRadius),
              )
              .sort(
                (a, b) =>
                  Math.hypot(a.x - scene.pointer.x, a.y - scene.pointer.y) -
                  Math.hypot(b.x - scene.pointer.x, b.y - scene.pointer.y),
              )
          : [];
      for (let i = 0; i < tetherNodes.length; i++) {
        const o = nearby[i],
          path = tetherNodes[i];
        if (!o || (scene.mobile && i >= 3)) {
          if (path.style.display !== 'none') path.style.display = 'none';
          continue;
        }
        const distance = Math.hypot(o.x - scene.pointer.x, o.y - scene.pointer.y);
        const radius = scene.mobile ? AMBIENT.mobilePointerRadius : AMBIENT.pointerRadius;
        path.style.display = '';
        path.setAttribute(
          'd',
          `M${scene.pointer.x} ${scene.pointer.y} Q${(scene.pointer.x + o.x) / 2} ${o.y + Math.sin(scene.clock + i) * 16} ${o.x} ${o.y}`,
        );
        path.setAttribute(
          'opacity',
          (0.32 * scene.pointer.strength * (1 - distance / radius) ** 2).toFixed(3),
        );
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
        const radius = waveRadius(burst.age, scene.mobile);
        const alpha = Math.sin(Math.PI * progress) * (1 - progress) * burst.power;
        wave.group.setAttribute(
          'transform',
          `translate(${burst.x} ${burst.worldY - scene.scroll})`,
        );
        wave.group.setAttribute('opacity', (alpha * 1.05).toFixed(3));
        wave.rings.forEach((ring, n) =>
          ring.setAttribute('r', Math.max(0, radius - Math.max(0, n - 1) * 20).toFixed(2)),
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
      for (let i = 0; i < relayNodes.length; i++) {
        const node = relayNodes[i],
          r = scene.relays[i];
        if (!r) {
          if (node.group.style.display !== 'none') node.group.style.display = 'none';
          continue;
        }
        node.group.style.display = '';
        const progress = r.age / AMBIENT.relayLife;
        node.group.setAttribute('transform', `translate(${r.x} ${r.worldY - scene.scroll})`);
        node.group.setAttribute(
          'opacity',
          (Math.sin(Math.PI * progress) * (1 - progress) * r.power * 0.65).toFixed(3),
        );
        node.ring.setAttribute('r', relayRadius(r.age, scene.mobile).toFixed(2));
        const dx = r.fromX - r.x,
          dy = r.fromWorldY - r.worldY;
        node.link.setAttribute(
          'd',
          `M${dx} ${dy} Q${dx * 0.5 - dy * 0.12} ${dy * 0.5 + dx * 0.12} 0 0`,
        );
      }
      if (previousRelays !== scene.relays.length) {
        svg.dataset.relays = String(scene.relays.length);
        previousRelays = scene.relays.length;
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
      if (disposed) return;
      loop.setActive(canAnimate());
      svg.dataset.sceneState = scene.reduced ? 'reduced' : canAnimate() ? 'running' : 'paused';
    };
    const invalidate = () => {
      if (disposed) return;
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
    const ignored = (target: EventTarget | null) =>
      target instanceof Element && !!target.closest(controls);
    const move = (event: PointerEvent) => {
      if (
        gesture &&
        Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > AMBIENT.tap.distance
      )
        gesture = null;
      if (event.pointerType === 'touch' || !event.isPrimary || !canAnimate()) return;
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
      // A scroll event can precede its next animation frame; never use stale document coordinates.
      if (dirty) refreshGeometry();
      if (scene.tap(event.clientX, event.clientY))
        svg.dataset.interactions = String(++interactions);
    };
    const scroll = () => {
      gesture = null;
      if (scene.pointer.active && canAnimate()) scene.movePointer(scene.pointer.x, scene.pointer.y);
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
    const passive = { passive: true, capture: true } as const;
    let disconnectInput: (() => void) | undefined;
    let mode = '';
    const configure = (enabled: boolean, reduce: boolean) => {
      if (disposed || mode === `${enabled}:${reduce}`) return;
      mode = `${enabled}:${reduce}`;
      disconnectInput?.();
      disconnectInput = undefined;
      gesture = null;
      scene.clearEffects();
      scene.setInteractive(enabled && !reduce);
      scene.setReduced(reduce);
      svg.dataset.pointerEffects = scene.interactive ? 'on' : 'off';
      if (scene.interactive) {
        window.addEventListener('pointermove', move, passive);
        window.addEventListener('pointerdown', down, passive);
        window.addEventListener('pointerup', up, passive);
        document.documentElement.addEventListener('pointerleave', leave, { passive: true });
        window.addEventListener('pointercancel', leave, passive);
        disconnectInput = () => {
          window.removeEventListener('pointermove', move, true);
          window.removeEventListener('pointerdown', down, true);
          window.removeEventListener('pointerup', up, true);
          document.documentElement.removeEventListener('pointerleave', leave);
          window.removeEventListener('pointercancel', leave, true);
        };
      }
      dirty = true;
      syncActivity();
      paint();
    };
    configureRef.current = configure;
    configure(interactive, reduced);
    svg.dataset.ready = 'true';
    const sizes = new ResizeObserver(invalidate);
    sizes.observe(document.body);
    const viewport = new IntersectionObserver((entries) => {
      if (disposed) return;
      inView = entries.some((entry) => entry.isIntersecting);
      if (!inView) scene.clearEffects();
      syncActivity();
    });
    viewport.observe(svg);
    window.addEventListener('scroll', scroll, passive);
    window.addEventListener('resize', invalidate, passive);
    document.addEventListener('visibilitychange', visibility);
    document.fonts.ready.then(() => {
      if (!disposed) invalidate();
    });
    return () => {
      disposed = true;
      scene.clearEffects();
      loop.dispose();
      if (layoutFrame !== null) cancelAnimationFrame(layoutFrame);
      sizes.disconnect();
      viewport.disconnect();
      configureRef.current = null;
      disconnectInput?.();
      window.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', invalidate, true);
      document.removeEventListener('visibilitychange', visibility);
    };
    // Prop changes configure the existing scene in the following effect.
  }, [pathname, id]);

  useEffect(() => {
    configureRef.current?.(interactive, reduced);
  }, [interactive, reduced]);

  return (
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
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="currentColor" stopOpacity=".14" />
          <stop offset=".35" stopColor="currentColor" stopOpacity=".06" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="ambient-field">
        {slots.map((i) => (
          <g key={i} data-object="" style={{ display: 'none' }}>
            <use href={`#${id}-shape-0`} />
          </g>
        ))}
      </g>
      <g className="ambient-response">
        <g data-pointer-field="" opacity="0">
          <circle r="175" fill={`url(#${id}-glow)`} stroke="none" />
          <g data-pointer-orbit="" opacity=".28">
            <circle r="31" strokeDasharray="12 86" />
            <circle r="57" strokeDasharray="2 44" />
          </g>
          <circle r="2" opacity=".5" fill="currentColor" stroke="none" />
        </g>
        {Array.from({ length: AMBIENT.maxTrail - 1 }, (_, i) => (
          <path
            key={`trail-${i}`}
            data-trail=""
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ display: 'none' }}
          />
        ))}
        {Array.from({ length: AMBIENT.connections }, (_, i) => (
          <path key={`tether-${i}`} data-tether="" strokeWidth=".8" style={{ display: 'none' }} />
        ))}
        {slots.map((i) => (
          <g
            key={`response-${i}`}
            data-response-object=""
            strokeWidth="1.15"
            style={{ display: 'none' }}
          >
            <use href={`#${id}-shape-0`} />
          </g>
        ))}
        {Array.from({ length: AMBIENT.maxRelays }, (_, i) => (
          <g key={`relay-${i}`} data-relay="" style={{ display: 'none' }} strokeWidth=".9">
            <path strokeLinecap="round" />
            <circle r="0" strokeDasharray="3 9" />
          </g>
        ))}
        <g className="ambient-waves" strokeWidth="1">
          {burstSlots.map((i) => (
            <g key={i} data-wave="" style={{ display: 'none' }}>
              <circle r="0" strokeWidth="10" opacity=".1" />
              <circle r="0" strokeWidth="1.5" />
              <circle r="0" strokeDasharray="2 10" opacity=".6" />
              {sparks.map((n) => (
                <use key={n} href={`#${id}-shape-${n % 2 ? 2 : 5}`} />
              ))}
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
