import { assert } from '@open-wc/testing';
import type { Keys } from '../../src/internal/types.js';
import sinon from 'sinon';

import { SORT_ICON_ASCENDING, SORT_ICON_DESCENDING } from '../../src/internal/constants.js';
import GridTestFixture from '../utils/grid-fixture.js';
import data, { importanceComparer } from '../utils/test-data.js';

class SortFixture<T extends object> extends GridTestFixture<T> {
  public override updateConfig(): void {
    this.columnConfig = this.columnConfig.map(config => ({ ...config, sort: true }));
  }

  public sortDOMExists(key: Keys<T>) {
    assert.exists(this.headers.get(key).sortPart);
  }

  public sortDOMDoesNotExist(key: Keys<T>) {
    assert.notExists(this.headers.get(key).sortPart);
  }

  public columnIsSorted(key: Keys<T>) {
    assert.isTrue(this.headers.get(key).isSorted);
  }

  public columnIsNotSorted(key: Keys<T>) {
    assert.isFalse(this.headers.get(key).isSorted);
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
      const key = 'id';

      // Default sort DOM state
      TDD.sortDOMExists(key);
      TDD.columnIsNotSorted(key);

      // Ascending state
      await TDD.sortHeader(key);
      TDD.indicatorIsAscending(key);
      TDD.columnIsSorted(key);

      // Descending state
      await TDD.sortHeader(key);
      TDD.indicatorIsDescending(key);
      TDD.columnIsSorted(key);
    });

    test('Non-sortable columns have no sort DOM', async () => {
      await TDD.updateColumns({ key: 'id', sort: false });
      TDD.sortDOMDoesNotExist('id');
    });

    test('Single sort by clicking', async () => {
      // Ascending
      await TDD.sortHeader('id');
      assert.strictEqual(TDD.rows.first.data.id, 1);

      // Descending
      await TDD.sortHeader('id');
      assert.strictEqual(TDD.rows.first.data.id, 8);
    });

    test('Multiple sort by clicking', async () => {
      // Ascending `active` & ascending `id`
      await TDD.sortHeader('active');
      await TDD.sortHeader('id');
      assert.strictEqual(TDD.rows.first.data.active, false);
      assert.strictEqual(TDD.rows.first.data.id, 1);

      // Ascending `active` & descending `id`
      await TDD.sortHeader('id');
      assert.strictEqual(TDD.rows.first.data.active, false);
      assert.strictEqual(TDD.rows.first.data.id, 6);
    });
  });

  suite('Grid sorting configuration', () => {
    test('Single sort with tri-state', async () => {
      await TDD.updateProperty('sortConfiguration', { multiple: false, triState: true });

      // ASC
      await TDD.sortHeader('id');
      TDD.indicatorIsAscending('id');
      TDD.columnIsSorted('id');

      // ASC by `active`, reset `id`
      await TDD.sortHeader('active');

      TDD.columnIsNotSorted('id');
      TDD.columnIsSorted('active');
      TDD.indicatorIsAscending('active');

      // ASC -> DESC
      await TDD.sortHeader('active');
      TDD.indicatorIsDescending('active');

      // Reset
      await TDD.sortHeader('active');
      TDD.columnIsNotSorted('active');
    });

    test('Single sort without tri-state', async () => {
      await TDD.updateProperty('sortConfiguration', { multiple: false, triState: false });

      // ASC
      await TDD.sortHeader('id');

      TDD.indicatorExists('id');
      TDD.indicatorIsAscending('id');
      TDD.columnIsSorted('id');

      // ASC by `active`, reset `id`
      await TDD.sortHeader('active');

      TDD.columnIsNotSorted('id');
      TDD.columnIsSorted('active');
      TDD.indicatorExists('active');
      TDD.indicatorIsAscending('active');

      // ASC -> DESC
      await TDD.sortHeader('active');
      TDD.indicatorIsDescending('active');

      // DESC -> ASC
      await TDD.sortHeader('active');
      TDD.indicatorIsAscending('active');
    });

    test('Multiple sort with tri-state', async () => {
      // ASC
      await TDD.sortHeader('id');

      // ASC -> DESC
      await TDD.sortHeader('active');
      await TDD.sortHeader('active');

      TDD.indicatorIsAscending('id');
      TDD.indicatorIsDescending('active');
      TDD.columnIsSorted('id');
      TDD.columnIsSorted('active');

      // Reset
      await TDD.sortHeader('active');

      TDD.indicatorIsAscending('id');
      TDD.columnIsNotSorted('active');
    });

    test('Multiple sort without tri-state', async () => {
      await TDD.updateProperty('sortConfiguration', { multiple: true, triState: false });

      // ASC
      await TDD.sortHeader('id');

      // ASC -> DESC
      await TDD.sortHeader('active');
      await TDD.sortHeader('active');

      TDD.indicatorIsAscending('id');
      TDD.indicatorIsDescending('active');

      // DESC -> ASC
      await TDD.sortHeader('active');

      TDD.indicatorIsAscending('id');
      TDD.indicatorIsAscending('active');
    });
  });

  suite('Events', () => {
    test('Event sequence', async () => {
      const spy = sinon.spy(TDD.grid, 'emitEvent');

      await TDD.sortHeader('id');
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

      await TDD.sortHeader('id');

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
      await TDD.sortHeader('id');

      TDD.grid.addEventListener('sorting', e => e.preventDefault());
      const spy = sinon.spy(TDD.grid, 'emitEvent');

      // DESC sort
      await TDD.sortHeader('id');

      assert.strictEqual(spy.callCount, 1);
      assert.strictEqual(TDD.rows.first.data.id, 1);
    });

    test('Modify event arguments mid-flight', async () => {
      const spy = sinon.spy(TDD.grid, 'emitEvent');
      TDD.grid.addEventListener('sorting', e => (e.detail.direction = 'descending'));

      // Click for ASC sort, but modify to DESC in the handler
      await TDD.sortHeader('id');

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
      await TDD.sort({ key: 'id', direction: 'descending' });
      assert.strictEqual(TDD.rows.first.data.id, 8);
    });

    test('Sort works on non-sortable columns', async () => {
      await TDD.updateColumns({ key: 'id', sort: false });
      await TDD.sort({ key: 'id', direction: 'descending' });

      assert.strictEqual(TDD.rows.first.data.id, 8);
    });

    test('Config object', async () => {
      await TDD.sort({ key: 'importance', direction: 'descending', comparer: importanceComparer });
      assert.strictEqual(TDD.rows.first.data.importance, 'high');

      await TDD.sort({ key: 'importance', direction: 'ascending', comparer: importanceComparer });
      assert.strictEqual(TDD.rows.first.data.importance, 'low');
    });

    test('Multiple expressions', async () => {
      await TDD.sort([
        {
          key: 'importance',
          direction: 'ascending',
          comparer: importanceComparer,
        },
        {
          key: 'active',
          direction: 'ascending',
        },
      ]);

      assert.strictEqual(TDD.rows.first.data.importance, 'low');
      TDD.columnIsSorted('importance');
      TDD.columnIsSorted('active');
    });

    test('API clear state', async () => {
      await TDD.sort({ key: 'importance', direction: 'descending', comparer: importanceComparer });
      assert.strictEqual(TDD.rows.first.data.importance, 'high');
      TDD.columnIsSorted('importance');

      await TDD.clearSort();
      TDD.columnIsNotSorted('importance');
    });

    test('API clear state (by key)', async () => {
      await TDD.sort([
        { key: 'importance', direction: 'descending', comparer: importanceComparer },
        { key: 'name', direction: 'ascending' },
      ]);
      assert.strictEqual(TDD.grid.sortExpressions.length, 2);

      await TDD.clearSort('importance');
      assert.strictEqual(TDD.grid.sortExpressions.length, 1);
    });
  });
});
