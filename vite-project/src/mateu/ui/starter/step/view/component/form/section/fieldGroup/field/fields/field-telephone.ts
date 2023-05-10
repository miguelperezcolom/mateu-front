import {customElement, property} from "lit/decorators.js";
import {html, css, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/vaadin-text-field'
import '@vaadin/item';
import '@vaadin/list-box';
import '@vaadin/select';
import { selectRenderer } from '@vaadin/select/lit.js';
import Field from "../../../../../../../../../../api/dtos/Field";
import TelephonePrefix from "../../../../../../../../../../api/dtos/TelephonePrefix";
import TelephoneNumber from "../../../../../../../../../../api/dtos/TelephoneNumber";


@customElement('field-telephone')
export class FieldTelephone extends LitElement implements Component {

    @property()
    required: boolean = false;

    setRequired(required: boolean): void {
        this.required = required;
    }

    setField(field: Field): void {
        this.field = field;
    }

    setLabel(label: string): void {
        this.label = label
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    onValueChanged(event: ValueChangedEvent): void {
        console.log(event)
    }
    setValue(value: unknown): void {
        this.value = value as TelephoneNumber;
        this.telprefix = this.value?.prefix
        this.number = this.value?.number
    }

    setBaseUrl(value: string): void {
        this.baseUrl = value
    }

    @property()
    baseUrl = '';


    @property()
    label = '';

    @property()
    placeholder = '';

    @property()
    name = '';

    @property()
    onPrefixChange = (e:CustomEvent) => {
        this.telprefix = e.detail.value
        console.log('prefix', e.detail.value)
        this.onValueChanged({
            fieldId: this.field!.id,
            value: {prefix: this.telprefix, number: this.number}})
    }

    @property()
    onNumberChange = (e:Event) => {
        const input = e.target as HTMLInputElement;
        this.number = input.value
        this.onValueChanged({
            fieldId: this.field!.id,
            value: {prefix: this.telprefix, number: this.number}})
    }

    @property()
    telprefix: string | undefined;

    @property()
    number: string | undefined;

    @property()
    value: TelephoneNumber | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;


    render() {
        return html`
            <vaadin-custom-field
                    label="${this.label}"
                    ?required=${this.required}
                    helper-text="${this.field?.description}"
            >
                <vaadin-select
                        value="${this.telprefix}"
                        @value-changed=${this.onPrefixChange}
                        ${selectRenderer(
                                () => html`
            <vaadin-list-box>
              ${this.field?.attributes
                      .map(a => a.value as TelephonePrefix)
                      .map(
                                        (a) => html`
                  <!-- Use the label attribute to display full name of the person as selected value label -->
                  <vaadin-item value="${a.value}"  >
                    <div style="display: flex; align-items: center;">
                      <img
                        src="https://flagcdn.com/${a.key}.svg"
                        style="width: var(--lumo-size-s); margin-right: var(--lumo-space-s);"
                      />
                      <div>
                          ${a.value}
                      </div>
                    </div>
                  </vaadin-item>
                `
                                )}
            </vaadin-list-box>
          `,
                                
                        )}
                ></vaadin-select>
            <vaadin-text-field
                @change=${this.onNumberChange} 
                           name="${this.name}" 
                           id="${this.name}"
                           value=${this.number}
                   ?disabled=${!this.enabled}
                ?required=${this.required}
                placeholder="${this.placeholder}"
            ></vaadin-text-field>
            </vaadin-custom-field>
            `
    }

    static styles = css`      
        vaadin-custom-field {
                width: 100%;
        }        
        vaadin-select {
            width: 140px;
        }
        vaadin-text-field {
            width: calc(100% - 145px);
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-telephone': FieldTelephone
    }
}

