import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GRID_CELL_TAG } from '../internal/tags.js';
import type { CellContext, ColumnConfig } from '../internal/types';
import styles from '../styles/cell-styles.js';
import type GridRow from './row';

@customElement(GRID_CELL_TAG)
export default class GridCell<T extends object> extends LitElement {
  public static get is() {
    return GRID_CELL_TAG;
  }

  public static override styles = styles;

  @property({ attribute: false })
  public value!: T[keyof T];

  @property({ attribute: false })
  public column!: ColumnConfig<T>;

  @property({ type: Boolean, reflect: true })
  public active = false;

  public row!: GridRow<T>;

  protected get context(): CellContext<T> {
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
    'igc-grid-cell': GridCell<object>;
  }
}
