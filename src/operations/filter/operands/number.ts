import { isDefined } from '../../../internal/is-defined.js';
import type { FilterOperands } from '../types.js';

export type NumberKeys =
  | 'default'
  | 'equals'
  | 'doesNotEqual'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'empty'
  | 'notEmpty';

export const NumberOperands = Object.freeze<FilterOperands<number, NumberKeys>>({
  default: {
    name: 'equals',
    unary: false,
    logic: (target, term) => target === term,
  },
  equals: {
    name: 'equals',
    unary: false,
    logic: (target, term) => target === term,
  },
  doesNotEqual: {
    name: 'doesNotEqual',
    unary: false,
    logic: (target, term) => target !== term,
  },
  greaterThan: {
    name: 'greaterThan',
    unary: false,
    logic: (target, term) => target > term,
  },
  lessThan: {
    name: 'lessThan',
    unary: false,
    logic: (target, term) => target < term,
  },
  greaterThanOrEqual: {
    name: 'greaterThanOrEqual',
    unary: false,
    logic: (target, term) => target >= term,
  },
  lessThanOrEqual: {
    name: 'lessThanOrEqual',
    unary: false,
    logic: (target, term) => target <= term,
  },
  empty: {
    name: 'empty',
    unary: true,
    logic: target => !isDefined(target) || isNaN(target),
  },
  notEmpty: {
    name: 'notEmpty',
    unary: true,
    logic: target => isDefined(target) && !isNaN(target),
  },
});
