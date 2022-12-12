import { isDefined } from '../../../internal/is-defined.js';
import { normalizeCase } from '../../../internal/normalize-case.js';
import { BaseOperands } from '../operands/base.js';
import type { FilterOperation } from '../types.js';

export class StringOperands extends BaseOperands<string> {
  public override get default() {
    return this.contains;
  }

  public contains: FilterOperation<string> = {
    name: 'contains',
    unary: false,
    logic: (target, searchTerm, caseSensitive?) =>
      normalizeCase(target, caseSensitive).includes(normalizeCase(searchTerm, caseSensitive)),
  };

  public doesNotContain: FilterOperation<string> = {
    name: 'doesNotContain',
    unary: false,
    logic: (target, searchTerm, caseSensitive?) =>
      !normalizeCase(target, caseSensitive).includes(normalizeCase(searchTerm, caseSensitive)),
  };

  public startsWith: FilterOperation<string> = {
    name: 'startsWith',
    unary: false,
    logic: (target, searchTerm, caseSensitive?) =>
      normalizeCase(target, caseSensitive).startsWith(normalizeCase(searchTerm, caseSensitive)),
  };

  public endsWith: FilterOperation<string> = {
    name: 'endsWith',
    unary: false,
    logic: (target, searchTerm, caseSensitive?) =>
      normalizeCase(target, caseSensitive).endsWith(normalizeCase(searchTerm, caseSensitive)),
  };

  public equals: FilterOperation<string> = {
    name: 'equals',
    unary: false,
    logic: (target, searchTerm, caseSensitive) =>
      normalizeCase(target, caseSensitive) === normalizeCase(searchTerm, caseSensitive),
  };

  public doesNotEqual: FilterOperation<string> = {
    name: 'doesNotEqual',
    unary: false,
    logic: (target, searchTerm, caseSensitive) =>
      normalizeCase(target, caseSensitive) !== normalizeCase(searchTerm, caseSensitive),
  };

  public empty: FilterOperation<string> = {
    name: 'empty',
    unary: true,
    logic: target => !isDefined(target) || target.length < 1,
  };

  public notEmpty: FilterOperation<string> = {
    name: 'notEmpty',
    unary: true,
    logic: target => isDefined(target) && target.length > 0,
  };
}
