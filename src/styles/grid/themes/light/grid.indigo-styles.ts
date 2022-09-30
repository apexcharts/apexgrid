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
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  height: 100%;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
      -ms-flex-flow: column;
          flex-flow: column;
  contain: content;
  font-family: var(--ig-font-family);
  -webkit-box-shadow: var(--ig-elevation-2);
          box-shadow: var(--ig-elevation-2);
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

:host {
  --content-background: var(hsla(var(--ig-gray-50), var(--ig-gray-a)));
  --content-text-color: var(var(--ig-gray-50-contrast));
  --header-background: hsla(var(--ig-gray-100), var(--ig-gray-a));
  --header-text-color: hsla(var(--ig-primary-500), var(--ig-primary-a));
  --header-border-width: 0.0625rem;
  --header-border-style: solid;
  --header-border-color: hsla(var(--ig-primary-500), 0.24);
  --sorted-header-icon-color: hsla(var(--ig-primary-500), var(--ig-primary-a));
  --row-hover-background: hsla(var(--ig-primary-50), var(--ig-primary-a));
  --row-hover-text-color: var(--ig-gray-200-contrast);
  --row-even-background: hsla(var(--ig-gray-50), var(--ig-gray-a));
  --row-even-text-color: var(--ig-gray-50-contrast);
  --row-odd-background: hsla(var(--ig-gray-50), var(--ig-gray-a));
  --row-odd-text-color: var(--ig-gray-50-contrast);
  --row-border-color: hsla(var(--ig-primary-50), var(--ig-primary-a));
  --row-border-style: var(--header-border-style);
  --row-border-width: var(--header-border-width);
  --cell-active-border-color: hsla(var(--ig-primary-500), var(--ig-primary-a));
  --grid-resize-line-color: hsla(var(--ig-primary-500), var(--ig-primary-a));
}`;
