import { ReactiveController } from 'lit';
import type ApexGridBody from '../components/grid-body';
import { NAVIGATION_STATE, SENTINEL_NODE } from '../internal/constants.js';
import type { ActiveNode, GridHost } from '../internal/types';

export class NavigationController<T extends object> implements ReactiveController {
  protected handlers = new Map(
    Object.entries({
      ArrowDown: this.arrowDown,
      ArrowUp: this.arrowUp,
      ArrowLeft: this.arrowLeft,
      ArrowRight: this.arrowRight,
      Home: this.home,
      End: this.end,
    }),
  );

  protected state = NAVIGATION_STATE;
  protected _active = SENTINEL_NODE;

  public get active() {
    return this._active;
  }

  public set active(node: ActiveNode) {
    this._active = node;
    this.state.set('previous', this._active);
    this.state.set('current', node);
    this.host.requestUpdate();
  }

  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  protected getActiveNode() {
    return this.state.get('current') ?? SENTINEL_NODE;
  }

  protected home(container: ApexGridBody) {
    const current = this.state.get('current')!;
    const next = { ...current };
    if (current !== SENTINEL_NODE) {
      next.row = 0;
    } else {
      next.column = this.host.columns.at(0)?.key ?? '';
      next.row = 0;
    }
    this.active = next;
    container.scrollToIndex(next.row, 'center');
  }

  protected end(container: ApexGridBody) {
    const current = this.state.get('current')!;
    const next = { ...current };
    const last = this.host.totalItems - 1;
    if (current !== SENTINEL_NODE) {
      next.row = last;
    } else {
      next.column = this.host.columns.at(0)?.key ?? '';
      next.row = last;
    }
    this.active = next;
    container.scrollToIndex(next.row, 'center');
  }

  protected arrowDown(container: ApexGridBody) {
    const current = this.state.get('current')!;
    const next = { ...current };
    if (current !== SENTINEL_NODE) {
      next.row = Math.min(next.row + 1, this.host.totalItems - 1);
    } else {
      next.column = this.host.columns.at(0)?.key ?? '';
      next.row = 0;
    }
    this.active = next;
    container.scrollToIndex(next.row, 'center');
  }

  protected arrowUp(container: ApexGridBody) {
    const current = this.state.get('current')!;
    const next = { ...current };
    if (current !== SENTINEL_NODE) {
      next.row = Math.max(0, next.row - 1);
    } else {
      next.column = this.host.columns.at(0)?.key ?? '';
      next.row = 0;
    }
    this.active = next;
    container.scrollToIndex(next.row, 'center');
  }

  protected arrowLeft() {
    const columns = this.host.columns;
    const current = this.state.get('current')!;
    const next = { ...current };
    if (current !== SENTINEL_NODE) {
      next.column = columns.at(columns.findIndex(column => column.key === current.column) - 1)!.key;
    } else {
      next.column = columns.at(0)?.key ?? '';
      next.row = 0;
    }
    this.active = next;
  }

  protected arrowRight() {
    const columns = this.host.columns;
    const current = this.state.get('current')!;
    const next = { ...current };
    if (current !== SENTINEL_NODE) {
      next.column = columns.at(
        (columns.findIndex(column => column.key === current.column) + 1) % columns.length,
      )!.key;
    } else {
      next.column = columns.at(0)?.key ?? '';
      next.row = 0;
    }
    this.active = next;
  }

  public hostConnected() {}

  public hostDisconnected() {
    // TODO: Revise
    this.active = SENTINEL_NODE;
    this.state = new Map();
  }

  public navigate(event: KeyboardEvent, container: ApexGridBody) {
    if (this.handlers.has(event.key)) {
      event.preventDefault();
      this.handlers.get(event.key)!.call(this, container);
    }
  }
}
