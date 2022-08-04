import { html, fixture, assert, fixtureCleanup, elementUpdated } from '@open-wc/testing';
import { Grid } from '../src/components/grid.js';

suite('Grid', () => {
  let el: Grid<any>;

  teardown(() => fixtureCleanup());

  suite('Default', () => {
    setup(async () => {
      el = (await fixture(html` <igc-grid></igc-grid> `)) as Grid<any>;
      await elementUpdated(el);
    });

    test('Grid is rendered', async () => {
      assert.instanceOf(el, Grid);
    });
  });
});
