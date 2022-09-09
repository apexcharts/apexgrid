import { elementUpdated, fixture, fixtureCleanup, html, waitUntil } from '@open-wc/testing';
import GridHeaderRow from '../../src/components/header-row.js';
import GridRow from '../../src/components/row.js';
import type { ColumnConfig, Keys } from '../../src/internal/types';
import type { SortExpression } from '../../src/operations/sort/types';
import type Grid from '../../src/components/grid';
import '../../src/index.js';
import HeaderTestFixture from './header-fixture.js';
import RowTestFixture from './row-fixture.js';
import CellTestFixture from './cell-fixture.js';

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
  public grid!: Grid<T>;
  public columnConfig: ColumnConfig<T>[];

  constructor(protected data: T[], protected parentStyle?: Partial<CSSStyleDeclaration>) {
    this.columnConfig = Object.keys(data.at(0)!).map(key => ({ key } as ColumnConfig<T>));
  }

  public updateConfig() {}

  public async setUp() {
    const parentNode = document.createElement('div');
    this.parentStyle
      ? Object.assign(parentNode.style, this.parentStyle)
      : Object.assign(parentNode.style, { height: '800px' });

    this.updateConfig();

    this.grid = await fixture(
      html`<igc-grid
        .data=${this.data}
        .columns=${this.columnConfig}
      ></igc-grid>`,
      { parentNode },
    );

    // TODO: Still not good but better than arbitrary condition
    await waitUntil(() => this.gridBody.querySelector(GridRow.is));
  }

  public tearDown() {
    return fixtureCleanup();
  }

  public get gridBody() {
    // @ts-expect-error - Protected member access
    return this.grid.bodyElement;
  }

  public get dataState() {
    // @ts-expect-error - Protected member access
    return this.grid.dataState;
  }

  public get resizePart() {
    return this.grid.shadowRoot!.querySelector('[part~="resize-indicator"]') as HTMLElement;
  }

  public get headerRow() {
    return this.grid.shadowRoot!.querySelector(GridHeaderRow.is)! as unknown as GridHeaderRow<T>;
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
      get: id => this.getHeader(id),
    };
  }

  protected getRow(index: number) {
    return new RowTestFixture(this.grid.rows.at(index)!);
  }

  protected getHeader(id: Keys<T> | number) {
    return new HeaderTestFixture(
      typeof id === 'number'
        ? this.headerRow.headers.at(id)!
        : this.headerRow.headers.find(({ column }) => column.key === id)!,
    );
  }

  public async clickHeader(key: Keys<T>) {
    this.getHeader(key).click();
    await elementUpdated(this.grid);
  }

  public async startResizeHeader(key: Keys<T>) {
    this.getHeader(key).startResize();
    await elementUpdated(this.grid);
  }

  public async stopResizeHeader(key: Keys<T>) {
    this.getHeader(key).stopResize();
    await elementUpdated(this.grid);
  }

  public async resizeHeader(key: Keys<T>, x: number) {
    this.getHeader(key).resize(x);
    await elementUpdated(this.grid);
  }

  public async autoSizeHeader(key: Keys<T>) {
    this.getHeader(key).autosize();
    await elementUpdated(this.grid);
  }

  public async clickCell(cell: CellTestFixture<T>) {
    cell.click();
    await elementUpdated(this.grid);
  }

  public async fireNavigationEvent(options?: KeyboardEventInit) {
    this.gridBody.dispatchEvent(
      new KeyboardEvent('keydown', Object.assign({ composed: true, bubbles: true }, options)),
    );
    await elementUpdated(this.grid);
  }

  public async updateColumn(key: Keys<T>, config: Partial<ColumnConfig<T>>) {
    this.grid.updateColumn(key, config);
    await elementUpdated(this.grid);
    return this;
  }

  public async sort(key: Keys<T>, config?: Partial<SortExpression<T>>) {
    this.grid.sort(key, config);
    await elementUpdated(this.grid);
    return this;
  }
}
