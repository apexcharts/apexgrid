import { css } from 'lit';

export default css`:host {
  --content-background: #f9fafa;
  --content-text-color: black;
  --row-hover-background: #ebedef;
  --row-hover-text-color: black;
  --row-even-background: #f9fafa;
  --row-even-text-color: black;
  --row-odd-background: #f9fafa;
  --row-odd-text-color: black;
  --row-border-color: rgba(148, 158, 169, 0.38);
  --cell-active-border-color: #0d6efd;
  --header-background: #f8f9fa;
  --header-text-color: black;
  --header-border-width: 0.0625rem;
  --header-border-style: solid;
  --header-border-color: rgba(182, 189, 196, 0.38);
  --sorted-header-icon-color: #0d6efd;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  height: 100%;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
      -ms-flex-flow: column;
          flex-flow: column;
  contain: content;
  -webkit-box-shadow: var(--ig-elevation-2);
          box-shadow: var(--ig-elevation-2);
}

igc-grid-body {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
      -ms-flex-flow: column;
          flex-flow: column;
  -webkit-box-flex: 1;
      -ms-flex: 1;
          flex: 1;
  background: var(--content-background);
  color: var(--content-text-color);
}
igc-grid-body:focus {
  outline: none;
}`;
