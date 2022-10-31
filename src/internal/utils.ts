import BooleanOperands from '../operations/filter/operands/boolean';
import NumberOperands from '../operations/filter/operands/number';
import StringOperands from '../operations/filter/operands/string';

import type { StyleInfo } from 'lit/directives/style-map.js';
import type { ColumnConfig } from './types';

export function isDefined<T>(value: T | null | undefined): value is NonNullable<T> {
  return value !== undefined && value !== null;
}

export function normalizeCase(string: string, caseSensitive?: boolean) {
  return caseSensitive ? string : string.toLowerCase();
}

// TODO: Revise if this is needed
export function applyColumnWidths<T extends object>(columns: Array<ColumnConfig<T>>): StyleInfo {
  return {
    'grid-template-columns': columns
      .filter(each => !each.hidden)
      .map(({ width }) => width ?? 'minmax(136px, 1fr)')
      .join(' '),
  };
}

export function asArray<T>(value: T | T[]) {
  return Array.isArray(value) ? value : [value];
}

export function getFilterOperandsFor<T extends object>(column: ColumnConfig<T>) {
  // Check for custom class in the filter config
  switch (column.type) {
    case 'boolean':
      return new BooleanOperands<T>();
    case 'number':
      return new NumberOperands<T>();
    default:
      return new StringOperands<T>();
  }
}
