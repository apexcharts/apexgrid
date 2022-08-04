import type { Keys } from '../../internal/types';

export type SortingDirection = 'ascending' | 'descending';

export interface SortExpression<T extends object> {
  key: Keys<T>;
  direction: SortingDirection;
  caseSensitive?: boolean;
}

export type SortState<T extends object> = Map<Keys<T>, SortExpression<T>>;
