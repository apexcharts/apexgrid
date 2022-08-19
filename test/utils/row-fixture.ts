import type { Keys } from '../../src/internal/types';
import type GridRow from '../../src/components/row';
import CellTestFixture from './cell-fixture.js';

export default class RowTestFixture<T extends object> {
  constructor(protected dom: GridRow<T>) {}

  public get(key: Keys<T>) {
    return new CellTestFixture(Array.from(this.dom.cells).find(cell => cell.column.key === key)!);
  }

  public get data() {
    return this.dom.data;
  }
}
