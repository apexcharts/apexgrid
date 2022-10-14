import BaseOperands from './base.js';
import { isDefined } from '../../../internal/utils.js';
import type { FilterOperation } from '../types';

export default class NumberOperands<T extends object> extends BaseOperands<T, number> {
  public override get default() {
    return this.equals;
  }

  public equals: FilterOperation<T, number> = {
    name: 'equals',
    unary: false,
    logic: (target, searchTerm) => target === searchTerm,
  };

  public doesNotEqual: FilterOperation<T, number> = {
    name: 'doesNotEqual',
    unary: false,
    logic: (target, searchTerm) => target !== searchTerm,
  };

  public greaterThan: FilterOperation<T, number> = {
    name: 'greaterThan',
    unary: false,
    logic: (target, searchTerm) => target > searchTerm,
  };

  public lessThan: FilterOperation<T, number> = {
    name: 'lessThan',
    unary: false,
    logic: (target, searchTerm) => target < searchTerm,
  };

  public greaterThanOrEqual: FilterOperation<T, number> = {
    name: 'greaterThanOrEqual',
    unary: false,
    logic: (target, searchTerm) => target >= searchTerm,
  };

  public lessThanOrEqual: FilterOperation<T, number> = {
    name: 'lessThanOrEqual',
    unary: false,
    logic: (target, searchTerm) => target <= searchTerm,
  };

  public empty: FilterOperation<T, number> = {
    name: 'empty',
    unary: true,
    logic: target => !isDefined(target) || isNaN(target),
  };

  public notEmpty: FilterOperation<T, number> = {
    name: 'notEmpty',
    unary: true,
    logic: target => isDefined(target) && !isNaN(target),
  };
}
