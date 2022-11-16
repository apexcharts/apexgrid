import { ReactiveController } from 'lit';
import SortDataOperation from '../operations/sort.js';
import FilterDataOperation from '../operations/filter.js';
import type { GridHost } from '../internal/types.js';
import type { StateController } from './state.js';
import { isDefined } from '../internal/utils.js';

export class DataOperationsController<T extends object> implements ReactiveController {
  protected sorting = new SortDataOperation<T>();
  protected filtering = new FilterDataOperation<T>();

  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  public hostConnected() {}

  protected get hasRemoteSort() {
    return isDefined(this.host.remoteConfig?.sort);
  }

  protected get hasRemoteFilter() {
    return isDefined(this.host.remoteConfig?.filter);
  }

  protected get remoteFilter() {
    return this.host.remoteConfig!.filter!;
  }

  protected get remoteSort() {
    return this.host.remoteConfig!.sort!;
  }

  public async apply(data: T[], state: StateController<T>) {
    const { filtering, sorting } = state;

    data = this.hasRemoteFilter
      ? await this.remoteFilter(data, filtering.state)
      : this.filtering.apply(data, filtering.state);

    data = this.hasRemoteSort
      ? await this.remoteSort(data, sorting.state)
      : this.sorting.apply(data, sorting.state);

    return data;
  }
}
