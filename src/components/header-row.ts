import { html, LitElement, nothing } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { GRID_HEADER_ROW_TAG } from '../internal/tags.js';
import type { StateController } from '../controllers/state';
import type { ColumnConfig } from '../internal/types';
import styles from '../styles/components/header-row/header-row-styles';
import GridHeader from './header.js';

@customElement(GRID_HEADER_ROW_TAG)
export default class GridHeaderRow<T extends object> extends LitElement {
  public static get is() {
    return GRID_HEADER_ROW_TAG;
  }
  public static override styles = styles;

  @queryAll(GridHeader.is)
  protected _headers!: NodeListOf<GridHeader<T>>;

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

  protected override render() {
    return html`${map(this.columns, column =>
      column.hidden
        ? nothing
        : html`<igc-grid-header
            .column=${column}
            .sortState=${this.#getColumnSortState(column)}
          ></igc-grid-header>`,
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-grid-header-row': GridHeaderRow<object>;
  }
}
