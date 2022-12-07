import { ReactiveController } from 'lit';
import { StyleInfo } from 'lit/directives/style-map.js';
import { StateController } from './state.js';
import { applyColumnWidths } from '../internal/utils.js';
import type { GridHost } from '../internal/types.js';

export class GridDOMController<T extends object> implements ReactiveController {
  constructor(protected host: GridHost<T>, protected state: StateController<T>) {
    this.host.addController(this);
  }

  public get virtualBody() {
    // @ts-expect-error: protected member access
    return this.host.bodyElement;
  }

  public columnSizes: StyleInfo = {};

  public hostConnected(): void {
    this.setGridColumnSizes();

    // Wait until the virtualizer updates the DOM. Then measure the scroll width again on the next tick.
    setTimeout(async () => {
      const ref = (this.virtualBody as any)._virtualizer;
      await ref._mutationPromise;
      this.host.requestUpdate();
    });
  }

  public hostUpdate(): void {
    this.setScrollOffset();
    this.setGridColumnSizes();
  }

  public setScrollOffset() {
    const size = this.virtualBody ? this.virtualBody.offsetWidth - this.virtualBody.clientWidth : 0;
    this.host.style.setProperty('--scrollbar-offset', `${size}px`);
  }

  protected setGridColumnSizes() {
    this.columnSizes = applyColumnWidths(this.host.columns);
  }

  public getActiveRowStyles(index: number): StyleInfo {
    return this.state.active.row === index ? { 'z-index': '3' } : {};
  }
}
