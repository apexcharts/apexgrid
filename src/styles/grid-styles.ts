import { css } from 'lit';

export default css`:host {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  height: 100%;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
      -ms-flex-flow: column;
          flex-flow: column;
  contain: content;
}

igc-grid-row {
  border: 1px solid hsla(var(--igc-gray-400));
  border-top: none;
}

igc-grid-row:nth-of-type(even) {
  background-color: hsla(var(--igc-gray-200));
}

igc-grid-row:hover {
  background-color: hsla(var(--igc-primary-50));
}`;
