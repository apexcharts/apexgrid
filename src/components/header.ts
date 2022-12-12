import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit-labs/context';
import { partNameMap } from '../internal/part-map.js';
import { GRID_HEADER_TAG } from '../internal/tags.js';
import {
  MIN_COL_RESIZE_WIDTH,
  SORT_ICON_ASCENDING,
  SORT_ICON_DESCENDING,
} from '../internal/constants.js';
import type { ColumnConfiguration, ApexHeaderContext } from '../internal/types.js';
import { StateController, gridStateContext } from '../controllers/state.js';
import { styles } from '../styles/header-cell/header-cell-styles.css.js';

@customElement(GRID_HEADER_TAG)
export default class ApexGridHeader<T extends object> extends LitElement {
  public static get is() {
    return GRID_HEADER_TAG;
  }

  public static override styles = styles;

  protected get context(): ApexHeaderContext<T> {
    return {
      parent: this,
      column: this.column,
    };
  }

  protected get isSortable() {
    return Boolean(this.column.sort);
  }

  protected get resizeController() {
    return this.state.resizing;
  }

  @consume({ context: gridStateContext, subscribe: true })
  @property({ attribute: false })
  public state!: StateController<T>;

  @property({ attribute: false })
  public column!: ColumnConfiguration<T>;

  #addResizeEventHandlers() {
    const config: AddEventListenerOptions = { once: true };

    this.addEventListener(
      'gotpointercapture',
      () => (this.resizeController.indicatorActive = true),
      config,
    );
    this.addEventListener('lostpointercapture', this.#handlePointerLost, config);
    this.addEventListener('pointerup', e => this.releasePointerCapture(e.pointerId), config);
    this.addEventListener('pointermove', this.#handleResize);
  }

  #handleClick(e: Event) {
    e.stopPropagation();
    this.state.sorting.sortFromHeaderClick(this.column);
  }

  #handleResize = ({ clientX }: PointerEvent) => {
    const { left } = this.getBoundingClientRect();
    const width = Math.max(clientX - left, MIN_COL_RESIZE_WIDTH);
    const x = this.offsetLeft + width;

    this.resizeController.resize(this.column, width, x);
  };

  #handleResizeStart(ev: PointerEvent) {
    const { target, pointerId } = ev;

    ev.preventDefault();

    this.#addResizeEventHandlers();
    this.resizeController.start(this);

    (target as HTMLElement).setPointerCapture(pointerId);
  }

  #handlePointerLost = () => {
    this.resizeController.indicatorActive = false;
    this.removeEventListener('pointermove', this.#handleResize);
    this.resizeController.stop();
  };

  #handleAutosize = () => this.resizeController.autosize(this.column, this);

  protected renderSortPart() {
    const state = this.state.sorting.state.get(this.column.key);
    const idx = Array.from(this.state.sorting.state.values()).indexOf(state!);
    const attr = this.state.host.sortConfiguration.multiple
      ? idx > -1
        ? idx + 1
        : nothing
      : nothing;
    const icon = state
      ? state.direction === 'ascending'
        ? SORT_ICON_ASCENDING
        : SORT_ICON_DESCENDING
      : SORT_ICON_ASCENDING;

    return state || this.isSortable
      ? html`<span
          part=${partNameMap({ action: true, sorted: !!state?.direction })}
          @click=${this.isSortable ? this.#handleClick : nothing}
        >
          <igc-icon
            part=${partNameMap({ 'sorting-action': !!state })}
            data-sortIndex=${attr}
            name=${icon}
            collection="internal"
          ></igc-icon>
        </span>`
      : nothing;
  }

  protected renderContentPart() {
    const defaultContent = this.column.headerText ?? this.column.key;
    const template = this.column.headerTemplate;

    return html`
      <span part="title">
        <span>${template ? template(this.context) : html`${defaultContent}`}</span>
      </span>
    `;
  }

  protected renderResizePart() {
    return this.column.resizable
      ? html`<span
          part="resizable"
          @dblclick=${this.#handleAutosize}
          @pointerdown=${this.#handleResizeStart}
        ></span>`
      : nothing;
  }

  protected override render() {
    return html`
      <div
        part=${partNameMap({
          content: true,
          sortable: this.isSortable,
          resizing: this.resizeController.indicatorActive,
        })}
      >
        ${this.renderContentPart()}
        <div part="actions">${this.renderSortPart()}</div>
      </div>
      ${this.renderResizePart()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexGridHeader.is]: ApexGridHeader<object>;
  }
}
