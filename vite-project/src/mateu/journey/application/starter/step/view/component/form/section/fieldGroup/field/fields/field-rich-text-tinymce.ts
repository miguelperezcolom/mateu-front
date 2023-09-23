import {customElement, property} from "lit/decorators.js";
import {html, css, LitElement, PropertyValues} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/vaadin-text-field'
import Field from "../../../../../../../../../../../shared/apiClients/dtos/Field";
import '@tinymce/tinymce-webcomponent'


@customElement('field-rich-text-tinymce')
export class RichTextTinymce extends LitElement implements Component {

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

    setPattern(pattern: string): void {
        this.pattern = pattern
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    onValueChanged(event: ValueChangedEvent): void {
        console.log(event)
    }
    setValue(value: unknown): void {
        this.value = value as string;
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
    pattern = '';

    @property()
    name = '';

    @property()
    onChange = (e:Event) => {
        const input = e.target as HTMLInputElement;
        this.onValueChanged({
            fieldId: this.field!.id,
            value: input.value})
    }

    @property()
    value: string | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    protected firstUpdated(_changedProperties: PropertyValues) {
        //super.firstUpdated(_changedProperties);

        const container = this.renderRoot.querySelector( '.editor' ) as HTMLElement
        console.log('container', container);
    }



    render() {

        return html`
            <vaadin-custom-field
                    label="${this.label}"
                    ?disabled=${!this.enabled}
                    ?required=${this.required}
                    placeholder="${this.placeholder}"
            >
                <tinymce-editor></tinymce-editor>
            </vaadin-custom-field>
            `
    }

    static styles = css`
        vaadin-text-field {
            width: 100%;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-rich-text-tinymce': RichTextTinymce
    }
}

