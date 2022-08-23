import { html, LitElement, nothing } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { GRID_ROW_TAG } from '../internal/tags.js';
import type { ActiveNode, ColumnConfig } from '../internal/types';
import GridCell from './cell.js';
import styles from '../styles/components/body-row/row-styles';

@customElement(GRID_ROW_TAG)
export default class GridRow<T extends object> extends LitElement {
  public static get is() {
    return GRID_ROW_TAG;
  }
  public static override styles = styles;

  @queryAll(GridCell.is)
  protected _cells!: NodeListOf<GridCell<T>>;

  @property({ attribute: false })
  public data!: T;

  @property({ attribute: false })
  public columns: Array<ColumnConfig<T>> = [];

  public get cells() {
    return Array.from(this._cells);
  }

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
