import { css } from 'lit';

export const styles = css`                    
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
  grid-row: filter-row;
  min-height: max(var(--is-large, 1) * 3.125rem, var(--is-medium, 1) * 2.125rem, var(--is-small, 1) * 1.5rem);
  background: var(--igx-header-background, var(--header-background));
  color: var(--igx-header-text-color, var(--header-text-color));
  -webkit-border-after: var(--igx-header-border-width, var(--header-border-width)) var(--igx-header-border-style, var(--header-border-style)) var(--igx-header-border-color, var(--header-border-color));
          border-block-end: var(--igx-header-border-width, var(--header-border-width)) var(--igx-header-border-style, var(--header-border-style)) var(--igx-header-border-color, var(--header-border-color));
  z-index: var(--z-index-base);
  -webkit-padding-end: var(--scrollbar-offset);
          padding-inline-end: var(--scrollbar-offset);
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
  background: var(--igx-filtering-row-background, var(--filtering-row-background));
  color: var(--igx-filtering-row-text-color, var(--filtering-row-text-color));
  -webkit-border-end: var(--igx-header-border-width, var(--header-border-width)) var(--igx-header-border-style, var(--header-border-style)) var(--igx-header-border-color, var(--header-border-color));
          border-inline-end: var(--igx-header-border-width, var(--header-border-width)) var(--igx-header-border-style, var(--header-border-style)) var(--igx-header-border-color, var(--header-border-color));
}

[part~=active-state] {
  background: var(--igx-filtering-row-background, var(--filtering-row-background));
  color: var(--igx-filtering-row-text-color, var(--filtering-row-text-color));
  min-height: max(var(--is-large, 1) * 3.125rem, var(--is-medium, 1) * 2.125rem, var(--is-small, 1) * 1.5rem);
  min-width: 100%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  gap: 0.5rem;
  position: relative;
  inset-block-start: -0.0625rem;
}

[part=filter-row-preview]:last-of-type {
  -webkit-border-end: none;
          border-inline-end: none;
}

[part~=filter-row-input] {
  -webkit-padding-start: max(var(--is-large, 1) * 1.5rem, var(--is-medium, 1) * 1rem, var(--is-small, 1) * 0.5rem);
          padding-inline-start: max(var(--is-large, 1) * 1.5rem, var(--is-medium, 1) * 1rem, var(--is-small, 1) * 0.5rem);
}

[part~=filter-row-actions] {
  -webkit-padding-end: max(var(--is-large, 1) * 1.5rem, var(--is-medium, 1) * 1rem, var(--is-small, 1) * 0.5rem);
          padding-inline-end: max(var(--is-large, 1) * 1.5rem, var(--is-medium, 1) * 1rem, var(--is-small, 1) * 0.5rem);
}

[part~=filter-row-input],
[part~=filter-row-filters],
[part~=filter-row-actions] {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
}

[part~=filter-row-filters] {
  -webkit-box-flex: 1;
      -ms-flex: 1;
          flex: 1;
  overflow: hidden;
}

igc-input::part(container), igc-input::part(input) {
  background: inherit;
  color: inherit;
}`;
