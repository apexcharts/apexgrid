import { assert, fixtureCleanup } from '@open-wc/testing';
import { FilterExpression } from '../../src/operations/filter/types';
import StringOperands from '../../src/operations/filter/operands/string.js';
import NumberOperands from '../../src/operations/filter/operands/number.js';
import BooleanOperands from '../../src/operations/filter/operands/boolean.js';
import FilterState from '../../src/operations/filter/state.js';
import FilterOperation from '../../src/operations/filter.js';
import data, { TestData } from '../utils/test-data.js';
// import { Values, PropertyType } from '../../src/internal/types';

class TDDFilterState<T extends object> {
  #result: T[] = [];
  #operation: FilterOperation<T> = new FilterOperation();
  #state: FilterState<T> = new FilterState();

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

  public setState(config: Partial<FilterExpression<T>>) {
    this.#state.set(config as FilterExpression<T>);
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
      TDD.setState({
        key: 'name',
        condition: new StringOperands<TestData>().get('contains'),
        searchTerm: 'd',
      }).run();

      assert.strictEqual(TDD.result.length, 2);
    });

    test('contains [case sensitive]', () => {
      TDD.setState({
        key: 'name',
        condition: new StringOperands<TestData>().get('contains'),
        searchTerm: 'd',
        caseSensitive: true,
      }).run();

      assert.strictEqual(TDD.result.length, 1);
    });

    test('does not contain [case insensitive]', () => {
      TDD.setState({
        key: 'name',
        searchTerm: 'a',
        condition: new StringOperands<TestData>().get('doesNotContain'),
      }).run();

      assert.strictEqual(TDD.result.length, 6);
    });

    test('does not contain [case sensitive]', () => {
      TDD.setState({
        key: 'name',
        searchTerm: 'd',
        condition: new StringOperands<TestData>().get('doesNotContain'),
        caseSensitive: true,
      }).run();

      assert.strictEqual(TDD.result.length, 7);
    });

    test('start with [case insensitive]', () => {
      TDD.setState({
        key: 'importance',
        searchTerm: 'l',
        condition: new StringOperands<TestData>().get('startsWith'),
      }).run();

      assert.strictEqual(TDD.result.length, 3);
    });

    test('start with [case sensitive]', () => {
      TDD.setState({
        key: 'name',
        searchTerm: 'A',
        condition: new StringOperands<TestData>().get('startsWith'),
        caseSensitive: true,
      }).run();

      assert.strictEqual(TDD.result.length, 1);
    });

    test('ends with [case insensitive]', () => {
      TDD.setState({
        key: 'name',
        searchTerm: 'A',
        condition: new StringOperands<TestData>().get('endsWith'),
      }).run();

      assert.strictEqual(TDD.result.length, 2);
    });

    test('ends with [case sensitive]', () => {
      TDD.setState({
        key: 'name',
        searchTerm: 'A',
        condition: new StringOperands<TestData>().get('endsWith'),
        caseSensitive: true,
      }).run();

      assert.strictEqual(TDD.result.length, 1);
    });

    test('equals [case insensitive]', () => {
      TDD.setState({
        key: 'name',
        searchTerm: 'A',
        condition: new StringOperands<TestData>().get('equals'),
      }).run();

      assert.strictEqual(TDD.result.length, 2);
    });

    test('equals [case sensitive]', () => {
      TDD.setState({
        key: 'name',
        searchTerm: 'A',
        condition: new StringOperands<TestData>().get('equals'),
        caseSensitive: true,
      }).run();

      assert.strictEqual(TDD.result.length, 1);
    });

    test('does not equal [case insensitive]', () => {
      TDD.setState({
        key: 'name',
        searchTerm: 'A',
        condition: new StringOperands<TestData>().get('doesNotContain'),
      }).run();

      assert.strictEqual(TDD.result.length, 6);
    });

    test('does not equal [case sensitive]', () => {
      TDD.setState({
        key: 'name',
        searchTerm: 'A',
        condition: new StringOperands<TestData>().get('doesNotContain'),
        caseSensitive: true,
      }).run();

      assert.strictEqual(TDD.result.length, 7);
    });

    test('empty', () => {
      TDD.setState({
        key: 'name',
        condition: new StringOperands<TestData>().get('empty'),
      }).run();

      assert.strictEqual(TDD.result.length, 0);
    });

    test('not empty', () => {
      TDD.setState({
        key: 'name',
        condition: new StringOperands<TestData>().get('notEmpty'),
      }).run();
      assert.strictEqual(TDD.result.length, 8);
    });
  });

  suite('Number operands', () => {
    teardown(() => TDD.clearState());

    test('equals', () => {
      TDD.setState({
        key: 'id',
        condition: new NumberOperands<TestData>().get('equals'),
        searchTerm: 1,
      }).run();
      assert.strictEqual(TDD.result.length, 1);
    });

    test('does not equal', () => {
      TDD.setState({
        key: 'id',
        condition: new NumberOperands<TestData>().get('doesNotEqual'),
        searchTerm: 1,
      }).run();

      assert.strictEqual(TDD.result.length, 7);
    });

    test('greater than', () => {
      TDD.setState({
        key: 'id',
        condition: new NumberOperands<TestData>().get('greaterThan'),
        searchTerm: 1,
      }).run();

      assert.strictEqual(TDD.result.length, 7);
    });

    test('less than', () => {
      TDD.setState({
        key: 'id',
        condition: new NumberOperands<TestData>().get('lessThan'),
        searchTerm: 8,
      }).run();

      assert.strictEqual(TDD.result.length, 7);
    });

    test('greater than or equal', () => {
      TDD.setState({
        key: 'id',
        condition: new NumberOperands<TestData>().get('greaterThanOrEqual'),
        searchTerm: 1,
      }).run();

      assert.strictEqual(TDD.result.length, 8);
    });

    test('less than or equal', () => {
      TDD.setState({
        key: 'id',
        condition: new NumberOperands<TestData>().get('lessThanOrEqual'),
        searchTerm: 8,
      }).run();

      assert.strictEqual(TDD.result.length, 8);
    });

    test('empty', () => {
      TDD.setState({
        key: 'id',
        condition: new NumberOperands<TestData>().get('empty'),
      }).run();

      assert.strictEqual(TDD.result.length, 0);
    });

    test('not empty', () => {
      TDD.setState({
        key: 'id',
        condition: new NumberOperands<TestData>().get('notEmpty'),
      }).run();

      assert.strictEqual(TDD.result.length, 8);
    });
  });

  suite('Boolean operands', () => {
    teardown(() => TDD.clearState());

    test('all', () => {
      TDD.setState({
        key: 'active',
        condition: new BooleanOperands<TestData>().get('all'),
      }).run();

      assert.strictEqual(TDD.result.length, 8);
    });

    test('true', () => {
      TDD.setState({
        key: 'active',
        condition: new BooleanOperands<TestData>().get('true'),
      }).run();

      assert.strictEqual(TDD.result.length, 4);
    });

    test('false', () => {
      TDD.setState({
        key: 'active',
        condition: new BooleanOperands<TestData>().get('false'),
      }).run();

      assert.strictEqual(TDD.result.length, 4);
    });

    test('empty', () => {
      TDD.setState({
        key: 'active',
        condition: new BooleanOperands<TestData>().get('empty'),
      }).run();

      assert.strictEqual(TDD.result.length, 0);
    });

    test('not empty', () => {
      TDD.setState({
        key: 'active',
        condition: new BooleanOperands<TestData>().get('notEmpty'),
      }).run();

      assert.strictEqual(TDD.result.length, 8);
    });
  });
});
