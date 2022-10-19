import { html, LitElement, nothing, PropertyValueMap } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { GRID_HEADER_ROW_TAG } from '../internal/tags.js';

import ApexGridHeader from './header.js';
import styles from '../styles/header-row/header-row.base-styles.js';

import type { ColumnConfig } from '../internal/types';

@customElement(GRID_HEADER_ROW_TAG)
export default class ApexGridHeaderRow<T extends object> extends LitElement {
  public static get is() {
    return GRID_HEADER_ROW_TAG;
  }
  public static override styles = styles;

  @queryAll(ApexGridHeader.is)
  protected _headers!: NodeListOf<ApexGridHeader<T>>;

  @property({ attribute: false })
  public columns: Array<ColumnConfig<T>> = [];

  public get headers() {
    return Array.from(this._headers);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
  }

  protected override shouldUpdate(props: PropertyValueMap<this> | Map<PropertyKey, this>): boolean {
    this.headers.forEach(header => header.requestUpdate());
    return super.shouldUpdate(props);
  }

  protected override render() {
    return html`${map(this.columns, column =>
      column.hidden ? nothing : html`<apx-grid-header .column=${column}></apx-grid-header>`,
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexGridHeaderRow.is]: ApexGridHeaderRow<object>;
  }
}
