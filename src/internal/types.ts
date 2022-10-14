import { ReactiveControllerHost } from 'lit';
import type ApexGrid from '../components/grid';
import type ApexGridCell from '../components/cell';
import type ApexGridRow from '../components/row';
import type ApexGridHeader from '../components/header';
import type { SortState } from '../operations/sort/types';

export type Keys<T> = keyof T;
export type Values<T> = T[keyof T];
export type PropertyType<T extends object, K extends keyof T> = T[K];
export type PickTypeKeys<Obj, Type, T extends keyof Obj = keyof Obj> = {
  [P in keyof Obj]: Obj[P] extends Type ? P : never;
}[T];

export type PickType<T, Type> = Pick<T, PickTypeKeys<T, Type>>;

export type DataType = 'number' | 'string' | 'boolean';

export type GridHost<T extends object> = ReactiveControllerHost & ApexGrid<T>;

export interface Template {
  strings: TemplateStringsArray;
  values: unknown[];
}

export interface GridSortingConfig {
  multiple: boolean;
  triState: boolean;
}

export interface ColumnSortConfig<T extends object> {
  caseSensitive?: boolean;
  comparer?: (a: Values<T>, b: Values<T>) => number;
}

export interface ColumnFilterConfig {
  remote?: unknown;
}

export interface ColumnConfig<T extends object> {
  key: Keys<T>;
  type?: DataType;
  headerText?: string;
  width?: string;
  hidden?: boolean;
  resizable?: boolean;
  sort?: ColumnSortConfig<T> | boolean;
  filter?: ColumnFilterConfig | boolean;
  headerTemplate?: (props: ApexHeaderContext<T>) => Template;
  cellTemplate?: (props: ApexCellContext<T>) => Template;
}

export interface ActiveNode {
  column: string | number | symbol;
  row: number;
}

export interface ApexHeaderContext<T extends object> {
  parent: ApexGridHeader<T>;
  column: ColumnConfig<T>;
}
export interface ApexCellContext<T extends object> {
  parent: ApexGridCell<T>;
  row: ApexGridRow<T>;
  column: ColumnConfig<T>;
  value: T[keyof T];
}

export type NavigationState = 'previous' | 'current';

type RemoteSortHook<T extends object> = (state: SortState<T>) => T[];
export interface GridRemoteConfig<T extends object> {
  sort: RemoteSortHook<T>;
}
