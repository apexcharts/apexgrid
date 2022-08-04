import { isDefined } from '../../../internal/utils.js';
import type { FilterOperation } from '../types';

export default class NumberOperands<T extends number> {
  public get(condition: keyof NumberOperands<number>) {
    return this[condition];
  }

  public equals: FilterOperation<T> = {
    name: 'equals',
    unary: false,
    logic: (target, searchTerm) => target === searchTerm,
  };

  public doesNotEqual: FilterOperation<T> = {
    name: 'doesNotEqual',
    unary: false,
    logic: (target, searchTerm) => target !== searchTerm,
  };

  public greaterThan: FilterOperation<T> = {
    name: 'greaterThan',
    unary: false,
    logic: (target, searchTerm) => target > searchTerm,
  };

  public lessThan: FilterOperation<T> = {
    name: 'lessThan',
    unary: false,
    logic: (target, searchTerm) => target < searchTerm,
  };

  public greaterThanOrEqual: FilterOperation<T> = {
    name: 'greaterThanOrEqual',
    unary: false,
    logic: (target, searchTerm) => target >= searchTerm,
  };

  public lessThanOrEqual: FilterOperation<T> = {
    name: 'lessThanOrEqual',
    unary: false,
    logic: (target, searchTerm) => target <= searchTerm,
  };

  public empty: FilterOperation<T> = {
    name: 'empty',
    unary: true,
    logic: target => !isDefined(target) || isNaN(target),
  };

  public notEmpty: FilterOperation<T> = {
    name: 'notEmpty',
    unary: true,
    logic: target => isDefined(target) && !isNaN(target),
  };
}
