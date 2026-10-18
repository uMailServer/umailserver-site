import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AmbientScene, AMBIENT, SceneLoop, isSceneTap } from '../src/lib/ambient-scene.ts';
function sceneAt(width = 1440, height = 900, scroll = 0) {
  const s = new AmbientScene();
  s.viewport(width, height, scroll);
  return s;
}
function runFor(s, seconds, hz = 60) {
  for (let i = 0; i < seconds * hz; i++) s.advance(1 / hz);
}

test('unlimited scroll and 4K sizes retain a fixed DOM-sized population, with less mobile density', () => {
  const mobile = sceneAt(375, 900),
    desktop = sceneAt();
  assert(mobile.objects.length < desktop.objects.length);
  for (const width of [320, 375, 768, 1440, 3840, 7680]) {
    for (const height of [400, 900, 2160, 5000]) {
      const s = sceneAt(width, height);
      for (const scroll of [0, 421, 6000, 100000, 2000000]) {
        s.viewport(width, height, scroll);
        assert(s.objects.length <= AMBIENT.maxObjects);
        const visible = s.objects.filter((o) => o.visible);
        assert(visible.length > 0);
        assert(visible.every((o) => Number.isFinite(o.x + o.y + o.rotation)));
      }
    }
  }
});

test('scroll preserves world identities and produces different depth displacements without a section reset', () => {
  const s = sceneAt();
  s.advance(0.02);
  const before = new Map(s.objects.filter((o) => o.visible).map((o) => [o.key, { ...o }]));
  const time = s.clock;
  s.viewport(1440, 900, 20);
  const shared = s.objects.filter((o) => o.visible && before.has(o.key));
  assert(shared.length > 10);
  const shifts = new Set();
  for (const o of shared) {
    const old = before.get(o.key);
    assert(Math.abs(o.y - old.y + 20 * o.parallax) < 0.000001);
    shifts.add(Math.round((old.y - o.y) * 100));
  }
  assert(shifts.size === 3);
  assert.equal(s.clock, time);
});

test('a thousand rapid clicks remain bounded, local and short lived', () => {
  for (const width of [375, 1440]) {
    const s = sceneAt(width);
    for (let i = 0; i < 1000; i++) s.tap((i * 79) % width, (i * 31) % 900);
    assert.equal(s.bursts.length, width < 700 ? AMBIENT.mobileBursts : AMBIENT.maxBursts);
    assert(s.bursts.every((b) => b.power <= 1.35));
    runFor(s, 2.1);
    assert.equal(s.bursts.length, 0);
    assert.equal(s.tap(NaN, 10), false);
    assert.equal(s.tap(-1, 10), false);
    assert.equal(s.tap(10, 901), false);
  }
});

test('nearby taps merge without renewing age; scroll anchors signals and removes departed ones', () => {
  const s = sceneAt();
  s.tap(300, 300);
  for (let i = 0; i < 10; i++) {
    s.advance(0.01);
    s.tap(302, 301);
  }
  assert.equal(s.bursts.length, 1);
  assert(s.bursts[0].age > 0.09);
  s.viewport(1440, 900, 100);
  assert.equal(s.bursts[0].worldY - s.scroll, 200);
  s.viewport(1440, 900, 1000);
  s.advance(0.01);
  assert.equal(s.bursts.length, 0);
});

test('local pointer attraction/repulsion settles after inactivity even without a pointerleave', () => {
  const s = sceneAt();
  const o = s.objects.find((o) => o.visible && o.y > 200 && o.y < 600);
  s.movePointer(o.x - 20, o.y - 10);
  runFor(s, 0.5);
  assert(s.objects.some((o) => Math.hypot(o.offsetX, o.offsetY) > 0.1));
  const distant = s.objects.filter((o) => Math.hypot(o.x - s.pointer.x, o.y - s.pointer.y) > 350);
  assert(distant.length > 0);
  assert(distant.every((o) => Math.hypot(o.offsetX, o.offsetY) < 0.001));
  runFor(s, 7);
  assert(s.pointer.strength < 0.000001);
  assert(s.objects.every((o) => Math.hypot(o.offsetX, o.offsetY) < 0.00001));
});

test('reduced motion is static, ignores inputs, and stays distributed deep down a long document', () => {
  const s = sceneAt();
  s.tap(300, 300);
  s.setReduced(true);
  const before = s.objects.map(({ x, y }) => ({ x, y }));
  s.movePointer(500, 500);
  assert.equal(s.tap(500, 500), false);
  runFor(s, 10);
  assert.equal(s.clock, 0);
  assert.equal(s.bursts.length, 0);
  assert.deepEqual(
    s.objects.map(({ x, y }) => ({ x, y })),
    before,
  );
  for (const scroll of [10000, 500000]) {
    s.viewport(1440, 900, scroll);
    assert(s.objects.filter((o) => o.visible).length > 10);
  }
  s.setReduced(false);
  s.viewport(1440, 900, 0);
  runFor(s, 1);
  assert(s.clock > 0.9);
});

