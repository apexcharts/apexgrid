import DataOperation from './base.js';
import type { Values } from '../internal/types';
import type { SortExpression, SortState } from './sort/types';

export default class SortDataOperation<T> extends DataOperation<T> {
  protected orderBy = new Map(
    Object.entries({
      ascending: 1,
      descending: -1,
    }),
  );

  protected compareValues(first: Values<T>, second: Values<T>) {
    if (typeof first === 'string' && typeof second === 'string') {
      return first.localeCompare(second);
    }
    return first > second ? 1 : first < second ? -1 : 0;
  }

  protected compareObjects(first: T, second: T, expression: SortExpression<T>) {
    const { direction, key, caseSensitive, comparer } = expression;
    const [a, b] = [
      this.resolveCase(this.resolveValue(first, key), caseSensitive),
      this.resolveCase(this.resolveValue(second, key), caseSensitive),
    ];

    return this.orderBy.get(direction)! * (comparer ? comparer(a, b) : this.compareValues(a, b));
  }

  public apply(data: T[], state: SortState<T>) {
    const expressions = Array.from(state.values()),
      length = expressions.length;

    data.sort((a, b) => {
      let i = 0,
        result = 0;

      while (i < length && !result) {
        result = this.compareObjects(a, b, expressions[i]);
        i++;
      }

      return result;
    });

    return data;
  }
}
