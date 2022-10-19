import type ApexGridHeader from '../../src/components/header';

const DEFAULT_ARGS: PointerEventInit = { pointerId: 1, bubbles: true, composed: true };

export default class HeaderTestFixture<T extends object> {
  constructor(public element: ApexGridHeader<T>) {}

  protected get contentPart() {
    return this.element.shadowRoot!.querySelector('[part~="content"]')!;
  }

  protected get actionPart() {
    return this.element.shadowRoot!.querySelector('[part~="action"]')!;
  }

  protected get filterPart() {
    return this.element.shadowRoot!.querySelector('[part~="filter"]')!;
  }

  public get filterIcon() {
    return this.filterPart.querySelector('igc-icon-button')!;
  }

  public get resizePart() {
    return this.element.shadowRoot!.querySelector('[part~="resizable"]')!;
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

  public startResize() {
    this.resizePart.dispatchEvent(new PointerEvent('pointerdown', DEFAULT_ARGS));
  }

  public stopResize() {
    this.resizePart.dispatchEvent(new PointerEvent('pointerup', DEFAULT_ARGS));
    this.resizePart.dispatchEvent(new PointerEvent('lostpointercapture', DEFAULT_ARGS));
  }

  public resize(x: number) {
    this.resizePart.dispatchEvent(
      new PointerEvent('pointermove', {
        ...DEFAULT_ARGS,
        clientX: this.element.offsetLeft + this.element.offsetWidth + x,
      }),
    );
  }

  public autosize() {
    this.resizePart.dispatchEvent(new Event('dblclick', DEFAULT_ARGS));
  }

  public click() {
    this.contentPart.dispatchEvent(new Event('click', DEFAULT_ARGS));
  }
}
