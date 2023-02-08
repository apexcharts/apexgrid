import { html, nothing } from 'lit';
import { ContextProvider } from '@lit-labs/context';
import { eventOptions, property, query, queryAll, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { GRID_TAG } from '../internal/tags.js';
import { StateController, gridStateContext } from '../controllers/state.js';
import { DataOperationsController } from '../controllers/data-operation.js';
import { GridDOMController } from '../controllers/dom.js';
import { EventEmitterBase } from '../internal/mixins/event-emitter.js';
import { watch } from '../internal/watch.js';
import { DEFAULT_COLUMN_CONFIG, PIPELINE } from '../internal/constants.js';
import { asArray, autoGenerateColumns, getFilterOperandsFor } from '../internal/utils.js';

import type {
  ColumnConfiguration,
  DataPipelineConfiguration,
  GridSortConfiguration,
  Keys,
} from '../internal/types.js';
import type { FilterExpression } from '../operations/filter/types.js';
import type { SortExpression } from '../operations/sort/types.js';

import { registerComponent } from '../internal/register.js';

import { styles as bootstrap } from '../styles/grid/themes/light/grid.bootstrap-styles.css.js';
import { styles as fluent } from '../styles/grid/themes/light/grid.fluent-styles.css.js';
import { styles as indigo } from '../styles/grid/themes/light/grid.indigo-styles.css.js';
import { styles as material } from '../styles/grid/themes/light/grid.material-styles.css.js';

import ApexVirtualizer from './virtualizer.js';
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
} from 'igniteui-webcomponents';

/**
 * Event object for the filtering event of the grid.
 */
export interface ApexFilteringEvent<T extends object> {
  /**
   * The target column for the filter operation.
   */
  key: Keys<T>;

  /**
   * The filter expression(s) to apply.
   */
  expressions: FilterExpression<T>[];

  /**
   * The type of modification which will be applied to the filter
   * state of the column.
   *
   * @remarks
   * `add` - a new filter expression will be added to the state of the column.
   * `modify` - an existing filter expression will be modified.
   * `remove` - the expression(s) will be removed from the state of the column.
   */
  type: 'add' | 'modify' | 'remove';
}

/**
 * Event object for the filtered event of the grid.
 */
export interface ApexFilteredEvent<T extends object> {
  /**
   * The target column for the filter operation.
   */
  key: Keys<T>;

  /**
   * The filter state of the column after the operation.
   */
  state: FilterExpression<T>[];
}

/**
 * Events for the apex-grid.
 */
export interface ApexGridEventMap<T extends object> {
  /**
   * Emitted when sorting is initiated through the UI.
   * Returns the sort expression which will be used for the operation.
   *
   * @remarks
   * The event is cancellable which prevents the operation from being applied.
   * The expression can be modified prior to the operation running.
   *
   * @event
   */
  sorting: CustomEvent<SortExpression<T>>;
  /**
   * Emitted when a sort operation initiated through the UI has completed.
   * Returns the sort expression used for the operation.
   *
   * @event
   */
  sorted: CustomEvent<SortExpression<T>>;
  /**
   * Emitted when filtering is initiated through the UI.
   *
   * @remarks
   * The event is cancellable which prevents the operation from being applied.
   * The expression can be modified prior to the operation running.
   *
   * @event
   */
  filtering: CustomEvent<ApexFilteringEvent<T>>;
  /**
   * Emitted when a filter operation initiated through the UI has completed.
   * Returns the filter state for the affected column.
   *
   * @event
   */
  filtered: CustomEvent<ApexFilteredEvent<T>>;
}

/**
 * Apex grid is a web component for displaying data in a tabular format quick and easy.
 *
 * Out of the box it provides row virtualization, sort and filter operations (client and server side),
 * the ability to template cells and headers and column hiding.
 *
 * @element apex-grid
 *
 * @fires sorting - Emitted when sorting is initiated through the UI.
 * @fires sorted - Emitted when a sort operation initiated through the UI has completed.
 * @fires filtering - Emitted when filtering is initiated through the UI.
 * @fires filtered - Emitted when a filter operation initiated through the UI has completed.
 *
 */
@themes({
  bootstrap,
  fluent,
  indigo,
  material,
})
export class ApexGrid<T extends object> extends EventEmitterBase<ApexGridEventMap<T>> {
  public static get is() {
    return GRID_TAG;
  }

  public static override styles = bootstrap;

  public static register() {
    registerComponent(this, [ApexVirtualizer, ApexGridRow, ApexGridHeaderRow, ApexFilterRow]);
    defineComponents(
      IgcButtonComponent,
      IgcChipComponent,
      IgcInputComponent,
      IgcDropdownComponent,
      IgcIconComponent,
    );
  }

  protected stateController = new StateController<T>(this);
  protected DOM = new GridDOMController<T>(this, this.stateController);
  protected dataController = new DataOperationsController<T>(this);

  protected stateProvider = new ContextProvider(this, gridStateContext, this.stateController);

  @query(ApexVirtualizer.is)
  protected scrollContainer!: ApexVirtualizer;

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

