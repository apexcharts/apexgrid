import { css } from 'lit';

export default css`:host {
  display: -webkit-inline-box;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -webkit-box-flex: 1;
      -ms-flex: 1 0 0px;
          flex: 1 0 0;
  padding: 0.5rem 0;
  contain: content;
  font-weight: 500;
}

[part~=sortable] {
  cursor: pointer;
}`;
