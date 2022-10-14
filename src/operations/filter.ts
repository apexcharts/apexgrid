import DataOperation from './base.js';
import FilterState from './filter/state.js';

export default class FilterOperation<T extends object> extends DataOperation<T> {
  protected match(record: T, state: FilterState<T>) {
    return (
      state.values
        .flatMap(v => v.ors)
        .some(e =>
          e.condition.logic(this.resolveValue(record, e.key), e.searchTerm!, e.caseSensitive),
        ) ||
      state.values
        .flatMap(v => v.ands)
        .every(e =>
          e.condition.logic(this.resolveValue(record, e.key), e.searchTerm!, e.caseSensitive),
        )
    );
  }

  public apply(data: T[], state: FilterState<T>): T[] {
    return state.empty ? data : data.filter(record => this.match(record, state));
  }
}
