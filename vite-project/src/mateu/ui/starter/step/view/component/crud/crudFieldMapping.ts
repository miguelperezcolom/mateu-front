import {html} from 'lit'
import Field from "../../../../../../api/dtos/Field";

export const mapField = (f: Field, filterChanged: Function, baseUrl: string) => html`
          ${f.type != 'enum'
&& f.type != 'boolean'
&& f.type != 'DatesRange'
&& f.type != 'ExternalReference'?html`
            <vaadin-text-field id="${f.id}" label="${f.caption}"
                               placeholder="${f.placeholder}"
                               @change=${filterChanged}
            ></vaadin-text-field>
          `:''}
          ${f.type == 'boolean'?html`
            <vaadin-checkbox-group id="${f.id}" label="${f.caption}"
                               placeholder="${f.placeholder}"
                               @change=${filterChanged}>
              <vaadin-checkbox></vaadin-checkbox>
            </vaadin-checkbox-group>
          `:''}
          ${f.type == 'DatesRange'?html`
            <vaadin-date-picker id="${f.id}_from" label="${f.caption} from"
                               placeholder="${f.placeholder}"
                               @change=${filterChanged}></vaadin-date-picker>
            <vaadin-date-picker id="${f.id}_to" label="${f.caption} to"
                                placeholder="${f.placeholder}"
                                @change=${filterChanged}></vaadin-date-picker>
          `:''}
          ${f.type == 'enum'?html`
            
            <vaadin-combo-box label="${f.caption}" theme="vertical"
                                @change=${filterChanged}
                           id="${f.id}"
                              .items="${f.attributes.filter(a => a.key == 'choice').map(a => a.value)}"
                              item-label-path="key"
                              item-value-path="value"
                              placeholder="${f.placeholder}"
            >
            </vaadin-combo-box>
            
            
          `:''}
          ${f.type == 'ExternalReference'?html`
            
            <field-externalref label="${f.caption}" theme="vertical"
                           id="${f.id}"
                               ._attributes="${f.attributes}"
                               baseUrl="${baseUrl}"
                               @filterchanged=${filterChanged}
                              item-label-path="key"
                              item-value-path="value"
                              placeholder="${f.placeholder}"
            >
            </field-externalref>
            
            
          `:''}
        `;
