import { ApexGrid } from './components/grid.js';

type ApexGridTheme = 'bootstrap' | 'material' | 'fluent' | 'indigo';

export interface ApexGridSetupOptions {
  /**
   * @deprecated Inert, and accepted only so existing calls keep compiling.
   *
   * The grid never shipped its own per-framework themes — it styles itself
   * entirely through `--ag-*` CSS custom properties (see the README's theming
   * section), so this option never affected its appearance. It used to forward
   * to `configureTheme()` from `igniteui-webcomponents`, which made a whole
   * component library a runtime dependency of every consumer for one
   * pass-through call. The dependency is gone and so is the forwarding.
   *
   * If you were relying on that side effect to theme your own Ignite UI
   * components, call `configureTheme()` yourself. Passing this option now warns
   * once and does nothing else; it will be removed in the next major version.
   */
  theme?: ApexGridTheme;

  /**
   * Whether to adopt a default host stylesheet that sets `height: 100%`
   * with a `min-height: 240px` fallback. Set to `false` if you want to
   * provide your own host sizing.
   *
   * @defaultValue true
   */
  hostStyles?: boolean;
}

const HOST_CSS = 'apex-grid { height: 100%; min-height: 240px; }';
let hostStylesInjected = false;

function adoptHostStyles(): void {
  if (hostStylesInjected || typeof document === 'undefined') return;

  if ('adoptedStyleSheets' in Document.prototype && 'replaceSync' in CSSStyleSheet.prototype) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(HOST_CSS);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  } else {
    const style = document.createElement('style');
    style.setAttribute('data-apex-grid', 'host-styles');
    style.textContent = HOST_CSS;
    document.head.appendChild(style);
  }

  hostStylesInjected = true;
}

let themeWarned = false;

function warnThemeIsInert(): void {
  if (themeWarned) return;
  themeWarned = true;
  // biome-ignore lint/suspicious/noConsole: intentional one-shot deprecation diagnostic
  console.warn(
    '[apex-grid] `setup({ theme })` is inert and will be removed. The grid styles ' +
      'itself through `--ag-*` CSS custom properties; this option only ever forwarded ' +
      "to igniteui-webcomponents' `configureTheme()`, which is no longer a dependency. " +
      'Call `configureTheme()` directly if you need it, and drop the option.'
  );
}

/**
 * One-call convenience: registers `<apex-grid>` and adopts a default host
 * stylesheet so the virtualizer has a bounded height. The grid is styled
 * out-of-the-box via `--ag-*` CSS custom properties — no theme import needed.
 *
 * @remarks
 * This is an **additive** alternative to the manual setup
 * (`import 'apex-grid/define'` + host CSS). Idempotent — safe to call more
 * than once; host styles are adopted only on the first call.
 *
 * Customize the look by overriding `--ag-*` CSS variables (see the README).
 * The deprecated {@link ApexGridSetupOptions.theme} option is inert.
 *
 * @example
 * ```ts
 * import { setup } from 'apex-grid';
 * setup();
 * ```
 *
 * @example Opt out of injected host styles:
 * ```ts
 * setup({ hostStyles: false });
 * ```
 */
export function setup(options: ApexGridSetupOptions = {}): void {
  const { theme, hostStyles = true } = options;

  ApexGrid.register();

  if (theme !== undefined) warnThemeIsInert();

  if (hostStyles) {
    adoptHostStyles();
  }
}
