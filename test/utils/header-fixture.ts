import type GridHeader from '../../src/components/header';

export default class HeaderTestFixture<T extends object> {
  constructor(public element: GridHeader<T>) {}

  protected get contentPart() {
    return this.element.shadowRoot!.querySelector('[part~="content"]')!;
  }

  public get sortIcon() {
    return this.element.shadowRoot!.querySelector('igc-icon')!;
  }

  public get text() {
    return this.contentPart.textContent?.trim();
  }

  public click() {
    this.contentPart.dispatchEvent(new Event('click', { bubbles: true, composed: true }));
  }
}
