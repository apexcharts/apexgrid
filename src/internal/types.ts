import { ReactiveControllerHost, TemplateResult } from 'lit';
import type ApexGrid from '../components/grid.js';
import type ApexGridCell from '../components/cell.js';
import type ApexGridRow from '../components/row.js';
import type ApexGridHeader from '../components/header.js';
import type { SortComparer, SortState } from '../operations/sort/types.js';
import type { FilterState } from '../operations/filter/state.js';

export type NavigationState = 'previous' | 'current';
export type GridHost<T extends object> = ReactiveControllerHost & ApexGrid<T>;

/**
 * Helper type for resolving keys of type T.
 */
export type Keys<T> = keyof T;

type BasePropertyType<T, K extends Keys<T> = Keys<T>> = T[K];

/**
 * Helper type for resolving types of type T.
 */
export type PropertyType<T, K extends Keys<T> = Keys<T>> = K extends Keys<T>
  ? BasePropertyType<T, K>
  : never;

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
export interface BaseColumnSortConfiguration<T, K extends Keys<T> = Keys<T>> {
  /**
   * Whether the sort operations will be case sensitive.
   */
  caseSensitive?: boolean;
  /**
   * Custom comparer function for sort operations for this column.
   */
  comparer?: SortComparer<T, K>;
}

/**
 * See {@link BaseColumnSortConfiguration} for the full documentation.
 */
export type ColumnSortConfiguration<T, K extends Keys<T> = Keys<T>> = K extends Keys<T>
  ? BaseColumnSortConfiguration<T, K>
  : never;

/**
 * Extended filter configuration for a column.
 */
export interface ColumnFilterConfiguration {
  /**
   * Whether the filter operations will be case sensitive.
   */
  caseSensitive?: boolean;
}

/** Configuration object for grid columns. */
export interface BaseColumnConfiguration<T extends object, K extends Keys<T> = Keys<T>> {
  /**
   * The field for from the data the this column will reference.
   */
  key: K;
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
  sort?: ColumnSortConfiguration<T, K> | boolean;
  /**
   * Whether filter operation can be applied on the column or not.
   */
  filter?: ColumnFilterConfiguration | boolean;
  /**
   * Header template callback.
   */
  headerTemplate?: (params: ApexHeaderContext<T>) => TemplateResult;
  /**
   * Cell template callback.
   */
  cellTemplate?: (params: ApexCellContext<T, K>) => TemplateResult;
}

/**
 * See {@link BaseColumnConfiguration} for the full documentation.
 */
export type ColumnConfiguration<T extends object, K extends Keys<T> = Keys<T>> = K extends Keys<T>
  ? BaseColumnConfiguration<T, K>
  : never;

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
export interface BaseApexCellContext<T extends object, K extends Keys<T> = Keys<T>> {
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
  column: ColumnConfiguration<T, K>;
  /**
   * The value from the data source for this cell.
   */
  value: PropertyType<T, K>;
}

/**
 * See {@link BaseApexCellContext} for the full documentation.
 */
export type ApexCellContext<T extends object, K extends Keys<T> = Keys<T>> = K extends Keys<T>
  ? BaseApexCellContext<T, K>
  : never;

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