test('slow drift is refresh-rate independent and offscreen objects do not animate', () => {
  const a = sceneAt(),
    b = sceneAt();
  const hidden = a.objects
    .filter((o) => !o.visible)
    .map((o) => ({ key: o.key, x: o.x, y: o.y, rotation: o.rotation }));
  runFor(a, 12, 60);
  runFor(b, 12, 120);
  a.objects.forEach((o, i) => {
    assert(Math.abs(o.x - b.objects[i].x) < 0.000001);
    assert(Math.abs(o.y - b.objects[i].y) < 0.000001);
  });
  hidden.forEach((old) => {
    const o = a.objects.find((o) => o.key === old.key);
    assert.equal(o.x, old.x);
    assert.equal(o.y, old.y);
    assert.equal(o.rotation, old.rotation);
  });
});

test('the RAF loop stops completely, resumes without catch-up, and disposes once', () => {
  let nextId = 1;
  const pending = new Map();
  const paints = [];
  const loop = new SceneLoop({
    request: (callback) => {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    },
    cancel: (id) => pending.delete(id),
    fps: () => 60,
    paint: (seconds) => paints.push(seconds),
  });
  function tick(at) {
    const callbacks = [...pending.values()];
    pending.clear();
    callbacks.forEach((cb) => cb(at));
  }
  loop.setActive(true);
  loop.setActive(true);
  assert.equal(pending.size, 1);
  tick(1000);
  tick(1017);
  assert.deepEqual(paints, [0, 0.017]);
  loop.setActive(false);
  assert.equal(pending.size, 0);
  tick(100000);
  assert.equal(paints.length, 2);
  loop.setActive(true);
  tick(200000);
  tick(200017);
  assert.deepEqual(paints, [0, 0.017, 0, 0.017]);
  loop.dispose();
  loop.dispose();
  loop.setActive(true);
  assert.equal(pending.size, 0);
});

test('a touch tap is accepted but scrolling, dragging, long press and another finger are ignored', () => {
  const start = { x: 100, y: 200, time: 0, id: 3, scroll: 0 };
  const tap = { ...start, x: 102, y: 202, time: 110 };
  assert.equal(isSceneTap(start, tap), true);
  assert.equal(isSceneTap(start, { ...tap, scroll: 30 }), false);
  assert.equal(isSceneTap(start, { ...tap, y: 230 }), false);
  assert.equal(isSceneTap(start, { ...tap, time: 900 }), false);
  assert.equal(isSceneTap(start, { ...tap, id: 4 }), false);
});

test('nearby objects visibly travel at least 24px under sustained pointer attraction or repulsion', () => {
  const s = sceneAt();
  const o = s.objects.find(
    (o) => o.visible && o.depth > 0.7 && o.x > 120 && o.x < 1200 && o.y > 160 && o.y < 650,
  );
  assert(o);
  s.movePointer(o.x - 60, o.y - 30);
  runFor(s, 0.6);
  assert(
    Math.hypot(o.offsetX, o.offsetY) > 24,
    `near object moved only ${Math.hypot(o.offsetX, o.offsetY).toFixed(2)}px`,
  );
  assert(
    s.objects
      .filter((p) => Math.hypot(p.x - s.pointer.x, p.y - s.pointer.y) > 450)
      .every((p) => Math.hypot(p.offsetX, p.offsetY) < 0.001),
  );
});

test('a click wave produces a brief visible displacement of nearby geometry', () => {
  const s = sceneAt();
  const o = s.objects.find(
    (o) => o.visible && o.depth > 0.7 && o.x > 160 && o.x < 1200 && o.y > 160 && o.y < 650,
  );
  assert(o);
  s.tap(o.x - 110, o.y);
  let peak = 0;
  for (let i = 0; i < 60; i++) {
    s.advance(1 / 60);
    peak = Math.max(peak, Math.hypot(o.offsetX, o.offsetY));
  }
  assert(peak > 24, `wave displacement peaked at only ${peak.toFixed(2)}px`);
  runFor(s, 5);
  assert.equal(s.bursts.length, 0);
  assert(Math.hypot(o.offsetX, o.offsetY) < 0.001);
});

test('pointer trails stay bounded, expire quickly and disappear in reduced motion', () => {
  const s = sceneAt();
  for (let i = 0; i < 2000; i++) s.movePointer(i % 1400, i % 850);
  assert.equal(s.trail.length, AMBIENT.maxTrail);
  assert(s.trail.every((p) => p.age === 0));
  runFor(s, 1);
  assert.equal(s.trail.length, 0);
  s.movePointer(200, 200);
  s.movePointer(240, 220);
  s.setReduced(true);
  assert.equal(s.trail.length, 0);
  assert.equal(s.pointer.strength, 0);
  assert(s.objects.every((o) => o.reaction === 0));
});

