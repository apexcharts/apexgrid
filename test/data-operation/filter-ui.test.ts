import { assert, elementUpdated } from '@open-wc/testing';
import sinon from 'sinon';
import { StringOperands } from '../../src/operations/filter/operands/string.js';
import { NumberOperands } from '../../src/operations/filter/operands/number.js';
import GridTestFixture from '../utils/grid-fixture.js';
import data, { TestData } from '../utils/test-data.js';

import type { Keys } from '../../src/internal/types.js';
import type { FilterExpression, OperandKeys } from '../../src/operations/filter/types.js';

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

  public get activeChips() {
    return this.filterRow.activeStateChips;
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

  public async commitInput() {
    this.filterRow.commitInput();
    await elementUpdated(this.grid);
  }

  public async resetInput() {
    this.filterRow.resetInput();
    await elementUpdated(this.grid);
  }

  public async changeFilterCondition(name: OperandKeys<T[keyof T]>) {
    this.filterRow.openDropdown();
    await elementUpdated(this.grid);
    this.filterRow.selectDropdownCondition(name);
    await elementUpdated(this.grid);
  }

  public async toggleCriteria(element: HTMLElement) {
    element.click();
    await elementUpdated(this.grid);
  }

  public async selectChip(chip: HTMLElement) {
    (chip.shadowRoot!.querySelector('[part="base"]') as HTMLElement).click();
    await elementUpdated(this.grid);
  }

  public async removeChip(chip: HTMLElement) {
    (chip.shadowRoot!.querySelector('slot[name="remove"]') as HTMLElement).click();
    await elementUpdated(this.grid);
  }

  public assertHasHeaderFilterStyle(name: Keys<T>) {
    assert.isTrue(this.headers.get(name).hasFilterStyle);
  }

  public assertDoesNotHaveHeaderFilterStyle(name: Keys<T>) {
    assert.isFalse(this.headers.get(name).hasFilterStyle);
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

      await TDD.updateColumns({ key: 'name', filter: false });
      assert.strictEqual(TDD.filterableColumns.length, TDD.filterRow.inactiveStateChips.length);

      await TDD.updateColumns({ key: 'name', filter: true });
      assert.strictEqual(TDD.filterableColumns.length, TDD.filterRow.inactiveStateChips.length);
    });

    test('Default state when clicking on a filter chip', async () => {
      await TDD.activateFilterRow('name');

      TDD.assertActiveFilterRowState();
      TDD.assertHasHeaderFilterStyle('name');
    });

    test('Default state when exiting from active filter row state', async () => {
      await TDD.activateFilterRow('name');
      await TDD.closeFilterRow();

      TDD.assertInactiveFilterRowState();
      TDD.assertDoesNotHaveHeaderFilterStyle('name');
    });

    test('Correctly changes header style for active column', async () => {
      await TDD.activateFilterRow('name');

      TDD.assertHasHeaderFilterStyle('name');

      await TDD.clickHeader('id');

      TDD.assertActiveFilterRowState();
      TDD.assertDoesNotHaveHeaderFilterStyle('name');
      TDD.assertHasHeaderFilterStyle('id');
    });

    test('Does not change header style when clicking on a non-filterable column', async () => {
      await TDD.updateColumns({ key: 'active', filter: false });
      await TDD.activateFilterRow('name');
      await TDD.clickHeader('active');

      TDD.assertActiveFilterRowState();
      TDD.assertHasHeaderFilterStyle('name');
      TDD.assertDoesNotHaveHeaderFilterStyle('active');
    });
  });

  suite('Default UI inactive state', () => {});

  suite('Default UI filtering', () => {
    test('Chip state on input', async () => {
      await TDD.activateFilterRow('name');
      await TDD.filterByInput('a');

      assert.strictEqual(TDD.activeChips.length, 1);
      assert.strictEqual(TDD.activeChips.at(0)?.textContent?.trim(), 'a');

      await TDD.filterByInput('');

      assert.strictEqual(TDD.activeChips.length, 0);
    });

    test('State on Enter keypress', async () => {
      await TDD.activateFilterRow('name');
      await TDD.filterByInput('a');
      await TDD.commitInput();

      assert.strictEqual(TDD.activeChips.length, 1);
      assert.strictEqual(TDD.grid.totalItems, 2);
      assert.isTrue(TDD.filterRow.active);
    });

    test('State on Escape keypress', async () => {
      await TDD.activateFilterRow('name');
      await TDD.filterByInput('a');
      await TDD.resetInput();

      assert.strictEqual(TDD.activeChips.length, 0);
      assert.strictEqual(TDD.grid.totalItems, 2);
      assert.isFalse(TDD.filterRow.active);
    });

    test('State on Reset button', async () => {
      await TDD.activateFilterRow('name');
      await TDD.filterByInput('a');
      await TDD.commitInput();

      assert.strictEqual(TDD.activeChips.length, 1);
      assert.strictEqual(TDD.grid.totalItems, 2);

      await TDD.resetFilterRow();

      assert.strictEqual(TDD.activeChips.length, 0);
      assert.notStrictEqual(TDD.grid.totalItems, 2);
    });

    test('Chip interactions', async () => {
      await TDD.activateFilterRow('name');
      await TDD.filterByInput('a');
      await TDD.commitInput();
      await TDD.filterByInput('b');
      await TDD.commitInput();

      await TDD.selectChip(TDD.activeChips.at(0)!);

      assert.isTrue(TDD.activeChips.at(0)!.hasAttribute('selected'));
      assert.strictEqual(TDD.filterRow.input.value, TDD.activeChips.at(0)!.textContent?.trim());

      await TDD.removeChip(TDD.activeChips.at(-1)!);

      assert.strictEqual(TDD.activeChips.length, 1);
    });

    test('Condition changed', async () => {
      await TDD.activateFilterRow('importance');
      await TDD.filterByInput('l');

      assert.strictEqual(TDD.grid.totalItems, 3);

      await TDD.changeFilterCondition('endsWith');
      assert.strictEqual(TDD.grid.totalItems, 0);

      await TDD.changeFilterCondition('startsWith');
      assert.strictEqual(TDD.grid.totalItems, 3);
    });

    test('Criteria changed', async () => {
      await TDD.activateFilterRow('importance');
      await TDD.changeFilterCondition('startsWith');

      await TDD.filterByInput('l');
      await TDD.commitInput();
      await TDD.filterByInput('h');
      await TDD.commitInput();

      assert.strictEqual(TDD.grid.totalItems, 0);

      await TDD.toggleCriteria(TDD.filterRow.activeCriteriaButtons.at(0)!);

      assert.strictEqual(TDD.grid.totalItems, 5);
    });

    test('String column, single filter [case insensitive]', async () => {
      await TDD.activateFilterRow('name');
      await TDD.filterByInput('a');

      assert.strictEqual(TDD.grid.totalItems, 2);

      await TDD.filterByInput('A');

      assert.strictEqual(TDD.grid.totalItems, 2);
    });

    test('String column, single filter [case sensitive]', async () => {
      await TDD.updateColumns({ key: 'name', filter: { caseSensitive: true } });
      await TDD.activateFilterRow('name');
      await TDD.filterByInput('a');

      assert.strictEqual(TDD.grid.totalItems, 1);
      assert.strictEqual(TDD.rows.first.data.name, 'a');

      await TDD.filterByInput('A');

      assert.strictEqual(TDD.grid.totalItems, 1);
      assert.strictEqual(TDD.rows.first.data.name, 'A');
    });

    test('Number column, single filter [correct type]', async () => {
      await TDD.updateColumns({ key: 'id', type: 'number' });

      await TDD.activateFilterRow('id');
      await TDD.filterByInput('3');

      assert.strictEqual(TDD.grid.totalItems, 1);
    });

    test('String column, multiple filters [AND]', async () => {
      await TDD.activateFilterRow('importance');
      await TDD.filterByInput('l');
      await TDD.commitInput();
      await TDD.filterByInput('h');
      await TDD.commitInput();

      assert.strictEqual(TDD.grid.totalItems, 0);
    });

    test('String column, multiple filters [OR]', async () => {
      await TDD.activateFilterRow('importance');
      await TDD.filterByInput('l');
      await TDD.commitInput();
      await TDD.filterByInput('h');
      await TDD.commitInput();

      await TDD.toggleCriteria(TDD.filterRow.activeCriteriaButtons.at(0)!);
      assert.strictEqual(TDD.grid.totalItems, 5);
    });
  });

  suite('Events', () => {
    test('Event sequence', async () => {
      const spy = sinon.spy(TDD.grid, 'emitEvent');

      await TDD.activateFilterRow('name');
      await TDD.filterByInput('a');

      assert.strictEqual(spy.callCount, 2);

      const [filtering, filtered] = [spy.firstCall, spy.secondCall];

      assert.strictEqual(filtering.firstArg, 'filtering');
      assert.strictEqual(filtered.firstArg, 'filtered');
    });

    test('Cancellable events', async () => {
      const spy = sinon.spy(TDD.grid, 'emitEvent');

      TDD.grid.addEventListener('filtering', e => e.preventDefault());

      await TDD.activateFilterRow('name');
      await TDD.filterByInput('a');

      assert.strictEqual(spy.callCount, 1);

      // No filter operation
      assert.strictEqual(TDD.grid.totalItems, 8);
    });

    test('Modify event arguments mid-flight', async () => {
      const spy = sinon.spy(TDD.grid, 'emitEvent');

      const expression: FilterExpression<TestData> = {
        key: 'id',
        condition: NumberOperands.greaterThan,
        searchTerm: 7,
      };

      TDD.grid.addEventListener('filtering', e =>
        Object.assign(e.detail.expressions[0], expression),
      );

      await TDD.activateFilterRow('name');
      await TDD.filterByInput('a');

      const eventData = spy.firstCall.lastArg.detail;
      assert.strictEqual(eventData.expressions[0].key, 'id');
      assert.strictEqual(eventData.expressions[0].searchTerm, 7);
      assert.strictEqual(eventData.expressions[0].condition.name, 'greaterThan');

      assert.strictEqual(TDD.grid.totalItems, 1);
      assert.strictEqual(TDD.rows.first.data.id, 8);
    });
  });

  suite('API', () => {
    test('Honors column configuration parameters', async () => {
      await TDD.updateColumns({ key: 'name', filter: { caseSensitive: true } });
      await TDD.filter({ key: 'name', condition: 'contains', searchTerm: 'D' });

      assert.strictEqual(TDD.grid.totalItems, 1);
    });

    test('Honors overwriting column configuration parameters', async () => {
      await TDD.updateColumns({ key: 'name', filter: { caseSensitive: true } });
      await TDD.filter({
        key: 'name',
        condition: 'contains',
        searchTerm: 'D',
        caseSensitive: false,
      });

      assert.strictEqual(TDD.grid.totalItems, 2);
    });

    test('Use of an operand param', async () => {
      await TDD.filter({ key: 'name', condition: StringOperands.contains, searchTerm: 'b' });

      assert.strictEqual(TDD.grid.totalItems, 2);
    });

    test('Single expression (single column)', async () => {
      await TDD.filter({ key: 'name', condition: 'contains', searchTerm: 'a' });

      assert.strictEqual(TDD.grid.totalItems, 2);
    });

    test('Single expression (multiple columns)', async () => {
      await TDD.updateColumns({ key: 'id', type: 'number' });
      await TDD.filter([
        { key: 'id', condition: 'greaterThan', searchTerm: 4 },
        { key: 'importance', condition: 'startsWith', searchTerm: 'medium' },
      ]);

      assert.strictEqual(TDD.grid.totalItems, 1);
    });

    test('Multiple expressions (single column)', async () => {
      await TDD.updateColumns({ key: 'id', type: 'number' });
      await TDD.filter([
        { key: 'id', condition: 'greaterThan', searchTerm: 4 },
        { key: 'id', condition: 'lessThan', searchTerm: 6 },
      ]);

      assert.strictEqual(TDD.grid.totalItems, 1);
    });

    test('Multiple expressions (multiple columns)', async () => {
      await TDD.updateColumns({ key: 'id', type: 'number' });

      await TDD.filter([
        { key: 'id', condition: 'greaterThan', searchTerm: 1 },
        { key: 'id', condition: 'lessThan', searchTerm: 5 },
        { key: 'name', condition: StringOperands.contains, searchTerm: 'b' },
        { key: 'name', condition: StringOperands.endsWith, searchTerm: 'd', criteria: 'or' },
      ]);

      assert.strictEqual(TDD.grid.totalItems, 2);
    });

    test('API clear state', async () => {
      await TDD.filter([{ key: 'name', condition: 'contains', searchTerm: 'a' }]);
      assert.strictEqual(TDD.grid.totalItems, 2);

      await TDD.clearFilter();
      assert.strictEqual(TDD.grid.totalItems, data.length);
    });

    test('API clear state (by key)', async () => {
      await TDD.updateColumns({ key: 'active', type: 'boolean' });
      await TDD.filter([
        { key: 'name', condition: 'contains', searchTerm: 'a' },
        { key: 'name', condition: 'startsWith', searchTerm: 'a' },
        { key: 'active', condition: 'true' },
      ]);
      assert.strictEqual(TDD.grid.filterExpressions.length, 3);

      await TDD.clearFilter('name');
      assert.strictEqual(TDD.grid.filterExpressions.length, 1);
    });
  });
});
