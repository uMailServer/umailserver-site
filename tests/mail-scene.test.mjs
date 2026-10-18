import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MailScene,
  SceneLoop,
  MAIL_SCENE,
  backingScale,
  isSceneTap,
} from '../src/lib/mail-scene.ts';

function sceneAt(width = 1440, height = 720) {
  const scene = new MailScene();
  scene.resize(width, height);
  return scene;
}
function runFor(scene, seconds, hz = 60) {
  for (let i = 0; i < seconds * hz; i++) scene.advance(1 / hz);
}

test('a high-rate click stream stays bounded and every signal expires', () => {
  const scene = sceneAt();
  for (let i = 0; i < 1000; i++) scene.tap((i * 79) % 1440, (i * 31) % 720);
  assert.equal(scene.bursts.length, MAIL_SCENE.maxBursts);
  assert(scene.bursts.every((b) => b.power <= 1.4));
  runFor(scene, 2);
  assert.equal(scene.bursts.length, 0);
  assert.equal(scene.packets.length, MAIL_SCENE.packets.desktop);
});

test('quick nearby taps combine without extending an effect indefinitely', () => {
  const scene = sceneAt();
  scene.tap(300, 200);
  for (let i = 0; i < 10; i++) {
    scene.advance(0.01);
    scene.tap(302, 201);
  }
  assert.equal(scene.bursts.length, 1);
  runFor(scene, 2);
  assert.equal(scene.bursts.length, 0);
});

test('ordinary elapsed motion is independent of the display refresh rate', () => {
  const a = sceneAt(),
    b = sceneAt();
  runFor(a, 12, 60);
  runFor(b, 12, 120);
  for (let i = 0; i < a.packets.length; i++) {
    assert(Math.abs(a.packets[i].x - b.packets[i].x) < 0.0001);
    assert(Math.abs(a.packets[i].y - b.packets[i].y) < 0.0001);
  }
});

test('pointer influence is local and settles after leaving the hero', () => {
  const scene = sceneAt();
  const packet = scene.packets.find((p) => p.x > 250 && p.x < 1100);
  scene.movePointer(packet.x - 20, packet.y - 10);
  runFor(scene, 0.5);
  assert(scene.packets.some((p) => Math.hypot(p.offsetX, p.offsetY) > 0.2));
  const distant = scene.packets.filter(
    (p) => Math.hypot(p.x - scene.pointer.x, p.y - scene.pointer.y) > 350,
  );
  assert(distant.length > 0);
  assert(distant.every((p) => Math.hypot(p.offsetX, p.offsetY) < 0.01));
  scene.leavePointer();
  runFor(scene, 3);
  assert(scene.pointer.strength < 0.00001);
  assert(scene.packets.every((p) => Math.hypot(p.offsetX, p.offsetY) < 0.001));
});

test('reduced motion freezes packets and ignores pointer and click effects', () => {
  const scene = sceneAt();
  scene.tap(500, 300);
  scene.setReduced(true);
  const positions = scene.packets.map(({ x, y }) => ({ x, y }));
  scene.movePointer(300, 300);
  assert.equal(scene.tap(500, 300), false);
  runFor(scene, 10);
  assert.equal(scene.bursts.length, 0);
  assert.equal(scene.clock, 0);
  assert.deepEqual(
    scene.packets.map(({ x, y }) => ({ x, y })),
    positions,
  );
  scene.setTheme(true);
  assert.deepEqual(scene.colors.ink, MAIL_SCENE.dark.ink);
});

test('mobile and 4K surfaces use bounded populations and backing-store budgets', () => {
  const small = sceneAt(375, 1100),
    wide = sceneAt(3840, 900);
  assert(small.packets.length < wide.packets.length);
  assert.equal(wide.packets.length, MAIL_SCENE.packets.wide);
  assert(wide.routes.length <= MAIL_SCENE.routes.wide);
  for (const [width, height, dpr] of [
    [375, 1100, 3],
    [3840, 900, 2],
    [7680, 1200, 3],
  ]) {
    const ratio = backingScale(width, height, dpr);
    assert(ratio <= MAIL_SCENE.maxDpr);
    assert(width * height * ratio * ratio <= MAIL_SCENE.maxPixels + 1);
  }
  assert.equal(wide.tap(-1, 200), false);
  assert.equal(wide.tap(Number.NaN, 200), false);
  assert.equal(wide.tap(100, 10000), false);
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

test('theme colors converge without restarting the mail simulation', () => {
  const scene = sceneAt();
  runFor(scene, 1);
  const before = scene.colors.ink[0];
  scene.setTheme(true);
  assert.equal(scene.colors.ink[0], before);
  runFor(scene, 2);
  assert(Math.abs(scene.colors.ink[0] - MAIL_SCENE.dark.ink[0]) < 0.001);
  assert(Math.abs(scene.clock - 3) < 0.0001);
});
