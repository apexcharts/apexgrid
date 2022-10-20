import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { contextProvided } from '@lit-labs/context';
import { EventEmitterBase } from '../internal/mixins/event-emitter.js';
import { partNameMap } from '../internal/part-map.js';
import { GRID_HEADER_TAG } from '../internal/tags.js';
import {
  gridStateContext,
  MIN_COL_RESIZE_WIDTH,
  SORT_ICON_ASCENDING,
  SORT_ICON_DESCENDING,
} from '../internal/constants.js';
import type { ColumnConfig, ApexHeaderContext } from '../internal/types';
import type { StateController } from '../controllers/state.js';
import styles from '../styles/header-cell/header-cell-styles.js';

export interface ColumnResizeStartEvent {
  anchor: number;
}

interface ColumnResizeBase<T extends object> {
  column: ColumnConfig<T>;
}

export interface ColumnResizedEvent<T extends object> extends ColumnResizeBase<T> {
  newWidth: number;
  x: number;
}

export interface ColumnAutosizeEvent<T extends object> extends ColumnResizeBase<T> {
  header: ApexGridHeader<T>;
}

export interface ApexGridHeaderEventMap<T extends object> {
  columnResizeStart: CustomEvent<ColumnResizeStartEvent>;
  columnResizeEnd: CustomEvent<void>;
  columnResized: CustomEvent<ColumnResizedEvent<T>>;
  columnAutosize: CustomEvent<ColumnAutosizeEvent<T>>;
  headerSortClicked: CustomEvent<ColumnConfig<T>>;
  headerFilterClicked: CustomEvent<ColumnConfig<T>>;
}

// TODO: Fix
declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface HTMLElementEventMap extends ApexGridHeaderEventMap<any> {}
}

@customElement(GRID_HEADER_TAG)
export default class ApexGridHeader<T extends object> extends EventEmitterBase<
  ApexGridHeaderEventMap<T>
> {
  public static get is() {
    return GRID_HEADER_TAG;
  }

  public static override styles = styles;

  protected get isSortable() {
    return Boolean(this.column.sort);
  }

  @contextProvided({ context: gridStateContext, subscribe: true })
  @property({ attribute: false })
  public state!: StateController<T>;

  @state()
  protected isResizing = false;

  @property({ attribute: false })
  public column!: ColumnConfig<T>;

  protected get context(): ApexHeaderContext<T> {
    return {
      parent: this,
      column: this.column,
    };
  }

  #initFilterRow() {
    this.emitEvent('headerFilterClicked', { detail: this.column });
  }

  #handleClick() {
    this.emitEvent('headerSortClicked', { detail: this.column });
  }

  #resize = ({ clientX }: PointerEvent) => {
    const val = Math.max(clientX - this.offsetLeft, MIN_COL_RESIZE_WIDTH);
    this.emitEvent('columnResized', {
      detail: {
        column: this.column,
        newWidth: val,
        x: Math.max(clientX, this.offsetLeft + val),
      },
    });
  };

  #resizeStart(ev: PointerEvent) {
    ev.preventDefault();

    const { target, pointerId } = ev;

    this.addEventListener('gotpointercapture', this.#pointerCaptured, { once: true });
    this.addEventListener('lostpointercapture', this.#pointerLost, { once: true });
    this.addEventListener('pointermove', this.#resize);
    this.addEventListener('pointerup', this.#resizeStop, { once: true });

    this.emitEvent('columnResizeStart', { detail: { anchor: this.offsetLeft + this.offsetWidth } });

    (target as HTMLElement).setPointerCapture(pointerId);
  }

  #resizeStop = ({ pointerId }: PointerEvent) => this.releasePointerCapture(pointerId);

  #pointerCaptured = () => (this.isResizing = true);

  #pointerLost = () => {
    this.isResizing = false;
    this.removeEventListener('pointermove', this.#resize);
    this.emitEvent('columnResizeEnd');
  };

  #autosize = () =>
    this.emitEvent('columnAutosize', { detail: { column: this.column, header: this } });

  protected renderSortPart() {
    const state = this.state.sorting.state.get(this.column.key);
    const idx = Array.from(this.state.sorting.state.values()).indexOf(state!);
    const attr = this.state.host.sortingConfig.multiple ? (idx > -1 ? idx + 1 : nothing) : nothing;
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

  protected renderFilterPart() {
    const count = this.state.filtering.state.get(this.column.key)?.length ?? 0;

    return this.column.filter
      ? html`<span part=${partNameMap({ action: true, filtered: count })}
          ><div part="filter">
            <igc-icon
              name="filter"
              collection="internal"
              @click=${this.#initFilterRow}
            ></igc-icon>
            ${count ? html`<span part="filter-count">${count}</span>` : nothing}
          </div></span
        >`
      : nothing;
  }

  protected renderResizePart() {
    return this.column.resizable
      ? html`<span
          part="resizable"
          @dblclick=${this.#autosize}
          @pointerdown=${this.#resizeStart}
        ></span>`
      : nothing;
  }

  protected override render() {
    return html`
      <div
        part=${partNameMap({
          content: true,
          sortable: this.isSortable,
          resizing: this.isResizing,
        })}
      >
        ${this.renderContentPart()}
        <div part="actions">${this.renderSortPart()}${this.renderFilterPart()}</div>
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
