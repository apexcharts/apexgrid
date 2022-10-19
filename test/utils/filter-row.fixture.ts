import type ApexFilterRow from '../../src/components/filter-row';

export default class FilterRowFixture<T extends object> {
  constructor(public element: ApexFilterRow<T>) {}

  public get selectComponent() {
    return this.element.shadowRoot!.querySelector('igc-select')!;
  }

  public get inputComponent() {
    return this.element.shadowRoot!.querySelector('igc-input')!;
  }
}
