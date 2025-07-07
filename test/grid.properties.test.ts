import { expect, html } from '@open-wc/testing';
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

describe('Grid auto-generate column configuration', () => {
  const keys = new Set(Object.keys(testData[0]));
  beforeEach(async () => await autoGenerateTDD.setUp());
  afterEach(() => autoGenerateTDD.tearDown());

  it('Default', async () => {
    for (const { key } of autoGenerateTDD.grid.columns) {
      expect(keys.has(key)).to.be.true;
    }

    expect(autoGenerateTDD.grid.rows).lengthOf(testData.length);
  });
});

describe('Grid properties (initial bindings)', () => {
  beforeEach(async () => await dataStateTDD.setUp());
  afterEach(() => dataStateTDD.tearDown());

  it('Initial data state applied', async () => {
    expect(dataStateTDD.rows.first.data.id).to.equal(8);
    expect(dataStateTDD.rows.last.data.id).to.equal(2);

    expect(dataStateTDD.rows.first.data.active).to.equal(true);
    expect(dataStateTDD.rows.last.data.active).to.equal(false);

    const importanceValues = new Set(['low', 'high']);

    for (const row of dataStateTDD.grid.rows) {
      expect(importanceValues.has(row.data.importance)).to.be.true;
    }
  });
});

describe('Grid properties', () => {
  beforeEach(async () => await TDD.setUp());
  afterEach(() => TDD.tearDown());

  it('Sort expressions late binding (set)', async () => {
    await TDD.updateProperty('sortExpressions', [{ key: 'id', direction: 'descending' }]);
    expect(TDD.rows.first.data.id).to.equal(8);
  });

  it('Filter expressions late binding (set)', async () => {
    await TDD.updateColumns({ key: 'id', type: 'number' });
    await TDD.updateProperty('filterExpressions', [
      { key: 'id', condition: 'greaterThanOrEqual', searchTerm: 8 },
    ]);

    expect(TDD.grid.totalItems).to.equal(1);
    expect(TDD.rows.first.data.id).to.equal(8);
  });

  it('Sort expressions (get)', async () => {
    await TDD.sort([
      { key: 'name', direction: 'descending' },
      { key: 'id', direction: 'ascending' },
    ]);

    expect(TDD.grid.sortExpressions).lengthOf(2);
  });

  it('Filter expressions (get)', async () => {
    await TDD.updateColumns({ key: 'id', type: 'number' });
    await TDD.filter([
      { key: 'name', condition: 'startsWith', searchTerm: 'a' },
      { key: 'name', condition: 'contains', searchTerm: 'a' },
      { key: 'id', condition: 'greaterThan', searchTerm: 3 },
    ]);

    expect(TDD.grid.filterExpressions).lengthOf(3);
  });
});
