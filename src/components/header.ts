import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { EventEmitterBase } from '../internal/mixins/event-emitter.js';
import { partNameMap } from '../internal/part-map.js';
import { GRID_HEADER_TAG } from '../internal/tags.js';
import {
  MIN_COL_RESIZE_WIDTH,
  SORT_ICON_ASCENDING,
  SORT_ICON_DESCENDING,
} from '../internal/constants.js';
import type { ColumnConfig, ApexHeaderContext } from '../internal/types';
import type { SortExpression } from '../operations/sort/types';
import styles from '../styles/header-cell/header-cell-styles.js';

// TODO: Revise
// import Icon from 'igniteui-webcomponents/components/icon/icon';
import { defineComponents, IgcIconComponent } from 'igniteui-webcomponents';
defineComponents(IgcIconComponent);

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

  @state()
  protected isResizing = false;

  @property({ attribute: false })
  public column!: ColumnConfig<T>;

  @property({ attribute: false })
  public sortState?: SortExpression<T>;

  @property({ attribute: false })
  public sortIndex = -1;

  protected get context(): ApexHeaderContext<T> {
    return {
      parent: this,
      column: this.column,
    };
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

  // TODO: Remove sort index for single sort
  protected renderSortState() {
    return this.sortState
      ? html`
          <igc-icon
            data-sortIndex=${this.sortIndex > -1 ? this.sortIndex + 1 : nothing}
            size="small"
            name=${this.sortState.direction === 'ascending'
              ? SORT_ICON_ASCENDING
              : SORT_ICON_DESCENDING}
            collection="internal"
          ></igc-icon>
        `
      : nothing;
  }

  protected renderContent() {
    return this.column.headerTemplate
      ? this.column.headerTemplate(this.context)
      : html`${this.column.headerText ?? this.column.key}`;
  }

  protected renderFilterArea() {
    return this.column.filter ? html`<div part="filter"></div>` : nothing;
  }

  protected renderResizeArea() {
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
          sortable: !!this.column.sort,
          resizing: this.isResizing,
        })}
        @click=${this.column.sort ? this.#handleClick : nothing}
      >
        <span part="title">
          <span>${this.renderContent()}</span>
        </span>
        <span part="action">${this.renderSortState()}</span>
      </div>
      ${this.renderResizeArea()} ${this.renderFilterArea()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexGridHeader.is]: ApexGridHeader<object>;
  }
}
