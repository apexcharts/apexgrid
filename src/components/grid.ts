import { html, TemplateResult } from 'lit';
import { customElement, eventOptions, property, query, queryAll, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { themes } from 'igniteui-webcomponents/theming/theming-decorator.js';
import { GRID_TAG } from '../internal/tags.js';
import { StateController } from '../controllers/state.js';
import { DataOperationsController } from '../controllers/data-operation.js';
import { ResizeController } from '../controllers/resize.js';
import { EventEmitterBase } from '../internal/mixins/event-emitter.js';
import { watch } from '../internal/watch.js';
import { DEFAULT_COLUMN_CONFIG, PIPELINE } from '../internal/constants.js';
import { registerGridIcons } from '../internal/icon-registry.js';
import { applyColumnWidths } from '../internal/utils.js';
import { default as bootstrap } from '../styles/grid/themes/light/grid.bootstrap-styles.js';
import { default as fluent } from '../styles/grid/themes/light/grid.fluent-styles.js';
import { default as indigo } from '../styles/grid/themes/light/grid.indigo-styles.js';
import { default as material } from '../styles/grid/themes/light/grid.material-styles.js';
import type { ColumnConfig, GridRemoteConfig, GridSortingConfig, Keys } from '../internal/types.js';
import type { SortExpression } from '../operations/sort/types.js';
import ApexGridBody from './grid-body.js';
import ApexGridHeaderRow from './header-row.js';
import ApexGridRow from './row.js';
import ApexGridCell from './cell.js';

// TODO: Subject to change as these are way too generic names
export interface ApexGridEventMap<T extends object> {
  sorting: CustomEvent<SortExpression<T>>;
  sorted: CustomEvent<SortExpression<T>>;
}
@themes({
  bootstrap,
  fluent,
  indigo,
  material,
})
@customElement(GRID_TAG)
export default class ApexGrid<T extends object> extends EventEmitterBase<ApexGridEventMap<T>> {
  public static get is() {
    return GRID_TAG;
  }
  public static override styles = bootstrap;

  protected resizeController = new ResizeController<T>(this);
  protected stateController = new StateController<T>(this);
  protected dataController = new DataOperationsController<T>(this);
  protected rowRenderer = <T>(data: T, index: number): TemplateResult => {
    return html`<apx-grid-row
      style=${styleMap(applyColumnWidths(this.columns))}
      .index=${index}
      .activeNode=${this.stateController.active}
      .data=${data}
      .columns=${this.columns}
    ></apx-grid-row>`;
  };

  @query(ApexGridBody.is)
  protected bodyElement!: ApexGridBody;

  @query(ApexGridHeaderRow.is)
  protected headerRow!: ApexGridHeaderRow<T>;

  @state()
  protected dataState: Array<T> = [];

  @queryAll(ApexGridRow.is)
  protected _rows!: NodeListOf<ApexGridRow<T>>;

  @property({ attribute: false })
  public columns: Array<ColumnConfig<T>> = [];

  @property({ attribute: false })
  public data: Array<T> = [];

  @property({ attribute: false })
  public sortingConfig: GridSortingConfig = {
    multiple: true,
    triState: true,
  };

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
  }

  @watch('columns')
  protected watchColumns(_: ColumnConfig<T>[], newConfig: ColumnConfig<T>[] = []) {
    this.columns = newConfig.map(config => ({ ...DEFAULT_COLUMN_CONFIG, ...config }));
  }

  public sort(key: Keys<T>, config?: Partial<SortExpression<T>>) {
    this.stateController.sorting.sort(key, config as SortExpression<T>);
  }

  public getColumn(id: Keys<T> | number) {
    return typeof id === 'number'
      ? this.columns.at(id)
      : this.columns.find(({ key }) => key === id);
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
    const target = event.composedPath().find(el => el instanceof ApexGridCell) as ApexGridCell<T>;
    if (target) {
      this.stateController.active = {
        column: target.column.key,
        row: target.row.index,
      };
    }
  }

  protected bodyKeydownHandler(event: KeyboardEvent) {
    const target = event.target as HTMLElement & ApexGridBody;
    if (this.bodyElement.isSameNode(target)) {
      this.stateController.navigation.navigate(event, this.bodyElement);
    }
  }

  protected renderHeaderRow() {
    return html`<apx-grid-header-row
      style=${styleMap(applyColumnWidths(this.columns))}
      .columns=${this.columns}
      .state=${this.stateController}
    ></apx-grid-header-row>`;
  }

  protected renderBody() {
    return html`<apx-grid-body
      @keydown=${this.bodyKeydownHandler}
      @click=${this.bodyClickHandler}
      .items=${this.dataState}
      .renderItem=${this.rowRenderer}
    ></apx-grid-body>`;
  }

  protected override render() {
    return html`
      ${this.stateController.filtering.renderFilterRow(this.headerRow)}
      ${this.resizeController.renderIndicator()} ${this.renderHeaderRow()} ${this.renderBody()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexGrid.is]: ApexGrid<object>;
  }
}
