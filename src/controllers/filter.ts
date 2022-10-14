import {
  defineComponents,
  IgcChipComponent,
  IgcDropdownItemComponent,
  IgcIconButtonComponent,
  IgcInputComponent,
  IgcSelectComponent,
} from 'igniteui-webcomponents';
import { html, nothing, ReactiveController } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { PIPELINE } from '../internal/constants';
import type { ColumnConfig, GridHost } from '../internal/types';
import BooleanOperands from '../operations/filter/operands/boolean.js';
import NumberOperands from '../operations/filter/operands/number.js';
import StringOperands from '../operations/filter/operands/string.js';
import FilterState from '../operations/filter/state.js';
import type { FilterExpression } from '../operations/filter/types';

defineComponents(IgcChipComponent, IgcSelectComponent, IgcInputComponent, IgcIconButtonComponent);

export class FilterController<T extends object> implements ReactiveController {
  constructor(protected host: GridHost<T>) {
    this.host.addController(this);
  }

  protected getOperandsFor(column: ColumnConfig<T>) {
    switch (column.type) {
      case 'boolean':
        return new BooleanOperands<T>();
      case 'number':
        return new NumberOperands<T>();
      default:
        return new StringOperands<T>();
    }
  }

  protected activeExpression!: Partial<FilterExpression<T>>;
  protected activeColumn?: ColumnConfig<T>;

  protected isNumeric() {
    return this.activeColumn?.type === 'number';
  }

  protected isBoolean() {
    return this.activeColumn?.type === 'boolean';
  }

  protected getStateForActiveColumn() {
    return this.state.get(this.activeColumn!.key);
  }

  protected get filterInput() {
    return this.host.shadowRoot!.querySelector('#filter-input') as IgcInputComponent;
  }

  get #defaultExpression(): Partial<FilterExpression<T>> {
    return {
      key: this.activeColumn?.key,
      condition: this.getOperandsFor(this.activeColumn!).default as any,
      criteria: 'and',
    };
  }

  #handleConditionChange = async (ev: CustomEvent<IgcDropdownItemComponent>) => {
    ev.stopPropagation();

    this.activeExpression.condition = this.getOperandsFor(this.activeColumn!).get(
      ev.detail.value as any,
    );

    this.host.requestUpdate();

    if (this.filterInput?.value || this.activeExpression.condition?.unary) {
      this._filter(this.activeExpression as FilterExpression<T>);
    }
  };

  #handleFilterInput = async (ev: CustomEvent<string>) => {
    ev.stopPropagation();
    if (!ev.detail) {
      this.getStateForActiveColumn()?.remove(this.activeExpression as FilterExpression<T>);
      this.host.requestUpdate(PIPELINE);
      return;
    }

    const term = this.isNumeric() ? parseFloat(ev.detail) : ev.detail;

    // TODO
    this.activeExpression!.searchTerm = term as any;
    this._filter(this.activeExpression as FilterExpression<T>);
  };

  #handleFilterIconClick = async (ev: CustomEvent<ColumnConfig<T>>) => {
    ev.stopPropagation();

    this.activeColumn = this.activeColumn === ev.detail ? undefined : ev.detail;
    if (this.activeColumn) {
      this.activeExpression = this.#defaultExpression;
    }
    this.host.requestUpdate();

    await this.host.updateComplete;
    this.filterInput?.focus();
  };

  #handleKeyboard = (event: KeyboardEvent) => {
    event.stopPropagation();

    switch (event.key) {
      case 'Enter':
        this.filterInput.value = '';
        this.activeExpression = this.#defaultExpression;
        this.host.requestUpdate();
        return;
      case 'Escape':
        this.filterInput.value = '';
        this.getStateForActiveColumn()?.remove(this.activeExpression as FilterExpression<T>);
        this.host.requestUpdate(PIPELINE);
        return;
      default:
        return;
    }
  };

  public state: FilterState<T> = new FilterState();

  public renderFilterRow(anchor?: HTMLElement) {
    if (!this.activeColumn) {
      return nothing;
    }

    const operands = [...this.getOperandsFor(this.activeColumn)!].map(
      operand => html`<igc-select-item .value=${operand}>
        <igc-icon
          slot="prefix"
          .name=${operand}
          collection="internal"
        ></igc-icon>
        ${operand}
      </igc-select-item>`,
    );

    // TODO: Move the var setup in the grid render
    const offset = anchor ? anchor.getBoundingClientRect().height : 50;

    return html`<div
      part="filter-row"
      style=${styleMap({ '--header-row-bottom': `${offset}px` })}
    >
      <igc-select
        size="small"
        outlined
        .value=${this.activeExpression.condition?.name}
        @igcChange=${this.#handleConditionChange}
      >
        <igc-icon
          slot="prefix"
          size="small"
          .name=${this.activeExpression.condition?.name ?? ''}
          collection="internal"
        ></igc-icon>
        ${operands}
      </igc-select>
      ${this.activeColumn.type !== 'boolean'
        ? html`<igc-input
            id="filter-input"
            .value=${this.activeExpression.searchTerm ?? ''}
            @igcInput=${this.#handleFilterInput}
            ?disabled=${this.activeExpression.condition?.unary}
            @keydown=${this.#handleKeyboard}
            outlined
            size="small"
          >
          </igc-input>`
        : nothing}
      ${this.renderExpressionChips()}
    </div>`;
  }

  protected renderExpressionChips() {
    const tree = this.state.get(this.activeColumn!.key);

    return !tree
      ? nothing
      : Array.from(tree).map((each, idx) => {
          const remove = (e: Event) => {
            e.stopPropagation();
            this.getStateForActiveColumn()?.remove(each);

            if (this.activeExpression === each) {
              this.activeExpression = this.#defaultExpression;
              this.filterInput?.focus();
            }

            this.host.requestUpdate(PIPELINE);
          };

          const select = async (e: Event) => {
            e.stopPropagation();
            this.activeExpression = each;
            this.host.requestUpdate();

            await this.host.updateComplete;
            this.filterInput?.focus();
            this.filterInput?.select();
          };

          const changeCriteria = (e: Event) => {
            e.stopPropagation();
            each.criteria = each.criteria === 'and' ? 'or' : 'and';
            this.host.requestUpdate(PIPELINE);
          };

          const criteriaPart = idx
            ? html`<igc-button
                size="small"
                variant="flat"
                @click=${changeCriteria}
                >${each.criteria}</igc-button
              >`
            : nothing;

          return html`${criteriaPart}<igc-chip
              selectable
              removable
              ?selected=${this.activeExpression === each}
              @igcRemove=${remove}
              @igcSelect=${select}
            >
              <span slot="select"></span>
              <igc-icon
                slot="prefix"
                .name=${each.condition.name}
                collection="internal"
              ></igc-icon>
              ${each.searchTerm}</igc-chip
            >`;
        });
  }

  protected _filter(expression: FilterExpression<T>) {
    this.state.set(expression);
    this.host.requestUpdate(PIPELINE);
  }

  public hostConnected() {
    this.host.addEventListener('headerFilterClicked', this.#handleFilterIconClick);
  }

  public hostDisconnected() {
    this.host.removeEventListener('headerFilterClicked', this.#handleFilterIconClick);
  }

  public filter() {}
}
