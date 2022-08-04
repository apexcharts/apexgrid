import { ReactiveControllerHost } from 'lit';
import type { Grid } from '../components/grid';

export type Keys<T extends object> = keyof T;
export type Values<T extends object> = T[keyof T];
export type PropertyType<T extends object, K extends keyof T> = T[K];

export type DataType = 'number' | 'string' | 'boolean';

export type GridHost<T extends object> = ReactiveControllerHost & Grid<T>;

export interface Template {
  strings: TemplateStringsArray;
  values: unknown[];
}

export interface ColumnSortConfig {
  caseSensitive?: boolean;
  comparator?: unknown;
  remote?: unknown;
}

export interface ColumnType<T extends object> {
  key: Keys<T>;
  type?: DataType;
  headerText?: string;
  hidden?: boolean;
  sort?: ColumnSortConfig;
  filter?: boolean;
  headerTemplate?: (props: unknown) => Template;
  cellTemplate?: (props: unknown) => Template;
}

export interface ActiveNode {
  column: string | number | symbol;
  row: number;
}

export type NavigationState = 'previous' | 'current';
