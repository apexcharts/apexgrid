import { html, LitElement, nothing } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { GRID_ROW_TAG } from '../internal/tags.js';
import type { ActiveNode, ColumnConfig } from '../internal/types';
import ApexGridCell from './cell.js';
import styles from '../styles/body-row/body-row-styles.js';

@customElement(GRID_ROW_TAG)
export default class ApexGridRow<T extends object> extends LitElement {
  public static get is() {
    return GRID_ROW_TAG;
  }
  public static override styles = styles;

  @queryAll(ApexGridCell.is)
  protected _cells!: NodeListOf<ApexGridCell<T>>;

  @property({ attribute: false })
  public data!: T;

  @property({ attribute: false })
  public columns: Array<ColumnConfig<T>> = [];

  public get cells() {
    return Array.from(this._cells);
  }

  @property({ attribute: false })
  public activeNode!: ActiveNode<T>;

  @property({ attribute: false, type: Number })
  public index = -1;

  public override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('exportparts', 'cell');
  }

  protected override render() {
    const { column: key, row: index } = this.activeNode;

    return html`
      ${map(this.columns, column =>
        column.hidden
          ? nothing
          : html`<apx-grid-cell
              part="cell"
              .active=${key === column.key && index === this.index}
              .column=${column}
              .row=${this as ApexGridRow<T>}
              .value=${this.data[column.key]}
            ></apx-grid-cell>`,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexGridRow.is]: ApexGridRow<object>;
  }
}
