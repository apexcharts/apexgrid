import { assert, elementUpdated, html } from '@open-wc/testing';
import type { Keys } from '../src/internal/types';
import GridTestFixture from './utils/grid-fixture.js';
import data, { TestData } from './utils/test-data.js';

const TDD = new GridTestFixture(data, { width: '1000px' });
const defaultKeys = Object.keys(data[0]) as Array<Keys<TestData>>;

suite('Column configuration', () => {
  setup(async () => await TDD.setUp());
  teardown(() => TDD.tearDown());

  suite('Binding', () => {
    test('Through attribute', async () => {
      assert.strictEqual(TDD.grid.columns.length, defaultKeys.length);
      defaultKeys.forEach(key => {
        assert.exists(TDD.grid.getColumn(key));
        assert.exists(TDD.headers.get(key).element);
      });
    });

    test('After initial render', async () => {
      const newKeys: Array<Keys<TestData>> = ['id', 'name'];
      TDD.grid.columns = newKeys.map(key => ({ key }));
      await elementUpdated(TDD.grid);

      newKeys.forEach(key => {
        assert.exists(TDD.grid.getColumn(key));
        assert.exists(TDD.headers.get(key).element);
      });
    });
  });

  suite('Properties', () => {
    test('Header text', async () => {
      const headerText = 'Primary key';
      assert.strictEqual(TDD.headers.first.text, 'id');

      await TDD.updateColumn('id', { headerText });
      assert.strictEqual(TDD.headers.first.text, headerText);
    });

    test('Visibility', async () => {
      assert.exists(TDD.headers.first.element);

      await TDD.updateColumn('id', { hidden: true });
      assert.notExists(TDD.headers.get('id').element);

      await TDD.updateColumn('id', { hidden: false });
      assert.exists(TDD.headers.first.element);
    });

    test('Header template', async () => {
      await TDD.updateColumn('id', {
        headerTemplate: props => html`<h3>Custom template for ${props.column.key}</h3>`,
      });
      assert.strictEqual(TDD.headers.first.text, 'Custom template for id');
      assert.shadowDom.equal(
        TDD.headers.first.element,
        `<div part="content"><h3>Custom template for id</h3></div>`,
      );
    });

    test('Cell template', async () => {
      await TDD.updateColumn('name', {
        cellTemplate: props => html`<input value=${props.value} />`,
      });
      assert.shadowDom.equal(
        TDD.rows.first.cells.get('name').element,
        `<input value="${data[0].name}" />`,
      );
    });

    test('Width', async () => {
      const headerWidthEquals = (expected: number) =>
        assert.strictEqual(TDD.headers.first.element.getBoundingClientRect().width, expected);
      const cellWidthEquals = (expected: number) =>
        assert.strictEqual(
          TDD.rows.first.cells.get('id').element.getBoundingClientRect().width,
          expected,
        );

      // 4 columns * 1fr out of 1000px = 250px

      headerWidthEquals(250);
      cellWidthEquals(250);

      // 0.5 * 1000 = 500
      await TDD.updateColumn('id', { width: '50%' });
      headerWidthEquals(500);
      cellWidthEquals(500);

      await TDD.updateColumn('id', { width: '200px' });
      headerWidthEquals(200);
      cellWidthEquals(200);
    });
  });
});
