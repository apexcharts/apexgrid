import { ReactiveController } from 'lit';
import { StyleInfo } from 'lit/directives/style-map.js';
import { StateController } from './state.js';
import { applyColumnWidths } from '../internal/utils.js';
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

  public async hostConnected() {
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
