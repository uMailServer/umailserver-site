/** Deterministic, viewport-bounded geometry. This decoration represents no live traffic. */
export const AMBIENT = {
  mobileBreakpoint: 700,
  maxObjects: 144,
  maxBursts: 5,
  mobileBursts: 3,
  burstLife: 1.9,
  sparks: 8,
  pointerRadius: 210,
  pointerDisplacement: 26,
  idleAfter: 3,
  tap: { distance: 8, scroll: 4, duration: 500 },
} as const;
export type ScenePointerSample = { x: number; y: number; time: number; id: number; scroll: number };
export function isSceneTap(start: ScenePointerSample, end: ScenePointerSample) {
  const elapsed = end.time - start.time;
  return (
    start.id === end.id &&
    Number.isFinite(end.x + end.y + elapsed + end.scroll) &&
    elapsed >= 0 &&
    elapsed <= AMBIENT.tap.duration &&
    Math.hypot(end.x - start.x, end.y - start.y) <= AMBIENT.tap.distance &&
    Math.abs(end.scroll - start.scroll) <= AMBIENT.tap.scroll
  );
}
const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const ease = (n: number) => {
  const t = Math.min(1, Math.max(0, n));
  return t * t * (3 - 2 * t);
};
export type AmbientObject = {
  key: string;
  seed: number;
  baseX: number;
  worldY: number;
  depth: number;
  parallax: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  size: number;
  kind: number;
  opacity: number;
  visible: boolean;
};
export type AmbientBurst = { x: number; worldY: number; age: number; seed: number; power: number };
export class AmbientScene {
  width = 1;
  height = 1;
  scroll = 0;
  clock = 0;
  mobile = false;
  reduced = false;
  objects: AmbientObject[] = [];
  bursts: AmbientBurst[] = [];
  pointer = { x: 0, y: 0, active: false, strength: 0 };
  private lastInteraction = -10;
  private bandKey = '';

