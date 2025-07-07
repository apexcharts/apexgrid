import { consume } from '@lit/context';
import { html, LitElement, nothing, type PropertyValueMap } from 'lit';
import { property, queryAll } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { gridStateContext, type StateController } from '../controllers/state.js';
import { partNameMap } from '../internal/part-map.js';
import { registerComponent } from '../internal/register.js';
import { GRID_HEADER_ROW_TAG } from '../internal/tags.js';
import type { ColumnConfiguration } from '../internal/types.js';
import { styles } from '../styles/header-row/header-row.base-styles.css.js';
import ApexGridHeader from './header.js';

export default class ApexGridHeaderRow<T extends object> extends LitElement {
  public static get is() {
    return GRID_HEADER_ROW_TAG;
  }
  public static override styles = styles;

  public static register() {
    registerComponent(ApexGridHeaderRow, [ApexGridHeader]);
  }

  @queryAll(ApexGridHeader.is)
  protected _headers!: NodeListOf<ApexGridHeader<T>>;

  @consume({ context: gridStateContext, subscribe: true })
  @property({ attribute: false })
  public state!: StateController<T>;

  @property({ attribute: false })
  public columns: Array<ColumnConfiguration<T>> = [];

  public get headers() {
    return Array.from(this._headers);
  }

  constructor() {
    super();
    this.addEventListener('click', this.#activeFilterColumn);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
  }

  #activeFilterColumn(event: MouseEvent) {
    const header = event
      .composedPath()
      .filter((target) => target instanceof ApexGridHeader)
      .at(0) as ApexGridHeader<T>;

    this.state.filtering.setActiveColumn(header?.column);
  }

  protected override shouldUpdate(props: PropertyValueMap<this> | Map<PropertyKey, this>): boolean {
    for (const header of this.headers) {
      header.requestUpdate();
    }

    return super.shouldUpdate(props);
  }

  protected override render() {
    const filterRow = this.state.filtering.filterRow;

    return html`${map(this.columns, (column) =>
      column.hidden
        ? nothing
        : html`<apex-grid-header
            part=${partNameMap({
              filtered: column === filterRow?.column,
            })}
            .column=${column}
          ></apex-grid-header>`
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexGridHeaderRow.is]: ApexGridHeaderRow<object>;
  }
}
