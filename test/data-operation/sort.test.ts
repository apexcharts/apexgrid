import { assert, fixtureCleanup } from '@open-wc/testing';
import SortDataOperation from '../../src/operations/sort.js';
import type { Keys } from '../../src/internal/types';
import type { SortExpression, SortState } from '../../src/operations/sort/types';
import data, { importanceComparer } from '../utils/test-data.js';

class TDDSortState<T extends object> {
  #result: T[] = [];
  #operation: SortDataOperation<T> = new SortDataOperation();
  #state: SortState<T> = new Map();

  constructor(protected data: T[]) {}

  public get result() {
    return this.#result;
  }

  public get first() {
    return this.at(0);
  }

  public get last() {
    return this.at(-1);
  }

  public at(index: number) {
    return this.result.at(index) as T;
  }

  public run() {
    this.#result = this.#operation.apply(structuredClone(this.data), this.#state);
  }

  public setState(key: Keys<T>, config?: Partial<SortExpression<T>>) {
    const expr: SortExpression<T> = { key, direction: 'ascending', caseSensitive: false };
    this.#state.set(key, Object.assign(expr, config));
    return this;
  }

  public clearState(key?: Keys<T>) {
    key ? this.#state.delete(key) : this.#state.clear();
    return this;
  }
}

const TDD = new TDDSortState(data);

suite('Sort operations', () => {
  teardown(() => fixtureCleanup());

  suite('Default sort', () => {
    teardown(() => TDD.clearState());

    test('type: number', () => {
      TDD.setState('id', { direction: 'descending' }).run();

      assert.strictEqual(TDD.first.id, 8);
      assert.strictEqual(TDD.last.id, 1);

      TDD.setState('id').run();

      assert.strictEqual(TDD.first.id, 1);
      assert.strictEqual(TDD.last.id, 8);
    });

    test('type: string [case insensitive]', () => {
      TDD.setState('name', { direction: 'descending' }).run();

      assert.strictEqual(TDD.first.name, 'D');
      assert.strictEqual(TDD.last.name, 'a');

      TDD.setState('name').run();

      assert.strictEqual(TDD.first.name, 'A');
      assert.strictEqual(TDD.last.name, 'd');
    });

    test('type: string [case sensitive]', () => {
      TDD.setState('name', { direction: 'descending', caseSensitive: true }).run();

      assert.strictEqual(TDD.first.name, 'D');
      assert.strictEqual(TDD.last.name, 'a');

      TDD.setState('name', { caseSensitive: true }).run();

      assert.strictEqual(TDD.first.name, 'a');
      assert.strictEqual(TDD.last.name, 'D');
    });

    test('type: boolean', () => {
      TDD.setState('active', { direction: 'descending' }).run();

      assert.strictEqual(TDD.first.active, true);
      assert.strictEqual(TDD.last.active, false);

      TDD.setState('active').run();

      assert.strictEqual(TDD.first.active, false);
      assert.strictEqual(TDD.last.active, true);
    });
  });

  suite('Multiple sort', () => {
    teardown(() => TDD.clearState());

    test('Default', () => {
      // [
      //   { id: 1, name: 'A', active: false },
      //   { id: 2, name: 'B', active: false },
      //   { id: 4, name: 'D', active: false },
      //   { id: 6, name: 'b', active: false },
      //   ....
      // ]
      TDD.setState('active').setState('id').run();
      assert.strictEqual(TDD.first.active, false);
      assert.strictEqual(TDD.first.id, 1);

      // [
      //   { id: 6, name: 'b', active: false },
      //   { id: 4, name: 'D', active: false },
      //   { id: 2, name: 'B', active: false },
      //   { id: 1, name: 'A', active: false },
      //   ...
      // ]
      TDD.setState('id', { direction: 'descending' }).run();
      assert.strictEqual(TDD.first.active, false);
      assert.strictEqual(TDD.first.id, 6);

      // [
      //   { id: 8, name: 'd', active: true },
      //   { id: 7, name: 'c', active: true },
      //   { id: 5, name: 'a', active: true },
      //   { id: 3, name: 'C', active: true },
      //   ...
      // ]
      TDD.setState('active', { direction: 'descending' }).run();
      assert.strictEqual(TDD.first.active, true);
      assert.strictEqual(TDD.first.id, 8);

      // [
      //   { id: 3, name: 'C', active: true },
      //   { id: 5, name: 'a', active: true },
      //   { id: 7, name: 'c', active: true },
      //   { id: 8, name: 'd', active: true },
      //   ...
      // ]
      TDD.setState('id').run();
      assert.strictEqual(TDD.first.active, true);
      assert.strictEqual(TDD.first.id, 3);
    });
  });

  suite('Custom comparer', () => {
    teardown(() => TDD.clearState());

    // const importance = 'low medium high'.split(' ');
    // const comparer = (a: any, b: any) => importance.indexOf(a) - importance.indexOf(b);

    test('Default', () => {
      // [
      //   { id: 5, name: 'a', active: true, importance: 'high' },
      //   { id: 8, name: 'd', active: true, importance: 'high' },
      //   { id: 1, name: 'A', active: false, importance: 'medium' },
      //   { id: 3, name: 'C', active: true, importance: 'medium' },
      //   ...
      // ]
      TDD.setState('importance', { comparer: importanceComparer, direction: 'descending' }).run();
      assert.strictEqual(TDD.first.importance, 'high');
      assert.strictEqual(TDD.last.importance, 'low');

      // [
      //   { id: 2, name: 'B', active: false, importance: 'low' },
      //   { id: 4, name: 'D', active: false, importance: 'low' },
      //   { id: 7, name: 'c', active: true, importance: 'low' },
      //   { id: 1, name: 'A', active: false, importance: 'medium' },
      //   ...
      // ]
      TDD.setState('importance', { comparer: importanceComparer }).run();
      assert.strictEqual(TDD.first.importance, 'low');
      assert.strictEqual(TDD.last.importance, 'high');
    });
  });
});
