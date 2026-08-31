/**
 * Keeps assertion failures that carry DOM nodes reportable.
 *
 * `@web/test-runner-mocha` copies `err.actual` and `err.expected` straight into
 * the result it posts back over the web socket, and when either holds a live
 * DOM node that post never completes: the run dies at the runner's 120s
 * `testsFinishTimeout` having printed no failure at all, so a genuine
 * regression reads as CI being stuck rather than as a broken test.
 *
 * Only assertions that fail *while holding* a node hit this, which is why
 * `expect(node).to.exist` is safe (it can only fail on `null`) while
 * `expect(node).to.not.exist` is not.
 *
 * Chai decides pass/fail before `assert` runs, so swapping nodes for a short
 * descriptive string here changes only what a failure reports, never whether
 * it fails.
 */
import { chai } from '@open-wc/testing';

/** Attributes named in a summary before it is truncated. */
const MAX_ATTRS = 3;
/** Characters of text kept when summarizing a non-element node. */
const MAX_TEXT = 40;

const INSTALLED = '__apexGridDomSafeAssertions';

/**
 * @param {unknown} value
 * @returns {boolean} Whether chai would stall the runner by reporting `value`.
 */
function isDomValue(value) {
  if (value instanceof Node) {
    return true;
  }
  return typeof Window === 'function' && value instanceof Window;
}

/**
 * @param {Node} node
 * @returns {string} A short, readable stand-in for `node`.
 */
function describeNode(node) {
  if (node instanceof Element) {
    const attrs = Array.from(node.attributes, (attr) => ` ${attr.name}="${attr.value}"`);
    const shown = attrs.slice(0, MAX_ATTRS).join('');
    const elided = attrs.length > MAX_ATTRS ? ' ...' : '';
    return `<${node.localName}${shown}${elided}>`;
  }
  if (node instanceof Document) {
    return '#document';
  }
  if (node instanceof DocumentFragment) {
    return '#document-fragment';
  }
  const text = (node.textContent ?? '').slice(0, MAX_TEXT);
  return `${node.nodeName} ${JSON.stringify(text)}`;
}

/**
 * Replaces DOM values with a summary string.
 *
 * Shallow by design: it descends one level into arrays and node lists (the
 * shapes assertions like `to.have.members` report) and leaves everything else
 * untouched, including the array identity when nothing inside it is a node.
 *
 * @param {unknown} value
 * @param {boolean} [nested] Whether this call is already one level down.
 * @returns {unknown}
 */
function summarize(value, nested = false) {
  if (value instanceof Node) {
    return describeNode(value);
  }
  if (typeof Window === 'function' && value instanceof Window) {
    return '#window';
  }
  if (nested) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.some(isDomValue) ? value.map((entry) => summarize(entry, true)) : value;
  }
  if (value instanceof NodeList || value instanceof HTMLCollection) {
    return Array.from(value, (entry) => summarize(entry, true));
  }
  return value;
}

if (!(/** @type {Record<string, unknown>} */ (globalThis)[INSTALLED])) {
  /** @type {Record<string, unknown>} */ (globalThis)[INSTALLED] = true;

  const original = chai.Assertion.prototype.assert;

  chai.Assertion.prototype.assert = function assertWithSummarizedDom(...args) {
    const [expr, message, negatedMessage, expected, actual, showDiff] = args;
    // Chai falls back to `_obj` for the actual value when the caller passed
    // fewer than five arguments, so resolve it here and always forward six.
    const resolved = args.length > 4 ? actual : this._obj;
    return original.call(
      this,
      expr,
      message,
      negatedMessage,
      summarize(expected),
      summarize(resolved),
      showDiff
    );
  };
}
