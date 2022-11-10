import type { Keys } from '../../internal/types';
import type BooleanOperands from './operands/boolean';
import type NumberOperands from './operands/number';
import type StringOperands from './operands/string';

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

export interface FilterExpression<T, Type = any> {
  key: Keys<T>;
  condition: FilterOperation<T, Type> | OperandKeys<T>;
  searchTerm?: Type;
  criteria?: FilterCriteria;
  caseSensitive?: boolean;
}

export type OperandKeys<T> =
  | Keys<NumberOperands<T>>
  | Keys<StringOperands<T>>
  | Keys<BooleanOperands<T>>;
