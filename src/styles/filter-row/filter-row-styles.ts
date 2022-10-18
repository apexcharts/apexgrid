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

@-webkit-keyframes slide-down {
  0% {
    opacity: 0.35;
    -webkit-transform: translate(0, -0.625rem);
            transform: translate(0, -0.625rem);
  }
  100% {
    opacity: 1;
  }
}

@keyframes slide-down {
  0% {
    opacity: 0.35;
    -webkit-transform: translate(0, -0.625rem);
            transform: translate(0, -0.625rem);
  }
  100% {
    opacity: 1;
  }
}
:host {
  --ig-size: 1;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  gap: 1rem;
  position: absolute;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  inset-block-start: var(--header-row-bottom);
  inset-inline-start: 0;
  width: 100%;
  min-height: max(var(--is-large, 1) * 3.125rem, var(--is-medium, 1) * 2.125rem, var(--is-small, 1) * 1.5rem);
  z-index: 1;
  background: var(--igx-filtering-row-background, var(--filtering-row-background));
  color: var(--igx-header-text-color, var(--header-text-color));
  padding: 0 max(var(--is-large, 1) * 1.5rem, var(--is-medium, 1) * 1rem, var(--is-small, 1) * 0.5rem);
  -webkit-box-sizing: border-box;
          box-sizing: border-box;
  -webkit-animation: slide-down 180ms ease-in-out both;
          animation: slide-down 180ms ease-in-out both;
  -webkit-box-shadow: var(--ig-elevation-1);
          box-shadow: var(--ig-elevation-1);
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
}`;
