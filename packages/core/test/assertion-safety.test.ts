import { expect, fixture, html } from '@open-wc/testing';

/**
 * Guards the fix in `test-setup/dom-safe-assertions.js`. Without it, any
 * assertion that fails while holding a DOM node kills the whole run at the
 * runner's 120s timeout with nothing printed, so a regression in these tests
 * reads as CI being stuck.
 */

/** Runs `assertion`, which must fail, and returns the error it threw. */
function failureOf(assertion: () => void): Record<string, unknown> {
  try {
    assertion();
  } catch (error) {
    return error as unknown as Record<string, unknown>;
  }
  throw new Error('expected the assertion to fail');
}

describe('assertion safety', () => {
  it('summarizes a node held as the actual value', async () => {
    const host = await fixture(html`<div><span class="x">hi</span></div>`);

    const error = failureOf(() => expect(host.querySelector('.x')).to.not.exist);

    expect(error.actual, 'actual is a summary, not the live node').to.equal('<span class="x">');
  });

  it('summarizes a node held as the expected value', async () => {
    const host = await fixture(html`<div><span class="x">hi</span></div>`);

    const error = failureOf(() => expect('not a node').to.equal(host.querySelector('.x')));

    expect(error.expected).to.equal('<span class="x">');
  });

  it('still describes the node in the failure message', async () => {
    const host = await fixture(html`<div><span id="y">hi</span></div>`);

    const error = failureOf(() => expect(host.querySelector('span')).to.not.exist);

    expect(error.message as string).to.contain('span');
    expect(error.message as string).to.contain('id="y"');
  });

  it('elides attributes past the third', async () => {
    const host = await fixture(
      html`<div><i class="a" id="b" title="c" lang="en" role="note"></i></div>`
    );

    const error = failureOf(() => expect(host.querySelector('i')).to.not.exist);

    expect(error.actual).to.equal('<i class="a" id="b" title="c" ...>');
  });

  it('summarizes documents, fragments and text nodes', () => {
    expect(failureOf(() => expect(document).to.not.exist).actual).to.equal('#document');
    expect(failureOf(() => expect(document.createDocumentFragment()).to.not.exist).actual).to.equal(
      '#document-fragment'
    );
    expect(failureOf(() => expect(document.createTextNode('hi')).to.not.exist).actual).to.equal(
      '#text "hi"'
    );
  });

  it('summarizes nodes inside arrays and node lists', async () => {
    const host = await fixture(html`<div><b>1</b><b>2</b></div>`);

    expect(failureOf(() => expect([host.querySelector('b')]).to.equal(0)).actual).to.deep.equal([
      '<b>',
    ]);
    expect(failureOf(() => expect(host.querySelectorAll('b')).to.equal(0)).actual).to.deep.equal([
      '<b>',
      '<b>',
    ]);
  });

  it('leaves non-DOM failures reporting their real values', () => {
    const error = failureOf(() => expect({ a: 1 }).to.deep.equal({ a: 2 }));

    expect(error.actual).to.deep.equal({ a: 1 });
    expect(error.expected).to.deep.equal({ a: 2 });
  });

  it('preserves the identity of an array holding no nodes', () => {
    const values = [1, 2, 3];

    expect(failureOf(() => expect(values).to.equal(0)).actual).to.equal(values);
  });
});
