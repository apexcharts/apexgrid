import { html, nothing, ReactiveController } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { PIPELINE } from '../internal/constants';
import type { ColumnConfig, GridHost, Keys } from '../internal/types';
import BooleanOperands from '../operations/filter/operands/boolean.js';
import NumberOperands from '../operations/filter/operands/number.js';
import StringOperands from '../operations/filter/operands/string.js';
import FilterState from '../operations/filter/state.js';
import type { FilterExpression } from '../operations/filter/types';

export class FilterController<T extends object> implements ReactiveController {
  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  protected get row() {
    // @ts-expect-error - Protected member access
    return this.host.filterRow;
  }

  protected getOperandsFor(column: ColumnConfig<T>) {
    switch (column.type) {
      case 'boolean':
        return new BooleanOperands<T>();
      case 'number':
        return new NumberOperands<T>();
      default:
        return new StringOperands<T>();
    }
  }

  protected activeExpression!: Partial<FilterExpression<T>>;
  protected activeColumn?: ColumnConfig<T>;

  protected getStateForActiveColumn() {
    return this.state.get(this.activeColumn!.key);
  }

  get #defaultExpression(): Partial<FilterExpression<T>> {
    return {
      key: this.activeColumn?.key,
      condition: this.getOperandsFor(this.activeColumn!).default,
      criteria: 'and',
    };
  }

  async #focusInput() {
    if (this.row) {
      this.row.requestUpdate();
      await this.row.updateComplete;
      this.row.input?.focus();
    }
  }

  #handleCriteriaChanged = (ev: CustomEvent<FilterExpression<T>>) => {
    ev.stopPropagation();

    ev.detail.criteria = ev.detail.criteria === 'and' ? 'or' : 'and';
    this._filter(ev.detail);
    this.row.requestUpdate();
  };

  #handleInputChanged = (ev: CustomEvent<string | number>) => {
    ev.stopPropagation();

    this.activeExpression.searchTerm = ev.detail;
    this._filter(this.activeExpression as FilterExpression<T>);
    this.row.requestUpdate();
  };

  #handleInputCleared = (ev: CustomEvent<void>) => {
    ev.stopPropagation();

    this.getStateForActiveColumn()?.remove(this.activeExpression as FilterExpression<T>);
    this.host.requestUpdate(PIPELINE);
    this.row.requestUpdate();
  };

  #handleCommit = (ev: CustomEvent<void>) => {
    ev.stopPropagation();

    this.activeExpression = this.#defaultExpression;
    this.host.requestUpdate();
  };

  #handleDiscard = (ev: CustomEvent<FilterExpression<T>>) => {
    ev.stopPropagation();

    this.getStateForActiveColumn()?.remove(ev.detail);
    this.host.requestUpdate(PIPELINE);
    this.row.requestUpdate();
  };

  #handleConditionChanged = (ev: CustomEvent<string>) => {
    ev.stopPropagation();

    this.activeExpression.condition = this.getOperandsFor(this.activeColumn!).get(ev.detail as any);
    this.host.requestUpdate();
    this.row.requestUpdate();

    if (this.row.input?.value || this.activeExpression.condition.unary) {
      this._filter(this.activeExpression as FilterExpression<T>);
    }
  };

  #handleChipRemove = async (event: CustomEvent<FilterExpression<T>>) => {
    event.stopPropagation();

    this.getStateForActiveColumn()?.remove(event.detail);

    if (this.activeExpression === event.detail) {
      this.activeExpression = this.#defaultExpression;
      await this.host.updateComplete;
      this.#focusInput();
    }

    this.host.requestUpdate(PIPELINE);
  };

  #handleSelectionChanged = async (ev: CustomEvent<FilterExpression<T>>) => {
    ev.stopPropagation();
    this.activeExpression = ev.detail;

    this.host.requestUpdate();
    this.row.requestUpdate();

    await this.row.updateComplete;
    this.row.input?.select();
  };

  #handleFilterIconClick = async (ev: CustomEvent<ColumnConfig<T>>) => {
    ev.stopPropagation();

    this.activeColumn = this.activeColumn === ev.detail ? undefined : ev.detail;
    if (this.activeColumn) {
      this.activeExpression = this.#defaultExpression;
    }

    this.host.requestUpdate();

    await this.host.updateComplete;
    this.#focusInput();
  };

  public state: FilterState<T> = new FilterState();

  public renderFilterRow(anchor?: HTMLElement) {
    return this.activeColumn
      ? html`<apx-filter-row
          style=${styleMap({
            '--header-row-bottom': `${anchor ? anchor.getBoundingClientRect().height : 50}px`,
          })}
          .column=${this.activeColumn}
          .expression=${this.activeExpression as FilterExpression<T>}
          .state=${this.state}
          @criteriaChanged=${this.#handleCriteriaChanged}
          @conditionChanged=${this.#handleConditionChanged}
          @inputChanged=${this.#handleInputChanged}
          @inputCleared=${this.#handleInputCleared}
          @commitExpression=${this.#handleCommit}
          @discardExpression=${this.#handleDiscard}
          @selectionChanged=${this.#handleSelectionChanged}
          @removeExpression=${this.#handleChipRemove}
        ></apx-filter-row>`
      : nothing;
  }

  protected _filter(expression: FilterExpression<T>) {
    this.state.set(expression);
    this.host.requestUpdate(PIPELINE);
  }

  public hostConnected() {
    this.host.addEventListener('headerFilterClicked', this.#handleFilterIconClick);
  }

  public hostDisconnected() {
    this.host.removeEventListener('headerFilterClicked', this.#handleFilterIconClick);
  }

  public filter() {}

  public reset(key?: Keys<T>) {
    key ? this.state.delete(key) : this.state.clear();
  }
}
