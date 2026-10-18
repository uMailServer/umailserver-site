import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createAnimationPreferenceStore,
  resolveAnimationPreference,
} from '../src/lib/animation-preference.ts';

function fixture(initial = null, reduced = false) {
  const state = {
    value: initial,
    reduced,
    connections: 0,
    disconnections: 0,
    writes: [],
    blocked: false,
  };
  let storage, motion;
  const host = {
    read() {
      if (state.blocked) throw new Error('Storage denied');
      return state.value;
    },
    write(value) {
      if (state.blocked) throw new Error('Storage denied');
      state.value = value;
      state.writes.push(value);
    },
    reduced: () => state.reduced,
    listen(onStorage, onMotion) {
      state.connections++;
      storage = onStorage;
      motion = onMotion;
      return () => {
        state.disconnections++;
        storage = motion = undefined;
      };
    },
  };
  return {
    state,
    host,
    store: createAnimationPreferenceStore(host),
    system(value) {
      state.reduced = value;
      motion?.();
    },
    external(value) {
      state.value = value;
      storage?.(value);
    },
  };
}

test('first use follows reduced motion, while valid saved choices override either system default', () => {
  for (const reduced of [true, false]) {
    for (const value of [null, '', 'invalid'])
      assert.equal(resolveAnimationPreference(value, reduced), !reduced);
    assert.equal(resolveAnimationPreference('on', reduced), true);
    assert.equal(resolveAnimationPreference('off', reduced), false);
  }
});

test('system changes are followed until an explicit choice, which survives a new page session', () => {
  const f = fixture();
  const seen = [];
  const unsubscribe = f.store.subscribe(() => seen.push(f.store.getSnapshot()));
  assert.equal(f.store.getSnapshot(), true);
  f.system(true);
  assert.equal(f.store.getSnapshot(), false);
  f.store.setEnabled(true);
  f.system(false);
  f.system(true);
  assert.equal(f.store.getSnapshot(), true);
  assert.deepEqual(f.state.writes, ['on']);
  assert.equal(createAnimationPreferenceStore(f.host).getSnapshot(), true);
  f.store.setEnabled(false);
  f.system(false);
  assert.equal(createAnimationPreferenceStore(f.host).getSnapshot(), false);
  assert(seen.includes(false) && seen.includes(true));
  unsubscribe();
});

test('header and background share one preference subscription and clean up when the final consumer leaves', () => {
  const f = fixture();
  let header = 0,
    background = 0;
  const a = f.store.subscribe(() => header++);
  const b = f.store.subscribe(() => background++);
  assert.equal(f.state.connections, 1);
  f.store.setEnabled(false);
  assert.equal(header, 1);
  assert.equal(background, 1);
  a();
  assert.equal(f.state.disconnections, 0);
  f.store.setEnabled(true);
  assert.equal(header, 1);
  assert.equal(background, 2);
  b();
  assert.equal(f.state.disconnections, 1);
  f.state.value = 'off';
  const c = f.store.subscribe(() => {});
  assert.equal(f.state.connections, 2);
  assert.equal(f.store.getSnapshot(), false);
  c();
  assert.equal(f.state.disconnections, 2);
});

test('cross-tab updates and cleared storage synchronize both consumers without writing back', () => {
  const f = fixture('on', true);
  const seen = [];
  const unsubscribe = f.store.subscribe(() => seen.push(f.store.getSnapshot()));
  f.external('off');
  f.external('on');
  f.external(null);
  f.system(false);
  assert.deepEqual(seen, [false, true, false, true]);
  assert.deepEqual(f.state.writes, []);
  unsubscribe();
});

test('blocked storage preserves a working in-memory switch across consumer remounts', () => {
  const f = fixture(null, true);
  f.state.blocked = true;
  assert.equal(f.store.getSnapshot(), false);
  const a = f.store.subscribe(() => {});
  f.store.setEnabled(true);
  assert.equal(f.store.getSnapshot(), true);
  a();
  const b = f.store.subscribe(() => {});
  assert.equal(f.store.getSnapshot(), true);
  f.store.setEnabled(false);
  assert.equal(f.store.getSnapshot(), false);
  b();
});
