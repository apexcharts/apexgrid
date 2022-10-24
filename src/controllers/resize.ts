import { html, nothing, ReactiveController } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import ApexGridHeader from '../components/header.js';
import { MIN_COL_RESIZE_WIDTH } from '../internal/constants.js';
import type { ColumnConfig, GridHost, Keys } from '../internal/types';

export class ResizeController<T extends object> implements ReactiveController {
  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  public active = false;
  public x = 0;

  public start(header: ApexGridHeader<T>) {
    this.active = true;
    this.x = header.offsetLeft + header.offsetWidth;
    this.host.requestUpdate();
  }

  public stop() {
    this.active = false;
    this.host.requestUpdate();
  }

  public resize(column: ColumnConfig<T>, width: number, sizerOffset?: number) {
    if (sizerOffset) {
      this.x = sizerOffset;
    }

    column.width = `${width}px`;
    this.host.requestUpdate();
  }

  public async autosize(column: ColumnConfig<T>, header: ApexGridHeader<T>) {
    column.width = `max-content`;

    this.host.requestUpdate();
    await this.host.updateComplete;

    column.width = `${this.#maxSize(column.key, header.offsetWidth)}px`;
    this.host.requestUpdate();
  }

  #maxSize(key: Keys<T>, headerWidth: number) {
    const maxCellWidth = this.host.rows
      .map(each => each.cells)
      .reduce((prev, current) => prev.concat(current), [])
      .filter(cell => cell.column.key === key)
      .reduce((prev, curr) => (curr.offsetWidth > prev ? curr.offsetWidth : prev), 0);

    return Math.max(...[MIN_COL_RESIZE_WIDTH, maxCellWidth, headerWidth]);
  }

  public hostConnected() {}

  public renderIndicator() {
    return this.active
      ? html`<div
          part="resize-indicator"
          style=${styleMap({
            transform: `translateX(${this.x}px)`,
          })}
        ></div>`
      : nothing;
  }
}
