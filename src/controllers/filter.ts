import { ReactiveController } from 'lit';
import { PIPELINE } from '../internal/constants';
import FilterState from '../operations/filter/state.js';

import type { ColumnConfig, GridHost, Keys } from '../internal/types';
import type { FilterExpression } from '../operations/filter/types';

export class FilterController<T extends object> implements ReactiveController {
  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  public state: FilterState<T> = new FilterState();

  // protected getOperandsFor(column: ColumnConfig<T>) {
  //   switch (column.type) {
  //     case 'boolean':
  //       return new BooleanOperands<T>();
  //     case 'number':
  //       return new NumberOperands<T>();
  //     default:
  //       return new StringOperands<T>();
  //   }
  // }

  protected activeExpression!: Partial<FilterExpression<T>>;
  protected activeColumn?: ColumnConfig<T>;

  protected getStateForActiveColumn() {
    return this.state.get(this.activeColumn!.key);
  }

  // get #defaultExpression(): Partial<FilterExpression<T>> {
  //   return {
  //     key: this.activeColumn?.key,
  //     condition: this.getOperandsFor(this.activeColumn!).default,
  //     criteria: 'and',
  //   };
  // }

  // #handleFilterIconClick = async (ev: CustomEvent<ColumnConfig<T>>) => {
  //   ev.stopPropagation();

  //   this.activeColumn = this.activeColumn === ev.detail ? undefined : ev.detail;
  //   if (this.activeColumn) {
  //     this.activeExpression = this.#defaultExpression;
  //   }

  //   this.host.requestUpdate();

  //   await this.host.updateComplete;
  //   this.#focusInput();
  // };

  protected _filter(expression: FilterExpression<T>) {
    this.state.set(expression);
    this.host.requestUpdate(PIPELINE);
  }

  public hostConnected() {
    // this.host.addEventListener('headerFilterClicked', this.#handleFilterIconClick);
  }

  // TODO: Revise
  public filter(expression: FilterExpression<T>) {
    this.state.set(expression);
    this.host.requestUpdate(PIPELINE);
  }

  public reset(key?: Keys<T>) {
    key ? this.state.delete(key) : this.state.clear();
  }
}
