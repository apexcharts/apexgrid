import DataOperation from './base.js';
import type FilterState from './filter/state.js';
import type { FilterExpression, FilterOperation } from './filter/types.js';

export default class FilterDataOperation<T extends object> extends DataOperation<T> {
  protected match(record: T, ands: FilterExpression<T>[], ors: FilterExpression<T>[]) {
    return (
      ors.some(e =>
        (e.condition as FilterOperation<T, any>).logic(
          this.resolveValue(record, e.key),
          e.searchTerm,
          e.caseSensitive,
        ),
      ) ||
      ands.every(e =>
        (e.condition as FilterOperation<T, any>).logic(
          this.resolveValue(record, e.key),
          e.searchTerm,
          e.caseSensitive,
        ),
      )
    );
  }

  public apply(data: T[], state: FilterState<T>): T[] {
    if (state.empty) return data;

    const { ands, ors } = state;
    return data.filter(record => this.match(record, ands, ors));
  }
}
