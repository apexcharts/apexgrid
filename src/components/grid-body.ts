import { LitVirtualizer } from '@lit-labs/virtualizer';
import { customElement } from 'lit/decorators.js';
import styles from '../styles/grid-body-styles.js';

@customElement('igc-grid-body')
export default class GridBody extends LitVirtualizer {
  public static override styles = styles;

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
