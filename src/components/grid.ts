import { html, nothing, PropertyDeclaration, TemplateResult } from 'lit';
import { ContextProvider } from '@lit-labs/context';
import { customElement, eventOptions, property, query, queryAll, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { GRID_TAG } from '../internal/tags.js';
import { StateController, gridStateContext } from '../controllers/state.js';
import { DataOperationsController } from '../controllers/data-operation.js';
import { GridDOMController } from '../controllers/dom.js';
import { EventEmitterBase } from '../internal/mixins/event-emitter.js';
import { watch } from '../internal/watch.js';
import { DEFAULT_COLUMN_CONFIG, PIPELINE } from '../internal/constants.js';
import { registerGridIcons } from '../internal/icon-registry.js';
import { asArray, getFilterOperandsFor } from '../internal/utils.js';

import type {
  ColumnConfiguration,
  GridRemoteConfig,
  GridSortConfiguration,
  Keys,
} from '../internal/types.js';
import type { FilterExpressionTree } from '../operations/filter/tree.js';
import type { FilterExpression } from '../operations/filter/types.js';
import type { SortExpression } from '../operations/sort/types.js';

import { default as bootstrap } from '../styles/grid/themes/light/grid.bootstrap-styles.js';
import { default as fluent } from '../styles/grid/themes/light/grid.fluent-styles.js';
import { default as indigo } from '../styles/grid/themes/light/grid.indigo-styles.js';
import { default as material } from '../styles/grid/themes/light/grid.material-styles.js';

import ApexGridBody from './grid-body.js';
import ApexGridHeaderRow from './header-row.js';
import ApexGridRow from './row.js';
import ApexGridCell from './cell.js';
import ApexFilterRow from './filter-row.js';

import { themes } from 'igniteui-webcomponents/theming/theming-decorator.js';
import {
  defineComponents,
  IgcButtonComponent,
  IgcChipComponent,
  IgcDropdownComponent,
  IgcInputComponent,
  IgcIconComponent,
  IgcDropdownItemComponent,
} from 'igniteui-webcomponents';

defineComponents(
  IgcButtonComponent,
  IgcChipComponent,
  IgcInputComponent,
  IgcDropdownComponent,
  IgcIconComponent,
  IgcDropdownItemComponent,
);

/**
 * Event object for the filtering event of the grid.
 */
export interface ApexFilteringEvent<T extends object> {
  /**
   * The filter expression to apply.
   */
  expression: FilterExpression<T>;
  /**
   * The filter state of the column.
   */
  state: FilterExpressionTree<T>;
}

// TODO: Subject to change as these are way too generic names
/**
 * Events for the apex-grid.
 */
export interface ApexGridEventMap<T extends object> {
  /**
   * Fired when sorting is initiated through the UI.
   * Returns the sort expression which will be used for the operation.
   *
   * @remark
   * The event is cancellable which prevents the operation from being applied.
   * The expression can be modified prior to the operation running.
   *
   * @event
   */
  sorting: CustomEvent<SortExpression<T>>;
  /**
   * Fired when a sort operation initiated through the UI has completed.
   * Returns the sort expression used for the operation.
   *
   * @event
   */
  sorted: CustomEvent<SortExpression<T>>;
  /**
   * Fired when filtering is initiated through the UI.
   *
   * @remark
   * The event is cancellable which prevents the operation from being applied.
   * The expression can be modified prior to the operation running.
   *
   * @event
   */
  filtering: CustomEvent<ApexFilteringEvent<T>>;
  /**
   * Fired when a filter operation initiated through the UI has completed.
   * Returns the filter state for the affected column.
   *
   * @event
   */
  filtered: CustomEvent<FilterExpressionTree<T>>;
}

/**
 *
 *
 */
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

  protected stateController = new StateController<T>(this);
  protected DOM = new GridDOMController<T>(this, this.stateController);
  protected dataController = new DataOperationsController<T>(this);

  protected rowRenderer = <T>(data: T, index: number): TemplateResult => {
    return html`<apex-grid-row
      part="row"
      style=${styleMap({ ...this.DOM.columnSizes, ...this.DOM.getActiveRowStyles(index) })}
      .index=${index}
      .activeNode=${this.stateController.active}
      .data=${data}
      .columns=${this.columns}
    ></apex-grid-row>`;
  };

  protected stateProvider = new ContextProvider(this, gridStateContext, this.stateController);

  @query(ApexGridBody.is)
  protected bodyElement!: ApexGridBody;

  @query(ApexGridHeaderRow.is)
  protected headerRow!: ApexGridHeaderRow<T>;

  @query(ApexFilterRow.is)
  protected filterRow!: ApexFilterRow<T>;

  @state()
  protected dataState: Array<T> = [];

  @queryAll(ApexGridRow.is)
  protected _rows!: NodeListOf<ApexGridRow<T>>;

  /** Column configuration for the grid. */
  @property({ attribute: false })
  public columns: Array<ColumnConfiguration<T>> = [];

  /** The data source for the grid. */
  @property({ attribute: false })
  public data: Array<T> = [];

  /** Sort configuration for the grid. */
  @property({ attribute: false })
  public sortConfiguration: GridSortConfiguration = {
    multiple: true,
    triState: true,
  };

  @property({ attribute: false })
  public remoteConfiguration?: GridRemoteConfig<T>;

  @property({ attribute: false })
  public sortExpressions: SortExpression<T>[] = [];

  @property({ attribute: false })
  public filterExpressions: FilterExpression<T>[] = [];

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

  public override requestUpdate(
    name?: PropertyKey,
    oldValue?: unknown,
    options?: PropertyDeclaration<this, unknown>,
  ): void {
    this.headerRow?.requestUpdate();
    this.filterRow?.requestUpdate();
    super.requestUpdate(name, oldValue, options);
  }

  @watch('sortExpressions')
  protected watchSortExpressions() {
    if (this.sortExpressions.length) {
      this.sort(this.sortExpressions);
    }
  }

  @watch('filterExpressions')
  protected watchFilterExpressions() {
    if (this.filterExpressions.length) {
      this.filter(this.filterExpressions);
    }
  }

  @watch('columns')
  protected watchColumns(_: ColumnConfiguration<T>[], newConfig: ColumnConfiguration<T>[] = []) {
    this.columns = newConfig.map(config => ({ ...DEFAULT_COLUMN_CONFIG, ...config }));
  }

  @watch('data')
  protected dataChanged() {
    this.dataState = structuredClone(this.data);
    if (this.hasUpdated) {
      this.pipeline();
    }
  }

  @watch(PIPELINE)
  protected async pipeline() {
    this.dataState = await this.dataController.apply(
      structuredClone(this.data),
      this.stateController,
    );
  }

  public filter(config: FilterExpression<T> | FilterExpression<T>[]) {
    this.stateController.filtering.filter(
      asArray(config).map(each =>
        typeof each.condition === 'string'
          ? Object.assign(each, {
              condition: getFilterOperandsFor(this.getColumn(each.key)!).get(each.condition as any),
            })
          : each,
      ),
    );
  }

  /**
   * Performs a sort operation in the grid based on the passed expression(s).
   */
  public sort(expressions: Partial<SortExpression<T>> | Partial<SortExpression<T>>[]) {
    this.stateController.sorting.sort(expressions as SortExpression<T>[]);
  }

  public getColumn(id: Keys<T> | number) {
    return typeof id === 'number'
      ? this.columns.at(id)
      : this.columns.find(({ key }) => key === id);
  }

  public updateColumn(key: Keys<T>, config: Partial<ColumnConfiguration<T>>) {
    // Check and reset data operation states
    // TODO: Run `pipeline` updates ?
    if (!config.sort) {
      this.stateController.sorting.reset(key);
    }

    if (!config.filter) {
      this.stateController.filtering.reset(key);
    }

    this.columns = this.columns.map(each => {
      if (key === each.key) {
        each = { ...each, ...config };
      }
      return each;
    });

    this.requestUpdate();
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
    return html`<apex-grid-header-row
      style=${styleMap(this.DOM.columnSizes)}
      .columns=${this.columns}
    ></apex-grid-header-row>`;
  }

  protected renderBody() {
    return html`<apex-grid-body
      @keydown=${this.bodyKeydownHandler}
      @click=${this.bodyClickHandler}
      .items=${this.dataState}
      .renderItem=${this.rowRenderer}
    ></apex-grid-body>`;
  }

  protected renderFilterRow() {
    return this.columns.some(column => column.filter)
      ? html`<apex-filter-row style=${styleMap(this.DOM.columnSizes)}></apex-filter-row>`
      : nothing;
  }

  protected override render() {
    return html`${this.stateController.resizing.renderIndicator()}${this.renderHeaderRow()}${this.renderFilterRow()}${this.renderBody()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexGrid.is]: ApexGrid<object>;
  }
}
