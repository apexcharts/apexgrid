import type { Keys, Values } from '../../internal/types';

export type SortingDirection = 'ascending' | 'descending' | 'none';

export interface SortExpression<T> {
  key: Keys<T>;
  direction: SortingDirection;
  caseSensitive?: boolean;
  comparer?: (a: Values<T>, b: Values<T>) => number;
}

export type SortState<T> = Map<Keys<T>, SortExpression<T>>;
