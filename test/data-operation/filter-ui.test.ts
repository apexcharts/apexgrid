import { assert } from '@open-wc/testing';
import GridTestFixture from '../utils/grid-fixture.js';
import data from '../utils/test-data.js';

class FilterFixture<T extends object> extends GridTestFixture<T> {
  public override updateConfig(): void {
    this.columnConfig = this.columnConfig.map(config => ({
      ...config,
      filter: true,
    }));
  }
}

const TDD = new FilterFixture(data);

suite('Grid UI filter', () => {
  setup(async () => await TDD.setUp());
  teardown(() => TDD.tearDown());

  suite('Default UI', () => {
    test('Filter icons state', async () => {
      await TDD.clickHeaderFilter('name');

      assert.isDefined(TDD.filterRow.element);
      assert.isDefined(TDD.filterRow.selectComponent);
    });
  });
});
