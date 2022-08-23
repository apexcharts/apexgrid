import { css } from 'lit';

export default css`:host {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
  width: 100%;
  min-height: 3.125rem;
  contain: content;
  -webkit-border-after: 0.0625rem solid var(--row-border-color);
          border-block-end: 0.0625rem solid var(--row-border-color);
  background: var(--row-odd-background);
  color: var(--row-odd-text-color);
}

:host(:last-of-type) {
  border-bottom: 0;
}

:host(:nth-of-type(even)) {
  background: var(--row-even-background);
  color: var(--row-even-text-color);
}

:host(:hover) {
  background: var(--row-hover-background);
  color: var(--row-hover-text-color);
}`;
