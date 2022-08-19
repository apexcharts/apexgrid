import type { StyleInfo } from 'lit/directives/style-map.js';
import type { ColumnConfig } from './types';

export function isDefined<T>(value: T) {
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
