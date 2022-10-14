import { ReactiveController } from 'lit';
import SortOperation from '../operations/sort.js';
import type { GridHost } from '../internal/types';
import type { StateController } from './state';
import FilterOperation from '../operations/filter.js';

export class DataOperationsController<T extends object> implements ReactiveController {
  protected sorting = new SortOperation<T>();
  protected filtering = new FilterOperation<T>();

  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  public hostConnected() {}

  public apply(data: T[], state: StateController<T>) {
    const { filtering, sorting } = state;
    return this.sorting.apply(this.filtering.apply(data, filtering.state), sorting.state);
  }
}
