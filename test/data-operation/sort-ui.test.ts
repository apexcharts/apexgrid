import { assert } from '@open-wc/testing';
import { SORT_ICON_ASCENDING, SORT_ICON_DESCENDING } from '../../src/internal/constants.js';
import GridTestFixture from '../utils/grid-fixture.js';
import data, { importanceComparer } from '../utils/test-data.js';

class SortFixture<T extends object> extends GridTestFixture<T> {
  public override updateConfig(): void {
    this.columnConfig = this.columnConfig.map(config => ({ ...config, sort: true }));
  }
}

const TDD = new SortFixture(data);

suite('Grid UI sort', () => {
  setup(async () => await TDD.setUp());
  teardown(() => TDD.tearDown());

  suite('Default UI', () => {
    test('Sort icons state', async () => {
      await TDD.clickHeader('id');
      assert.strictEqual(TDD.headers.first.sortIcon.name, SORT_ICON_ASCENDING);

      await TDD.clickHeader('id');
      assert.strictEqual(TDD.headers.first.sortIcon.name, SORT_ICON_DESCENDING);
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

  suite('API', () => {
    test('Single sort', async () => {
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

      await TDD.sort('importance', { comparer: importanceComparer });
      assert.strictEqual(TDD.rows.first.data.importance, 'low');
    });
  });
});
