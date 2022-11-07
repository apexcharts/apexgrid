import type { Keys, Values } from '../internal/types';

export default abstract class DataOperation<T> {
  protected resolveValue(record: T, key: Keys<T>) {
    return record[key];
  }

  protected resolveCase(value: Values<T>, caseSensitive?: boolean) {
    return typeof value === 'string' && !caseSensitive
      ? (value.toLowerCase() as unknown as Values<T>)
      : value;
  }

  public abstract apply(...args: unknown[]): T[];
}
