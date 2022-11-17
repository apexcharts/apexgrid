import { ReactiveControllerHost, TemplateResult } from 'lit';
import type ApexGrid from '../components/grid.js';
import type ApexGridCell from '../components/cell.js';
import type ApexGridRow from '../components/row.js';
import type ApexGridHeader from '../components/header.js';
import type { BaseOperands } from '../operations/filter/operands/base.js';
import type { SortState } from '../operations/sort/types.js';
import type { FilterState } from '../operations/filter/state.js';

export type Keys<T> = keyof T;
export type Values<T> = T[keyof T];
export type PropertyType<T extends object, K extends keyof T> = T[K];

/** The data for the current column */
export type DataType = 'number' | 'string' | 'boolean';

export type GridHost<T extends object> = ReactiveControllerHost & ApexGrid<T>;

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
   * @remark
   * If not passed, `string` is assumed to be the default type.
   *
   */
  type?: DataType;
  /**
   * Optional text to display in the column header. By def
   */
  headerText?: string;
  /**
   * Width for the current column.
   *
   * Accepts most CSS units for controlling width.
   *
   * @remark
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
   *
   */
  headerTemplate?: (props: ApexHeaderContext<T>) => TemplateResult;
  /**
   *
   */
  cellTemplate?: (props: ApexCellContext<T>) => TemplateResult;
}

export interface ActiveNode<T> {
  column: Keys<T>;
  row: number;
}

export interface ApexHeaderContext<T extends object> {
  parent: ApexGridHeader<T>;
  column: ColumnConfiguration<T>;
}
export interface ApexCellContext<T extends object> {
  parent: ApexGridCell<T>;
  row: ApexGridRow<T>;
  column: ColumnConfiguration<T>;
  value: Values<T>;
}

export type NavigationState = 'previous' | 'current';

export type RemoteSortHook<T> = (data: T[], state: SortState<T>) => T[] | Promise<T[]>;
export type RemoteFilterHook<T> = (data: T[], state: FilterState<T>) => [] | Promise<T[]>;
export interface GridRemoteConfig<T> {
  sort?: RemoteSortHook<T>;
  filter?: RemoteFilterHook<T>;
}
