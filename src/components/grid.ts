import { html, LitElement, nothing, TemplateResult } from 'lit';
import { customElement, eventOptions, property, query, queryAll, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { themes } from 'igniteui-webcomponents/theming/theming-decorator.js';
import { GRID_TAG } from '../internal/tags.js';
import { StateController } from '../controllers/state.js';
import { DataOperationsController } from '../controllers/data-operation.js';
import { ResizeController } from '../controllers/resize.js';
import { watch } from '../internal/watch.js';
import { PIPELINE } from '../internal/constants.js';
import { registerGridIcons } from '../internal/icon-registry.js';
import { applyColumnWidths } from '../internal/utils.js';
import { default as bootstrap } from '../styles/grid/themes/light/grid.bootstrap-styles.js';
import { default as fluent } from '../styles/grid/themes/light/grid.fluent-styles.js';
import { default as indigo } from '../styles/grid/themes/light/grid.indigo-styles.js';
import { default as material } from '../styles/grid/themes/light/grid.material-styles.js';
import type { ColumnConfig, GridRemoteConfig, Keys } from '../internal/types.js';
import type { SortExpression } from '../operations/sort/types.js';
import GridBody from './grid-body.js';
import GridHeaderRow from './header-row.js';
import GridRow from './row.js';
import GridCell from './cell.js';

@themes({
  bootstrap,
  fluent,
  indigo,
  material,
})
@customElement(GRID_TAG)
export default class Grid<T extends object> extends LitElement {
  public static get is() {
    return GRID_TAG;
  }
  public static override styles = bootstrap;

  protected resizeController = new ResizeController<T>(this);
  protected stateController = new StateController<T>(this);
  protected dataController = new DataOperationsController<T>(this);
  protected rowRenderer = <T>(data: T, index: number): TemplateResult => {
    return html`<igc-grid-row
      style=${styleMap(applyColumnWidths(this.columns))}
      .index=${index}
      .activeNode=${this.stateController.active}
      .data=${data}
      .columns=${this.columns}
    ></igc-grid-row>`;
  };

  @query(GridBody.is)
  protected bodyElement!: GridBody;

  @query(GridHeaderRow.is)
  protected headerRow!: GridHeaderRow<T>;

  @state()
  protected dataState: Array<T> = [];

  @queryAll(GridRow.is)
  protected _rows!: NodeListOf<GridRow<T>>;

  @property({ attribute: false })
  public columns: Array<ColumnConfig<T>> = [];

  @property({ attribute: false })
  public data: Array<T> = [];

  @property({ attribute: false })
  public remoteConfig?: GridRemoteConfig<T>;

  public get rows() {
    return Array.from(this._rows);
  }

  public get totalItems() {
    return this.dataState.length;
  }

  constructor() {
    super();
    registerGridIcons();
    this.addEventListener('headerSortClicked', (e: any) => {
      e.stopPropagation();
      this.stateController.sorting.sort(e.detail.key);
    });
  }

  public sort(key: Keys<T>, config?: Partial<SortExpression<T>>) {
    this.stateController.sorting.sort(key, config as SortExpression<T>);
  }

  public getColumn(id: Keys<T> | number) {
    if (typeof id === 'number') {
      return this.columns.at(id);
    }
    return this.columns.find(({ key }) => key === id);
  }

  public updateColumn(key: Keys<T>, config: Partial<ColumnConfig<T>>) {
    // Check and reset data operation states
    if (!config.sort) {
      this.stateController.sorting.reset(key);
    }
    this.columns = this.columns.map(each => {
      if (key === each.key) {
        each = { ...each, ...config };
      }
      return each;
    });
    this.requestUpdate(PIPELINE);
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
      style=${styleMap(applyColumnWidths(this.columns))}
      .columns=${this.columns}
      .state=${this.stateController}
    ></igc-grid-header-row>`;
  }

  protected renderBody() {
    return html`<igc-grid-body
      @keydown=${this.bodyKeydownHandler}
      @click=${this.bodyClickHandler}
      .items=${this.dataState}
      .renderItem=${this.rowRenderer}
    ></igc-grid-body>`;
  }

  protected renderResizeIndicator() {
    return this.resizeController.active
      ? html`<div
          part="resize-indicator"
          style=${styleMap({
            transform: `translateX(${this.resizeController.x}px)`,
          })}
        ></div>`
      : nothing;
  }

  protected override render() {
    return html`${this.renderResizeIndicator()}${this.renderHeaderRow()}${this.renderBody()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-grid': Grid<object>;
  }
}
