import { ReactiveControllerHost, TemplateResult } from 'lit';
import type ApexGrid from '../components/grid.js';
import type ApexGridCell from '../components/cell.js';
import type ApexGridRow from '../components/row.js';
import type ApexGridHeader from '../components/header.js';
import type { BaseOperands } from '../operations/filter/operands/base.js';
import type { SortState } from '../operations/sort/types.js';
import type { FilterState } from '../operations/filter/state.js';

export type NavigationState = 'previous' | 'current';
export type GridHost<T extends object> = ReactiveControllerHost & ApexGrid<T>;

/**
 * Helper type for resolving keys of type T.
 */
export type Keys<T> = keyof T;
/**
 * Helper type for resolving types of type T.
 */
export type Values<T> = T[keyof T];

export type PropertyType<T extends object, K extends keyof T> = T[K];

/** The data for the current column. */
export type DataType = 'number' | 'string' | 'boolean';

/**
 * Configures the sort behavior for the grid.
 */
export interface GridSortConfiguration {
  /**
   * Whether multiple sorting is enabled.
   */
  multiple: boolean;
  /**
   * Whether tri-state sorting is enabled.
   */
  triState: boolean;
}

/**
 * Extended sort configuration for a column.
 */
export interface ColumnSortConfiguration<T extends object> {
  /**
   * Whether the sort operations will be case sensitive.
   */
  caseSensitive?: boolean;
  /**
   * Custom comparer function for sort operations for this column.
   */
  comparer?: (a: Values<T>, b: Values<T>) => number;
}

/**
 * Extended filter configuration for a column.
 */
export interface ColumnFilterConfiguration<T> {
  /**
   * Whether the filter operations will be case sensitive.
   */
  caseSensitive?: boolean;
  /**
   *
   *
   */
  strategy?: BaseOperands<T>;
}

/** Configuration object for grid columns. */
export interface ColumnConfiguration<T extends object> {
  /**
   * The field for from the data the this column will reference.
   */
  key: Keys<T>;
  /**
   * The type of data this column will reference.
   *
   * Affects the default filter operands if the column is with filtering enabled.
   *
   * @remarks
   * If not passed, `string` is assumed to be the default type.
   *
   */
  type?: DataType;
  /**
   * Optional text to display in the column header. By default, the column key is used
   * to render the header text.
   */
  headerText?: string;
  /**
   * Width for the current column.
   *
   * Accepts most CSS units for controlling width.
   *
   * @remarks
   * If not passed, the column will try to size itself based on the number of other
   * columns and the total width of the grid.
   *
   */
  width?: string;
  /**
   * Whether the column is hidden or not.
   */
  hidden?: boolean;
  /**
   * Whether the the column can be resized or not.
   */
  resizable?: boolean;
  /**
   * Whether the column can be sorted or not.
   */
  sort?: ColumnSortConfiguration<T> | boolean;
  /**
   * Whether filter operation can be applied on the column or not.
   */
  filter?: ColumnFilterConfiguration<T> | boolean;
  /**
   * Header template callback.
   */
  headerTemplate?: (params: ApexHeaderContext<T>) => TemplateResult;
  /**
   * Cell template callback.
   */
  cellTemplate?: (params: ApexCellContext<T>) => TemplateResult;
}

export interface ActiveNode<T> {
  column: Keys<T>;
  row: number;
}

/**
 * Context object for the column header template callback.
 */
export interface ApexHeaderContext<T extends object> {
  /**
   * The header element parent of the template.
   */
  parent: ApexGridHeader<T>;
  /**
   * The current configuration for the column.
   */
  column: ColumnConfiguration<T>;
}

/**
 * Context object for the row cell template callback.
 */
export interface ApexCellContext<T extends object> {
  /**
   * The cell element parent of the template.
   */
  parent: ApexGridCell<T>;
  /**
   * The row element containing the cell.
   */
  row: ApexGridRow<T>;
  /**
   * The current configuration for the column.
   */
  column: ColumnConfiguration<T>;
  /**
   * The value from the data source for this cell.
   */
  value: Values<T>;
}

/**
 * Remote sort callback function.
 *
 * The callback is passed the current data view state as well as the current sort state configuration of the grid.
 *
 */
export type RemoteSortHook<T> = (data: T[], state: SortState<T>) => T[] | Promise<T[]>;
/**
 * Remote filter callback function.
 *
 * The callback is passed the current data view state as well as the current filter state configuration of the grid.
 */
export type RemoteFilterHook<T> = (data: T[], state: FilterState<T>) => T[] | Promise<T[]>;

/** Configuration for grid remote operations. */
export interface GridRemoteConfig<T> {
  /**
   * Callback for remote sorting.
   */
  sort?: RemoteSortHook<T>;
  /**
   * Callback for remote filtering.
   */
  filter?: RemoteFilterHook<T>;
}
