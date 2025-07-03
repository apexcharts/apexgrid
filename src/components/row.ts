import { html, LitElement, nothing } from 'lit';
import { property, queryAll } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { registerComponent } from '../internal/register.js';
import { GRID_ROW_TAG } from '../internal/tags.js';
import type { ActiveNode, ColumnConfiguration } from '../internal/types.js';
import { styles } from '../styles/body-row/body-row-styles.css.js';
import ApexGridCell from './cell.js';

/**
 * Component representing the DOM row in the Apex grid.
 */
export default class ApexGridRow<T extends object> extends LitElement {
  public static get is() {
    return GRID_ROW_TAG;
  }
  public static override styles = styles;

  public static register() {
    registerComponent(ApexGridRow, [ApexGridCell]);
  }

  @queryAll(ApexGridCell.is)
  protected _cells!: NodeListOf<ApexGridCell<T>>;

  @property({ attribute: false })
  public data!: T;

  @property({ attribute: false })
  public columns: Array<ColumnConfiguration<T>> = [];

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
          : html`<apex-grid-cell
              part="cell"
              .active=${key === column.key && index === this.index}
              .column=${column}
              .row=${this as ApexGridRow<T>}
              .value=${this.data[column.key]}
            ></apex-grid-cell>`
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexGridRow.is]: ApexGridRow<object>;
  }
}
