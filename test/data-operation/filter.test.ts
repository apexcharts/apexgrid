import { assert, fixtureCleanup } from '@open-wc/testing';
import StringOperands from '../../src/operations/filter/operands/string.js';
import NumberOperands from '../../src/operations/filter/operands/number.js';
import BooleanOperands from '../../src/operations/filter/operands/boolean.js';
import FilterState from '../../src/operations/filter/state.js';
import FilterDataOperation from '../../src/operations/filter.js';
import data from '../utils/test-data.js';

import type { FilterExpression, OperandKeys } from '../../src/operations/filter/types.js';
import type { Keys } from '../../src/internal/types.js';

class TDDFilterState<T extends object> {
  #result: T[] = [];
  #operation: FilterDataOperation<T> = new FilterDataOperation();
  #state: FilterState<T> = new FilterState();
  #operands: Record<string, StringOperands<T> | NumberOperands<T> | BooleanOperands<T>> = {
    string: new StringOperands<T>(),
    number: new NumberOperands<T>(),
    boolean: new BooleanOperands<T>(),
  };

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

  public addCondition(
    key: Keys<T>,
    operand: OperandKeys<T>,
    opts: Partial<FilterExpression<T>> = {},
  ) {
    const type = this.#operands[typeof this.data[0][key]];
    this.#state.set({
      key,
      condition: type.get(operand as any),
      ...opts,
    });
    return this;
  }

  public clearState() {
    this.#state.clear();
  }

  public run() {
    this.#result = this.#operation.apply(structuredClone(this.data), this.#state);
  }
}

const TDD = new TDDFilterState(data);

