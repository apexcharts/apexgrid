import { assert, html } from '@open-wc/testing';
import { MIN_COL_RESIZE_WIDTH } from '../src/internal/constants.js';
import type { Keys } from '../src/internal/types';
import GridTestFixture from './utils/grid-fixture.js';
import data from './utils/test-data.js';

class ResizeFixture<T extends object> extends GridTestFixture<T> {
  public override updateConfig(): void {
    this.columnConfig = this.columnConfig.map(config => ({ ...config, resizable: true }));
  }

  public async assertResized(name: Keys<T>, delta: number) {
    const dom = this.headers.get(name).element;
    const initial = dom.offsetWidth;

    await this.startResizeHeader(name);
    await this.resizeHeader(name, delta);
    await this.stopResizeHeader(name);
    // Header
    assert.strictEqual(dom.offsetWidth, initial + delta);

    // Cell
    assert.strictEqual(this.rows.first.cells.get(name).element.offsetWidth, initial + delta);
  }

  public getTranslate(element: HTMLElement) {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).getPropertyValue('transform'));
    return {
      x: matrix.m41,
      y: matrix.m42,
    };
  }
}

const TDD = new ResizeFixture(data);

suite('Column resizing', () => {
  setup(async () => await TDD.setUp());
  teardown(() => TDD.tearDown());

  suite('Default', () => {
    test('Resize element state with disabled resizing', async () => {
      await TDD.updateColumn('name', { resizable: false });
      assert.notExists(TDD.resizePart);
      assert.notExists(TDD.headers.get('name').resizePart);
    });

    test('Resize element state with enabled resizing', async () => {
      assert.exists(TDD.headers.get('name').resizePart);

      await TDD.startResizeHeader('name');
      assert.exists(TDD.resizePart);
    });

    test('Resize element is at correct x point', async () => {
      await TDD.startResizeHeader('name');
      const header = TDD.headers.get('name').element;
      assert.strictEqual(
        TDD.getTranslate(TDD.resizePart).x,
        header.offsetLeft + header.offsetWidth,
      );
    });

    test('Resize element is none when resizing stops', async () => {
      await TDD.startResizeHeader('name');
      assert.exists(TDD.resizePart);

      await TDD.stopResizeHeader('name');
      assert.notExists(TDD.resizePart);
    });

    test('Header is sized correctly', async () => {
      await TDD.assertResized('name', 100);
      await TDD.assertResized('name', -100);
    });

    test('Header does not fall below min threshold', async () => {
      const dom = TDD.headers.get('name').element;

      await TDD.startResizeHeader('name');
      await TDD.resizeHeader('name', -1e3);
      await TDD.stopResizeHeader('name');

      assert.strictEqual(dom.offsetWidth, MIN_COL_RESIZE_WIDTH);
    });

    test('Auto-size (header)', async () => {
      await TDD.updateColumn('name', {
        headerTemplate: () => html`<div style="width: 300px"></div>`,
      });
      await TDD.autoSizeHeader('name');

      const [header, cell] = [
        TDD.headers.get('name').element,
        TDD.rows.first.cells.get('name').element,
      ];

      assert.isAbove(header.offsetWidth, 300);
      assert.strictEqual(header.offsetWidth, cell.offsetWidth);
    });

    test('Auto size (cell)', async () => {
      await TDD.updateColumn('name', {
        cellTemplate: () => html`<div style="width: 600px"></div>`,
      });
      await TDD.autoSizeHeader('name');

      const [header, cell] = [
        TDD.headers.get('name').element,
        TDD.rows.first.cells.get('name').element,
      ];

      assert.isAbove(header.offsetWidth, 600);
      assert.strictEqual(header.offsetWidth, cell.offsetWidth);
    });
  });

  suite('Events', () => {});
});
