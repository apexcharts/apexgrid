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

igc-grid-body {
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
igc-grid-body:focus {
  outline: none;
}

:host {
  --content-background: var(hsla(var(--ig-gray-50), var(--ig-gray-a)));
  --content-text-color: var(var(--ig-gray-50-contrast));
  --header-background: hsla(var(--ig-gray-100), var(--ig-gray-a));
  --header-text-color: hsla(var(--ig-gray-800), 0.7);
  --header-border-width: 0.0625rem;
  --header-border-style: solid;
  --header-border-color: hsla(var(--ig-gray-400), 0.38);
  --sorted-header-icon-color: hsla(var(--ig-secondary-500), var(--ig-secondary-a));
  --row-hover-background: hsla(var(--ig-gray-200), var(--ig-gray-a));
  --row-hover-text-color: var(--ig-gray-200-contrast);
  --row-even-background: hsla(var(--ig-gray-50), var(--ig-gray-a));
  --row-even-text-color: hsla(var(--ig-gray-800), var(--ig-gray-a));
  --row-odd-background: hsla(var(--ig-gray-50), var(--ig-gray-a));
  --row-odd-text-color: hsla(var(--ig-gray-800), var(--ig-gray-a));
  --row-border-color: hsla(var(--ig-gray-300), 0.38);
  --row-border-style: var(--header-border-style);
  --row-border-width: var(--header-border-width);
  --cell-active-border-color: hsla(var(--ig-secondary-500), var(--ig-secondary-a));
}`;
