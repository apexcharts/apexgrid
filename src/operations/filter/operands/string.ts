import { BaseOperands } from '../operands/base.js';
import { isDefined, normalizeCase } from '../../../internal/utils.js';
import type { FilterOperation } from '../types.js';

export class StringOperands<T> extends BaseOperands<T, string> {
  public override get default() {
    return this.contains;
  }

  public contains: FilterOperation<T, string> = {
    name: 'contains',
    unary: false,
    logic: (target, searchTerm, caseSensitive?) =>
      normalizeCase(target, caseSensitive).includes(normalizeCase(searchTerm, caseSensitive)),
  };

  public doesNotContain: FilterOperation<T, string> = {
    name: 'doesNotContain',
    unary: false,
    logic: (target, searchTerm, caseSensitive?) =>
      !normalizeCase(target, caseSensitive).includes(normalizeCase(searchTerm, caseSensitive)),
  };

  public startsWith: FilterOperation<T, string> = {
    name: 'startsWith',
    unary: false,
    logic: (target, searchTerm, caseSensitive?) =>
      normalizeCase(target, caseSensitive).startsWith(normalizeCase(searchTerm, caseSensitive)),
  };

  public endsWith: FilterOperation<T, string> = {
    name: 'endsWith',
    unary: false,
    logic: (target, searchTerm, caseSensitive?) =>
      normalizeCase(target, caseSensitive).endsWith(normalizeCase(searchTerm, caseSensitive)),
  };

  public equals: FilterOperation<T, string> = {
    name: 'equals',
    unary: false,
    logic: (target, searchTerm, caseSensitive) =>
      normalizeCase(target, caseSensitive) === normalizeCase(searchTerm, caseSensitive),
  };

  public doesNotEqual: FilterOperation<T, string> = {
    name: 'doesNotEqual',
    unary: false,
    logic: (target, searchTerm, caseSensitive) =>
      normalizeCase(target, caseSensitive) !== normalizeCase(searchTerm, caseSensitive),
  };

  public empty: FilterOperation<T, string> = {
    name: 'empty',
    unary: true,
    logic: target => !isDefined(target) || target.length < 1,
  };

  public notEmpty: FilterOperation<T, string> = {
    name: 'notEmpty',
    unary: true,
    logic: target => isDefined(target) && target.length > 0,
  };
}
