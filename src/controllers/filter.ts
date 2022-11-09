import { ReactiveController } from 'lit';
import { PIPELINE } from '../internal/constants.js';
import { asArray, getFilterOperandsFor } from '../internal/utils.js';
import FilterState from '../operations/filter/state.js';

import type FilterExpressionTree from '../operations/filter/tree';
import type { ColumnConfig, GridHost, Keys } from '../internal/types';
import type { FilterExpression } from '../operations/filter/types';

export class FilterController<T extends object> implements ReactiveController {
  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  public state: FilterState<T> = new FilterState();

  public get filterRow() {
    // @ts-expect-error - protected access
    return this.host.filterRow;
  }

  #emitFilteringEvent(expression: FilterExpression<T>) {
    return this.host.emitEvent('filtering', {
      detail: {
        expression,
        state: this.get(expression.key)!,
      },
      cancelable: true,
    });
  }

  #emitFilteredEvent(detail: FilterExpressionTree<T>) {
    return this.host.emitEvent('filtered', { detail });
  }

  protected _filter(expression: FilterExpression<T> | FilterExpression<T>[]) {
    asArray(expression).forEach(expr => this.state.set(expr));
    this.host.requestUpdate(PIPELINE);
  }

  public hostConnected() {}

  public get(key: Keys<T>) {
    return this.state.get(key);
  }

  public reset(key?: Keys<T>) {
    key ? this.state.delete(key) : this.state.clear();
  }

  public setActiveColumn(column: ColumnConfig<T>) {
    if (column.filter && this.filterRow?.active) {
      this.filterRow.column = column;
      this.filterRow.expression = this.getDefaultExpression(column);
      this.host.requestUpdate();
    }
  }

  public getDefaultExpression(column: ColumnConfig<T>): FilterExpression<T> {
    const caseSensitive =
      typeof column.filter === 'boolean' ? false : Boolean(column.filter?.caseSensitive);
    return {
      key: column.key,
      condition: getFilterOperandsFor(column).default,
      caseSensitive,
    };
  }

  public removeExpression(expression: FilterExpression<T>) {
    const state = this.get(expression.key);

    state?.remove(expression);

    if (state?.empty) {
      this.reset(state.key);
    }
  }

  public async filterWithEvent(expression: FilterExpression<T>) {
    if (!this.#emitFilteringEvent(expression)) {
      return;
    }

    this._filter(expression);

    await this.host.updateComplete;
    this.#emitFilteredEvent(this.get(expression.key)!);
  }

  public filter(expression: FilterExpression<T> | FilterExpression<T>[]) {
    this._filter(
      asArray(expression).map(expr =>
        Object.assign(this.getDefaultExpression(this.host.getColumn(expr.key)!), expr),
      ),
    );
  }
}
