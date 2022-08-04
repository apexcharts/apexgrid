import { ReactiveController } from 'lit';
import SortOperation from '../operations/sort.js';
import type { GridHost } from '../internal/types';
import type { StateController } from './state';

export class DataOperationsController<T extends object> implements ReactiveController {
  protected sorting = new SortOperation<T>();

  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  public hostConnected() {}

  public apply(data: T[], state: StateController<T>) {
    return this.sorting.apply(data, state.sorting.state);
  }
}
