import type { Keys } from '../../internal/types.js';
import type { BooleanOperands } from './operands/boolean.js';
import type { NumberOperands } from './operands/number.js';
import type { StringOperands } from './operands/string.js';

/**
 * The link operator
 */
export type FilterCriteria = 'and' | 'or';

export type FilterOperationLogic<T> = (
  target: T,
  searchTerm: T,
  caseSensitive?: boolean,
) => boolean;

export interface FilterOperation<T> {
  name: string;
  unary: boolean;
  logic: FilterOperationLogic<T>;
}

export type FilterOperands<DataType, Operands extends string> = {
  [key in Operands]: FilterOperation<DataType>;
};

/**
 * Represents a filter operation for a given column.
 */
export interface BaseFilterExpression<T, K extends Keys<T> = Keys<T>> {
  /**
   * The target column.
   */
  key: K;
  /**
   *
   */
  condition: FilterOperation<T[K]> | OperandKeys<T[K]>;

  /**
   *
   */
  searchTerm?: T[K];
  /**
   *
   */
  criteria?: FilterCriteria;
  /**
   * Whether the sort operation should be case sensitive.
   *
   * @remarks
   * If not provided, the value is resolved based on the column filter configuration (if any).
   */
  caseSensitive?: boolean;
}

export type FilterExpression<T, K extends Keys<T> = Keys<T>> = K extends Keys<T>
  ? BaseFilterExpression<T, K>
  : never;

export type OperandKeys<Type> = Type extends number
  ? keyof typeof NumberOperands
  : Type extends string
  ? keyof typeof StringOperands
  : Type extends boolean
  ? keyof typeof BooleanOperands
  : Type;
