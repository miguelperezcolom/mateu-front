import {customElement, property} from "lit/decorators.js";
import {html, css, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/vaadin-upload'
import Field from "../../../../../../../../../../api/dtos/Field";
import File from "../../../../../../../../../../api/dtos/File";
import {nanoid} from "nanoid";
import {UploadElement} from "@vaadin/vaadin-upload/src/vaadin-upload";


@customElement('field-file')
export class FieldFile extends LitElement implements Component {

    @property()
    required: boolean = false;

    setRequired(required: boolean): void {
        this.required = required;
    }


    setField(field: Field): void {
        this.field = field;
        this.fileidprefix = field.attributes.find(a => a.key == 'fileidprefix')?.value as string;
        this.fileid = nanoid();
        this.maxfiles = field.attributes.find(a => a.key == 'maxfiles')?.value as number;
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
        console.log('value', value)
        if (!value) {
            this.value = [];
            return
        }
        this.value = [value as File];
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
    onChange = (e:CustomEvent) => {
        const input = e.target as UploadElement;
        if (e.detail.value == 100) {
            console.log('upload complete', e, input.files)
            this.onValueChanged({
                fieldId: this.field!.id,
                value: input.files.map(uf => { return {
                    targetUrl: uf.uploadTarget,
                    id: this.fileid,
                    name: uf.name,
                    type: uf.type
                } as File })})
        }
    }

    @property()
    value: File[] = [];

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    @property()
    maxfiles: number | undefined;

    @property()
    fileidprefix: string | undefined;

    @property()
    fileid: string | undefined;

    render() {
        return html`
            <vaadin-custom-field
                    label="${this.label}"
                    ?required=${this.required}
                    placeholder="${this.placeholder}"
                    helper-text="${this.field?.description}"
            >
            <vaadin-upload
                label="${this.label}"
                .maxFiles="${this.maxfiles}"
                @files-changed=${this.onChange}
                           name="${this.name}" 
                           id="${this.name}"
                           .files=${this.value}
                   ?disabled=${!this.enabled}
                ?required=${this.required}
                placeholder="${this.placeholder}"
                    target="${this.baseUrl + '/files/' + this.fileidprefix + this.fileid}"></vaadin-upload>
            </vaadin-custom-field>
            `
    }

    static styles = css`
        
        :host {
            width: 100%;
        }
    
        vaadin-custom-field {
            width: 100%;
        }
        vaadin-upload {
            width: 100%;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-file': FieldFile
    }
}

