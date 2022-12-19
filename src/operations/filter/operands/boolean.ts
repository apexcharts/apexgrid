import { isDefined } from '../../../internal/is-defined.js';
import type { FilterOperands } from '../types.js';

export type BooleanKeys = 'default' | 'all' | 'true' | 'false' | 'empty' | 'notEmpty';

export const BooleanOperands = Object.freeze<FilterOperands<boolean, BooleanKeys>>({
  default: {
    name: 'all',
    unary: true,
    logic: _ => true,
  },
  all: {
    name: 'all',
    unary: true,
    logic: _ => true,
  },
  true: {
    name: 'true',
    unary: true,
    logic: target => target === true,
  },
  false: {
    name: 'false',
    unary: true,
    logic: target => target === false,
  },
  empty: {
    name: 'empty',
    unary: true,
    logic: target => !isDefined(target),
  },
  notEmpty: {
    name: 'nonEmpty',
    unary: true,
    logic: target => isDefined(target),
  },
});
