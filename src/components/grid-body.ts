import { LitVirtualizer } from '@lit-labs/virtualizer';
import { customElement } from 'lit/decorators.js';
import { GRID_BODY_TAG } from '../internal/tags.js';

@customElement(GRID_BODY_TAG)
export default class GridBody extends LitVirtualizer {
  public static get is() {
    return GRID_BODY_TAG;
  }

  public override scroller = true;

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-grid-body': GridBody;
  }
}
