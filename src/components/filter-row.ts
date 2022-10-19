import { html, nothing } from 'lit';
import { contextProvided } from '@lit-labs/context';
import { customElement, property, query } from 'lit/decorators.js';
import { EventEmitterBase } from '../internal/mixins/event-emitter.js';
import { GRID_FILTER_ROW_TAG } from '../internal/tags.js';
import BooleanOperands from '../operations/filter/operands/boolean.js';
import NumberOperands from '../operations/filter/operands/number.js';
import StringOperands from '../operations/filter/operands/string.js';

import styles from '../styles/filter-row/filter-row-styles.js';

import type { FilterExpression } from '../operations/filter/types';
import type { ColumnConfig } from '../internal/types';

import {
  defineComponents,
  IgcChipComponent,
  IgcIconButtonComponent,
  IgcInputComponent,
  IgcSelectComponent,
  IgcSelectItemComponent,
} from 'igniteui-webcomponents';
import { gridStateContext } from '../internal/constants.js';
import { StateController } from '../controllers/state.js';

defineComponents(IgcChipComponent, IgcSelectComponent, IgcInputComponent, IgcIconButtonComponent);

interface ApexFilterRowEventMap<T> {
  inputChanged: CustomEvent<string | number>;
  inputCleared: CustomEvent<void>;
  criteriaChanged: CustomEvent<FilterExpression<T>>;
  conditionChanged: CustomEvent<string>;
  selectionChanged: CustomEvent<FilterExpression<T>>;
  commitExpression: CustomEvent<void>;
  discardExpression: CustomEvent<FilterExpression<T>>;
  removeExpression: CustomEvent<FilterExpression<T>>;
}

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
export default class ApexFilterRow<T extends object> extends EventEmitterBase<
  ApexFilterRowEventMap<T>
> {
  public static get is() {
    return GRID_FILTER_ROW_TAG;
  }

  public static override styles = styles;

  protected get isNumeric() {
    return this.column.type === 'number';
  }

  protected get isBoolean() {
    return this.column.type === 'boolean';
  }

  @query('#filter-input')
  public input!: IgcInputComponent;

  @property({ attribute: false })
  public column!: ColumnConfig<T>;

  @property({ attribute: false })
  public expression!: FilterExpression<T>;

  @contextProvided({ context: gridStateContext, subscribe: true })
  @property({ attribute: false })
  public state!: StateController<T>;

  #handleConditionChange(event: CustomEvent<IgcSelectItemComponent>) {
    event.stopPropagation();
    this.emitEvent('conditionChanged', { detail: event.detail.value });
  }

  #handleInput(event: CustomEvent<string>) {
    event.stopPropagation();

    event.detail
      ? this.emitEvent('inputChanged', {
          detail: this.isNumeric ? parseFloat(event.detail) : event.detail,
        })
      : this.emitEvent('inputCleared');
  }

  #handleKeydown(event: KeyboardEvent) {
    event.stopPropagation();

    switch (event.key) {
      case 'Enter':
        this.input.value = '';
        this.emitEvent('commitExpression');
        return;
      case 'Escape':
        this.input.value = '';
        this.emitEvent('discardExpression', { detail: this.expression });
        return;
      default:
        return;
    }
  }

  protected renderPrefixIcon() {
    return html`<igc-icon
      slot="prefix"
      .name=${this.expression.condition.name}
      collection="internal"
    ></igc-icon>`;
  }

  protected renderChipPrefix(value: FilterExpression<T>) {
    return html`<span slot="select"></span
      ><igc-icon
        slot="prefix"
        .name=${value.condition.name}
        collection="internal"
      ></igc-icon>`;
  }

  protected renderOperands() {
    return Array.from(getOperandsFor(this.column)).map(
      each => html` <igc-select-item .value=${each}>
        <igc-icon
          slot="prefix"
          .name=${each}
          collection="internal"
        ></igc-icon>
        ${each}
      </igc-select-item>`,
    );
  }

  protected renderSelect() {
    return html`<igc-select
      outlined
      .value=${this.expression.condition.name}
      @igcChange=${this.#handleConditionChange}
    >
      ${this.renderPrefixIcon()} ${this.renderOperands()}
    </igc-select>`;
  }

  protected renderInput() {
    return this.column.type === 'boolean'
      ? nothing
      : html` <igc-input
          id="filter-input"
          outlined
          ?disabled=${this.expression.condition?.unary}
          .value=${this.expression.searchTerm ?? ''}
          @igcInput=${this.#handleInput}
          @keydown=${this.#handleKeydown}
          placeholder="Type and pres enter."
        ></igc-input>`;
  }

  protected renderExpressionChips() {
    const state = this.state.filtering.state.get(this.column.key);

    return !state
      ? nothing
      : Array.from(state).map((each, idx) => {
          const remove = (e: Event) => {
            e.stopPropagation();
            this.emitEvent('removeExpression', { detail: each });
          };

          const select = async (e: Event) => {
            e.stopPropagation();
            this.emitEvent('selectionChanged', { detail: each });
          };

          const changeCriteria = (e: Event) => {
            e.stopPropagation();
            this.emitEvent('criteriaChanged', { detail: each });
          };

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
              ${this.renderChipPrefix(each)} ${each.searchTerm}
            </igc-chip>`;
        });
  }

  protected override render() {
    return html`
      <div part="filter-row-input">${this.renderSelect()} - ${this.renderInput()}</div>
      <div part="filter-row-filters">${this.renderExpressionChips()}</div>
      <div part="filter-actions">
        <igc-button variant="flat">
          <igc-icon
            slot="prefix"
            name="refresh"
            collection="internal"
          ></igc-icon>
          Reset
        </igc-button>
        <igc-button variant="flat">
          <igc-icon
            slot="prefix"
            name="close"
            collection="internal"
          ></igc-icon>
          Close
        </igc-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ApexFilterRow.is]: ApexFilterRow<object>;
  }
}
