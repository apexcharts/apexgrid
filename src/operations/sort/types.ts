import type { Keys, Values } from '../../internal/types.js';

/**
 * Sort direction for a given sort expression.
 *
 * @remarks
 * `none` is
 */
export type SortingDirection = 'ascending' | 'descending' | 'none';

/**
 * Represents a sort operation for a given column.
 */
export interface SortExpression<T> {
  /**
   * The target column.
   */
  key: Keys<T>;
  /**
   * Sort direction for this operation.
   */
  direction: SortingDirection;
  /**
   * Whether the sort operation should be case sensitive.
   *
   * @remarks
   * If not provided, the value is resolved based on the column sort configuration (if any).
   */
  caseSensitive?: boolean;
  /**
   * Custom comparer function for this operation.
   *
   * @remarks
   * If not provided, the value is resolved based on the column sort configuration (if any).
   */
  comparer?: (a: Values<T>, b: Values<T>) => number;
}

/** Represents the sort state of the grid. */
export type SortState<T> = Map<Keys<T>, SortExpression<T>>;
