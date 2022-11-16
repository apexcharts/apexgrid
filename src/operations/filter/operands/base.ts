import type { FilterOperation } from '../types.js';

export abstract class BaseOperands<T, Type = any> {
  public get(condition: keyof this) {
    return this[condition] as FilterOperation<T, Type>;
  }

  public abstract get default(): FilterOperation<T, Type>;

  protected conditions() {
    return Object.keys(this).filter(key => key !== 'get' && key !== 'default');
  }

  public *[Symbol.iterator]() {
    const result = this.conditions();
    for (const each of result) {
      yield each;
    }
  }
}
