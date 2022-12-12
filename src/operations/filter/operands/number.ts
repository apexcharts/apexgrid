import { BaseOperands } from './base.js';
import { isDefined } from '../../../internal/is-defined.js';
import type { FilterOperation } from '../types.js';

export class NumberOperands extends BaseOperands<number> {
  public override get default() {
    return this.equals;
  }

  public equals: FilterOperation<number> = {
    name: 'equals',
    unary: false,
    logic: (target, searchTerm) => target === searchTerm,
  };

  public doesNotEqual: FilterOperation<number> = {
    name: 'doesNotEqual',
    unary: false,
    logic: (target, searchTerm) => target !== searchTerm,
  };

  public greaterThan: FilterOperation<number> = {
    name: 'greaterThan',
    unary: false,
    logic: (target, searchTerm) => target > searchTerm,
  };

  public lessThan: FilterOperation<number> = {
    name: 'lessThan',
    unary: false,
    logic: (target, searchTerm) => target < searchTerm,
  };

  public greaterThanOrEqual: FilterOperation<number> = {
    name: 'greaterThanOrEqual',
    unary: false,
    logic: (target, searchTerm) => target >= searchTerm,
  };

  public lessThanOrEqual: FilterOperation<number> = {
    name: 'lessThanOrEqual',
    unary: false,
    logic: (target, searchTerm) => target <= searchTerm,
  };

  public empty: FilterOperation<number> = {
    name: 'empty',
    unary: true,
    logic: target => !isDefined(target) || isNaN(target),
  };

  public notEmpty: FilterOperation<number> = {
    name: 'notEmpty',
    unary: true,
    logic: target => isDefined(target) && !isNaN(target),
  };
}
