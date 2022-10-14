import { html, LitElement, nothing } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { GRID_HEADER_ROW_TAG } from '../internal/tags.js';
import type { StateController } from '../controllers/state';
import type { ColumnConfig } from '../internal/types';
import styles from '../styles/header-row/header-row.base-styles.js';
import ApexGridHeader from './header.js';

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

  @property({ attribute: false })
  public state!: StateController<T>;

  public get headers() {
    return Array.from(this._headers);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
  }

  #getColumnSortState(column: ColumnConfig<T>) {
    return this.state.sorting.state.get(column.key);
  }

  #getFilterState(column: ColumnConfig<T>) {
    return this.state.filtering.state.get(column.key)?.length ?? 0;
  }

  #getSortIndex(column: ColumnConfig<T>) {
    return Array.from(this.state.sorting.state.values()).indexOf(this.#getColumnSortState(column)!);
  }

  protected override render() {
    return html`${map(this.columns, column =>
      column.hidden
        ? nothing
        : html`<apx-grid-header
            .column=${column}
            .sortState=${this.#getColumnSortState(column)}
            .sortIndex=${this.#getSortIndex(column)}
            .filterCount=${this.#getFilterState(column)}
          ></apx-grid-header>`,
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexGridHeaderRow.is]: ApexGridHeaderRow<object>;
  }
}
