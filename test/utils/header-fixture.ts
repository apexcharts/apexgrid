import type GridHeader from '../../src/components/header';

export default class HeaderTestFixture<T extends object> {
  constructor(protected dom: GridHeader<T>) {}

  protected get contentPart() {
    return this.dom.shadowRoot!.querySelector('[part~="content"]')!;
  }

  public get sortIcon() {
    return this.dom.shadowRoot!.querySelector('igc-icon')!;
  }

  public click() {
    this.contentPart.dispatchEvent(new Event('click', { bubbles: true, composed: true }));
  }
}
