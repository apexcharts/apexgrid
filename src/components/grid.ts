import { html, nothing, PropertyDeclaration, TemplateResult } from 'lit';
import { ContextProvider } from '@lit-labs/context';
import { customElement, eventOptions, property, query, queryAll, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { GRID_TAG } from '../internal/tags.js';
import { StateController, gridStateContext } from '../controllers/state.js';
import { DataOperationsController } from '../controllers/data-operation.js';
import { EventEmitterBase } from '../internal/mixins/event-emitter.js';
import { watch } from '../internal/watch.js';
import { DEFAULT_COLUMN_CONFIG, PIPELINE } from '../internal/constants.js';
import { registerGridIcons } from '../internal/icon-registry.js';
import { applyColumnWidths, asArray, getFilterOperandsFor } from '../internal/utils.js';

import type { ColumnConfig, GridRemoteConfig, GridSortingConfig, Keys } from '../internal/types';
import type FilterExpressionTree from '../operations/filter/tree';
import type { FilterExpression } from '../operations/filter/types';
import type { SortExpression } from '../operations/sort/types';

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
import { defineComponents, IgcIconComponent } from 'igniteui-webcomponents';
defineComponents(IgcIconComponent);

export interface ApexFilteringEvent<T extends object> {
  expression: FilterExpression<T>;
  state: FilterExpressionTree<T>;
}

// TODO: Subject to change as these are way too generic names
export interface ApexGridEventMap<T extends object> {
  sorting: CustomEvent<SortExpression<T>>;
  sorted: CustomEvent<SortExpression<T>>;
  filtering: CustomEvent<ApexFilteringEvent<T>>;
  filtered: CustomEvent<FilterExpressionTree<T>>;
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

  public override requestUpdate(
    name?: PropertyKey,
    oldValue?: unknown,
    options?: PropertyDeclaration<this, unknown>,
  ): void {
    this.headerRow?.requestUpdate();
    this.filterRow?.requestUpdate();
    super.requestUpdate(name, oldValue, options);
  }

  @watch('columns')
  protected watchColumns(_: ColumnConfig<T>[], newConfig: ColumnConfig<T>[] = []) {
    this.columns = newConfig.map(config => ({ ...DEFAULT_COLUMN_CONFIG, ...config }));
  }

  @watch(PIPELINE, { waitUntilFirstUpdate: true })
  @watch('data')
  protected pipeline() {
    this.dataState = this.dataController.apply(structuredClone(this.data), this.stateController);
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

  public sort(expressions: Partial<SortExpression<T>> | Partial<SortExpression<T>>[]) {
    this.stateController.sorting.sort(expressions as SortExpression<T>[]);
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

    if (!config.filter) {
      this.stateController.filtering.reset(key);
    }

    this.columns = this.columns.map(each => {
      if (key === each.key) {
        each = { ...each, ...config };
      }
      return each;
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
    const target = event.target as HTMLElement & ApexGridBody;
    if (this.bodyElement.isSameNode(target)) {
      this.stateController.navigation.navigate(event, this.bodyElement);
    }
  }

  protected renderHeaderRow() {
    return html`<apx-grid-header-row
      style=${styleMap(applyColumnWidths(this.columns))}
      .columns=${this.columns}
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

  protected renderFilterRow() {
    return this.columns.some(column => column.filter)
      ? html`<apx-filter-row style=${styleMap(applyColumnWidths(this.columns))}></apx-filter-row>`
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
