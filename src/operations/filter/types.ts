import type { Keys, Values, PropertyType } from '../../internal/types';

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

export interface FilterExpression<T extends object> {
  key: Keys<T>;
  condition: FilterOperation<Values<T>>;
  searchTerm?: PropertyType<T, Keys<T>>;
  caseSensitive?: boolean;
}

export interface FilterTree<T> {
  criteria: FilterCriteria;
  operands: Map<string, FilterOperation<T>>;
}

export type FilterState<T extends object> = Map<Keys<T>, FilterExpression<T>>;
