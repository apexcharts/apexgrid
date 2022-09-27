import type { Keys, Values } from '../../internal/types';

export type SortingDirection = 'ascending' | 'descending' | 'none';

export interface SortExpression<T extends object> {
  key: Keys<T>;
  direction: SortingDirection;
  caseSensitive?: boolean;
  comparer?: (a: Values<T>, b: Values<T>) => number;
}

export type SortState<T extends object> = Map<Keys<T>, SortExpression<T>>;
