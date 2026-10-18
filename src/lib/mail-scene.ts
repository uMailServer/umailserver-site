/** The mail fabric is decorative: these packets do not represent live server activity. */
export const MAIL_SCENE = {
  mobileBreakpoint: 700,
  packets: { mobile: 24, desktop: 48, wide: 72 },
  routes: { mobile: 5, desktop: 8, wide: 11 },
  maxDpr: 1.75,
  maxPixels: 3_200_000,
  fps: { active: 60, idle: 24, mobileActive: 30, mobileIdle: 18 },
  idleAfter: 4,
  speed: { minimum: 0.009, variation: 0.014, drift: 9 },
  tap: { distance: 8, scroll: 4, duration: 500 },
  pointerRadius: 190,
  mobilePointerRadius: 125,
  pointerDisplacement: 23,
  pointerConnections: 6,
  maxBursts: 6,
  burstLife: 1.65,
  burstOpacity: 0.85,
  burstRadius: 250,
  mobileBurstRadius: 155,
  sparksPerBurst: 7,
  protectionFeather: 42,
  light: { ink: [13, 126, 145], accent: [37, 161, 174], opacity: 0.48 },
  dark: { ink: [77, 199, 210], accent: [132, 228, 218], opacity: 0.65 },
} as const;

export type SceneRect = { x: number; y: number; width: number; height: number; weight: number };
export type ScenePointerSample = { x: number; y: number; time: number; id: number; scroll: number };
export function isSceneTap(start: ScenePointerSample, end: ScenePointerSample) {
  const elapsed = end.time - start.time;
  return (
    start.id === end.id &&
    Number.isFinite(end.x + end.y + elapsed + end.scroll) &&
    elapsed >= 0 &&
    elapsed <= MAIL_SCENE.tap.duration &&
    Math.hypot(end.x - start.x, end.y - start.y) <= MAIL_SCENE.tap.distance &&
    Math.abs(end.scroll - start.scroll) <= MAIL_SCENE.tap.scroll
  );
}
type Point = { x: number; y: number };
type Route = { a: Point; b: Point; c: Point; d: Point; reverse: boolean };
type Packet = Point & {
  origin: number;
  route: number;
  speed: number;
  depth: number;
  size: number;
  offsetX: number;
  offsetY: number;
  angle: number;
  envelope: boolean;
};
type Burst = Point & { age: number; variant: number; power: number; seed: number };
export type SceneColors = { ink: readonly number[]; accent: readonly number[]; opacity: number };

