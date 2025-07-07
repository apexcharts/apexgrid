import { css } from 'lit';
export const styles = css`:host{--is-large: clamp(0, (var(--component-size, 1) + 1) - var(--ig-size-large, 3), 1);--is-medium: min( clamp(0, (var(--component-size, 1) + 1) - var(--ig-size-medium, 2), 1), clamp(0, var(--ig-size-large, 3) - var(--component-size, 1), 1) );--is-small: clamp(0, var(--ig-size-medium) - var(--component-size, 1), 1);--component-size: 3}`;
