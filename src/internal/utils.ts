import { BooleanOperands } from '../operations/filter/operands/boolean.js';
import { NumberOperands } from '../operations/filter/operands/number.js';
import { StringOperands } from '../operations/filter/operands/string.js';

import type { StyleInfo } from 'lit/directives/style-map.js';
import type { ColumnConfiguration, DataType, GridHost } from './types.js';

// TODO: Revise if this is needed
export function applyColumnWidths<T extends object>(
  columns: Array<ColumnConfiguration<T>>,
): StyleInfo {
  return {
    'grid-template-columns': columns
      .filter(each => !each.hidden)
      .map(({ width }) => width ?? 'minmax(136px, 1fr)')
      .join(' '),
  };
}

export function autoGenerateColumns<T extends object>(grid: GridHost<T>) {
  if (grid.autoGenerate && grid.columns.length < 1) {
    const record = grid.data[0] ?? {};

    grid.columns = Object.entries(record).map(([key, value]) => {
      const type: DataType =
        typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string';
      return { key, type } as ColumnConfiguration<T>;
    });
  }
}

export function asArray<T>(value: T | T[]) {
  return Array.isArray(value) ? value : [value];
}

export function getFilterOperandsFor<T extends object>(column: ColumnConfiguration<T>) {
  // Check for custom class in the filter config
  switch (column.type) {
    case 'boolean':
      return BooleanOperands;
    case 'number':
      return NumberOperands;
    default:
      return StringOperands;
  }
}