const clamp = (value: number, low = 0, high = 1) => Math.min(high, Math.max(low, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;
const hash = (seed: number) => {
  const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
};

export function backingScale(width: number, height: number, deviceRatio: number) {
  return Math.min(
    Math.max(1, deviceRatio),
    MAIL_SCENE.maxDpr,
    Math.sqrt(MAIL_SCENE.maxPixels / Math.max(1, width * height)),
  );
}

function along(route: Route, progress: number): Point {
  const t = route.reverse ? 1 - progress : progress;
  const u = 1 - t;
  return {
    x:
      u ** 3 * route.a.x +
      3 * u * u * t * route.b.x +
      3 * u * t * t * route.c.x +
      t ** 3 * route.d.x,
    y:
      u ** 3 * route.a.y +
      3 * u * u * t * route.b.y +
      3 * u * t * t * route.c.y +
      t ** 3 * route.d.y,
  };
}

export class MailScene {
  width = 1;
  height = 1;
  mobile = false;
  clock = 0;
  reduced = false;
  packets: Packet[] = [];
  bursts: Burst[] = [];
  routes: Route[] = [];
  protectedAreas: SceneRect[] = [];
  pointer = { x: 0, y: 0, active: false, strength: 0 };
  colors: SceneColors = { ...MAIL_SCENE.light };
  private targetColors: SceneColors = MAIL_SCENE.light;
  private lastInteraction = -10;
  private clickIndex = 0;
  private warmth = 0;
  private energy = 0.35;

  resize(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.mobile = width < MAIL_SCENE.mobileBreakpoint;
    const wide = width >= 1920;
    const count = this.mobile
      ? MAIL_SCENE.routes.mobile
      : wide
        ? MAIL_SCENE.routes.wide
        : MAIL_SCENE.routes.desktop;
    this.routes = Array.from({ length: count }, (_, i) => {
      const y = ((i + 0.5) / count) * height;
      const bend = (i % 2 === 0 ? 1 : -1) * height * 0.13;
      return {
        a: { x: -width * 0.08, y },
        b: { x: width * 0.3, y: y + bend },
        c: { x: width * 0.7, y: y - bend },
        d: { x: width * 1.08, y: y + bend * 0.2 },
        reverse: i % 3 === 1,
      };
    });
    const packetCount = this.mobile
      ? MAIL_SCENE.packets.mobile
      : wide
        ? MAIL_SCENE.packets.wide
        : MAIL_SCENE.packets.desktop;
    this.packets = Array.from({ length: packetCount }, (_, i) => ({
      x: 0,
      y: 0,
      origin: hash(i + 1),
      route: i % count,
      speed: MAIL_SCENE.speed.minimum + hash(i + 31) * MAIL_SCENE.speed.variation,
      depth: 0.3 + hash(i + 71) * 0.7,
      size: 5 + hash(i + 101) * 9,
      offsetX: 0,
      offsetY: 0,
      angle: 0,
      envelope: i % 4 !== 0,
    }));
    this.bursts = [];
    this.pointer.active = false;
    this.pointer.strength = 0;
    this.positionPackets(0);
  }

  setTheme(dark: boolean, immediate = false) {
    this.targetColors = dark ? MAIL_SCENE.dark : MAIL_SCENE.light;
    if (immediate || this.reduced || this.clock === 0) this.colors = { ...this.targetColors };
  }

  setReduced(reduced: boolean) {
    this.reduced = reduced;
    if (reduced) {
      this.bursts = [];
      this.pointer.active = false;
      this.pointer.strength = 0;
      this.colors = { ...this.targetColors };
      this.packets.forEach((packet) => {
        packet.offsetX = 0;
        packet.offsetY = 0;
      });
      this.positionPackets(0);
    }
  }

  movePointer(x: number, y: number) {
    if (this.reduced || !Number.isFinite(x + y)) return;
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.active = true;
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
    this.lastInteraction = this.clock;
    // Fast clicks add energy to an existing signal instead of allocating more effects.
    const nearby = this.bursts.find((b) => b.age < 0.22 && Math.hypot(b.x - x, b.y - y) < 45);
    if (nearby) nearby.power = Math.min(1.4, nearby.power + 0.12);
    else if (this.bursts.length < MAIL_SCENE.maxBursts) {
      this.bursts.push({
        x,
        y,
        age: 0,
        power: 1,
        variant: (this.clickIndex++ + Math.floor(x / 220) + Math.floor(y / 160)) % 3,
        seed: hash(x + y),
      });
    } else {
      const closest = this.bursts.reduce((a, b) =>
        Math.hypot(a.x - x, a.y - y) < Math.hypot(b.x - x, b.y - y) ? a : b,
      );
      closest.power = Math.min(1.4, closest.power + 0.08);
    }
    return true;
  }

  get active() {
    return !this.reduced && this.clock - this.lastInteraction < MAIL_SCENE.idleAfter;
  }
  get fps() {
    return this.mobile
      ? this.active
        ? MAIL_SCENE.fps.mobileActive
        : MAIL_SCENE.fps.mobileIdle
      : this.active
        ? MAIL_SCENE.fps.active
        : MAIL_SCENE.fps.idle;
  }

  advance(seconds: number) {
    if (this.reduced || !Number.isFinite(seconds)) return;
    const dt = clamp(seconds, 0, 0.08);
    this.clock += dt;
    this.warmth = Math.min(1, this.warmth + dt / 0.9);
    const ease = 1 - Math.exp(-dt * 8);
    this.energy = mix(this.energy, this.active ? 1 : 0.35, ease * 0.5);
    this.pointer.strength = mix(
      this.pointer.strength,
      this.pointer.active && this.active ? 1 : 0,
      ease,
    );
    this.colors = {
      ink: this.colors.ink.map((n, i) => mix(n, this.targetColors.ink[i], ease)),
      accent: this.colors.accent.map((n, i) => mix(n, this.targetColors.accent[i], ease)),
      opacity: mix(this.colors.opacity, this.targetColors.opacity, ease),
    };
    this.bursts.forEach((b) => {
      b.age += dt;
    });
    this.bursts = this.bursts.filter((b) => b.age < MAIL_SCENE.burstLife);
    this.positionPackets(ease);
  }

  private positionPackets(ease: number) {
    const radius = this.mobile ? MAIL_SCENE.mobilePointerRadius : MAIL_SCENE.pointerRadius;
    for (const packet of this.packets) {
      const progress = (packet.origin + this.clock * packet.speed) % 1;
      const point = along(this.routes[packet.route], progress);
      const drift =
        Math.sin(this.clock * 0.38 + packet.origin * 12) * packet.depth * MAIL_SCENE.speed.drift;
      const dx = point.x - this.pointer.x;
      const dy = point.y + drift - this.pointer.y;
      const distance = Math.hypot(dx, dy);
      const influence = smooth(1 - distance / radius) * this.pointer.strength * packet.depth;
      let targetX = (dx / Math.max(1, distance)) * influence * MAIL_SCENE.pointerDisplacement;
      let targetY = (dy / Math.max(1, distance)) * influence * MAIL_SCENE.pointerDisplacement;
      for (const burst of this.bursts) {
        const bx = point.x - burst.x,
          by = point.y - burst.y;
        const d = Math.hypot(bx, by);
        const waveRadius = this.burstRadius * (burst.age / MAIL_SCENE.burstLife);
        const force =
          Math.exp(-(((d - waveRadius) / 38) ** 2)) *
          Math.sin((Math.PI * burst.age) / MAIL_SCENE.burstLife) *
          14 *
          burst.power;
        targetX += (bx / Math.max(1, d)) * force;
        targetY += (by / Math.max(1, d)) * force;
      }
      packet.offsetX = mix(packet.offsetX, targetX, ease);
      packet.offsetY = mix(packet.offsetY, targetY, ease);
      packet.x = point.x + packet.offsetX;
      packet.y = point.y + drift + packet.offsetY;
      packet.angle = Math.sin(this.clock * 0.22 + packet.origin * 9) * 0.22 * packet.depth;
    }
  }

  get burstRadius() {
    return this.mobile ? MAIL_SCENE.mobileBurstRadius : MAIL_SCENE.burstRadius;
  }

  private edgeOpacity(x: number, y: number) {
    return smooth(Math.min(x, this.width - x) / 65) * smooth(Math.min(y, this.height - y) / 60);
  }

  private contentOpacity(x: number, y: number) {
    let opacity = 1;
    for (const rect of this.protectedAreas) {
      const dx = Math.max(rect.x - x, 0, x - rect.x - rect.width);
      const dy = Math.max(rect.y - y, 0, y - rect.y - rect.height);
      opacity = Math.min(
        opacity,
        mix(rect.weight, 1, smooth(Math.hypot(dx, dy) / MAIL_SCENE.protectionFeather)),
      );
    }
    return opacity;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    const entrance = this.reduced ? 0.55 : smooth(this.warmth) * (0.65 + this.energy * 0.35);
    if (entrance === 0) return;
    const ink = `rgb(${this.colors.ink.map(Math.round).join(',')})`;
    const accent = `rgb(${this.colors.accent.map(Math.round).join(',')})`;
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = this.colors.opacity * 0.18 * entrance;
    // Curved delivery lanes keep this a mail network rather than a generic dot field.
    for (const route of this.routes) {
      ctx.beginPath();
      ctx.moveTo(route.a.x, route.a.y);
      ctx.bezierCurveTo(route.b.x, route.b.y, route.c.x, route.c.y, route.d.x, route.d.y);
      ctx.stroke();
    }
    let connections = 0;
    const pointerRadius = this.mobile ? MAIL_SCENE.mobilePointerRadius : MAIL_SCENE.pointerRadius;
    for (const packet of this.packets) {
      const opacity =
        this.edgeOpacity(packet.x, packet.y) * this.contentOpacity(packet.x, packet.y) * entrance;
      if (opacity < 0.01) continue;
      const distance = Math.hypot(packet.x - this.pointer.x, packet.y - this.pointer.y);
      const nearby = smooth(1 - distance / pointerRadius) * this.pointer.strength;
      if (nearby > 0.05 && connections++ < MAIL_SCENE.pointerConnections) {
        ctx.globalAlpha = opacity * nearby * 0.3;
        ctx.beginPath();
        ctx.moveTo(this.pointer.x, this.pointer.y);
        ctx.quadraticCurveTo((packet.x + this.pointer.x) / 2, packet.y, packet.x, packet.y);
        ctx.stroke();
      }
      ctx.globalAlpha = opacity * this.colors.opacity * (0.25 + packet.depth * 0.45 + nearby * 0.4);
      ctx.save();
      ctx.translate(packet.x, packet.y);
      ctx.rotate(packet.angle);
      ctx.lineWidth = 0.9 + packet.depth * 0.35;
      if (packet.envelope) this.envelope(ctx, packet.size);
      else {
        ctx.beginPath();
        ctx.rect(-2.2, -2.2, 4.4, 4.4);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.strokeStyle = accent;
    for (const burst of this.bursts) this.drawBurst(ctx, burst, entrance);
    ctx.globalAlpha = 1;
  }

  private envelope(ctx: CanvasRenderingContext2D, size: number) {
    const half = size / 2,
      height = size * 0.34;
    ctx.beginPath();
    ctx.roundRect(-half, -height, size, height * 2, 1.5);
    ctx.moveTo(-half, -height);
    ctx.lineTo(0, height * 0.2);
    ctx.lineTo(half, -height);
    ctx.moveTo(-half, height);
    ctx.lineTo(-size * 0.16, 0);
    ctx.moveTo(half, height);
    ctx.lineTo(size * 0.16, 0);
    ctx.stroke();
  }

  private drawBurst(ctx: CanvasRenderingContext2D, burst: Burst, entrance: number) {
    const progress = burst.age / MAIL_SCENE.burstLife;
    const radius = 12 + this.burstRadius * (1 - (1 - progress) ** 2);
    const alpha = Math.sin(Math.PI * progress) * (1 - progress) * burst.power * entrance;
    ctx.lineWidth = 1.1 * (1 - progress) + 0.3;
    // Segmented fading avoids a hard cut when a pulse reaches a hero edge.
    for (let ring = 0; ring < (burst.variant === 0 ? 2 : 1); ring++) {
      const r = Math.max(0, radius - ring * 18);
      for (let segment = 0; segment < 36; segment++) {
        const angle = (segment / 36) * Math.PI * 2;
        const x = burst.x + Math.cos(angle) * r,
          y = burst.y + Math.sin(angle) * r;
        ctx.globalAlpha =
          alpha * this.edgeOpacity(x, y) * this.contentOpacity(x, y) * MAIL_SCENE.burstOpacity;
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, r, angle, angle + (Math.PI * 2) / 36 + 0.01);
        ctx.stroke();
      }
    }
    for (let i = 0; i < MAIL_SCENE.sparksPerBurst; i++) {
      const angle = (i / MAIL_SCENE.sparksPerBurst) * Math.PI * 2 + burst.seed * 2;
      const travel = radius * (0.3 + hash(i + burst.seed) * 0.32);
      const x = burst.x + Math.cos(angle) * travel,
        y = burst.y + Math.sin(angle) * travel;
      ctx.globalAlpha = alpha * this.edgeOpacity(x, y) * this.contentOpacity(x, y) * 0.75;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle * 0.2);
      if (burst.variant === 1 && i % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        ctx.lineTo(3, 0);
        ctx.moveTo(0, -3);
        ctx.lineTo(0, 3);
        ctx.stroke();
      } else this.envelope(ctx, 5 + hash(i + 20) * 4);
      ctx.restore();
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
