import type GridCell from '../../src/components/cell';

export default class CellTestFixture<T extends object> {
  constructor(protected dom: GridCell<T>) {}

  public get value() {
    return this.dom.value;
  }
}
