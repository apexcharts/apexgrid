import { assert } from '@open-wc/testing';
import { html } from 'lit';
import type { FilterExpression } from '../src/operations/filter/types.js';
import type { SortExpression } from '../src/operations/sort/types.js';
import GridTestFixture from './utils/grid-fixture.js';
import testData from './utils/test-data.js';
import data, { type TestData } from './utils/test-data.js';

class InitialDataStateFixture<T extends TestData> extends GridTestFixture<T> {
  public sortState: SortExpression<TestData>[] = [
    { key: 'active', direction: 'descending' },
    { key: 'id', direction: 'descending' },
  ];
  public filterState: FilterExpression<TestData>[] = [
    { key: 'importance', condition: 'equals', searchTerm: 'low' },
    { key: 'importance', condition: 'equals', searchTerm: 'high', criteria: 'or' },
  ];

  public override setupTemplate() {
    return html`<apex-grid
      .data=${this.data}
      .columns=${this.columnConfig}
      .sortExpressions=${this.sortState}
      .filterExpressions=${this.filterState}
    ></apex-grid>`;
  }
}

class AutoGenerateFixture<T extends TestData> extends GridTestFixture<T> {
  public override setupTemplate() {
    return html`<apex-grid
      auto-generate
      .data=${this.data}
    ></apex-grid>`;
  }
}

const TDD = new GridTestFixture(data);
const dataStateTDD = new InitialDataStateFixture(data);
const autoGenerateTDD = new AutoGenerateFixture(data);

suite('Grid auto-generate column configuration', () => {
  const keys = new Set(Object.keys(testData[0]));
  setup(async () => await autoGenerateTDD.setUp());
  teardown(() => autoGenerateTDD.tearDown());

  test('Default', async () => {
    for (const { key } of autoGenerateTDD.grid.columns) {
      assert.isTrue(keys.has(key));
    }

    assert.strictEqual(autoGenerateTDD.grid.rows.length, testData.length);
  });
});

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

  test('Sort expressions late binding (set)', async () => {
    await TDD.updateProperty('sortExpressions', [{ key: 'id', direction: 'descending' }]);
    assert.strictEqual(TDD.rows.first.data.id, 8);
  });

  test('Filter expressions late binding (set)', async () => {
    await TDD.updateColumns({ key: 'id', type: 'number' });
    await TDD.updateProperty('filterExpressions', [
      { key: 'id', condition: 'greaterThanOrEqual', searchTerm: 8 },
    ]);

    assert.strictEqual(TDD.grid.totalItems, 1);
    assert.strictEqual(TDD.rows.first.data.id, 8);
  });

  test('Sort expressions (get)', async () => {
    await TDD.sort([
      { key: 'name', direction: 'descending' },
      { key: 'id', direction: 'ascending' },
    ]);

    assert.strictEqual(TDD.grid.sortExpressions.length, 2);
  });

  test('Filter expressions (get)', async () => {
    await TDD.updateColumns({ key: 'id', type: 'number' });
    await TDD.filter([
      { key: 'name', condition: 'startsWith', searchTerm: 'a' },
      { key: 'name', condition: 'contains', searchTerm: 'a' },
      { key: 'id', condition: 'greaterThan', searchTerm: 3 },
    ]);

    assert.strictEqual(TDD.grid.filterExpressions.length, 3);
  });
});
