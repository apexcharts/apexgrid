import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { partNameMap } from '../internal/part-map.js';
import type { ColumnType } from '../internal/types';
import type { SortExpression } from '../operations/sort/types.js';
import styles from '../styles/header-styles.js';

@customElement('igc-grid-header')
export default class GridHeader<T extends object> extends LitElement {
  public static override styles = styles;

  @property({ attribute: false })
  public column!: ColumnType<T>;

  @property({ attribute: false })
  public sortState?: SortExpression<T>;

  protected get context() {
    return {
      parent: this as GridHeader<T>,
      column: this.column,
    };
  }

  #handleClick() {
    this.dispatchEvent(
      new CustomEvent('headerSortClicked', {
        bubbles: true,
        composed: true,
        detail: this.column,
      }),
    );
  }

  protected renderSortState() {
    if (!this.sortState) return nothing;
    return html`${this.sortState.direction === 'ascending' ? '↑' : '↓'}`;
  }

  protected renderContent() {
    return this.column.headerTemplate
      ? this.column.headerTemplate(this.context)
      : html`${this.column.headerText ?? this.column.key}`;
  }

  protected renderFilterArea() {
    return this.column.filter ? html`<div part="filter"></div>` : nothing;
  }

  protected override render() {
    return html`
      <div
        part=${partNameMap({
          content: true,
          sortable: !!this.column.sort,
        })}
        @click=${this.column.sort ? this.#handleClick : nothing}
      >
        ${this.renderContent()} ${this.renderSortState()}
      </div>
      ${this.renderFilterArea()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-grid-header': GridHeader<object>;
  }
}
