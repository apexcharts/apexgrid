import { assert, elementUpdated, html } from '@open-wc/testing';
import type { ApexCellContext, Keys } from '../src/internal/types.js';
import GridTestFixture from './utils/grid-fixture.js';
import data, { type TestData } from './utils/test-data.js';

const TDD = new GridTestFixture(data, { width: '1000px' });
const defaultKeys = Object.keys(data[0]) as Array<Keys<TestData>>;

suite('Column configuration', () => {
  setup(async () => await TDD.setUp());
  teardown(() => TDD.tearDown());

  suite('Binding', () => {
    test('Through attribute', async () => {
      assert.strictEqual(TDD.grid.columns.length, defaultKeys.length);

      for (const key of defaultKeys) {
        assert.exists(TDD.grid.getColumn(key));
        assert.exists(TDD.headers.get(key).element);
      }
    });

    test('After initial render', async () => {
      const newKeys: Array<Keys<TestData>> = ['id', 'name'];
      TDD.grid.columns = newKeys.map(key => ({ key }));
      await elementUpdated(TDD.grid);

      for (const key of newKeys) {
        assert.exists(TDD.grid.getColumn(key));
        assert.exists(TDD.headers.get(key).element);
      }
    });

    test('Updating configuration', async () => {
      await TDD.updateColumns([
        { key: 'id', headerText: 'Primary' },
        { key: 'name', headerText: 'Username' },
      ]);
      assert.strictEqual(TDD.grid.getColumn('id')?.headerText, 'Primary');
      assert.strictEqual(TDD.grid.getColumn('name')?.headerText, 'Username');
    });
  });

  suite('Properties', () => {
    test('Header text', async () => {
      const headerText = 'Primary key';
      assert.strictEqual(TDD.headers.first.text, 'id');

      await TDD.updateColumns({ key: 'id', headerText });
      assert.strictEqual(TDD.headers.first.text, headerText);
    });

    test('Visibility', async () => {
      assert.exists(TDD.headers.first.element);

      await TDD.updateColumns({ key: 'id', hidden: true });
      assert.notExists(TDD.headers.get('id').element);

      await TDD.updateColumns({ key: 'id', hidden: false });
      assert.exists(TDD.headers.first.element);
    });

    test('Header template', async () => {
      await TDD.updateColumns({
        key: 'id',
        headerTemplate: props => html`<h3>Custom template for ${props.column.key}</h3>`,
      });
      assert.strictEqual(TDD.headers.first.text, 'Custom template for id');
      assert.dom.equal(
        TDD.headers.first.titlePart,
        `<span part="title">
            <span>
              <h3>Custom template for id</h3>
            </span>
          </span>`
      );
    });

    test('Cell template', async () => {
      await TDD.updateColumns({
        key: 'name',
        cellTemplate: (props: ApexCellContext<TestData, 'name'>) =>
          html`<input value=${props.value} />`,
      });

      assert.shadowDom.equal(
        TDD.rows.first.cells.get('name').element,
        `<input value="${data[0].name}" />`
      );
    });

    test('Width', async () => {
      const headerWidthEquals = (expected: number) =>
        assert.strictEqual(TDD.headers.first.element.getBoundingClientRect().width, expected);

      const cellWidthEquals = (expected: number) =>
        assert.strictEqual(
          TDD.rows.first.cells.get('id').element.getBoundingClientRect().width,
          expected
        );

      // 4 columns * 1fr out of 1000px = 250px

      headerWidthEquals(250);
      cellWidthEquals(250);

      // 0.5 * 1000 = 500
      await TDD.updateColumns({ key: 'id', width: '50%' });
      headerWidthEquals(500);
      cellWidthEquals(500);

      await TDD.updateColumns({ key: 'id', width: '200px' });
      headerWidthEquals(200);
      cellWidthEquals(200);
    });

    test('Resize', async () => {
      assert.isFalse(TDD.grid.getColumn('name')?.resizable);

      await TDD.updateColumns({ key: 'name', resizable: true });

      assert.strictEqual(TDD.grid.getColumn('name')?.resizable, true);
      assert.exists(TDD.headers.get('name').resizePart);
    });
  });
});
