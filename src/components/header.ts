import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { partNameMap } from '../internal/part-map.js';
import { GRID_HEADER_TAG } from '../internal/tags.js';
import { SORT_ICON_ASCENDING, SORT_ICON_DESCENDING } from '../internal/constants.js';
import type { ColumnConfig, HeaderContext } from '../internal/types';
import type { SortExpression } from '../operations/sort/types.js';
import styles from '../styles/header-cell/header-cell-styles';

// TODO: Revise
// import Icon from 'igniteui-webcomponents/components/icon/icon';
import { defineComponents, IgcIconComponent } from 'igniteui-webcomponents';
defineComponents(IgcIconComponent);

@customElement(GRID_HEADER_TAG)
export default class GridHeader<T extends object> extends LitElement {
  public static get is() {
    return GRID_HEADER_TAG;
  }

  public static override styles = styles;

  @property({ attribute: false })
  public column!: ColumnConfig<T>;

  @property({ attribute: false })
  public sortState?: SortExpression<T>;

  protected get context(): HeaderContext<T> {
    return {
      parent: this,
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
    return html`<igc-icon
      size="small"
      name=${this.sortState.direction === 'ascending' ? SORT_ICON_ASCENDING : SORT_ICON_DESCENDING}
      collection="internal"
    ></igc-icon>`;
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
        <span part="title">
          <span>${this.renderContent()}</span>
        </span>
        <span part="action">${this.renderSortState()}</span>
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
