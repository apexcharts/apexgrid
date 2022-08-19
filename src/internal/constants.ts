import type { ActiveNode, NavigationState } from './types';

export const PIPELINE = 'pipeline';
export const SORT_ICON_ASCENDING = 'keyboard_arrow_up' as const;
export const SORT_ICON_DESCENDING = 'keyboard_arrow_down' as const;

export const SENTINEL_NODE = Object.freeze<ActiveNode>({ column: '', row: -1 });
export const NAVIGATION_STATE = new Map<NavigationState, ActiveNode>([
  ['previous', SENTINEL_NODE],
  ['current', SENTINEL_NODE],
]);
