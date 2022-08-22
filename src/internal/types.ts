import { ReactiveControllerHost } from 'lit';
import type Grid from '../components/grid';
import type GridCell from '../components/cell';
import type GridRow from '../components/row';
import type GridHeader from '../components/header';
import type { SortState } from '../operations/sort/types';

export type Keys<T extends object> = keyof T;
export type Values<T extends object> = T[keyof T];
export type PropertyType<T extends object, K extends keyof T> = T[K];
// export type PickTypeKeys<Obj, Type, T extends keyof Obj = keyof Obj> = {
//   [P in keyof Obj]: Obj[P] extends Type ? P : never;
// }[T];

// export type PickType<T, Type> = Pick<T, PickTypeKeys<T, Type>>;

export type DataType = 'number' | 'string' | 'boolean';

export type GridHost<T extends object> = ReactiveControllerHost & Grid<T>;

export interface Template {
  strings: TemplateStringsArray;
  values: unknown[];
}

export interface ColumnSortConfig {
  caseSensitive?: boolean;
  comparator?: unknown;
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
  sort?: ColumnSortConfig | boolean;
  filter?: ColumnFilterConfig | boolean;
  headerTemplate?: (props: HeaderContext<T>) => Template;
  cellTemplate?: (props: CellContext<T>) => Template;
}

export interface ActiveNode {
  column: string | number | symbol;
  row: number;
}

export interface HeaderContext<T extends object> {
  parent: GridHeader<T>;
  column: ColumnConfig<T>;
}
export interface CellContext<T extends object> {
  parent: GridCell<T>;
  row: GridRow<T>;
  column: ColumnConfig<T>;
  value: T[keyof T];
}

export type NavigationState = 'previous' | 'current';

type RemoteSortHook<T extends object> = (state: SortState<T>) => T[];
export interface GridRemoteConfig<T extends object> {
  sort: RemoteSortHook<T>;
}
