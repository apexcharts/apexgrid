import { assert } from '@open-wc/testing';
import { html } from 'lit';

import GridTestFixture from './utils/grid-fixture.js';
import data, { TestData } from './utils/test-data.js';

import type { SortExpression } from '../src/operations/sort/types.js';
import type { FilterExpression } from '../src/operations/filter/types.js';

class InitialDataStateFixture<T extends TestData> extends GridTestFixture<T> {
  public sortState: SortExpression<TestData>[] = [
    { key: 'active', direction: 'descending' },
    { key: 'id', direction: 'descending' },
  ];
  public filterState: FilterExpression<TestData>[] = [
    { key: 'importance', condition: 'startsWith', searchTerm: 'l' },
    { key: 'importance', condition: 'startsWith', searchTerm: 'h', criteria: 'or' },
  ];

  public override setupTemplate() {
    return html`<apx-grid
      .data=${this.data}
      .columns=${this.columnConfig}
      .sortExpressions=${this.sortState}
      .filterExpressions=${this.filterState}
    ></apx-grid>`;
  }
}

const TDD = new GridTestFixture(data);
const dataStateTDD = new InitialDataStateFixture(data);

suite('Grid properties (initial bindings)', () => {
  setup(async () => await dataStateTDD.setUp());
  teardown(() => dataStateTDD.tearDown());

  test('Initial data state applied', async () => {
    assert.strictEqual(dataStateTDD.rows.first.data.id, 8);
    assert.strictEqual(dataStateTDD.rows.last.data.id, 2);

    assert.strictEqual(dataStateTDD.rows.first.data.active, true);
    assert.strictEqual(dataStateTDD.rows.last.data.active, false);

    const importanceValues = new Set(['low', 'high']);

    for (const row of dataStateTDD.grid.rows) {
      assert.isTrue(importanceValues.has(row.data.importance));
    }
  });
});

suite('Grid properties', () => {
  setup(async () => await TDD.setUp());
  teardown(() => TDD.tearDown());

  test('Sort expressions late binding', async () => {
    await TDD.updateProperty('sortExpressions', [{ key: 'id', direction: 'descending' }]);
    assert.strictEqual(TDD.rows.first.data.id, 8);
  });

  test('Filter expressions late binding', async () => {
    await TDD.updateColumn('id', { type: 'number' });
    await TDD.updateProperty('filterExpressions', [
      { key: 'id', condition: 'greaterThanOrEqual', searchTerm: 8 },
    ]);

    assert.strictEqual(TDD.grid.totalItems, 1);
    assert.strictEqual(TDD.rows.first.data.id, 8);
  });
});
