import { isDefined } from '../../../internal/is-defined.js';
import { normalizeCase } from '../../../internal/normalize-case.js';
import type { FilterOperands } from '../types.js';

export type StringKeys =
  | 'default'
  | 'contains'
  | 'doesNotContain'
  | 'startsWith'
  | 'endsWith'
  | 'equals'
  | 'doesNotEqual'
  | 'empty'
  | 'notEmpty';

export const StringOperands = Object.freeze<FilterOperands<string, StringKeys>>({
  default: {
    name: 'contains',
    unary: false,
    logic: (target, term, caseSensitive?) =>
      normalizeCase(target, caseSensitive).includes(normalizeCase(term, caseSensitive)),
  },
  contains: {
    name: 'contains',
    unary: false,
    logic: (target, term, caseSensitive?) =>
      normalizeCase(target, caseSensitive).includes(normalizeCase(term, caseSensitive)),
  },
  doesNotContain: {
    name: 'doesNotContain',
    unary: false,
    logic: (target, term, caseSensitive?) =>
      !normalizeCase(target, caseSensitive).includes(normalizeCase(term, caseSensitive)),
  },
  startsWith: {
    name: 'startsWith',
    unary: false,
    logic: (target, searchTerm, caseSensitive?) =>
      normalizeCase(target, caseSensitive).startsWith(normalizeCase(searchTerm, caseSensitive)),
  },
  endsWith: {
    name: 'endsWith',
    unary: false,
    logic: (target, searchTerm, caseSensitive?) =>
      normalizeCase(target, caseSensitive).endsWith(normalizeCase(searchTerm, caseSensitive)),
  },
  equals: {
    name: 'equals',
    unary: false,
    logic: (target, searchTerm, caseSensitive) =>
      normalizeCase(target, caseSensitive) === normalizeCase(searchTerm, caseSensitive),
  },

  doesNotEqual: {
    name: 'doesNotEqual',
    unary: false,
    logic: (target, searchTerm, caseSensitive) =>
      normalizeCase(target, caseSensitive) !== normalizeCase(searchTerm, caseSensitive),
  },

  empty: {
    name: 'empty',
    unary: true,
    logic: target => !isDefined(target) || target.length < 1,
  },

  notEmpty: {
    name: 'notEmpty',
    unary: true,
    logic: target => isDefined(target) && target.length > 0,
  },
});