test('scroll keeps the pointer in client space and anchors a fresh click to the new document position', () => {
  const s = sceneAt();
  s.movePointer(480, 350);
  runFor(s, 0.3);
  s.viewport(1440, 900, 2500);
  assert.equal(s.pointer.x, 480);
  assert.equal(s.pointer.y, 350);
  assert(s.pointer.active);
  assert(s.pointer.strength > 0.5);
  s.tap(480, 350);
  assert.equal(s.bursts[0].worldY, 2850);
  s.viewport(1440, 900, 2540);
  assert.equal(s.pointer.y, 350);
  assert.equal(s.bursts[0].worldY - s.scroll, 310);
});

test('overlapping impulses never launch geometry beyond the displacement budget', () => {
  const s = sceneAt();
  for (let i = 0; i < 1000; i++) {
    s.tap(500 + (i % 4) * 50, 300 + (i % 3) * 50);
    s.movePointer(500, 350);
    s.advance(1 / 120);
    assert(s.bursts.length <= AMBIENT.maxBursts);
    assert(
      s.objects.every((o) => Math.hypot(o.offsetX, o.offsetY) <= AMBIENT.maxDisplacement + 0.0001),
    );
  }
  s.clearEffects();
  runFor(s, 4);
  assert(s.objects.every((o) => o.reaction < 0.0001));
});

test('a nearby object sweeps around the pointer rather than only moving radially', () => {
  const s = sceneAt();
  const o = s.objects.find(
    (o) =>
      o.visible &&
      o.depth > 0.7 &&
      o.kind % 2 === 0 &&
      o.x > 150 &&
      o.x < 1100 &&
      o.y > 150 &&
      o.y < 650,
  );
  assert(o);
  const px = o.x - 80,
    py = o.y;
  const angles = [];
  for (let i = 0; i < 150; i++) {
    s.movePointer(px, py);
    s.advance(1 / 60);
    angles.push(Math.atan2(o.y - py, o.x - px));
  }
  const sweep = Math.max(...angles) - Math.min(...angles);
  assert(sweep > 0.5, `angular sweep was only ${sweep.toFixed(3)} radians`);
});

function relayFixture(withNeighbours = true) {
  const s = sceneAt();
  const original = s.objects.find((o) => o.visible && o.depth > 0.7);
  const positions = withNeighbours ? [240, 380, 520, 660] : [520];
  s.objects = positions.map((x, i) => ({
    ...original,
    key: `fixture-${i}`,
    seed: 0,
    baseX: x,
    worldY: 380,
    x,
    y: 400,
    offsetX: 0,
    offsetY: 0,
  }));
  s.tap(100, 400);
  return s;
}
test('a click reaches distant geometry through neighbours, but not across an empty gap', () => {
  const linked = relayFixture(),
    isolated = relayFixture(false);
  let linkedPeak = 0,
    isolatedPeak = 0;
  for (let i = 0; i < 180; i++) {
    linked.advance(1 / 60);
    isolated.advance(1 / 60);
    linkedPeak = Math.max(
      linkedPeak,
      Math.hypot(linked.objects[2].offsetX, linked.objects[2].offsetY),
    );
    isolatedPeak = Math.max(
      isolatedPeak,
      Math.hypot(isolated.objects[0].offsetX, isolated.objects[0].offsetY),
    );
  }
  assert(linkedPeak > 1, `chain displacement was only ${linkedPeak.toFixed(3)}px`);
  assert(isolatedPeak < 0.001);
});

test('cascades have bounded fanout, depth and lifetime on desktop and mobile', () => {
  for (const width of [375, 1440]) {
    const s = sceneAt(width);
    let sawRelay = false;
    for (let i = 0; i < 800; i++) {
      if (i < 250 && i % 5 === 0) s.tap((i * 37) % width, (i * 23) % 900);
      s.advance(1 / 120);
      sawRelay ||= s.relays.length > 0;
      assert(s.relays.length <= (s.mobile ? AMBIENT.mobileRelays : AMBIENT.maxRelays));
      for (const r of s.relays) {
        assert(r.hop <= AMBIENT.cascadeHops);
        assert(r.children <= 2);
        assert(
          r.cascade.visited.size <= (s.mobile ? AMBIENT.mobileCascadeNodes : AMBIENT.cascadeNodes),
        );
      }
    }
    assert(sawRelay);
    assert.equal(s.relays.length, 0);
  }
  const reduced = relayFixture();
  runFor(reduced, 0.5);
  assert(reduced.relays.length > 0);
  reduced.setReduced(true);
  assert.equal(reduced.relays.length, 0);
  runFor(reduced, 4);
  assert.equal(reduced.relays.length, 0);
});

test('clicking a shape directly starts its own relay without waiting for another neighbour', () => {
  const s = relayFixture();
  s.clearEffects();
  s.tap(240, 400);
  runFor(s, 0.25);
  assert(s.relays.some((r) => r.source === 'fixture-0'));
});
