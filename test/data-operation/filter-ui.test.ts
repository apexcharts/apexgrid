import { assert, elementUpdated } from '@open-wc/testing';
import GridTestFixture from '../utils/grid-fixture.js';
import data from '../utils/test-data.js';

import type { Keys } from '../../src/internal/types';

class FilterFixture<T extends object> extends GridTestFixture<T> {
  public override updateConfig(): void {
    this.columnConfig = this.columnConfig.map(config => ({
      ...config,
      filter: true,
    }));
  }

  public get filterableColumns() {
    return this.grid.columns.filter(each => each.filter);
  }

  public async activateFilterRow(key: Keys<T>) {
    this.filterRow.open(key);
    await elementUpdated(this.grid);
  }

  public async closeFilterRow() {
    this.filterRow.close();
    await elementUpdated(this.grid);
  }

  public async resetFilterRow() {
    this.filterRow.reset();
    await elementUpdated(this.grid);
  }

  public async filterByInput(value: string) {
    this.filterRow.fireInputEvent(value);
    await elementUpdated(this.grid);
  }

  public assertActiveFilterRowState() {
    assert.isTrue(this.filterRow.active);
    assert.isDefined(this.filterRow.input);
    assert.isDefined(this.filterRow.dropdown);
  }

  public assertInactiveFilterRowState() {
    assert.isFalse(this.filterRow.active);
    assert.notExists(this.filterRow.input);
    assert.notExists(this.filterRow.dropdown);
  }
}

const TDD = new FilterFixture(data);

suite('Grid UI filter', () => {
  setup(async () => await TDD.setUp());
  teardown(() => TDD.tearDown());

  suite('Default UI state', () => {
    test('Default state for no filterable columns', async () => {
      await TDD.updateProperty(
        'columns',
        TDD.columnConfig.map(each => ({ ...each, filter: false })),
      );

      assert.isNotOk(TDD.filterRow.element);
    });

    test('Default state with filterable columns', async () => {
      assert.isOk(TDD.filterRow.element);
    });

    test('Correct number of UI elements', async () => {
      assert.strictEqual(TDD.filterableColumns.length, TDD.filterRow.inactiveStateChips.length);

      await TDD.updateColumn('name', { filter: false });
      assert.strictEqual(TDD.filterableColumns.length, TDD.filterRow.inactiveStateChips.length);

      await TDD.updateColumn('name', { filter: true });
      assert.strictEqual(TDD.filterableColumns.length, TDD.filterRow.inactiveStateChips.length);
    });

    test('Default state when clicking on a filter chip', async () => {
      await TDD.activateFilterRow('name');
      TDD.assertActiveFilterRowState();
    });

    test('Default state when exiting from active filter row state', async () => {
      await TDD.activateFilterRow('name');
      await TDD.closeFilterRow();

      TDD.assertInactiveFilterRowState();
    });
  });

  suite('Default UI filtering', () => {
    test('String column, single filter [case insensitive]', async () => {
      await TDD.activateFilterRow('name');
      await TDD.filterByInput('a');

      assert.strictEqual(TDD.grid.totalItems, 2);

      await TDD.filterByInput('A');

      assert.strictEqual(TDD.grid.totalItems, 2);
    });

    test('String column, single filter [case sensitive]', async () => {
      await TDD.updateColumn('name', { filter: { caseSensitive: true } });
      await TDD.activateFilterRow('name');
      await TDD.filterByInput('a');

      assert.strictEqual(TDD.grid.totalItems, 1);
      assert.strictEqual(TDD.rows.first.data.name, 'a');

      await TDD.filterByInput('A');

      assert.strictEqual(TDD.grid.totalItems, 1);
      assert.strictEqual(TDD.rows.first.data.name, 'A');
    });

    test('Number column, single filter [correct type]', async () => {
      await TDD.updateColumn('id', { type: 'number' });

      await TDD.activateFilterRow('id');
      await TDD.filterByInput('3');

      assert.strictEqual(TDD.grid.totalItems, 1);
    });
  });

  suite('API', () => {
    test('Default', async () => {
      // await TDD.filter({ key: 'name', condition: '', searchTerm: '1' });
    });
  });
});
