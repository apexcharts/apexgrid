import { isDefined, normalizeCase } from '../../../internal/utils.js';
import type { FilterOperation } from '../types';

export default class StringOperands<T extends string> {
  public get(condition: keyof StringOperands<string>) {
    return this[condition];
  }

  public contains: FilterOperation<T> = {
    name: 'contains',
    unary: false,
    logic: (target, searchTerm, caseSensitive?) =>
      normalizeCase(target, caseSensitive).includes(normalizeCase(searchTerm, caseSensitive)),
  };

  public doesNotContain: FilterOperation<T> = {
    name: 'doesNotContain',
    unary: false,
    logic: (target, searchTerm, caseSensitive?) =>
      !normalizeCase(target, caseSensitive).includes(normalizeCase(searchTerm, caseSensitive)),
  };

  public startsWith: FilterOperation<T> = {
    name: 'startsWith',
    unary: false,
    logic: (target, searchTerm, caseSensitive?) =>
      normalizeCase(target, caseSensitive).startsWith(normalizeCase(searchTerm, caseSensitive)),
  };

  public endsWith: FilterOperation<T> = {
    name: 'endsWith',
    unary: false,
    logic: (target, searchTerm, caseSensitive?) =>
      normalizeCase(target, caseSensitive).endsWith(normalizeCase(searchTerm, caseSensitive)),
  };

  public equals: FilterOperation<T> = {
    name: 'equals',
    unary: false,
    logic: (target, searchTerm, caseSensitive) =>
      normalizeCase(target, caseSensitive) === normalizeCase(searchTerm, caseSensitive),
  };

  public doesNotEqual: FilterOperation<T> = {
    name: 'doesNotEqual',
    unary: false,
    logic: (target, searchTerm, caseSensitive) =>
      normalizeCase(target, caseSensitive) !== normalizeCase(searchTerm, caseSensitive),
  };

  public empty: FilterOperation<T> = {
    name: 'empty',
    unary: true,
    logic: target => !isDefined(target) || target.length < 1,
  };

  public notEmpty: FilterOperation<T> = {
    name: 'notEmpty',
    unary: true,
    logic: target => isDefined(target) && target.length > 0,
  };
}
