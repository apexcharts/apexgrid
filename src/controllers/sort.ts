import { ReactiveController } from 'lit';
import { PIPELINE } from '../internal/constants.js';
import type { ColumnConfig, ColumnSortConfig, GridHost, Keys } from '../internal/types';
import type { SortExpression, SortingDirection, SortState } from '../operations/sort/types';

export class SortController<T extends object> implements ReactiveController {
  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  public state: SortState<T> = new Map();

  #resolveSortOptions(
    options: boolean | undefined | ColumnSortConfig<T>,
  ): Partial<SortExpression<T>> {
    const guard = (obj: boolean | undefined | ColumnSortConfig<T>): obj is ColumnSortConfig<T> =>
      obj !== undefined && typeof obj !== 'boolean';
    return {
      caseSensitive: guard(options) ? options.caseSensitive : false,
      comparer: guard(options) ? options.comparer : undefined,
    };
  }

  #createDefaultExpression(key: Keys<T>): SortExpression<T> {
    const options = this.host.getColumn(key)?.sort;

    return {
      key,
      direction: 'ascending',
      ...this.#resolveSortOptions(options),
    };
  }

  get #isMultipleSort() {
    return this.host.sortingConfig.multiple;
  }

  get #isTriStateSort() {
    return this.host.sortingConfig.triState;
  }

  #emitSortingEvent(detail: SortExpression<T>) {
    return this.host.emitEvent('sorting', { detail, cancelable: true });
  }

  #emitSortedEvent(detail: SortExpression<T>) {
    return this.host.emitEvent('sorted', { detail });
  }

  #headerSortHandler = async (ev: CustomEvent<ColumnConfig<T>>) => {
    ev.stopPropagation();
    const expression = this.prepareExpression(ev.detail);

    if (!this.#emitSortingEvent(expression)) {
      return;
    }

    if (!this.#isMultipleSort) {
      this.reset();
    }

    expression.direction === 'none'
      ? this.reset(expression.key)
      : this._sort(expression.key, expression);

    await this.host.updateComplete;
    this.#emitSortedEvent(expression);
  };

  public prepareExpression({ key, sort: options }: ColumnConfig<T>): SortExpression<T> {
    if (this.state.has(key)) {
      const expr = this.state.get(key)!;

      return Object.assign(expr, {
        direction: this.#orderBy(expr.direction),
        ...this.#resolveSortOptions(options),
      });
    }

    // Initial state
    return this.#createDefaultExpression(key);
  }

  #orderBy(dir?: SortingDirection): SortingDirection {
    return this.#isTriStateSort
      ? dir === 'ascending'
        ? 'descending'
        : dir === 'descending'
        ? 'none'
        : 'ascending'
      : dir === 'ascending'
      ? 'descending'
      : 'ascending';
  }

  public reset(key?: Keys<T>) {
    key ? this.state.delete(key) : this.state.clear();
    this.host.requestUpdate(PIPELINE);
  }

  protected _sort(key: Keys<T>, expression: SortExpression<T>) {
    this.state.set(key, { ...expression });
    this.host.requestUpdate(PIPELINE);
  }

  public sort(key: Keys<T>, expression?: SortExpression<T>) {
    const value = this.state.get(key) ?? this.#createDefaultExpression(key);
    this._sort(key, Object.assign(value, expression));
  }

  public hostConnected() {
    this.host.addEventListener('headerSortClicked', this.#headerSortHandler);
  }

  public hostDisconnected(): void {
    this.host.removeEventListener('headerSortClicked', this.#headerSortHandler);
  }
}
