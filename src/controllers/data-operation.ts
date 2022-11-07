import { ReactiveController } from 'lit';
import SortDataOperation from '../operations/sort.js';
import FilterDataOperation from '../operations/filter.js';
import type { GridHost } from '../internal/types';
import type { StateController } from './state';

export class DataOperationsController<T extends object> implements ReactiveController {
  protected sorting = new SortDataOperation<T>();
  protected filtering = new FilterDataOperation<T>();

  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  public hostConnected() {}

  public apply(data: T[], state: StateController<T>) {
    const { filtering, sorting } = state;
    return this.sorting.apply(this.filtering.apply(data, filtering.state), sorting.state);
  }
}
