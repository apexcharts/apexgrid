import type ApexFilterRow from '../../src/components/filter-row';
import type { OperandKeys } from '../../src/operations/filter/types';
import type { Keys } from '../../src/internal/types';

export default class FilterRowFixture<T extends object> {
  constructor(public element: ApexFilterRow<T>) {}

  protected get previewParts(): HTMLElement[] {
    return Array.from(this.element.shadowRoot!.querySelectorAll('[part~="filter-row-preview"]'));
  }

  public get inactiveStateChips(): HTMLElement[] {
    return Array.from(
      this.element.shadowRoot!.querySelectorAll('[part~="filter-row-preview"] igc-chip'),
    );
  }

  public get activeStateChips(): HTMLElement[] {
    return Array.from(
      this.element.shadowRoot!.querySelectorAll('[part~="filter-row-filters"] igc-chip'),
    );
  }

  public get active() {
    return this.element.active;
  }

  public get input() {
    return this.element.input;
  }

  public get dropdownTarget() {
    return this.element.conditionElement;
  }

  public get dropdown() {
    return this.element.dropdown;
  }

  public get resetButton() {
    return this.element.shadowRoot!.querySelector('#reset') as HTMLElement;
  }

  public get closeButton() {
    return this.element.shadowRoot!.querySelector('#close') as HTMLElement;
  }

  public get dropdownItems() {
    return Array.from(this.dropdown.querySelectorAll('igc-dropdown-item'));
  }

  public getInactiveChip(key: Keys<T>) {
    return this.inactiveStateChips.find(chip => chip.dataset.column === key)!;
  }

  public open(key: Keys<T>) {
    this.getInactiveChip(key).click();
  }

  public openDropdown() {
    this.dropdownTarget.click();
  }

  public selectDropdownCondition(name: OperandKeys<T>) {
    this.dropdownItems.find(item => item.value === name)?.click();
  }

  public fireInputEvent(value: string) {
    this.input.value = value;
    this.input.emitEvent('igcInput', { detail: value });
  }

  public commitInput() {
    this.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  }

  public resetInput() {
    this.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  }

  public close() {
    this.closeButton.click();
  }

  public reset() {
    this.resetButton.click();
  }
}
