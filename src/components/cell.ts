import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GRID_CELL_TAG } from '../internal/tags.js';
import type { ApexCellContext, ColumnConfiguration } from '../internal/types.js';
import { styles } from '../styles/body-cell/body-cell-styles.css.js';
import type ApexGridRow from './row.js';

@customElement(GRID_CELL_TAG)
export default class ApexGridCell<T extends object> extends LitElement {
  public static get is() {
    return GRID_CELL_TAG;
  }

  public static override styles = styles;

  @property({ attribute: false })
  public value!: T[keyof T];

  @property({ attribute: false })
  public column!: ColumnConfiguration<T>;

  @property({ type: Boolean, reflect: true })
  public active = false;

  public row!: ApexGridRow<T>;

  protected get context(): ApexCellContext<T> {
    return {
      parent: this,
      row: this.row,
      column: this.column,
      value: this.value,
    };
  }

  protected override render() {
    return this.column.cellTemplate ? this.column.cellTemplate(this.context) : html`${this.value}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexGridCell.is]: ApexGridCell<object>;
  }
}
