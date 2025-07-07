import { LitVirtualizer } from '@lit-labs/virtualizer/LitVirtualizer.js';
import { registerComponent } from '../internal/register.js';
import { GRID_BODY } from '../internal/tags.js';

export default class ApexVirtualizer extends LitVirtualizer {
  public static get tagName() {
    return GRID_BODY;
  }

  public static register(): void {
    registerComponent(ApexVirtualizer);
  }

  public override scroller = true;

  public override async connectedCallback() {
    await super.layoutComplete;

    super.connectedCallback();
    this.setAttribute('tabindex', '0');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexVirtualizer.tagName]: ApexVirtualizer;
  }
}
