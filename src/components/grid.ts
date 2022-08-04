import { html, LitElement, TemplateResult } from 'lit';
import { customElement, eventOptions, property, query, queryAll, state } from 'lit/decorators.js';
import { ColumnType } from '../internal/types.js';
import styles from '../styles/grid-styles.js';

import './header-row.js';
import './grid-body.js';
import './row.js';
import GridCell from './cell.js';
import type GridBody from './grid-body';
import { StateController } from '../controllers/state.js';
import { DataOperationsController } from '../controllers/data-operation.js';
import type GridRow from './row.js';
import { watch } from '../internal/watch.js';
import { PIPELINE } from '../internal/constants.js';
import type GridHeaderRow from './header-row.js';

@customElement('igc-grid')
export class Grid<T extends object> extends LitElement {
  public static override styles = styles;

  protected stateController = new StateController<T>(this);
  protected dataController = new DataOperationsController<T>(this);

  @query('igc-grid-body')
  protected bodyElement!: GridBody;

  @query('igc-grid-header-row')
  protected headerRow!: GridHeaderRow<T>;

  @state()
  protected dataState: Array<T> = [];

  @property({ attribute: false })
  public columns: Array<ColumnType<T>> = [];

  @property({ attribute: false })
  public data: Array<T> = [];

  @queryAll('igc-grid-row')
  public rows!: Array<GridRow<T>>;

  public get totalItems() {
    return this.dataState.length;
  }

  constructor() {
    super();
    this.addEventListener('headerSortClicked', (e: any) => {
      e.stopPropagation();
      this.stateController.sorting.sort(e.detail.key);
    });
  }

  @watch(PIPELINE, { waitUntilFirstUpdate: true })
  @watch('data')
  protected pipeline() {
    this.dataState = this.dataController.apply(structuredClone(this.data), this.stateController);
    this.headerRow?.requestUpdate();
  }

  @eventOptions({ capture: true })
  protected bodyClickHandler(event: MouseEvent) {
    const target = event.composedPath().find(el => el instanceof GridCell) as GridCell<T>;
    if (target) {
      this.stateController.active = {
        column: target.column.key,
        row: target.row.index,
      };
    }
  }

  protected bodyKeydownHandler(event: KeyboardEvent) {
    const target = event.target as HTMLElement & GridBody;
    if (this.bodyElement.isSameNode(target)) {
      this.stateController.navigation.navigate(event, this.bodyElement);
    }
  }

  protected renderHeaderRow() {
    return html`<igc-grid-header-row
      .columns=${this.columns}
      .state=${this.stateController}
    ></igc-grid-header-row>`;
  }

  protected renderBody() {
    return html`<igc-grid-body
      style="height: 100%"
      @keydown=${this.bodyKeydownHandler}
      @click=${this.bodyClickHandler}
      .items=${this.dataState}
      .renderItem=${(data: T, index: number): TemplateResult => html`<igc-grid-row
        .index=${index}
        .activeNode=${this.stateController.active}
        .data=${data}
        .columns=${this.columns}
      ></igc-grid-row>`}
    ></igc-grid-body>`;
  }

  protected override render() {
    return html`${this.renderHeaderRow()}${this.renderBody()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-grid': Grid<object>;
  }
}
