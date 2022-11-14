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

  suite('Keyboard navigation & activation', () => {
    test('ArrowRight', async () => {
      await TDD.clickCell(TDD.rows.first.cells.first);

      for (const each of keys) {
        assert.isTrue(TDD.rows.first.cells.get(each).active);
        await TDD.fireNavigationEvent({ key: 'ArrowRight' });
      }
    });

    test('ArrowRight @ boundary', async () => {
      await TDD.clickCell(TDD.rows.first.cells.last);
      await TDD.fireNavigationEvent({ key: 'ArrowRight' });

      assert.isTrue(TDD.rows.first.cells.last.active);
    });

    test('ArrowLeft', async () => {
      const reversed = keys.reverse();
      await TDD.clickCell(TDD.rows.first.cells.last);

      for (const each of reversed) {
        assert.isTrue(TDD.rows.first.cells.get(each).active);
        await TDD.fireNavigationEvent({ key: 'ArrowLeft' });
      }
    });

    test('ArrowLeft @ boundary', async () => {
      await TDD.clickCell(TDD.rows.first.cells.first);
      await TDD.fireNavigationEvent({ key: 'ArrowLeft' });

      assert.isTrue(TDD.rows.first.cells.first.active);
    });

    test('ArrowDown', async () => {
      await TDD.clickCell(TDD.rows.first.cells.first);

      for (let i = 0; i < data.length; i++) {
        assert.isTrue(TDD.rows.get(i).cells.first.active);
        await TDD.fireNavigationEvent({ key: 'ArrowDown' });
      }
    });

    test('ArrowDown @ boundary', async () => {
      await TDD.clickCell(TDD.rows.last.cells.first);
      await TDD.fireNavigationEvent({ key: 'ArrowDown' });

      assert.isTrue(TDD.rows.last.cells.first.active);
    });

    test('ArrowUp', async () => {
      await TDD.clickCell(TDD.rows.last.cells.first);

      for (let i = data.length - 1; i > -1; i--) {
        assert.isTrue(TDD.rows.get(i).cells.first.active);
        await TDD.fireNavigationEvent({ key: 'ArrowUp' });
      }
    });

    test('ArrowUp @ boundary', async () => {
      await TDD.clickCell(TDD.rows.first.cells.first);
      await TDD.fireNavigationEvent({ key: 'ArrowUp' });

      assert.isTrue(TDD.rows.first.cells.first.active);
    });

    test('Home', async () => {
      await TDD.clickCell(TDD.rows.last.cells.first);
      await TDD.fireNavigationEvent({ key: 'Home' });

      assert.isTrue(TDD.rows.first.cells.first.active);
    });

    test('Home @ boundary', async () => {
      await TDD.clickCell(TDD.rows.first.cells.first);
      await TDD.fireNavigationEvent({ key: 'Home' });

      assert.isTrue(TDD.rows.first.cells.first.active);
    });

    test('End', async () => {
      await TDD.clickCell(TDD.rows.first.cells.first);
      await TDD.fireNavigationEvent({ key: 'End' });

      assert.isTrue(TDD.rows.last.cells.first.active);
    });

    test('End (at edge)', async () => {
      await TDD.clickCell(TDD.rows.last.cells.first);
      await TDD.fireNavigationEvent({ key: 'End' });

      assert.isTrue(TDD.rows.last.cells.first.active);
    });
  });
});
