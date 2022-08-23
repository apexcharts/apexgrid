import { css } from 'lit';

export default css`:host {
  display: -webkit-inline-box;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-box-flex: 1;
      -ms-flex: 1 0 0px;
          flex: 1 0 0;
  contain: content;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  padding: 0 1.5rem;
  color: inherit;
}

:host([active]) {
  outline: none;
  -webkit-box-shadow: inset 0 0 0 0.0625rem var(--cell-active-border-color);
          box-shadow: inset 0 0 0 0.0625rem var(--cell-active-border-color);
}

:host(:last-child) {
  -webkit-border-end: none;
          border-inline-end: none;
}

igc-input {
  position: absolute;
  top: 0.0625rem;
  left: 0.0625rem;
  width: calc(100% - 0.0625rem * 2);
  height: calc(100% - 0.0625rem * 2);
}
igc-input::part(container), igc-input::part(input) {
  height: 100%;
}
igc-input::part(input) {
  border: none;
  -webkit-box-shadow: none;
          box-shadow: none;
  border-radius: 0;
}`;
