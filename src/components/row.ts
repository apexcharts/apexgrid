import { html, LitElement, nothing } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import type { ActiveNode, ColumnType } from '../internal/types';
import type GridCell from './cell';
import styles from '../styles/row-styles.js';

import './cell.js';

@customElement('igc-grid-row')
export default class GridRow<T extends object> extends LitElement {
  public static override styles = styles;

  @queryAll('igc-grid-cell')
  public cells!: NodeListOf<GridCell<T>>;

  @property({ attribute: false })
  public data!: T;

  @property({ attribute: false })
  public columns: Array<ColumnType<T>> = [];

  @property({ attribute: false })
  public activeNode!: ActiveNode;

  @property({ attribute: false, type: Number })
  public index = -1;

  protected override render() {
    const { column: key, row: index } = this.activeNode;

    return html`
      ${map(this.columns, column =>
        column.hidden
          ? nothing
          : html`<igc-grid-cell
              .active=${key === column.key && index === this.index}
              .column=${column}
              .row=${this as GridRow<T>}
              .value=${this.data[column.key]}
            ></igc-grid-cell>`,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-grid-row': GridRow<object>;
  }
}
