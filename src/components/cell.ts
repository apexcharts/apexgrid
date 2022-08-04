import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ColumnType } from '../internal/types';
import styles from '../styles/cell-styles.js';
import type GridRow from './row';

@customElement('igc-grid-cell')
export default class GridCell<T extends object> extends LitElement {
  public static override styles = styles;

  @property({ attribute: false })
  public value!: T;

  @property({ attribute: false })
  public column!: ColumnType<T>;

  @property({ type: Boolean, reflect: true })
  public active = false;

  public row!: GridRow<T>;

  protected get context() {
    return {
      parent: this as GridCell<T>,
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