  /**
   * Whether the grid will try to "resolve" its column configuration based on the passed
   * data source.
   *
   * @remarks
   * This is usually executed on initial rendering in the DOM. It depends on having an existing data source
   * to infer the column configuration for the grid.
   * Passing an empty data source or having a late bound data source (such as a HTTP request) will usually
   * result in empty column configuration for the grid.
   *
   * This property is ignored if any existing column configuration already exists in the grid.
   *
   * In a scenario where you want to bind a new data source and still keep the auto-generation behavior,
   * make sure to reset the column collection of the grid before passing in the new data source.
   *
   * @example
   * ```typescript
   * // assuming autoGenerate is set to true
   * grid.columns = [];
   * grid.data = [...];
   * ```
   *
   * @attr auto-generate
   */
  @property({ type: Boolean, attribute: 'auto-generate' })
  public autoGenerate = false;

  /** Sort configuration property for the grid. */
  @property({ attribute: false })
  public sortConfiguration: GridSortConfiguration = {
    multiple: true,
    triState: true,
  };

  /**
   * Configuration object which controls remote data operations for the grid.
   */
  @property({ attribute: false })
  public dataPipelineConfiguration!: DataPipelineConfiguration<T>;

  /**
   * Set the sort state for the grid.
   */
  public set sortExpressions(expressions: SortExpression<T>[]) {
    if (expressions.length) {
      this.sort(expressions);
    }
  }

  /**
   * Get the sort state for the grid.
   */
  @property({ attribute: false })
  public get sortExpressions(): SortExpression<T>[] {
    return Array.from(this.stateController.sorting.state.values());
  }

  /**
   * Set the filter state for the grid.
   */
  public set filterExpressions(expressions: FilterExpression<T>[]) {
    if (expressions.length) {
      this.filter(expressions);
    }
  }

  /**
   * Get the filter state for the grid.
   */
  @property({ attribute: false })
  public get filterExpressions(): FilterExpression<T>[] {
    return this.stateController.filtering.state.values.reduce<FilterExpression<T>[]>(
      (prev, curr) => [...prev, ...curr.all],
      [],
    );
  }

  /**
   * Returns the collection of rendered row elements in the grid.
   *
   * @remarks
   * Since the grid has virtualization, this property returns only the currently rendered
   * chunk of elements in the DOM.
   */
  public get rows() {
    return Array.from(this._rows);
  }

  /**
   * Returns the state of the data source after sort/filter operations
   * have been applied.
   */
  public get dataView(): ReadonlyArray<T> {
    return this.dataState;
  }

  /**
   * The total number of items in the {@link ApexGrid.dataView} collection.
   */
  public get totalItems() {
    return this.dataState.length;
  }

  @watch('columns')
  protected watchColumns(_: ColumnConfiguration<T>[], newConfig: ColumnConfiguration<T>[] = []) {
    this.columns = newConfig.map(config => ({ ...DEFAULT_COLUMN_CONFIG, ...config }));
  }

  @watch('data')
  protected dataChanged() {
    this.dataState = structuredClone(this.data);
    autoGenerateColumns(this);

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

  /**
   * Performs a filter operation in the grid based on the passed expression(s).
   */
  public filter(config: FilterExpression<T> | FilterExpression<T>[]) {
    this.stateController.filtering.filter(
      asArray(config).map(each =>
        typeof each.condition === 'string'
          ? // XXX: Types
            Object.assign(each, {
              condition: (getFilterOperandsFor(this.getColumn(each.key)!) as any)[each.condition],
            })
          : each,
      ),
    );
  }

  /**
   * Performs a sort operation in the grid based on the passed expression(s).
   */
  public sort(expressions: SortExpression<T> | SortExpression<T>[]) {
    this.stateController.sorting.sort(expressions);
  }

  /**
   * Resets the current sort state of the control.
   */
  public clearSort(key?: Keys<T>) {
    this.stateController.sorting.reset(key);
    this.requestUpdate(PIPELINE);
  }

  /**
   * Resets the current filter state of the control.
   */
  public clearFilter(key?: Keys<T>) {
    this.stateController.filtering.reset(key);
    this.requestUpdate(PIPELINE);
  }

  /**
   * Returns a {@link ColumnConfiguration} for a given column.
   */
  public getColumn(id: Keys<T> | number) {
    return typeof id === 'number'
      ? this.columns.at(id)
      : this.columns.find(({ key }) => key === id);
  }

  /**
   * Updates the column configuration of the grid.
   */
  public updateColumns(columns: ColumnConfiguration<T> | ColumnConfiguration<T>[]) {
    asArray(columns).forEach(column => {
      const idx = this.columns.findIndex(original => original.key === column.key);
      this.columns[idx] = { ...this.columns[idx], ...column };
    });
    this.requestUpdate(PIPELINE);
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
    if (this.scrollContainer.isSameNode(event.target as HTMLElement)) {
      this.stateController.navigation.navigate(event);
    }
  }

  protected renderHeaderRow() {
    return html`<apex-grid-header-row
      style=${styleMap(this.DOM.columnSizes)}
      .columns=${this.columns}
    ></apex-grid-header-row>`;
  }

  protected renderBody() {
    return html`
      <apex-virtualizer
        .items=${this.dataState}
        .renderItem=${this.DOM.rowRenderer}
        @click=${this.bodyClickHandler}
        @keydown=${this.bodyKeydownHandler}
      ></apex-virtualizer>
    `;
  }

  protected renderFilterRow() {
    return this.columns.some(column => column.filter)
      ? html`<apex-filter-row style=${styleMap(this.DOM.columnSizes)}></apex-filter-row>`
      : nothing;
  }

  protected override render() {
    return html` ${this.stateController.resizing.renderIndicator()} ${this.renderHeaderRow()}
    ${this.renderFilterRow()} ${this.renderBody()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexGrid.is]: ApexGrid<object>;
  }
}
