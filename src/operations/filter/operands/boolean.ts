import { isDefined } from '../../../internal/utils.js';
import type { FilterOperation } from '../types';

export default class BooleanOperands<T extends boolean> {
  public get(condition: keyof BooleanOperands<boolean>) {
    return this[condition];
  }

  public all: FilterOperation<T> = {
    name: 'all',
    unary: true,
    logic: _ => true,
  };

  public true: FilterOperation<T> = {
    name: 'true',
    unary: true,
    logic: target => target === true,
  };

  public false: FilterOperation<T> = {
    name: 'false',
    unary: true,
    logic: target => target === false,
  };

  public empty: FilterOperation<T> = {
    name: 'empty',
    unary: true,
    logic: target => !isDefined(target),
  };

  public notEmpty: FilterOperation<T> = {
    name: 'nonEmpty',
    unary: true,
    logic: target => isDefined(target),
  };
}
