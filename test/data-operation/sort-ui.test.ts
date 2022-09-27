import { assert } from '@open-wc/testing';
import type { Keys } from '../../src/internal/types';
import sinon from 'sinon';

import { SORT_ICON_ASCENDING, SORT_ICON_DESCENDING } from '../../src/internal/constants.js';
import GridTestFixture from '../utils/grid-fixture.js';
import data, { importanceComparer } from '../utils/test-data.js';

class SortFixture<T extends object> extends GridTestFixture<T> {
  public override updateConfig(): void {
    this.columnConfig = this.columnConfig.map(config => ({ ...config, sort: true }));
  }

  public indicatorExists(key: Keys<T>) {
    assert.exists(this.headers.get(key).sortIcon);
  }

  public indicatorDoesNotExist(key: Keys<T>) {
    assert.notExists(this.headers.get(key).sortIcon);
  }

  public indicatorIsAscending(key: Keys<T>) {
    assert.strictEqual(this.headers.get(key).sortIcon.name, SORT_ICON_ASCENDING);
  }

  public indicatorIsDescending(key: Keys<T>) {
    assert.strictEqual(this.headers.get(key).sortIcon.name, SORT_ICON_DESCENDING);
  }
}

const TDD = new SortFixture(data);

suite('Grid UI sort', () => {
  setup(async () => await TDD.setUp());
  teardown(() => TDD.tearDown());

  suite('Default UI', () => {
    test('Sort icons state', async () => {
      await TDD.clickHeader('id');
      TDD.indicatorIsAscending('id');

      await TDD.clickHeader('id');
      TDD.indicatorIsDescending('id');
    });

    test('Single sort by clicking', async () => {
      // Ascending
      await TDD.clickHeader('id');
      assert.strictEqual(TDD.rows.first.data.id, 1);

      // Descending
      await TDD.clickHeader('id');
      assert.strictEqual(TDD.rows.first.data.id, 8);
    });

    test('Multiple sort by clicking', async () => {
      // Ascending `active` & ascending `id`
      await TDD.clickHeader('active');
      await TDD.clickHeader('id');
      assert.strictEqual(TDD.rows.first.data.active, false);
      assert.strictEqual(TDD.rows.first.data.id, 1);

      // Ascending `active` & descending `id`
      await TDD.clickHeader('id');
      assert.strictEqual(TDD.rows.first.data.active, false);
      assert.strictEqual(TDD.rows.first.data.id, 6);
    });

    test('Click on non-sortable columns', async () => {
      await TDD.updateColumn('id', { sort: false });
      await TDD.clickHeader('id');
      await TDD.clickHeader('id');

      assert.notStrictEqual(TDD.rows.first.data.id, 8);
    });
  });

  suite('Grid sorting configuration', () => {
    test('Single sort with tri-state', async () => {
      await TDD.updateProperty('sortingConfig', { multiple: false, triState: true });

      // ASC
      await TDD.clickHeader('id');
      TDD.indicatorIsAscending('id');

      // ASC by `active`, reset `id`
      await TDD.clickHeader('active');

      TDD.indicatorDoesNotExist('id');
      TDD.indicatorIsAscending('active');

      // ASC -> DESC
      await TDD.clickHeader('active');
      TDD.indicatorIsDescending('active');

      // Reset
      await TDD.clickHeader('active');
      TDD.indicatorDoesNotExist('active');
    });

    test('Single sort without tri-state', async () => {
      await TDD.updateProperty('sortingConfig', { multiple: false, triState: false });

      // ASC
      await TDD.clickHeader('id');

      TDD.indicatorExists('id');
      TDD.indicatorIsAscending('id');

      // ASC by `active`, reset `id`
      await TDD.clickHeader('active');

      TDD.indicatorDoesNotExist('id');
      TDD.indicatorExists('active');
      TDD.indicatorIsAscending('active');

      // ASC -> DESC
      await TDD.clickHeader('active');
      TDD.indicatorIsDescending('active');

      // DESC -> ASC
      await TDD.clickHeader('active');
      TDD.indicatorIsAscending('active');
    });

    test('Multiple sort with tri-state', async () => {
      // ASC
      await TDD.clickHeader('id');

      // ASC -> DESC
      await TDD.clickHeader('active');
      await TDD.clickHeader('active');

      TDD.indicatorIsAscending('id');
      TDD.indicatorIsDescending('active');

      // Reset
      await TDD.clickHeader('active');

      TDD.indicatorIsAscending('id');
      TDD.indicatorDoesNotExist('active');
    });

    test('Multiple sort without tri-state', async () => {
      await TDD.updateProperty('sortingConfig', { multiple: true, triState: false });

      // ASC
      await TDD.clickHeader('id');

      // ASC -> DESC
      await TDD.clickHeader('active');
      await TDD.clickHeader('active');

      TDD.indicatorIsAscending('id');
      TDD.indicatorIsDescending('active');

      // DESC -> ASC
      await TDD.clickHeader('active');

      TDD.indicatorIsAscending('id');
      TDD.indicatorIsAscending('active');
    });
  });

  suite('Events', () => {
    test('Event sequence', async () => {
      const spy = sinon.spy(TDD.grid, 'emitEvent');

      await TDD.clickHeader('id');
      assert.strictEqual(spy.callCount, 2);
      assert.strictEqual(TDD.rows.first.data.id, 1);

      assert.strictEqual(spy.firstCall.firstArg, 'sorting');
      assert.sameDeepMembers(
        [spy.firstCall.lastArg],
        [
          {
            detail: {
              key: 'id',
              direction: 'ascending',
              comparer: undefined,
              caseSensitive: false,
            },
            cancelable: true,
          },
        ],
      );

      assert.strictEqual(spy.lastCall.firstArg, 'sorted');
      assert.sameDeepMembers(
        [spy.lastCall.lastArg],
        [
          {
            detail: {
              key: 'id',
              direction: 'ascending',
              comparer: undefined,
              caseSensitive: false,
            },
          },
        ],
      );

      spy.resetHistory();

      await TDD.clickHeader('id');

      assert.strictEqual(spy.callCount, 2);
      assert.strictEqual(TDD.rows.first.data.id, 8);

      assert.strictEqual(spy.firstCall.firstArg, 'sorting');
      assert.sameDeepMembers(
        [spy.firstCall.lastArg],
        [
          {
            detail: {
              key: 'id',
              direction: 'descending',
              comparer: undefined,
              caseSensitive: false,
            },
            cancelable: true,
          },
        ],
      );

      assert.strictEqual(spy.lastCall.firstArg, 'sorted');
      assert.sameDeepMembers(
        [spy.lastCall.lastArg],
        [
          {
            detail: {
              key: 'id',
              direction: 'descending',
              comparer: undefined,
              caseSensitive: false,
            },
          },
        ],
      );
    });

    test('Cancellable sorting event', async () => {
      // ASC sort
      await TDD.clickHeader('id');

      TDD.grid.addEventListener('sorting', e => e.preventDefault());
      const spy = sinon.spy(TDD.grid, 'emitEvent');

      // DESC sort
      await TDD.clickHeader('id');

      assert.strictEqual(spy.callCount, 1);
      assert.strictEqual(TDD.rows.first.data.id, 1);
    });

    test('Modify event arguments mid-flight', async () => {
      const spy = sinon.spy(TDD.grid, 'emitEvent');
      TDD.grid.addEventListener('sorting', e => (e.detail.direction = 'descending'));

      // Click for ASC sort, but modify to DESC in the handler
      await TDD.clickHeader('id');

      assert.strictEqual(TDD.rows.first.data.id, 8);
      assert.strictEqual(spy.callCount, 2);
      assert.sameDeepMembers(
        [spy.firstCall.lastArg],
        [
          {
            detail: {
              key: 'id',
              direction: 'descending',
              caseSensitive: false,
              comparer: undefined,
            },
            cancelable: true,
          },
        ],
      );
    });
  });

  suite('API', () => {
    test('Default', async () => {
      await TDD.sort('id', { direction: 'descending' });
      assert.strictEqual(TDD.rows.first.data.id, 8);
    });

    test('Sort works on non-sortable columns', async () => {
      await TDD.updateColumn('id', { sort: false });
      await TDD.sort('id', { direction: 'descending' });

      assert.strictEqual(TDD.rows.first.data.id, 8);
    });

    test('Config object', async () => {
      await TDD.sort('importance', { direction: 'descending', comparer: importanceComparer });
      assert.strictEqual(TDD.rows.first.data.importance, 'high');

      await TDD.sort('importance', { direction: 'ascending', comparer: importanceComparer });
      assert.strictEqual(TDD.rows.first.data.importance, 'low');
    });
  });
});
