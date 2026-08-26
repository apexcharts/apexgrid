import { expect, fixture, fixtureCleanup, html, nextFrame, waitUntil } from '@open-wc/testing';
import type { ApexCellValueChangedEvent } from '../src/components/grid.js';
import { ApexGrid } from '../src/components/grid.js';
import type { ColumnConfiguration } from '../src/internal/types.js';

interface Row {
  id: number;
  name: string;
  amount: number;
  locked: string;
}

function rows(): Row[] {
  return Array.from({ length: 6 }, (_, id) => ({
    id,
    name: `Row ${id}`,
    amount: id * 10,
    locked: 'x',
  }));
}

const columns: ColumnConfiguration<Row>[] = [
  { key: 'id', type: 'number' },
  { key: 'name', editable: true },
  {
    key: 'amount',
    type: 'number',
    editable: true,
    // Rejects negatives, so a batch can be partially invalid.
    validators: [(value: unknown) => (Number(value) >= 0 ? null : 'no negatives')],
  },
  { key: 'locked' },
];

async function mount() {
  ApexGrid.register();
  const parent = document.createElement('div');
  parent.style.height = '500px';
  const grid = await fixture<ApexGrid<Row>>(
    html`<apex-grid
      .data=${rows()}
      .columns=${columns}
      .editing=${{ enabled: true, history: { enabled: true } }}
    ></apex-grid>`,
    { parentNode: parent }
  );
  await grid.updateComplete;
  await nextFrame();
  await waitUntil(() => grid.rows.length > 0, 'body rows never rendered');
  return grid;
}

describe('applyEdits (batch editing)', () => {
  afterEach(() => fixtureCleanup());

  it('writes every cell and reports what happened', async () => {
    const grid = await mount();
    const tally = grid.applyEdits([
      { rowIndex: 0, column: 'name', value: 'A' },
      { rowIndex: 1, column: 'name', value: 'B' },
      { rowIndex: 2, column: 'amount', value: 999 },
    ]);
    await grid.updateComplete;

    expect(tally.applied).to.equal(3);
    expect(grid.pageItems[0].name).to.equal('A');
    expect(grid.pageItems[1].name).to.equal('B');
    expect(grid.pageItems[2].amount).to.equal(999);
  });

  it('lands as one undo step, not one per cell', async () => {
    const grid = await mount();
    grid.applyEdits([
      { rowIndex: 0, column: 'name', value: 'A' },
      { rowIndex: 1, column: 'name', value: 'B' },
      { rowIndex: 2, column: 'name', value: 'C' },
    ]);
    await grid.updateComplete;
    expect(grid.canUndo).to.be.true;

    grid.undo();
    await grid.updateComplete;
    // A single undo must reverse all three, or the batch was not batched.
    expect(grid.pageItems[0].name).to.equal('Row 0');
    expect(grid.pageItems[1].name).to.equal('Row 1');
    expect(grid.pageItems[2].name).to.equal('Row 2');
    expect(grid.canUndo, 'nothing left to undo').to.be.false;
  });

  it('emits cellValueChanged per changed cell', async () => {
    const grid = await mount();
    const changed: string[] = [];
    grid.addEventListener('cellValueChanged', (event) => {
      changed.push(String((event as CustomEvent<ApexCellValueChangedEvent<Row>>).detail.key));
    });

    grid.applyEdits([
      { rowIndex: 0, column: 'name', value: 'A' },
      { rowIndex: 1, column: 'amount', value: 5 },
    ]);
    await grid.updateComplete;
    expect(changed).to.eql(['name', 'amount']);
  });

  it('honours a cancelling cellValueChanging listener', async () => {
    const grid = await mount();
    grid.addEventListener('cellValueChanging', (event) => event.preventDefault());

    const tally = grid.applyEdits([{ rowIndex: 0, column: 'name', value: 'A' }]);
    await grid.updateComplete;
    expect(tally.cancelled).to.equal(1);
    expect(tally.applied).to.equal(0);
    expect(grid.pageItems[0].name, 'value untouched').to.equal('Row 0');
  });

  it('runs column validators and reports the rejects separately', async () => {
    const grid = await mount();
    const tally = grid.applyEdits([
      { rowIndex: 0, column: 'amount', value: 50 },
      { rowIndex: 1, column: 'amount', value: -1 },
    ]);
    await grid.updateComplete;

    expect(tally.applied).to.equal(1);
    expect(tally.invalid).to.equal(1);
    expect(grid.pageItems[0].amount).to.equal(50);
    expect(grid.pageItems[1].amount, 'invalid value not written').to.equal(10);
  });

  it('skips what a user could not edit either, without throwing', async () => {
    const grid = await mount();
    const tally = grid.applyEdits([
      { rowIndex: 0, column: 'locked', value: 'y' },
      { rowIndex: 99, column: 'name', value: 'nope' },
      { rowIndex: -1, column: 'name', value: 'nope' },
    ]);
    await grid.updateComplete;

    expect(tally.skipped).to.equal(3);
    expect(tally.applied).to.equal(0);
    expect(grid.pageItems[0].locked, 'non-editable column untouched').to.equal('x');
  });

  it('counts a no-op write as unchanged rather than applied', async () => {
    const grid = await mount();
    const tally = grid.applyEdits([{ rowIndex: 0, column: 'name', value: 'Row 0' }]);
    expect(tally.unchanged).to.equal(1);
    expect(tally.applied).to.equal(0);
  });

  it('lets a later edit to the same cell win', async () => {
    const grid = await mount();
    grid.applyEdits([
      { rowIndex: 0, column: 'name', value: 'first' },
      { rowIndex: 0, column: 'name', value: 'second' },
    ]);
    await grid.updateComplete;
    expect(grid.pageItems[0].name).to.equal('second');
  });

  it('is a no-op for an empty batch', async () => {
    const grid = await mount();
    const tally = grid.applyEdits([]);
    expect(tally).to.eql({ applied: 0, unchanged: 0, invalid: 0, cancelled: 0, skipped: 0 });
    expect(grid.canUndo, 'no history entry for an empty batch').to.be.false;
  });
});
