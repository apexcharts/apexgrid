import { elementUpdated, fixture, fixtureCleanup, html, nextFrame } from '@open-wc/testing';
import GridHeaderRow from '../../src/components/header-row.js';
import type { ColumnConfig, Keys } from '../../src/internal/types';
import type { SortExpression } from '../../src/operations/sort/types';
import type Grid from '../../src/components/grid';
import '../../src/index.js';
import HeaderTestFixture from './header-fixture.js';
import RowTestFixture from './row-fixture.js';

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

    await nextFrame();
    return nextFrame();
  }

  public tearDown() {
    return fixtureCleanup();
  }

  public get gridBody() {
    // @ts-expect-error - Protected member access
    return this.grid.bodyElement;
  }

  public get firstRow() {
    return this.getRow(0);
  }

  public get lastRow() {
    return this.getRow(-1);
  }

  public get dataState() {
    // @ts-expect-error - Protected member access
    return this.grid.dataState;
  }

  public get headerRow() {
    return this.grid.shadowRoot!.querySelector(GridHeaderRow.is)!;
  }

  public getRow(index: number) {
    return new RowTestFixture(this.grid.rows.at(index)!);
  }

  public getHeader(key: Keys<T>) {
    return new HeaderTestFixture(this.headerRow.headers.find(e => e.column.key === key)!);
  }

  public async clickHeader(key: Keys<T>) {
    this.getHeader(key).click();
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
