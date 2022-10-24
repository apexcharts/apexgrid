import { html, LitElement, nothing } from 'lit';
import { contextProvided } from '@lit-labs/context';
import { customElement, property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { GRID_FILTER_ROW_TAG } from '../internal/tags.js';
import { PIPELINE } from '../internal/constants.js';
import { StateController, gridStateContext } from '../controllers/state.js';
import { watch } from '../internal/watch.js';
import BooleanOperands from '../operations/filter/operands/boolean.js';
import NumberOperands from '../operations/filter/operands/number.js';
import StringOperands from '../operations/filter/operands/string.js';

import styles from '../styles/filter-row/filter-row-styles.js';

import type { FilterExpression } from '../operations/filter/types';
import type { ColumnConfig } from '../internal/types';

import {
  defineComponents,
  IgcChipComponent,
  IgcDropdownComponent,
  IgcInputComponent,
  IgcIconComponent,
  IgcDropdownItemComponent,
} from 'igniteui-webcomponents';

defineComponents(IgcChipComponent, IgcInputComponent, IgcDropdownComponent);

function getOperandsFor<T extends object>(column: ColumnConfig<T>) {
  switch (column.type) {
    case 'boolean':
      return new BooleanOperands<T>();
    case 'number':
      return new NumberOperands<T>();
    default:
      return new StringOperands<T>();
  }
}

@customElement(GRID_FILTER_ROW_TAG)
export default class ApexFilterRow<T extends object> extends LitElement {
  public static get is() {
    return GRID_FILTER_ROW_TAG;
  }

  public static override styles = styles;

  @contextProvided({ context: gridStateContext, subscribe: true })
  @property({ attribute: false })
  public state!: StateController<T>;

  protected get isNumeric() {
    return this.column.type === 'number';
  }

  protected get isBoolean() {
    return this.column.type === 'boolean';
  }

  protected get stateForColumn() {
    return this.state.filtering.state.get(this.column.key);
  }

  @property({ attribute: false })
  public active = false;

  @query(IgcInputComponent.tagName)
  public input!: IgcInputComponent;

  @query('#condition')
  public conditionElement!: IgcIconComponent;

  @query(IgcDropdownComponent.tagName)
  public dropdown!: IgcDropdownComponent;

  @property({ attribute: false })
  public column!: ColumnConfig<T>;

  @property({ attribute: false })
  public expression!: FilterExpression<T>;

  get #defaultExpression(): FilterExpression<T> {
    return {
      key: this.column?.key,
      condition: getOperandsFor(this.column!).default,
      criteria: 'and',
    };
  }

  #handleConditionChanged(event: CustomEvent<IgcDropdownItemComponent>) {
    event.stopPropagation();

    this.expression.condition = getOperandsFor(this.column).get(event.detail.value as any);

    if (this.input.value || this.expression.condition.unary) {
      this.state.filtering.filter(this.expression);
    }

    this.requestUpdate();
  }

  #handleInput(event: CustomEvent<string>) {
    event.stopPropagation();

    const value = this.isNumeric ? parseFloat(event.detail) : event.detail;

    if (value) {
      this.expression.searchTerm = value;
      this.state.filtering.filter(this.expression);
    } else {
      this.stateForColumn?.remove(this.expression);
      this.state.host.requestUpdate(PIPELINE);
    }
    this.requestUpdate();
  }

  #handleKeydown(event: KeyboardEvent) {
    event.stopPropagation();

    switch (event.key) {
      case 'Enter':
        this.input.value = '';
        this.expression = this.#defaultExpression;
        return;
      case 'Escape':
        // TODO: Revise
        if (this.input.value) {
          this.input.value = '';
          this.stateForColumn?.remove(this.expression);
          this.state.host.requestUpdate(PIPELINE);
        } else {
          this.active = false;
        }
        return;
      default:
        return;
    }
  }

  #handleResetClick() {
    this.state.filtering.reset(this.column.key);
    this.state.host.requestUpdate(PIPELINE);
    this.requestUpdate();
  }

  #openDropdownList() {
    this.dropdown.toggle(this.input);
  }

  @watch('active', { waitUntilFirstUpdate: true })
  protected activeChanged() {
    this.active ? (this.style.display = 'flex') : (this.style.display = '');
  }

  protected renderPrefixIcon() {
    return html`<igc-icon
      slot="prefix"
      .name=${this.expression.condition.name}
      collection="internal"
    ></igc-icon>`;
  }

  protected getChipHandlers(expression: FilterExpression<T>) {
    return {
      remove: async (e: Event) => {
        e.stopPropagation();

        this.stateForColumn?.remove(expression);

        if (this.expression === expression) {
          this.expression = this.#defaultExpression;
          await this.updateComplete;
          this.input.focus();
        }
        this.state.host.requestUpdate(PIPELINE);
        this.requestUpdate();
      },
      select: async (e: Event) => {
        e.stopPropagation();

        this.expression = expression;
        this.input.focus();
      },
      changeCriteria: async (e: Event) => {
        e.stopPropagation();

        expression.criteria = expression.criteria === 'and' ? 'or' : 'and';
        this.state.filtering.filter(expression);
        this.requestUpdate();
      },
    };
  }

  protected renderChipPrefix(value: FilterExpression<T>) {
    return html`<span slot="select"></span
      ><igc-icon
        slot="prefix"
        .name=${value.condition.name}
        collection="internal"
      ></igc-icon>`;
  }

  protected renderExpressionChips() {
    const state = this.state.filtering.state.get(this.column.key);

    return !state
      ? nothing
      : Array.from(state).map((each, idx) => {
          const { remove, select, changeCriteria } = this.getChipHandlers(each);

          const criteriaPart = idx
            ? html`<igc-button
                variant="flat"
                @click=${changeCriteria}
                >${each.criteria}</igc-button
              >`
            : nothing;

          return html`${criteriaPart}<igc-chip
              selectable
              removable
              ?selected=${this.expression === each}
              @igcRemove=${remove}
              @igcSelect=${select}
            >
              ${this.renderChipPrefix(each)}
              ${each.condition.unary ? each.condition.name : each.searchTerm}
            </igc-chip>`;
        });
  }

  protected renderFilterActions() {
    return html`
      <igc-button
        variant="flat"
        @click=${this.#handleResetClick}
      >
        <igc-icon
          slot="prefix"
          name="refresh"
          collection="internal"
        ></igc-icon>
        Reset
      </igc-button>
      <igc-button
        variant="flat"
        @click=${this.#hide}
      >
        <igc-icon
          slot="prefix"
          name="close"
          collection="internal"
        ></igc-icon>
        Close
      </igc-button>
    `;
  }

  /**
   * Renders the applicable filtering conditions for the active column
   * in the dropdown list.
   */
  protected renderDropdownList() {
    return Array.from(getOperandsFor(this.column)).map(
      each => html`<igc-dropdown-item
        .value=${each}
        ?selected=${this.expression?.condition?.name === each}
      >
        <igc-icon
          slot="prefix"
          .name=${each}
          collection="internal"
        ></igc-icon>
        ${each}
      </igc-dropdown-item>`,
    );
  }

  protected renderDropdown() {
    return html`<igc-dropdown
      flip
      same-width
      @igcChange=${this.#handleConditionChanged}
      >${this.renderDropdownList()}</igc-dropdown
    >`;
  }

  protected renderDropdownTarget() {
    return html`<igc-icon
      id="condition"
      slot="prefix"
      collection="internal"
      .name=${this.expression.condition.name}
      @click=${this.#openDropdownList}
    ></igc-icon>`;
  }

  protected renderInputArea() {
    return html`<igc-input
        outlined
        value=${ifDefined(this.expression.searchTerm)}
        ?readonly=${this.expression.condition.unary}
        @igcInput=${this.#handleInput}
        @keydown=${this.#handleKeydown}
      >
        ${this.renderDropdownTarget()}
      </igc-input>
      ${this.renderDropdown()}`;
  }

  protected renderActiveState() {
    return html`<div part="active-state">
      <div part="filter-row-inputs">${this.renderInputArea()}</div>
      <div part="filter-row-filters">${this.renderExpressionChips()}</div>
      <div part="filter-row-actions">${this.renderFilterActions()}</div>
    </div> `;
  }

  #hide() {
    this.active = false;
  }

  async #show() {
    this.active = true;
    await this.updateComplete;
    this.input.focus();
  }

  protected renderFilterState(column: ColumnConfig<T>) {
    // const state = this.state.filtering.state.get(column.key);

    // if (state && state.length < 3) {
    //   return this.renderExpressionChips();
    // }

    return html`
      <igc-button
        variant="flat"
        @click=${() => {
          this.column = column;
          this.expression = this.#defaultExpression;
          this.#show();
        }}
        >Filter</igc-button
      >
    `;
  }

  protected renderInactiveState() {
    return this.state.host.columns
      .filter(column => !column.hidden)
      .map(
        column =>
          html`<div part="filter-row-preview">
            ${column.filter ? this.renderFilterState(column) : nothing}
          </div>`,
      );
  }

  protected override render() {
    return html`${this.active ? this.renderActiveState() : this.renderInactiveState()}`;

    // return html`
    //   <div part="filter-row-input">${this.renderSelect()} - ${this.renderInput()}</div>
    //   <div part="filter-row-filters">${this.renderExpressionChips()}</div>
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexFilterRow.is]: ApexFilterRow<object>;
  }
}
