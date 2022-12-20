import { html, ReactiveController } from 'lit';
import { StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { RenderItemFunction } from '@lit-labs/virtualizer/virtualize.js';
import { StateController } from './state.js';
import { applyColumnWidths } from '../internal/utils.js';
import { registerGridIcons } from '../internal/icon-registry.js';
import type { GridHost } from '../internal/types.js';

export class GridDOMController<T extends object> implements ReactiveController {
  constructor(protected host: GridHost<T>, protected state: StateController<T>) {
    this.host.addController(this);
  }

  public get container() {
    // @ts-expect-error: protected member access
    return this.host.scrollContainer;
  }

  public columnSizes: StyleInfo = {};

  public rowRenderer: RenderItemFunction<T> = (data: T, index: number) => {
    return html`<apex-grid-row
      part="row"
      style=${styleMap({ ...this.columnSizes, ...this.getActiveRowStyles(index) })}
      .index=${index}
      .activeNode=${this.state.active}
      .data=${data}
      .columns=${this.host.columns}
    ></apex-grid-row>`;
  };

  public hostConnected() {
    registerGridIcons();
    this.setGridColumnSizes();
  }

  public hostUpdate(): void {
    this.setScrollOffset();
    this.setGridColumnSizes();
  }

  public setScrollOffset() {
    const size = this.container ? this.container.offsetWidth - this.container.clientWidth : 0;
    this.host.style.setProperty('--scrollbar-offset', `${size}px`);
  }

  protected setGridColumnSizes() {
    this.columnSizes = applyColumnWidths(this.host.columns);
  }

  public getActiveRowStyles(index: number): StyleInfo {
    return this.state.active.row === index ? { 'z-index': '3' } : {};
  }
}
