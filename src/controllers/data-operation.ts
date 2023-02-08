import { ReactiveController } from 'lit';
import SortDataOperation from '../operations/sort.js';
import FilterDataOperation from '../operations/filter.js';
import type { GridHost } from '../internal/types.js';
import type { StateController } from './state.js';
import { isDefined } from '../internal/is-defined.js';

export class DataOperationsController<T extends object> implements ReactiveController {
  protected sorting = new SortDataOperation<T>();
  protected filtering = new FilterDataOperation<T>();

  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  public hostConnected() {}

  protected get hasCustomSort() {
    return isDefined(this.host.dataPipelineConfiguration?.sort);
  }

  protected get hasCustomFilter() {
    return isDefined(this.host.dataPipelineConfiguration?.filter);
  }

  protected get customFilter() {
    return this.host.dataPipelineConfiguration!.filter!;
  }

  protected get customSort() {
    return this.host.dataPipelineConfiguration!.sort!;
  }

  public async apply(data: T[], state: StateController<T>) {
    const { filtering, sorting } = state;

    data = this.hasCustomFilter
      ? await this.customFilter({ data, grid: this.host, type: 'filter' })
      : this.filtering.apply(data, filtering.state);

    data = this.hasCustomSort
      ? await this.customSort({ data, grid: this.host, type: 'sort' })
      : this.sorting.apply(data, sorting.state);

    return data;
  }
}
