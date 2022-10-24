import {css} from 'lit';

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
  --ig-size: 1;
  display: grid;
  min-height: max(var(--is-large, 1) * 3.125rem, var(--is-medium, 1) * 2.125rem, var(--is-small, 1) * 1.5rem);
  background: var(--igx-header-background, var(--header-background));
  color: var(--igx-header-text-color, var(--header-text-color));
  -webkit-border-after: var(--igx-header-border-width, var(--header-border-width)) var(--igx-header-border-style, var(--header-border-style)) var(--igx-header-border-color, var(--header-border-color));
          border-block-end: var(--igx-header-border-width, var(--header-border-width)) var(--igx-header-border-style, var(--header-border-style)) var(--igx-header-border-color, var(--header-border-color));
}

[part=filter-row-preview] {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  overflow: hidden;
  padding: 0 max(var(--is-large, 1) * 1.5rem, var(--is-medium, 1) * 1rem, var(--is-small, 1) * 0.5rem);
}

[part~=filter-row-input],
[part~=filter-row-filters],
[part~=filter-actions] {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  gap: 0.5rem;
}

[part~=filter-row-filters] {
  -webkit-box-flex: 1;
      -ms-flex: 1;
          flex: 1;
  overflow: hidden;
}

[part~=active-state] {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  padding: 0 max(var(--is-large, 1) * 1.5rem, var(--is-medium, 1) * 1rem, var(--is-small, 1) * 0.5rem);
  width: 100%;
  gap: 0.5rem;
}`;
