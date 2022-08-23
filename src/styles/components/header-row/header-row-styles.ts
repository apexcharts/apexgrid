import { css } from 'lit';

export default css`:host {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
  min-height: 3.125rem;
  background: var(--header-background);
  color: var(--header-text-color);
  contain: content;
  border-bottom: 1px solid #ccc;
}

:host(:focus) {
  outline: none;
}`;
