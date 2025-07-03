import { css } from 'lit';

export const styles = css`
  /* stylelint-disable max-line-length */
  :host {
    --is-large: clamp(0, (var(--component-size, 1) + 1) - var(--ig-size-large, 3), 1);
    --is-medium: min(
        clamp(0, (var(--component-size, 1) + 1) - var(--ig-size-medium, 2), 1),
        clamp(0, var(--ig-size-large, 3) - var(--component-size, 1), 1)
    );
    --is-small: clamp(0, var(--ig-size-medium) - var(--component-size, 1), 1);
    --component-size: 3;
  }

  :host {
    display: grid;
    height: 100%;
    position: relative;
    font-family: var(--ig-font-family);
    box-shadow: var(--ig-elevation-2);
    overflow: auto hidden;
    grid-template-rows: [header-row] max-content [filter-row] max-content [virtualized-container] auto;
    --scrollbar-offset: 0;
    --z-index-base: 1;
  }

  apex-virtualizer {
    grid-row: virtualized-container;
    display: flex;
    flex-flow: column;
    flex: 1;
    background: var(--igx-content-background, var(--content-background));
    color: var(--igx-content-text-color, var(--content-text-color));
    overflow: hidden auto !important;
  }

  apex-virtualizer:focus {
    outline: none;
  }

  [part~=resize-indicator] {
    position: absolute;
    height: 100%;
    background-color: var(--igx-grid-resize-line-color, var(--grid-resize-line-color));
    width: 0.125rem;
    inset-inline-start: 0;
    top: 0;
    z-index: calc(var(--z-index-base) + 1);
  }

  :host {
    --content-background: var(var(--ig-gray-50));
    --content-text-color: var(var(--ig-gray-50-contrast));
    --header-background: var(--ig-gray-100);
    --header-text-color: var(--ig-primary-500);
    --header-border-width: 0.0625rem;
    --header-border-style: solid;
    --header-border-color: hsl(from var(--ig-primary-500) h s l/0.24);
    --filtering-header-background: var(--ig-gray-50);
    --filtering-row-background: var(--ig-gray-50);
    --filtering-row-text-color: var(--ig-gray-50-contrast);
    --sorted-header-icon-color: var(--ig-primary-500);
    --icon-color: "currentColor";
    --row-hover-background: var(--ig-primary-50);
    --row-hover-text-color: var(--ig-gray-200-contrast);
    --row-even-background: var(--ig-gray-50);
    --row-even-text-color: var(--ig-gray-50-contrast);
    --row-odd-background: var(--ig-gray-50);
    --row-odd-text-color: var(--ig-gray-50-contrast);
    --row-border-color: var(--ig-primary-50);
    --row-border-style: var(--header-border-style);
    --row-border-width: var(--header-border-width);
    --cell-active-border-color: var(--ig-primary-500);
    --grid-resize-line-color: var(--ig-primary-500);
  }

`;
