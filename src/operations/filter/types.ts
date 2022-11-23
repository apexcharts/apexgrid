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

export interface FilterOperation<_, Type> {
  name: string;
  unary: boolean;
  logic: FilterOperationLogic<Type>;
}

/**
 * Represents a filter operation for a given column.
 */
export interface FilterExpression<T, Type = any> {
  /**
   * The target column.
   */
  key: Keys<T>;
  /**
   *
   */
  condition: FilterOperation<T, Type> | OperandKeys<T>;

  /**
   *
   */
  searchTerm?: Type;
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

export type OperandKeys<T> =
  | Keys<NumberOperands<T>>
  | Keys<StringOperands<T>>
  | Keys<BooleanOperands<T>>;
