import { BaseOperands } from './base.js';
import { isDefined } from '../../../internal/is-defined.js';
import type { FilterOperation } from '../types.js';

export class BooleanOperands extends BaseOperands<boolean> {
  public override get default() {
    return this.all;
  }

  public all: FilterOperation<boolean> = {
    name: 'all',
    unary: true,
    logic: _ => true,
  };

  public true: FilterOperation<boolean> = {
    name: 'true',
    unary: true,
    logic: target => target === true,
  };

  public false: FilterOperation<boolean> = {
    name: 'false',
    unary: true,
    logic: target => target === false,
  };

  public empty: FilterOperation<boolean> = {
    name: 'empty',
    unary: true,
    logic: target => !isDefined(target),
  };

  public notEmpty: FilterOperation<boolean> = {
    name: 'nonEmpty',
    unary: true,
    logic: target => isDefined(target),
  };
}
