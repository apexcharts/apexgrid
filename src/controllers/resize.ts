import { ReactiveController } from 'lit';
import type {
  ColumnAutosizeEvent,
  ColumnResizedEvent,
  ColumnResizeStartEvent,
} from '../components/header';
import { MIN_COL_RESIZE_WIDTH } from '../internal/constants.js';
import type { GridHost, Keys } from '../internal/types';

export class ResizeController<T extends object> implements ReactiveController {
  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  public active = false;
  public x = 0;

  protected resizeStart = (ev: CustomEvent<ColumnResizeStartEvent>) => {
    ev.stopPropagation();

    this.active = true;
    this.x = ev.detail.anchor;
    this.host.requestUpdate();
  };

  protected resizeStop = (ev: CustomEvent<void>) => {
    ev.stopPropagation();

    this.active = false;
    this.host.requestUpdate();
  };

  protected resize = (ev: CustomEvent<ColumnResizedEvent<T>>) => {
    ev.stopPropagation();

    this.x = ev.detail.x;
    ev.detail.column.width = `${ev.detail.newWidth}px`;
    this.host.requestUpdate();
  };

  protected autosize = async (ev: CustomEvent<ColumnAutosizeEvent<T>>) => {
    ev.stopPropagation();
    const { column, header } = ev.detail;

    column.width = `max-content`;

    this.host.requestUpdate();
    await this.host.updateComplete;

    column.width = `${this.#maxSize(column.key, header.offsetWidth)}px`;
    this.host.requestUpdate();
  };

  #maxSize(key: Keys<T>, headerWidth: number) {
    const maxCellWidth = this.host.rows
      .map(each => each.cells)
      .reduce((prev, current) => prev.concat(current), [])
      .filter(cell => cell.column.key === key)
      .reduce((prev, curr) => (curr.offsetWidth > prev ? curr.offsetWidth : prev), 0);

    return Math.max(...[MIN_COL_RESIZE_WIDTH, maxCellWidth, headerWidth]);
  }

  public hostConnected() {
    this.host.addEventListener('columnResizeStart', this.resizeStart);
    this.host.addEventListener('columnResizeEnd', this.resizeStop);
    this.host.addEventListener('columnResized', this.resize);
    this.host.addEventListener('columnAutosize', this.autosize);
  }

  public hostDisconnected() {
    this.host.removeEventListener('columnResizeStart', this.resizeStart);
    this.host.removeEventListener('columnResizeEnd', this.resizeStop);
    this.host.removeEventListener('columnResized', this.resize);
    this.host.removeEventListener('columnAutosize', this.autosize);
  }
}
