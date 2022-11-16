import { ReactiveController } from 'lit';
import { PIPELINE } from '../internal/constants.js';
import { asArray } from '../internal/utils.js';
import type { ColumnConfig, ColumnSortConfig, GridHost, Keys } from '../internal/types.js';
import type { SortExpression, SortingDirection, SortState } from '../operations/sort/types.js';

export class SortController<T extends object> implements ReactiveController {
  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  public state: SortState<T> = new Map();

  get #isMultipleSort() {
    return this.host.sortingConfig.multiple;
  }

  get #isTriStateSort() {
    return this.host.sortingConfig.triState;
  }

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

  #emitSortingEvent(detail: SortExpression<T>) {
    return this.host.emitEvent('sorting', { detail, cancelable: true });
  }

  #emitSortedEvent(detail: SortExpression<T>) {
    return this.host.emitEvent('sorted', { detail });
  }

  public async sortFromHeaderClick(column: ColumnConfig<T>) {
    const expression = this.prepareExpression(column);

    if (!this.#emitSortingEvent(expression)) {
      return;
    }

    if (!this.#isMultipleSort) {
      this.reset();
    }

    if (expression.direction == 'none') {
      this.reset(expression.key);
      this.host.requestUpdate(PIPELINE);
    } else {
      this._sort(expression);
    }

    await this.host.updateComplete;
    this.#emitSortedEvent(expression);
  }

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

  public reset(key?: Keys<T>) {
    key ? this.state.delete(key) : this.state.clear();
  }

  protected _sort(expressions: SortExpression<T> | SortExpression<T>[]) {
    asArray(expressions).forEach(expr => this.state.set(expr.key, { ...expr }));
    this.host.requestUpdate(PIPELINE);
  }

  public sort(expressions: SortExpression<T> | SortExpression<T>[]) {
    this._sort(
      asArray(expressions).map(expr =>
        Object.assign(this.state.get(expr.key) ?? this.#createDefaultExpression(expr.key), expr),
      ),
    );
  }

  public hostConnected() {}
}
