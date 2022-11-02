import type { ActiveNode, ColumnConfig, NavigationState } from './types';

const columnKey = Symbol();

export const PIPELINE = 'pipeline';
export const SORT_ICON_ASCENDING = 'arrow-upward' as const;
export const SORT_ICON_DESCENDING = 'arrow-downward' as const;

export const MIN_COL_RESIZE_WIDTH = 80;

export const SENTINEL_NODE = Object.freeze<ActiveNode>({ column: '', row: -1 });
export const DEFAULT_COLUMN_CONFIG: ColumnConfig<any> = Object.freeze<ColumnConfig<any>>({
  key: columnKey,
  type: 'string',
  resizable: false,
  hidden: false,
  sort: false,
  filter: false,
});
export const NAVIGATION_STATE = new Map<NavigationState, ActiveNode>([
  ['previous', SENTINEL_NODE],
  ['current', SENTINEL_NODE],
]);
