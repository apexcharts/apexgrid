import { css } from 'lit';

export default css`:host {
  display: grid;
  width: 100%;
  contain: content;
}

igc-grid-cell {
  border-right: 1px solid hsla(var(--igc-gray-400));
}
igc-grid-cell:last-child {
  border-right: none;
}
igc-grid-cell[active] {
  outline-offset: -1px;
  outline: 2px solid hsla(var(--igc-secondary-500));
}`;
