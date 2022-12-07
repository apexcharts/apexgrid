import { html, LitElement, nothing, PropertyValueMap } from 'lit';
import { contextProvided } from '@lit-labs/context';
import { customElement, property, queryAll } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { gridStateContext, StateController } from '../controllers/state.js';
import { partNameMap } from '../internal/part-map.js';
import { GRID_HEADER_ROW_TAG } from '../internal/tags.js';

import ApexGridHeader from './header.js';
import { styles } from '../styles/header-row/header-row.base-styles.css.js';

import type { ColumnConfiguration } from '../internal/types.js';

@customElement(GRID_HEADER_ROW_TAG)
export default class ApexGridHeaderRow<T extends object> extends LitElement {
  public static get is() {
    return GRID_HEADER_ROW_TAG;
  }
  public static override styles = styles;

  @queryAll(ApexGridHeader.is)
  protected _headers!: NodeListOf<ApexGridHeader<T>>;

  @contextProvided({ context: gridStateContext, subscribe: true })
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
      .filter(target => target instanceof ApexGridHeader)
      .at(0) as ApexGridHeader<T>;

    this.state.filtering.setActiveColumn(header?.column);
  }

  protected override shouldUpdate(props: PropertyValueMap<this> | Map<PropertyKey, this>): boolean {
    this.headers.forEach(header => header.requestUpdate());
    return super.shouldUpdate(props);
  }

  protected override render() {
    const filterRow = this.state.filtering.filterRow;

    return html`${map(this.columns, column =>
      column.hidden
        ? nothing
        : html`<apex-grid-header
            part=${partNameMap({
              filtered: column === filterRow?.column,
            })}
            .column=${column}
          ></apex-grid-header>`,
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexGridHeaderRow.is]: ApexGridHeaderRow<object>;
  }
}
