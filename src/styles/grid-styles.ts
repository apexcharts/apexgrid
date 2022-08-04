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
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
}

igc-grid-row:nth-of-type(even) {
  background-color: #eee;
}

igc-grid-row:hover {
  background-color: lightblue;
}`;
