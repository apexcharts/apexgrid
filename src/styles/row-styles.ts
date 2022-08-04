import { css } from 'lit';

export default css`:host {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
  contain: content;
}

igc-grid-cell {
  border-right: 1px solid #ccc;
}
igc-grid-cell:last-child {
  border-right: none;
}
igc-grid-cell[active] {
  outline-offset: -1px;
  outline: 2px solid deeppink;
}`;
