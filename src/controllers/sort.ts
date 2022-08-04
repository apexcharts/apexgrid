import { ReactiveController } from 'lit';
import { PIPELINE } from '../internal/constants.js';
import type { ColumnType, GridHost, Keys } from '../internal/types';
import type { SortExpression, SortingDirection, SortState } from '../operations/sort/types';

export class SortController<T extends object> implements ReactiveController {
  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  public state: SortState<T> = new Map();

  public hostConnected() {}

  public prepareExpression(column: ColumnType<T>): SortExpression<T> {
    return {
      key: column.key,
      caseSensitive: column.sort?.caseSensitive ?? false,
      direction: this.#orderBy(this.state.get(column.key)?.direction),
    };
  }

  #orderBy(dir?: SortingDirection): SortingDirection {
    return dir === 'ascending' ? 'descending' : 'ascending';
  }

  public reset(key?: Keys<T>) {
    key ? this.state.delete(key) : this.state.clear();
    this.host.requestUpdate(PIPELINE);
  }

  public sort(key: Keys<T>) {
    let expr = this.state.get(key);
    expr = expr
      ? { ...expr, ...{ direction: this.#orderBy(expr.direction) } }
      : { key, direction: 'ascending' };
    this.state.set(key, expr);
    this.host.requestUpdate(PIPELINE);
  }
}
