import { assert } from '@open-wc/testing';
import type { Keys } from '../src/internal/types';
import GridTestFixture from './utils/grid-fixture.js';
import data, { type TestData } from './utils/test-data.js';

const TDD = new GridTestFixture(data);
const keys = Object.keys(data[0]) as Array<Keys<TestData>>;

suite('Grid activation', () => {
  setup(async () => await TDD.setUp());
  teardown(() => TDD.tearDown());

  suite('Click activation', () => {
    test('Default', async () => {
      const initial = TDD.rows.first.cells.first;
      const next = TDD.rows.first.cells.last;

      await TDD.clickCell(initial);
      assert.strictEqual(initial.active, true);

      await TDD.clickCell(next);
      assert.strictEqual(initial.active, false);
      assert.strictEqual(next.active, true);
    });
  });

  suite('Keyboard navigation & activation [No previous selection]', () => {
    test('ArrowRight', async () => {
      for (const each of keys) {
        await TDD.fireNavigationEvent({ key: 'ArrowRight' });
        assert.strictEqual(TDD.rows.first.cells.get(each).active, true);
      }
    });

    test('ArrowLeft', async () => {
      const reversed = [keys[0], ...keys.slice(1).reverse()];
      for (const each of reversed) {
        await TDD.fireNavigationEvent({ key: 'ArrowLeft' });
        assert.strictEqual(TDD.rows.first.cells.get(each).active, true);
      }
    });

    test('ArrowDown', async () => {
      for (let i = 0; i < data.length; i++) {
        await TDD.fireNavigationEvent({ key: 'ArrowDown' });
        assert.strictEqual(TDD.rows.get(i).cells.first.active, true);
      }
    });
  });
});
