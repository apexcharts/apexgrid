import { createContext } from '@lit/context';
import type { ReactiveController } from 'lit';
import type { ActiveNode, GridHost } from '../internal/types.js';
import { FilterController } from './filter.js';
import { NavigationController } from './navigation.js';
import { ResizeController } from './resize.js';
import { SortController } from './sort.js';

export class StateController<T extends object> implements ReactiveController {
  public sorting!: SortController<T>;
  public filtering!: FilterController<T>;
  public navigation!: NavigationController<T>;
  public resizing!: ResizeController<T>;

  public get active() {
    return this.navigation.active;
  }

  public set active(node: ActiveNode<T>) {
    this.navigation.active = node;
  }

  public get headerRow() {
    // @ts-expect-error - Protected member access
    return this.host.headerRow;
  }

  public get scrollContainer() {
    // @ts-expect-error - Protected member access
    return this.host.scrollContainer;
  }

  constructor(public host: GridHost<T>) {
    this.host.addController(this);
    this.init();
  }

  protected init() {
    this.sorting = new SortController(this.host);
    this.filtering = new FilterController(this.host);
    this.navigation = new NavigationController(this.host);
    this.resizing = new ResizeController(this.host);
  }

  public hostConnected() {}

  public hostUpdate(): void {
    this.headerRow?.requestUpdate();
    this.scrollContainer?.requestUpdate();
  }
}

export const gridStateContext = createContext<StateController<any>>('gridStateController');
