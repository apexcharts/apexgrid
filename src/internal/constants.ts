import type { ActiveNode, NavigationState } from './types';

export const PIPELINE = 'pipeline';
export const SORT_ICON_ASCENDING = 'arrow-upward' as const;
export const SORT_ICON_DESCENDING = 'arrow-downward' as const;

export const SENTINEL_NODE = Object.freeze<ActiveNode>({ column: '', row: -1 });
export const NAVIGATION_STATE = new Map<NavigationState, ActiveNode>([
  ['previous', SENTINEL_NODE],
  ['current', SENTINEL_NODE],
]);
