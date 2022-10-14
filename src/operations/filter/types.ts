import type { Keys } from '../../internal/types';

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
  condition: FilterOperation<T, Type>;
  searchTerm?: Type;
  criteria?: FilterCriteria;
  caseSensitive?: boolean;
}
