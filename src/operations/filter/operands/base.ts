import type { FilterOperation } from '../types';

export default class BaseOperands<T, Type = any> {
  public get(condition: keyof this): FilterOperation<T, Type> {
    return this[condition] as FilterOperation<T, Type>;
  }

  public get default() {
    return this.get(this.conditions().at(0) as keyof this);
  }

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
