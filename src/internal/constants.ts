import type { ActiveNode, ColumnConfiguration, NavigationState } from './types.js';

const columnKey = Symbol();

export const PIPELINE = 'pipeline';
export const SORT_ICON_ASCENDING = 'arrow-upward' as const;
export const SORT_ICON_DESCENDING = 'arrow-downward' as const;

export const MIN_COL_RESIZE_WIDTH = 80;

export const SENTINEL_NODE: Readonly<ActiveNode<any>> = Object.freeze({ column: '', row: -1 });
export const DEFAULT_COLUMN_CONFIG = Object.freeze<ColumnConfiguration<any>>({
  key: columnKey,
  type: 'string',
  resizable: false,
  hidden: false,
  sort: false,
  filter: false,
});
export const NAVIGATION_STATE: Map<NavigationState, ActiveNode<any>> = new Map([
  ['previous', SENTINEL_NODE],
  ['current', SENTINEL_NODE],
]);