suite('Filter operations', () => {
  teardown(() => fixtureCleanup());

  suite('String operands', () => {
    teardown(() => TDD.clearState());

    test('contains [case insensitive]', () => {
      TDD.addCondition('name', 'contains', { searchTerm: 'd' }).run();
      assert.strictEqual(TDD.result.length, 2);
    });

    test('contains [case sensitive]', () => {
      TDD.addCondition('name', 'contains', { searchTerm: 'd', caseSensitive: true }).run();
      assert.strictEqual(TDD.result.length, 1);
    });

    test('does not contain [case insensitive]', () => {
      TDD.addCondition('name', 'doesNotContain', { searchTerm: 'a' }).run();
      assert.strictEqual(TDD.result.length, 6);
    });

    test('does not contain [case sensitive]', () => {
      TDD.addCondition('name', 'doesNotContain', { searchTerm: 'd', caseSensitive: true }).run();
      assert.strictEqual(TDD.result.length, 7);
    });

    test('start with [case insensitive]', () => {
      TDD.addCondition('importance', 'startsWith', { searchTerm: 'l' }).run();
      assert.strictEqual(TDD.result.length, 3);
    });

    test('start with [case sensitive]', () => {
      TDD.addCondition('name', 'startsWith', { searchTerm: 'A', caseSensitive: true }).run();
      assert.strictEqual(TDD.result.length, 1);
    });

    test('ends with [case insensitive]', () => {
      TDD.addCondition('name', 'endsWith', { searchTerm: 'A' }).run();
      assert.strictEqual(TDD.result.length, 2);
    });

    test('ends with [case sensitive]', () => {
      TDD.addCondition('name', 'endsWith', { searchTerm: 'A', caseSensitive: true }).run();
      assert.strictEqual(TDD.result.length, 1);
    });

    test('equals [case insensitive]', () => {
      TDD.addCondition('name', 'equals', { searchTerm: 'A' }).run();
      assert.strictEqual(TDD.result.length, 2);
    });

    test('equals [case sensitive]', () => {
      TDD.addCondition('name', 'equals', { searchTerm: 'A', caseSensitive: true }).run();
      assert.strictEqual(TDD.result.length, 1);
    });

    test('does not equal [case insensitive]', () => {
      TDD.addCondition('name', 'doesNotEqual', { searchTerm: 'A' }).run();
      assert.strictEqual(TDD.result.length, 6);
    });

    test('does not equal [case sensitive]', () => {
      TDD.addCondition('name', 'doesNotEqual', { searchTerm: 'A', caseSensitive: true }).run();
      assert.strictEqual(TDD.result.length, 7);
    });

    test('empty', () => {
      TDD.addCondition('name', 'empty').run();
      assert.strictEqual(TDD.result.length, 0);
    });

    test('not empty', () => {
      TDD.addCondition('name', 'notEmpty').run();
      assert.strictEqual(TDD.result.length, 8);
    });
  });

  suite('Number operands', () => {
    teardown(() => TDD.clearState());

    test('equals', () => {
      TDD.addCondition('id', 'equals', { searchTerm: 1 }).run();
      assert.strictEqual(TDD.result.length, 1);
    });

    test('does not equal', () => {
      TDD.addCondition('id', 'doesNotEqual', { searchTerm: 1 }).run();
      assert.strictEqual(TDD.result.length, 7);
    });

    test('greater than', () => {
      TDD.addCondition('id', 'greaterThan', { searchTerm: 1 }).run();
      assert.strictEqual(TDD.result.length, 7);
    });

    test('less than', () => {
      TDD.addCondition('id', 'lessThan', { searchTerm: 8 }).run();
      assert.strictEqual(TDD.result.length, 7);
    });

    test('greater than or equal', () => {
      TDD.addCondition('id', 'greaterThanOrEqual', { searchTerm: 1 }).run();
      assert.strictEqual(TDD.result.length, 8);
    });

    test('less than or equal', () => {
      TDD.addCondition('id', 'lessThanOrEqual', { searchTerm: 8 }).run();
      assert.strictEqual(TDD.result.length, 8);
    });

    test('empty', () => {
      TDD.addCondition('id', 'empty').run();
      assert.strictEqual(TDD.result.length, 0);
    });

    test('not empty', () => {
      TDD.addCondition('id', 'notEmpty').run();
      assert.strictEqual(TDD.result.length, 8);
    });
  });

  suite('Boolean operands', () => {
    teardown(() => TDD.clearState());

    test('all', () => {
      TDD.addCondition('active', 'all').run();
      assert.strictEqual(TDD.result.length, 8);
    });

    test('true', () => {
      TDD.addCondition('active', 'true').run();
      assert.strictEqual(TDD.result.length, 4);
    });

    test('false', () => {
      TDD.addCondition('active', 'false').run();
      assert.strictEqual(TDD.result.length, 4);
    });

    test('empty', () => {
      TDD.addCondition('active', 'empty').run();
      assert.strictEqual(TDD.result.length, 0);
    });

    test('not empty', () => {
      TDD.addCondition('active', 'notEmpty').run();
      assert.strictEqual(TDD.result.length, 8);
    });
  });

  suite('Combinations', () => {
    teardown(() => TDD.clearState());

    test('Single field -> A && B', () => {
      TDD.addCondition('id', 'greaterThan', { searchTerm: 3 })
        .addCondition('id', 'lessThan', { searchTerm: 5 })
        .run();

      /**
       * [
       *  { id: 4, ... }
       * ]
       */
      assert.strictEqual(TDD.result.length, 1);
      assert.strictEqual(TDD.first.id, 4);
    });

    test('Single field -> A || B', () => {
      TDD.addCondition('id', 'greaterThanOrEqual', { searchTerm: 8 })
        .addCondition('id', 'lessThan', { searchTerm: 2, criteria: 'or' })
        .run();

      /**
       * [
       *  { id: 1, ... },
       *  { id: 8, ... }
       * ]
       */
      assert.strictEqual(TDD.result.length, 2);
      assert.strictEqual(TDD.first.id, 1);
      assert.strictEqual(TDD.last.id, 8);
    });

    test('Single field -> A && B || C', () => {
      TDD.addCondition('id', 'greaterThan', { searchTerm: 3 })
        .addCondition('id', 'lessThan', {
          searchTerm: 5,
        })
        .addCondition('id', 'greaterThanOrEqual', { searchTerm: 6, criteria: 'or' })
        .run();

      /**
       * [
       *  { id: 4, ... },
       *  { id: 6 ... },
       *  { id: 7 ... },
       *  { id: 8 ... }
       * ]
       */
      assert.strictEqual(TDD.result.length, 4);
      assert.strictEqual(TDD.first.id, 4);
      assert.strictEqual(TDD.last.id, 8);
    });

    test('Multiple fields -> A && B', () => {
      TDD.addCondition('active', 'true')
        .addCondition('importance', 'equals', {
          searchTerm: 'high',
        })
        .run();

      /**
       * [
       *  { id: 5, name: 'a', active: true, importance: 'high' },
       *  { id: 8, name: 'd', active: true, importance: 'high' }
       * ]
       */
      assert.strictEqual(TDD.result.length, 2);
      assert.strictEqual(TDD.first.active, true);
      assert.strictEqual(TDD.first.importance, 'high');
      assert.strictEqual(TDD.last.active, true);
      assert.strictEqual(TDD.last.importance, 'high');
    });
  });
});
