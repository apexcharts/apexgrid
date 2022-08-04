import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import type { StateController } from '../controllers/state';
import type { ColumnType } from '../internal/types';
import styles from '../styles/header-row-styles.js';
import './header.js';

@customElement('igc-grid-header-row')
export default class GridHeaderRow<T extends object> extends LitElement {
  public static override styles = styles;

  @property({ attribute: false })
  public columns: Array<ColumnType<T>> = [];

  @property({ attribute: false })
  public state!: StateController<T>;

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
  }

  #getColumnSortState(column: ColumnType<T>) {
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
