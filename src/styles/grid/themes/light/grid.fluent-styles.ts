import { css } from 'lit';

export default css`/* stylelint-disable max-line-length */
:host {
  --is-large: clamp(0, (var(--component-size, 1) + 1) - var(--ig-size-large, 3), 1);
  --is-medium:
      min(
          clamp(0, (var(--component-size, 1) + 1) - var(--ig-size-medium, 2), 1),
          clamp(0, var(--ig-size-large, 3) - var(--component-size, 1), 1)
      );
  --is-small: clamp(0, var(--ig-size-medium) - var(--component-size, 1), 1);
  --component-size: 3;
}

:host {
  display: grid;
  height: 100%;
  contain: content;
  font-family: var(--ig-font-family);
  -webkit-box-shadow: var(--ig-elevation-2);
          box-shadow: var(--ig-elevation-2);
  overflow: auto hidden;
  grid-template-rows: -webkit-max-content auto;
  grid-template-rows: max-content auto;
}

apx-grid-body {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
      -ms-flex-flow: column;
          flex-flow: column;
  -webkit-box-flex: 1;
      -ms-flex: 1;
          flex: 1;
  background: var(--igx-content-background, var(--content-background));
  color: var(--igx-content-text-color, var(--content-text-color));
}
apx-grid-body:focus {
  outline: none;
}

[part~=resize-indicator] {
  position: absolute;
  height: 100%;
  background-color: var(--igx-grid-resize-line-color, var(--grid-resize-line-color));
  width: 0.125rem;
  inset-inline-start: 0;
  top: 0;
  z-index: 1;
}

@-webkit-keyframes slide-down {
  from {
    opacity: 0.35;
    -webkit-transform: translate(0, -0.625rem);
            transform: translate(0, -0.625rem);
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-down {
  from {
    opacity: 0.35;
    -webkit-transform: translate(0, -0.625rem);
            transform: translate(0, -0.625rem);
  }
  to {
    opacity: 1;
  }
}
[part~=filter-row] {
  -webkit-animation: slide-down 180ms ease-in-out both;
          animation: slide-down 180ms ease-in-out both;
  position: absolute;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  background: var(--igx-header-background, var(--header-background));
  color: var(--igx-header-text-color, var(--header-text-color));
  width: 100%;
  inset-block-start: var(--header-row-bottom);
  inset-inline-start: 0;
  z-index: 1;
}

:host {
  --content-background: var(hsla(var(--ig-gray-50), var(--ig-gray-a)));
  --content-text-color: var(var(--ig-gray-50-contrast));
  --header-background: hsla(var(--ig-surface-500), var(--ig-surface-a));
  --header-text-color: var(--ig-surface-500-contrast);
  --header-border-width: 0.0625rem;
  --header-border-style: solid;
  --header-border-color: hsla(var(--ig-gray-100), var(--ig-gray-a));
  --sorted-header-icon-color: hsla(var(--ig-secondary-500), var(--ig-secondary-a));
  --row-hover-background: hsla(var(--ig-gray-200), var(--ig-gray-a));
  --row-hover-text-color: var(--ig-gray-200-contrast);
  --row-even-background: hsla(var(--ig-gray-50), var(--ig-gray-a));
  --row-even-text-color: var(--ig-gray-50-contrast);
  --row-odd-background: hsla(var(--ig-gray-50), var(--ig-gray-a));
  --row-odd-text-color: var(--ig-gray-50-contrast);
  --row-border-color: hsla(var(--ig-gray-100), var(--ig-gray-a));
  --row-border-style: var(--header-border-style);
  --row-border-width: var(--header-border-width);
  --cell-active-border-color: hsla(var(--ig-primary-500), var(--ig-primary-a));
  --grid-resize-line-color: hsla(var(--ig-primary-500), var(--ig-primary-a));
}`;
