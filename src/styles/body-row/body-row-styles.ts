import {css} from 'lit';

export default css`/* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */
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
  width: 100%;
  min-height: max(var(--is-large, 1) * 3.125rem, var(--is-medium, 1) * 2.125rem, var(--is-small, 1) * 1.5rem);
  -webkit-border-after: var(--igx-row-border-width, var(--header-border-width)) var(--igx-row-border-style, var(--header-border-style)) var(--igx-row-border-color, var(--header-border-color));
          border-block-end: var(--igx-row-border-width, var(--header-border-width)) var(--igx-row-border-style, var(--header-border-style)) var(--igx-row-border-color, var(--header-border-color));
  background: var(--igx-row-odd-background, var(--row-odd-background));
  color: var(--igx-row-odd-text-color, var(--row-odd-text-color));
  z-index: var(--z-index-base);
}

:host(:last-of-type) {
  border-bottom: 0;
}

:host(:nth-of-type(even)) {
  background: var(--igx-row-even-background, var(--row-even-background));
  color: var(--igx-row-even-text-color, var(--row-even-text-color));
}

:host(:hover) {
  background: var(--igx-row-hover-background, var(--row-hover-background));
  color: var(--igx-row-hover-text-color, var(--row-hover-text-color));
}`;
