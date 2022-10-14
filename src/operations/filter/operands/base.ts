import type { FilterOperation } from '../types';

type OmitKey<T, K extends PropertyKey> = { [P in keyof T as Exclude<P, K>]: T[P] };
type IgnoredKeys = 'get' | 'default';

export default class BaseOperands<T, Type = any> {
  public get(condition: OmitKey<keyof this, IgnoredKeys>): FilterOperation<T, Type> {
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
