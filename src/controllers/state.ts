import { ReactiveController } from 'lit';
import { createContext } from '@lit-labs/context';
import { FilterController } from './filter.js';
import { NavigationController } from './navigation.js';
import { SortController } from './sort.js';
import { ResizeController } from './resize.js';
import type { ActiveNode, GridHost } from '../internal/types';

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
}

export const gridStateContext = createContext<StateController<any>>('gridStateController');
