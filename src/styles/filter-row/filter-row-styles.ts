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
}`;
