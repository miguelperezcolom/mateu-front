import {customElement, property} from "lit/decorators.js";
import {html, css, LitElement, PropertyValues} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/custom-field'
import Field from "../../../../../../../../../../api/dtos/Field";


@customElement('field-rich-text-unlayer')
export class RichTextUnlayer extends LitElement implements Component {

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
        if (this.value && this.editor) {
            //console.log('loading design', this.value)
            this.editor.loadDesign(JSON.parse(this.value))
        }
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

    editor: any

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);

        const div = document.createElement('div')
        div.setAttribute('id', 'mieditor')
        div.setAttribute('class', 'editor')
        document.body.append(div)


        /*
        // @ts-ignore
        unlayer.init({
            id: 'mieditor',
            projectId: 182152,
        })
         */

        // @ts-ignore
        this.editor = unlayer.createEditor({
            id: 'mieditor',
            projectId: 182152,
            displayMode: 'email'
        })

        const container = this.renderRoot.querySelector( 'vaadin-custom-field' ) as HTMLElement
        container.appendChild(div)
        // @ts-ignore
        div.querySelector('iframe').style.minWidth = null;

        const theeditor = this.editor
        const dis = this;
        this.editor.addEventListener('editor:ready', function () {
            console.log('editor:ready');
            // theeditor.loadDesign({
            //     html: '<html><body><div>This is a legacy HTML template.</div></body></html>',
            //     classic: true
            // })
            if (dis.value) {
                theeditor.loadDesign(JSON.parse(dis.value))
            }
        });
        // @ts-ignore
        this.editor.addEventListener('design:updated', function(updates) {
            // Design is updated by the user
            console.log('design updated')

            theeditor.exportHtml(function (data:any) {
                // @ts-ignore
                const json = data.design; // design json
                //const html = data.html; // design html

                //console.log(JSON.stringify(json))
                //console.log(html)

                dis.onValueChanged({
                    fieldId: dis.field!.id,
                    value: JSON.stringify(json)})
            })
        });

        //this.editor.exportHtml(function(data) { })
    }

    render() {

        return html`
            <vaadin-custom-field
                    label="${this.label}"
                    ?disabled=${!this.enabled}
                    ?required=${this.required}
                    placeholder="${this.placeholder}"
            >
                
            </vaadin-custom-field>
            `
    }

    static styles = css`
        vaadin-custom-field {
            width: 100%;
        }
        .editor {
            width: 100%;
            height: 500px;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-rich-text-unlayer': RichTextUnlayer
    }
}

