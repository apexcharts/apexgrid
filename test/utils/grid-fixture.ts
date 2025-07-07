import { elementUpdated, fixture, fixtureCleanup, html, nextFrame } from '@open-wc/testing';
import { ApexGrid } from '../../src/components/grid.js';
import ApexGridHeaderRow from '../../src/components/header-row.js';
import type { ColumnConfiguration, Keys } from '../../src/internal/types.js';
import type { FilterExpression } from '../../src/operations/filter/types.js';
import type { SortExpression } from '../../src/operations/sort/types.js';
import type CellTestFixture from './cell-fixture.js';
import FilterRowFixture from './filter-row.fixture.js';
import HeaderTestFixture from './header-fixture.js';
import RowTestFixture from './row-fixture.js';

interface RowCollection<T extends object> {
  first: RowTestFixture<T>;
  last: RowTestFixture<T>;
  get: (id: number) => RowTestFixture<T>;
}

interface HeaderCollection<T extends object> {
  first: HeaderTestFixture<T>;
  last: HeaderTestFixture<T>;
  get: (id: Keys<T> | number) => HeaderTestFixture<T>;
}

export default class GridTestFixture<T extends object> {
  public grid!: ApexGrid<T>;
  public columnConfig: ColumnConfiguration<T>[];

  constructor(
    protected data: T[],
    protected parentStyle?: Partial<CSSStyleDeclaration>
  ) {
    this.columnConfig = Object.keys(data.at(0)!).map((key) => ({ key }) as ColumnConfiguration<T>);
  }

  protected async waitForUpdate() {
    await Promise.all([elementUpdated(this.grid), nextFrame]);
    await nextFrame();
  }

  public registerComponents() {
    ApexGrid.register();
  }

  public updateConfig() {}

  public setupParentNode(styles: Partial<CSSStyleDeclaration> = { height: '800px' }) {
    const parentNode = document.createElement('div');
    this.parentStyle
      ? Object.assign(parentNode.style, this.parentStyle)
      : Object.assign(parentNode.style, styles);
    return parentNode;
  }

  public setupTemplate() {
    return html`<apex-grid
      .data=${this.data}
      .columns=${this.columnConfig}
    ></apex-grid>`;
  }

  public async setUp() {
    this.registerComponents();
    this.updateConfig();

    this.grid = await fixture(this.setupTemplate(), { parentNode: this.setupParentNode() });
    await this.gridBody.layoutComplete;
  }

  public tearDown() {
    return fixtureCleanup();
  }

  public async updateProperty<K extends keyof ApexGrid<T>>(prop: K, value: ApexGrid<T>[K]) {
    Object.assign(this.grid, { [prop]: value });
    await this.waitForUpdate();
  }

  public get filterRow() {
    // @ts-expect-error - Protected member access
    return new FilterRowFixture(this.grid.filterRow);
  }

  public get gridBody() {
    // @ts-expect-error - Protected member access
    return this.grid.scrollContainer;
  }

  public get dataState() {
    // @ts-expect-error - Protected member access
    return this.grid.dataState;
  }

  public get resizePart() {
    return this.grid.renderRoot.querySelector('[part~="resize-indicator"]') as HTMLElement;
  }

  public get headerRow() {
    return this.grid.renderRoot.querySelector<ApexGridHeaderRow<T>>(ApexGridHeaderRow.tagName)!;
  }

  public get rows(): RowCollection<T> {
    return {
      first: this.getRow(0),
      last: this.getRow(-1),
      get: (id: number) => this.getRow(id),
    };
  }

  public get headers(): HeaderCollection<T> {
    return {
      first: this.getHeader(0),
      last: this.getHeader(-1),
      get: (id) => this.getHeader(id),
    };
  }

  protected getRow(index: number) {
    return new RowTestFixture(this.grid.rows.at(index)!);
  }

  protected getHeader(id: Keys<T> | number) {
    return new HeaderTestFixture(
      typeof id === 'number'
        ? this.headerRow.headers.at(id)!
        : this.headerRow.headers.find(({ column }) => column.key === id)!
    );
  }

  public async sortHeader(key: Keys<T>) {
    this.getHeader(key).sort();
    await this.waitForUpdate();
  }

  public async startResizeHeader(key: Keys<T>) {
    this.getHeader(key).startResize();
    await this.waitForUpdate();
  }

  public async stopResizeHeader(key: Keys<T>) {
    this.getHeader(key).stopResize();
    await this.waitForUpdate();
  }

  public async resizeHeader(key: Keys<T>, x: number) {
    this.getHeader(key).resize(x);
    await this.waitForUpdate();
  }

  public async autoSizeHeader(key: Keys<T>) {
    this.getHeader(key).autosize();
    await this.waitForUpdate();
  }

  public async clickCell(cell: CellTestFixture<T>) {
    cell.click();
    await this.waitForUpdate();
  }

  public async clickHeader(name: Keys<T>) {
    this.headers.get(name).element.click();
    await this.waitForUpdate();
  }

  public async fireNavigationEvent(options?: KeyboardEventInit) {
    this.gridBody.dispatchEvent(
      new KeyboardEvent('keydown', Object.assign({ composed: true, bubbles: true }, options))
    );
    await this.waitForUpdate();
  }

  public async updateColumns(columns: ColumnConfiguration<T> | ColumnConfiguration<T>[]) {
    this.grid.updateColumns(columns);
    await this.waitForUpdate();
    return this;
  }

  public async sort(config: SortExpression<T> | SortExpression<T>[]) {
    this.grid.sort(config);
    await this.waitForUpdate();
    return this;
  }

  public async filter(config: FilterExpression<T> | FilterExpression<T>[]) {
    this.grid.filter(config);
    await this.waitForUpdate();
    return this;
  }

  public async clearSort(key?: Keys<T>) {
    this.grid.clearSort(key);
    await this.waitForUpdate();
    return this;
  }

  public async clearFilter(key?: Keys<T>) {
    this.grid.clearFilter(key);
    await this.waitForUpdate();
    return this;
  }
}
