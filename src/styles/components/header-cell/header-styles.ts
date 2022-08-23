import { css } from 'lit';

export default css`:host {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  contain: content;
  -webkit-border-end: var(--header-border-width) var(--header-border-style) var(--header-border-color);
          border-inline-end: var(--header-border-width) var(--header-border-style) var(--header-border-color);
}

:host(:last-of-type) {
  -webkit-border-end: none;
          border-inline-end: none;
}

[part~=content] {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  -webkit-box-pack: justify;
      -ms-flex-pack: justify;
          justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 0 1.5rem;
  font-weight: 500;
  overflow: hidden;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
}

[part~=sortable] {
  cursor: pointer;
}

[part~=title] {
  display: block;
  position: relative;
  cursor: initial;
  white-space: nowrap;
  -o-text-overflow: ellipsis;
     text-overflow: ellipsis;
  overflow: hidden;
  min-width: 3ch;
}

[part~=action] igc-icon {
  --size: 0.9375rem;
  color: var(--sorted-header-icon-color);
}`;
