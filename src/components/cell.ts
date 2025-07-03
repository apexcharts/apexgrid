import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '../internal/register.js';
import { GRID_CELL_TAG } from '../internal/tags.js';
import type { ApexCellContext, ColumnConfiguration, PropertyType } from '../internal/types.js';
import { styles } from '../styles/body-cell/body-cell-styles.css.js';
import type ApexGridRow from './row.js';

/**
 * Component representing a DOM cell of the Apex grid.
 */
export default class ApexGridCell<T extends object> extends LitElement {
  public static get is() {
    return GRID_CELL_TAG;
  }

  public static override styles = styles;

  public static register(): void {
    registerComponent(ApexGridCell);
  }

  /**
   * The value which will be rendered by the component.
   */
  @property({ attribute: false })
  public value!: PropertyType<T>;

  /**
   * A reference to the column configuration object.
   */
  @property({ attribute: false })
  public column!: ColumnConfiguration<T>;

  /**
   * Indicates whether this is the active cell in the grid.
   *
   */
  @property({ type: Boolean, reflect: true })
  public active = false;

  /**
   * The parent row component holding this cell.
   */
  public row!: ApexGridRow<T>;

  protected get context(): ApexCellContext<T> {
    return {
      parent: this,
      row: this.row,
      column: this.column,
      value: this.value,
    } as unknown as ApexCellContext<T>;
  }

  protected override render() {
    return this.column.cellTemplate
      ? this.column.cellTemplate(this.context as ApexCellContext<T> as any)
      : html`${this.value}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexGridCell.is]: ApexGridCell<object>;
  }
}
