import BaseOperands from './base.js';
import { isDefined } from '../../../internal/utils.js';
import type { FilterOperation } from '../types';

export default class BooleanOperands<T> extends BaseOperands<T, boolean> {
  public override get default() {
    return this.all;
  }

  public all: FilterOperation<T, boolean> = {
    name: 'all',
    unary: true,
    logic: _ => true,
  };

  public true: FilterOperation<T, boolean> = {
    name: 'true',
    unary: true,
    logic: target => target === true,
  };

  public false: FilterOperation<T, boolean> = {
    name: 'false',
    unary: true,
    logic: target => target === false,
  };

  public empty: FilterOperation<T, boolean> = {
    name: 'empty',
    unary: true,
    logic: target => !isDefined(target),
  };

  public notEmpty: FilterOperation<T, boolean> = {
    name: 'nonEmpty',
    unary: true,
    logic: target => isDefined(target),
  };
}
