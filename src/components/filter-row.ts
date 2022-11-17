import { html, LitElement, nothing } from 'lit';
import { contextProvided } from '@lit-labs/context';
import { customElement, property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { StateController, gridStateContext } from '../controllers/state.js';
import { PIPELINE, DEFAULT_COLUMN_CONFIG } from '../internal/constants.js';
import { GRID_FILTER_ROW_TAG } from '../internal/tags.js';
import { getFilterOperandsFor } from '../internal/utils.js';
import { watch } from '../internal/watch.js';

import styles from '../styles/filter-row/filter-row-styles.js';

import type { FilterExpressionTree } from '../operations/filter/tree.js';
import type { FilterExpression, FilterOperation } from '../operations/filter/types.js';
import type { ColumnConfiguration } from '../internal/types.js';
import {
  IgcInputComponent,
  IgcDropdownComponent,
  IgcDropdownItemComponent,
  IgcIconComponent,
} from 'igniteui-webcomponents';

type ExpressionChipProps<T> = {
  expression: FilterExpression<T>;
  selected: boolean;
  onRemove: Function;
  onSelect: Function;
};

function prefixedIcon(icon?: string) {
  return html`<igc-icon
    slot="prefix"
    name=${ifDefined(icon)}
    collection="internal"
  ></igc-icon>`;
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

  protected get filterController() {
    return this.state.filtering;
  }

  protected get condition() {
    return this.expression.condition as FilterOperation<T, any>;
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
  public column: ColumnConfiguration<T> = DEFAULT_COLUMN_CONFIG;

  @property({ attribute: false })
  public expression!: FilterExpression<T>;

  #setDefaultExpression() {
    this.expression = this.filterController.getDefaultExpression(this.column);
  }

  #removeExpression(expression: FilterExpression<T>) {
    this.filterController.removeExpression(expression);
  }

  async #show() {
    this.active = true;

    await this.updateComplete;
    this.input.select();
  }

  #handleConditionChanged(event: CustomEvent<IgcDropdownItemComponent>) {
    event.stopPropagation();

    this.expression.condition = getFilterOperandsFor(this.column).get(event.detail.value as any);

    if (this.input.value || this.expression.condition.unary) {
      this.filterController.filterWithEvent(this.expression);
    }

    this.requestUpdate();
  }

  #handleInput(event: CustomEvent<string>) {
    event.stopPropagation();

    const value = this.isNumeric ? parseFloat(event.detail) : event.detail;
    const shouldUpdate = this.isNumeric ? !isNaN(value as number) : !!value;

    if (shouldUpdate) {
      this.expression.searchTerm = value;
      this.filterController.filterWithEvent(this.expression);
    } else {
      this.#removeExpression(this.expression);
      this.state.host.requestUpdate(PIPELINE);
    }
    this.requestUpdate();
  }

  #handleKeydown(event: KeyboardEvent) {
    event.stopPropagation();

    switch (event.key) {
      case 'Enter':
        this.input.value = '';
        this.#setDefaultExpression();
        return;
      case 'Escape':
        this.active = false;
        return;
      default:
        return;
    }
  }

  #handleResetClick() {
    this.filterController.reset(this.column.key);
    this.state.host.requestUpdate(PIPELINE);
    this.requestUpdate();
  }

  #openDropdownList() {
    this.dropdown.toggle(this.input);
  }

  @watch('active', { waitUntilFirstUpdate: true })
  protected activeChanged() {
    this.style.display = this.active ? 'flex' : '';

    if (!this.active) {
      this.column = DEFAULT_COLUMN_CONFIG;
    }

    this.state.host.requestUpdate();
  }

  #chipCriteriaFor(expression: FilterExpression<T>) {
    return async (e: Event) => {
      e.stopPropagation();

      expression.criteria = expression.criteria === 'and' ? 'or' : 'and';
      this.filterController.filterWithEvent(expression);
      this.requestUpdate();
    };
  }

  #chipSelectFor(expression: FilterExpression<T>) {
    return async (e: Event) => {
      e.stopPropagation();
      this.expression = expression;
      await this.updateComplete;
      this.input.select();
    };
  }

  #chipRemoveFor(expression: FilterExpression<T>) {
    return async (e: Event) => {
      e.stopPropagation();
      this.#removeExpression(expression);

      if (this.active && this.expression === expression) {
        this.#setDefaultExpression();
        await this.updateComplete;
        this.input.focus();
      }

      this.state.host.requestUpdate(PIPELINE);
      this.requestUpdate();
    };
  }

  protected renderCriteriaButton(expr: FilterExpression<T>, index: number) {
    return index
      ? html`<igc-button
          variant="flat"
          @click=${this.#chipCriteriaFor(expr)}
        >
          ${expr.criteria}
        </igc-button>`
      : nothing;
  }

  protected renderExpressionChip(props: ExpressionChipProps<T>) {
    const { name, unary } = props.expression.condition as FilterOperation<T, any>;
    const { searchTerm: term } = props.expression;

    const prefix = html`<span slot="select"></span>${prefixedIcon(name)}`;

    return html`<igc-chip
      selectable
      removable
      ?selected=${props.selected}
      @igcRemove=${props.onRemove}
      @igcSelect=${props.onSelect}
    >
      ${prefix}${unary ? name : term}
    </igc-chip>`;
  }

  protected renderActiveChips() {
    const state = this.filterController.get(this.column.key);

    return !state
      ? nothing
      : Array.from(state).map((expression, idx) => {
          const props: ExpressionChipProps<T> = {
            expression,
            selected: this.expression === expression,
            onRemove: this.#chipRemoveFor(expression),
            onSelect: this.#chipSelectFor(expression),
          };

          return html`${this.renderCriteriaButton(expression, idx)}${this.renderExpressionChip(
            props,
          )}`;
        });
  }

  protected renderFilterActions() {
    return html`
      <igc-button
        id="reset"
        variant="flat"
        @click=${this.#handleResetClick}
      >
        ${prefixedIcon('refresh')} Reset
      </igc-button>
      <igc-button
        id="close"
        variant="flat"
        @click=${() => (this.active = false)}
      >
        ${prefixedIcon('close')} Close
      </igc-button>
    `;
  }

  protected renderDropdown() {
    return html`<igc-dropdown
      flip
      same-width
      @igcChange=${this.#handleConditionChanged}
      >${Array.from(getFilterOperandsFor(this.column)).map(
        each => html`<igc-dropdown-item
          .value=${each}
          ?selected=${this.condition?.name === each}
        >
          ${prefixedIcon(each)}${each}
        </igc-dropdown-item>`,
      )}
    </igc-dropdown>`;
  }

  protected renderDropdownTarget() {
    return html`<igc-icon
      id="condition"
      slot="prefix"
      collection="internal"
      .name=${this.condition.name}
      @click=${this.#openDropdownList}
    >
    </igc-icon>`;
  }

  protected renderInputArea() {
    return html`<igc-input
        outlined
        value=${ifDefined(this.expression.searchTerm)}
        placeholder="Add filter value"
        ?readonly=${this.condition.unary}
        @igcInput=${this.#handleInput}
        @keydown=${this.#handleKeydown}
      >
        ${this.renderDropdownTarget()}
      </igc-input>
      ${this.renderDropdown()}`;
  }

  protected renderActiveState() {
    return html`<div part="active-state">
      <div part="filter-row-input">${this.renderInputArea()}</div>
      <div part="filter-row-filters">${this.renderActiveChips()}</div>
      <div part="filter-row-actions">${this.renderFilterActions()}</div>
    </div> `;
  }

  protected renderInactiveChips(column: ColumnConfiguration<T>, state: FilterExpressionTree<T>) {
    return Array.from(state).map((expression, idx) => {
      const props: ExpressionChipProps<T> = {
        expression,
        selected: false,
        onRemove: this.#chipRemoveFor(expression),
        onSelect: (e: Event) => {
          e.stopPropagation();
          this.column = column;
          this.expression = expression;
          this.#show();
        },
      };

      return html`${this.renderCriteriaButton(expression, idx)}${this.renderExpressionChip(props)}`;
    });
  }

  protected renderFilterState(column: ColumnConfiguration<T>) {
    const state = this.filterController.get(column.key);

    const partial = state && state.length < 3;
    const hidden = state && state.length >= 3;

    const open = () => {
      this.column = column;
      this.#setDefaultExpression();
      this.#show();
    };

    const count = hidden ? html`<span slot="suffix">${state.length}</span>` : nothing;
    const chip = html`<igc-chip
      data-column=${column.key}
      @click=${open}
      >${prefixedIcon('filter')}Filter${count}</igc-chip
    >`;

    return partial ? this.renderInactiveChips(column, state) : chip;
  }

  protected renderInactiveState() {
    return this.state.host.columns.map(column =>
      column.hidden
        ? nothing
        : html`<div part="filter-row-preview">
            ${column.filter ? this.renderFilterState(column) : nothing}
          </div>`,
    );
  }

  protected override render() {
    return html`${this.active ? this.renderActiveState() : this.renderInactiveState()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexFilterRow.is]: ApexFilterRow<object>;
  }
}
