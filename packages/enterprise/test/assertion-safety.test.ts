import { expect, fixture, html } from '@open-wc/testing';

/**
 * Enterprise runs its own `web-test-runner.config.mjs`, so it needs its own
 * proof that `test/setup.js` is loaded ahead of the test framework. The
 * behaviour itself is covered by core's `assertion-safety.test.ts`.
 */
describe('assertion safety', () => {
  it('is installed for the enterprise suite too', async () => {
    const host = await fixture(html`<div><span class="x">hi</span></div>`);
    let actual: unknown;

    try {
      expect(host.querySelector('.x')).to.not.exist;
    } catch (error) {
      actual = (error as { actual?: unknown }).actual;
    }

    expect(actual, 'node summarized rather than reported live').to.equal('<span class="x">');
  });
});
