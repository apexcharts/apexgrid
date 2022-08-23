import type GridHeader from '../../src/components/header';

export default class HeaderTestFixture<T extends object> {
  constructor(public element: GridHeader<T>) {}

  protected get contentPart() {
    return this.element.shadowRoot!.querySelector('[part~="content"]')!;
  }

  protected get actionPart() {
    return this.element.shadowRoot!.querySelector('[part~="action"]')!;
  }

  public get titlePart() {
    return this.element.shadowRoot!.querySelector('[part~="title"]')!;
  }

  public get sortIcon() {
    return this.actionPart.querySelector('igc-icon')!;
  }

  public get text() {
    return this.contentPart.textContent?.trim();
  }

  public click() {
    this.contentPart.dispatchEvent(new Event('click', { bubbles: true, composed: true }));
  }
}
