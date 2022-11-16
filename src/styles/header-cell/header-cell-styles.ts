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
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  position: relative;
  -webkit-border-end: var(--igx-header-border-width, var(--header-border-width)) var(--igx-header-border-style, var(--header-border-style)) var(--igx-header-border-color, var(--header-border-color));
          border-inline-end: var(--igx-header-border-width, var(--header-border-width)) var(--igx-header-border-style, var(--header-border-style)) var(--igx-header-border-color, var(--header-border-color));
  font-weight: 600;
  font-size: 0.75rem;
}

:host(:last-of-type) {
  -webkit-border-end: none;
          border-inline-end: none;
}

[part~=content] {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  -webkit-box-pack: justify;
      -ms-flex-pack: justify;
          justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 0 max(var(--is-large, 1) * 1.5rem, var(--is-medium, 1) * 1rem, var(--is-small, 1) * 0.5rem);
  font-weight: 500;
  overflow: hidden;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
}

[part~=title] {
  display: block;
  position: relative;
  cursor: initial;
  white-space: nowrap;
  -o-text-overflow: ellipsis;
     text-overflow: ellipsis;
  overflow: hidden;
  min-width: 3ch;
}

[part~=actions] {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  gap: 0.25rem;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
}

[part~=action] {
  cursor: pointer;
  opacity: 0.7;
  -webkit-transition: opacity 0.25s ease-in-out;
  -o-transition: opacity 0.25s ease-in-out;
  transition: opacity 0.25s ease-in-out;
}
[part~=action]:hover, [part~=action]:focus {
  opacity: 1;
}
[part~=action] igc-icon {
  --size: 0.9375rem;
  color: var(--igx-icon-color, var(--icon-color));
}
[part~=action] igc-icon::after {
  content: attr(data-sortIndex);
  position: absolute;
  top: -5px;
  inset-inline-end: -1px;
  font-size: 0.625rem;
  text-align: end;
  font-family: sans-serif;
  line-height: 0.625rem;
  color: var(--igx-sorted-header-icon-color, var(--sorted-header-icon-color));
}

[part~=sorted],
[part~=filtered] {
  color: var(--igx-sorted-header-icon-color, var(--sorted-header-icon-color));
}
[part~=sorted] igc-icon,
[part~=filtered] igc-icon {
  color: var(--igx-sorted-header-icon-color, var(--sorted-header-icon-color));
}

[part~=filtered] {
  background: var(--igx-filtering-header-background, var(--filtering-header-background));
}

[part~=action]:empty {
  display: none;
}

[part~=resizable] {
  width: 0.25rem;
  height: 100%;
  position: absolute;
  inset-inline-end: -0.125rem;
  z-index: var(--z-index-base);
  cursor: col-resize;
}

[part~=filter] {
  position: relative;
}

[part~=filter-count] {
  position: absolute;
  top: -5px;
  inset-inline-end: -1px;
  font-size: 0.625rem;
  text-align: end;
  font-family: sans-serif;
  line-height: 0.625rem;
  color: currentcolor;
}`;
