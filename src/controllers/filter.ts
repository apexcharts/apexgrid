import { ReactiveController } from 'lit';
import type { GridHost } from '../internal/types';
import type { FilterState } from '../operations/filter/types';

export class FilterController<T extends object> implements ReactiveController {
  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  public state: FilterState<T> = new Map();

  public hostConnected() {}

  public filter() {}
}
