import { css } from 'lit';

export const styles = css`/* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */ /* stylelint-disable max-line-length */
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
  position: relative;
  display: -webkit-inline-box;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-box-flex: 1;
      -ms-flex: 1 0 0px;
          flex: 1 0 0;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  padding: 0 max(var(--is-large, 1) * 1.5rem, var(--is-medium, 1) * 1rem, var(--is-small, 1) * 0.5rem);
  color: inherit;
  border-right: var(--igx-row-border-width, var(--row-border-width)) solid transparent;
  font-size: 0.8125rem;
  overflow-wrap: anywhere;
}
:host:last-of-type {
  border-right: 0;
}

:host([active]) {
  outline: none;
  -webkit-box-shadow: inset 0 0 0 0.0625rem var(--igx-cell-active-border-color, var(--cell-active-border-color));
          box-shadow: inset 0 0 0 0.0625rem var(--igx-cell-active-border-color, var(--cell-active-border-color));
}

:host(:last-child) {
  -webkit-border-end: none;
          border-inline-end: none;
}

igc-input {
  position: absolute;
  left: 0;
  height: calc(100% - 0.0625rem * 2);
  width: 100%;
}
igc-input::part(container), igc-input::part(input) {
  border-color: transparent;
  -webkit-box-shadow: none;
          box-shadow: none;
  height: 100%;
}

igc-input::part(container), igc-input::part(input),
igc-select::part(container),
igc-select::part(input) {
  background: inherit;
  color: inherit;
  font-size: 0.8125rem;
}
igc-input::part(helper-text)::after, igc-input::part(container)::after,
igc-select::part(helper-text)::after,
igc-select::part(container)::after {
  display: none;
}`;
