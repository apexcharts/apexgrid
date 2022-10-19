import { ReactiveController } from 'lit';
import { ActiveNode, GridHost } from '../internal/types';
import { FilterController } from './filter.js';
import { NavigationController } from './navigation.js';
import { SortController } from './sort.js';

export class StateController<T extends object> implements ReactiveController {
  public sorting!: SortController<T>;
  public filtering!: FilterController<T>;
  public navigation!: NavigationController<T>;

  public get active() {
    return this.navigation.active;
  }

  public set active(node: ActiveNode) {
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
  }

  public hostConnected() {}
}