  viewport(width: number, height: number, scroll: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.scroll = Math.max(0, scroll);
    this.mobile = width < AMBIENT.mobileBreakpoint;
    const columns = this.mobile ? 2 : Math.min(6, Math.max(3, Math.ceil(width / 460)));
    const layers = this.mobile ? 2 : 3;
    const spacing = Math.max(this.mobile ? 460 : 420, height / 5);
    const rows = Math.ceil(height / spacing) + 3;
    const first = Array.from(
      { length: layers },
      (_, layer) =>
        Math.floor((this.scroll * (this.reduced ? 1 : 1 - (layer + 1) * 0.045)) / spacing) - 1,
    );
    const key = [width, height, ...first].join(':');
    if (key !== this.bandKey) {
      this.bandKey = key;
      const previous = new Map(this.objects.map((o) => [o.key, o]));
      const next: AmbientObject[] = [];
      for (let layer = 0; layer < layers; layer++) {
        for (let row = first[layer]; row < first[layer] + rows; row++) {
          for (let column = 0; column < columns; column++) {
            const id = `${layer}:${row}:${column}`;
            const seed = row * 137 + column * 31 + layer * 983;
            const depth = 0.25 + layer * 0.3;
            const o = previous.get(id) ?? {
              key: id,
              seed,
              x: 0,
              y: 0,
              offsetX: 0,
              offsetY: 0,
              rotation: 0,
              baseX: 0,
              worldY: 0,
              depth,
              parallax: 1 - (layer + 1) * 0.045,
              size: 0.65 + hash(seed + 8) * 1.2 + depth * 0.35,
              kind: Math.floor(hash(seed + 11) * 7),
              opacity: 0,
              visible: false,
            };
            o.baseX = ((column + 0.15 + hash(seed) * 0.7) / columns) * width;
            o.worldY = (row + 0.15 + hash(seed + 2) * 0.7) * spacing;
            next.push(o);
          }
        }
      }
      this.objects = next.slice(0, AMBIENT.maxObjects);
    }
    this.position(0);
  }
  setReduced(value: boolean) {
    this.reduced = value;
    if (value) {
      this.clearEffects();
      for (const o of this.objects) {
        o.offsetX = 0;
        o.offsetY = 0;
      }
      this.position(0);
    }
  }
  clearEffects() {
    this.bursts = [];
    this.pointer.active = false;
    this.pointer.strength = 0;
  }
  movePointer(x: number, y: number) {
    if (this.reduced || !Number.isFinite(x + y)) return;
    Object.assign(this.pointer, { x, y, active: true });
    this.lastInteraction = this.clock;
  }
  leavePointer() {
    this.pointer.active = false;
  }
  tap(x: number, y: number) {
    if (
      this.reduced ||
      !Number.isFinite(x + y) ||
      x < 0 ||
      y < 0 ||
      x > this.width ||
      y > this.height
    )
      return false;
    const worldY = y + this.scroll;
    const nearby = this.bursts.find(
      (b) => b.age < 0.22 && Math.hypot(b.x - x, b.worldY - worldY) < 45,
    );
    if (nearby) nearby.power = Math.min(1.35, nearby.power + 0.08);
    else if (this.bursts.length < (this.mobile ? AMBIENT.mobileBursts : AMBIENT.maxBursts))
      this.bursts.push({ x, worldY, age: 0, seed: hash(x + worldY + this.clock), power: 1 });
    this.lastInteraction = this.clock;
    return true;
  }
  get active() {
    return this.clock - this.lastInteraction < AMBIENT.idleAfter;
  }
  get fps() {
    return this.mobile ? (this.active ? 30 : 18) : this.active ? 45 : 24;
  }
  advance(seconds: number) {
    if (this.reduced || !Number.isFinite(seconds)) return;
    const dt = Math.max(0, Math.min(0.08, seconds));
    this.clock += dt;
    const smoothing = 1 - Math.exp(-dt * 7);
    this.pointer.strength +=
      ((this.pointer.active && this.active ? 1 : 0) - this.pointer.strength) * smoothing;
    for (const burst of this.bursts) burst.age += dt;
    this.bursts = this.bursts.filter(
      (b) =>
        b.age < AMBIENT.burstLife &&
        b.worldY - this.scroll > -240 &&
        b.worldY - this.scroll < this.height + 240,
    );
    this.position(smoothing);
  }
  private position(smoothing: number) {
    for (const o of this.objects) {
      const baseY = o.worldY - this.scroll * (this.reduced ? 1 : o.parallax);
      o.visible = baseY > -90 && baseY < this.height + 90;
      if (!o.visible) continue; // No motion work or SVG mutations for offscreen objects.
      const phase = o.seed * 0.7;
      const t = this.reduced ? 0 : this.clock;
      const x = o.baseX + Math.sin(t * (0.07 + o.depth * 0.04) + phase) * (12 + o.depth * 15);
      const y = baseY + Math.cos(t * (0.09 + o.depth * 0.05) + phase) * (10 + o.depth * 16);
      const dx = x - this.pointer.x,
        dy = y - this.pointer.y;
      const distance = Math.hypot(dx, dy);
      const influence =
        ease(1 - distance / AMBIENT.pointerRadius) * this.pointer.strength * o.depth;
      // Alternate attraction and repulsion; the support is strictly local.
      const direction = o.kind % 2 ? -1 : 1;
      let tx = (dx / Math.max(distance, 1)) * influence * AMBIENT.pointerDisplacement * direction;
      let ty = (dy / Math.max(distance, 1)) * influence * AMBIENT.pointerDisplacement * direction;
      for (const b of this.bursts) {
        const bx = x - b.x,
          by = y - (b.worldY - this.scroll),
          d = Math.hypot(bx, by);
        if (d > 240) continue;
        const progress = b.age / AMBIENT.burstLife;
        const force =
          Math.exp(-(((d - 210 * progress) / 30) ** 2)) * Math.sin(progress * Math.PI) * 10;
        tx += (bx / Math.max(1, d)) * force;
        ty += (by / Math.max(1, d)) * force;
      }
      o.offsetX += (tx - o.offsetX) * smoothing;
      o.offsetY += (ty - o.offsetY) * smoothing;
      o.x = x + o.offsetX;
      o.y = y + o.offsetY;
      o.rotation = Math.sin(t * 0.045 + phase) * (o.kind === 5 ? 6 : 24);
      const edge = ease(Math.min(o.y + 40, this.height + 40 - o.y) / 100);
      o.opacity = edge * (0.16 + o.depth * 0.21 + influence * 0.2);
    }
  }
}

/** One cancellable RAF chain; resuming deliberately starts with zero elapsed time. */
export class SceneLoop {
  private active = false;
  private disposed = false;
  private frame: number | null = null;
  private previous: number | null = null;
  private readonly schedule: {
    request: (callback: FrameRequestCallback) => number;
    cancel: (id: number) => void;
    fps: () => number;
    paint: (seconds: number) => void;
  };
  constructor(schedule: SceneLoop['schedule']) {
    this.schedule = schedule;
  }

  setActive(active: boolean) {
    if (this.disposed || active === this.active) return;
    this.active = active;
    this.previous = null;
    if (this.frame !== null) {
      this.schedule.cancel(this.frame);
      this.frame = null;
    }
    if (active) this.frame = this.schedule.request(this.tick);
  }

  private tick = (timestamp: number) => {
    this.frame = null;
    if (!this.active || this.disposed) return;
    const elapsed = this.previous === null ? 0 : timestamp - this.previous;
    if (this.previous === null || elapsed >= 1000 / this.schedule.fps() - 0.5) {
      this.schedule.paint(this.previous === null ? 0 : Math.min(0.08, elapsed / 1000));
      this.previous = timestamp;
    }
    if (this.active) this.frame = this.schedule.request(this.tick);
  };

  dispose() {
    this.setActive(false);
    this.disposed = true;
  }
}
