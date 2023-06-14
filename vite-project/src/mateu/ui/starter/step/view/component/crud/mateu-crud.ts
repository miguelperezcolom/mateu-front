import {css, html, LitElement, PropertyValues, TemplateResult} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import Crud from "../../../../../../api/dtos/Crud";
import "@vaadin/horizontal-layout";
import "@vaadin/button";
import "@vaadin/vaadin-grid";
import "@vaadin/vaadin-grid/vaadin-grid-selection-column";
import "@vaadin/vaadin-grid/vaadin-grid-sort-column";
import "@vaadin/vaadin-grid/vaadin-grid-column";
import "../form/section/fieldGroup/field/fields/field-externalref"
import "./mateu-paginator"
import {columnBodyRenderer} from '@vaadin/grid/lit.js';
import {Grid, GridDataProvider} from "@vaadin/vaadin-grid";
import {Button} from "@vaadin/button";
import {badge} from "@vaadin/vaadin-lumo-styles";
import {StatusType} from "../../../../../../api/dtos/StatusType";
import Column from "../../../../../../api/dtos/Column";
import '@vaadin/menu-bar';
import MateuApiClient from "../../../../../../api/MateuApiClient";
import {Base64} from "js-base64";
import ConfirmationTexts from "../../../../../../api/dtos/ConfirmationTexts";
import { dialogRenderer } from 'lit-vaadin-helpers';
import { dialogFooterRenderer } from '@vaadin/dialog/lit';
import {MenuBarItemSelectedEvent} from "@vaadin/menu-bar";


/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('mateu-crud')
export class MateuCrud extends LitElement {
  /**
   * Copy for the read the docs hint.
   */

  @property()
  baseUrl = ''

  @property()
  journeyTypeId!: string

  @property()
  journeyId!: string

  @property()
  stepId!: string

  @property()
  previousStepId!: string

  @property()
  listId!: string

  @property()
  searchSignature!: string


  @property()
  metadata!: Crud

  @property()
  data: object | undefined;

  @state()
  private clickedRow:unknown;

  // @ts-ignore

  private contextMenuOpened?: boolean;

  @state()
  message = '';

  @state()
  canDownload = true;

  @property()
  confirmationOpened = false;

  @state()
  lastFilters: string | undefined

  @state()
  lastSortOrders: string | undefined


  @property()
  closeConfirmation = () => {
    this.confirmationOpened = false
  };

  @property()
  confirmationAction = () => {};

  @property()
  runConfirmedAction = () => {
    this.confirmationAction()
    this.confirmationOpened = false
  };

  @property()
  confirmationTexts: ConfirmationTexts | undefined;

  @state()
  count = 0;

  @state()
  pageSize = 10;

  @state()
  page = 0;

  dataProvider: GridDataProvider<any> = async (params, callback) => {
    //const { page, pageSize } = params;
    const page = this.page;
    const pageSize = this.pageSize;

    this.fetchData({
      page,
      pageSize,
      sortOrders: Base64.encode(JSON.stringify(params.sortOrders.map(o => {
        let direction = 'None';
        if ('asc' == o.direction) direction = 'Ascending';
        if ('desc' == o.direction) direction = 'Descending';
        return {
          column: o.path,
          order: direction
        }
      }))),
      filters: Base64.encode(JSON.stringify(this.data)),
    }).catch((error) => {
      console.log('error', error)
    }).then(result => {
      const {rows, count} = result!
      // @ts-ignore
      if (rows.code || count.code) {
        console.log('fetch returned error or cancelled')
        return
      }
      const gridCount = count > pageSize?pageSize:count;
      rows.forEach((r, i) => {
        r.__index = i + (page * pageSize);
      })
      callback(rows, gridCount);
    });
  };

  async updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("searchSignature")
    || changedProperties.has("journeyId")
    || changedProperties.has("stepId")
    || changedProperties.has("listId")) {
      let searchSignature = this.searchSignature;
      if (changedProperties.has("searchSignature")) {
        searchSignature = changedProperties.get("searchSignature") as string;
      }
      let journeyId = this.journeyId;
      if (changedProperties.has("journeyId")) {
        journeyId = changedProperties.get("journeyId") as string;
      }
      let stepId = this.stepId;
      if (changedProperties.has("stepId")) {
        stepId = changedProperties.get("stepId") as string;
      }
      let listId = this.listId;
      if (changedProperties.has("listId")) {
        listId = changedProperties.get("listId") as string;
      }
      this.setUp();
      if (searchSignature == journeyId + '-' + stepId + '-' + listId) {
        setTimeout(() => this.search());
      }
    }
  }

  search() {
    console.log('signature', this.searchSignature, this.journeyId + '-' + this.stepId + '-' + this.listId)
    if (this.searchSignature != this.journeyId + '-' + this.stepId + '-' + this.listId) {
      const grid = this.shadowRoot!.getElementById('grid') as Grid;
      this.page = 0;
      grid.clearCache();
    }
  }

  async fetchData(params: {
    page: number;
    pageSize: number;
    filters: string;
    sortOrders: string;
  }) {
    const rows = await this.fetchRows(params);

    // @ts-ignore
    if (rows.code == 'ERR_CANCELED') {
      this.message = `Request cancelled`;
      return {rows: [], count: 0}
    }

    // Pagination
    this.count = await this.fetchCount(params.filters);
    this.message = `${this.count} elements found.`;

    return { rows, count: this.count };
  }

  async fetchRows(params: {
    page: number;
    pageSize: number;
    filters: string;
    sortOrders: string;
  }): Promise<any[]> {
    this.lastFilters = params.filters;
    this.lastSortOrders = params.sortOrders;
    return new MateuApiClient(this.baseUrl).fetchRows(this.journeyTypeId, this.journeyId,
        this.stepId, this.listId, params.page, params.pageSize,
        params.sortOrders, params.filters)
  }

  async fetchCount(filters: string): Promise<number> {
    return new MateuApiClient(this.baseUrl).fetchCount(this.journeyTypeId, this.journeyId,
        this.stepId, this.listId, filters)
  }

  connectedCallback() {
    super.connectedCallback();
    this.setUp()
  }

  setUp() {

  }

  protected firstUpdated(_changedProperties: PropertyValues) {
      this.addEventListener('keydown', this.handleKey);
  }

  private handleKey(e: KeyboardEvent) {
    if (e.code == 'Enter') {
      setTimeout(() => this.search());
    }
  }

  stateChanged(state: any) {
    //debugger;
    console.log('state changed in crud', state)
  }

  filterChanged(e:Event) {
    const input = e.currentTarget as HTMLInputElement;
    const obj = {};
    // @ts-ignore
    obj[input.id] = input.value || null;
    this.data = { ...this.data, ...obj}
  }

  valueChanged(e: CustomEvent) {
    const obj = {};
    // @ts-ignore
    obj[e.detail.fieldId] = e.detail.value || null;
    this.data = { ...this.data, ...obj}
  }

  async edit(e:Event) {
    const button = e.currentTarget as Button;
    // @ts-ignore
    console.log(button.row);
    const obj = {
      // @ts-ignore
      _selectedRow: button.row,
      // @ts-ignore
      __index: button.row.__index,
      __count: this.count
    };
    // @ts-ignore
    this.data = { ...this.data, ...obj}
    await new MateuApiClient(this.baseUrl).runStepAction(this.journeyTypeId, this.journeyId, this.stepId, '__list__' + this.listId + '__edit', this.data)
  }

  async runAction(e:Event) {
    const button = e.currentTarget as Button;
    const actionId = button.getAttribute('actionid');
    if (!actionId) {
      console.log('Attribute actionId is missing for ' + button)
      return
    }

    const action = this.findAction(actionId!)
    if (!action) {
      console.log('No action with id ' + actionId)
      return
    }
    const grid = this.shadowRoot?.getElementById('grid') as Grid
    const obj = {
      // @ts-ignore
      _selectedRows: grid.selectedItems,
      _clickedRow: this.clickedRow
    };
    // @ts-ignore
    const extendedData = { ...this.data, ...obj}
    if (action.confirmationRequired) {
      this.confirmationAction = async () => {
        await new MateuApiClient(this.baseUrl).runStepAction(this.journeyTypeId, this.journeyId, this.stepId,
            actionId, extendedData)
      }
      this.confirmationTexts = action.confirmationTexts
      this.confirmationOpened = true;
    } else {
      await new MateuApiClient(this.baseUrl).runStepAction(this.journeyTypeId, this.journeyId, this.stepId,
          actionId, extendedData)
    }
  }

  private findAction(actionId: string) {
    let action = this.metadata.actions.find(a => a.id == actionId);
    return action
  }

  async itemSelected(e: CustomEvent) {
    const obj = {
      // @ts-ignore
      _clickedRow: e.target.row
    };
    // @ts-ignore
    const extendedData = { ...this.data, ...obj}
    await new MateuApiClient(this.baseUrl).runStepAction(this.journeyTypeId, this.journeyId, this.stepId,
        '__list__' + this.listId + '__row__' + e.detail.value.methodNameInCrud, extendedData)
  }

  private getThemeForBadgetType(type: StatusType): string {
    switch (type) {
      case StatusType.SUCCESS: return 'success';
      case StatusType.WARNING: return 'warning';
      case StatusType.DANGER: return 'error';
      case StatusType.NONE: return 'contrast';
    }
    return '';
  }

  private getColumn(c: Column): TemplateResult {
    if (c.type == 'Status') {
      return html`
            <vaadin-grid-sort-column  path="${c.id}" header="${c.caption}" resizable
                                      width="${c.width}"
                ${columnBodyRenderer(
          (row) => {
            // @ts-ignore
            const status = row[c.id]
            return status?html`<span theme="badge ${this.getThemeForBadgetType(status.type)}">${status.message}</span>`:html``;
          },
          []
      )}>
            </vaadin-grid-sort-column>
          `;
    }
    if (c.type == 'ColumnActionGroup') {
      return html`
        <vaadin-grid-column  path="${c.id}" header="${c.caption}" width="60px"
                             ${columnBodyRenderer(
                                 (row) => {
                                   // @ts-ignore
                                   const actions = row[c.id]?.actions.map(a => {
                                     return {
                                       ...a,text: a.caption
                                     }
                                   })
                                   return html`
                                     <vaadin-menu-bar
                                         .items=${[{ text: '···', children: actions }]}
                                         theme="tertiary"
                                         .row="${row}"
                                         @item-selected="${this.itemSelected}"
                                     ></vaadin-menu-bar>
                                   `;
                                 },
                                 []
                             )}
        </vaadin-grid-column>
      `;
    }
    return html`
            <vaadin-grid-sort-column path="${c.id}" header="${c.caption}" resizable
                                     width="${c.width}"
            ></vaadin-grid-sort-column>
        `;
  }


  exportItemSelected(event: MenuBarItemSelectedEvent) {
    let item = event.detail.value
    if (item.text == 'Excel') {
      new MateuApiClient(this.baseUrl).getXls(this.journeyTypeId, this.journeyId, this.stepId, this.listId, this.lastSortOrders!, this.lastFilters!)
    } else if (item.text == 'Csv') {
      new MateuApiClient(this.baseUrl).getCsv(this.journeyTypeId, this.journeyId, this.stepId, this.listId, this.lastSortOrders!, this.lastFilters!)
    }
  }

  pageChanged(e: CustomEvent) {
    const grid = this.shadowRoot!.getElementById('grid') as Grid;
    this.page = e.detail.page;
    grid.clearCache();
  }

  render() {
    // @ts-ignore
    return html`

      <vaadin-horizontal-layout class="header">
        <div>
          <h3>${this.metadata.title}</h3>
          <p>${this.metadata.subtitle}</p>
        </div>
        <vaadin-horizontal-layout style="justify-content: end; flex-grow: 1; align-items: center;" theme="spacing">
          ${this.metadata.actions.map(a => html`
            <vaadin-button theme="secondary" @click=${this.runAction} actionId=${a.id}>${a.caption}</vaadin-button>
          `)}
        </vaadin-horizontal-layout>
      </vaadin-horizontal-layout>
      <vaadin-horizontal-layout style="align-items: baseline;" theme="spacing">
        ${this.metadata?.searchForm.fields.slice(0,1).map(f => html`
          <vaadin-text-field id="${f.id}" label="${f.caption}" @change=${this.filterChanged}
                             placeholder="${f.placeholder}"
                             style="flex-grow: 1;"></vaadin-text-field>
        `)}
        <vaadin-button theme="primary" @click="${this.search}">Search</vaadin-button>
      </vaadin-horizontal-layout>

      <vaadin-horizontal-layout style="align-items: baseline;" theme="spacing">
        ${this.metadata?.searchForm.fields.slice(1).map(f => html`
          ${f.type != 'enum'
              && f.type != 'boolean'
              && f.type != 'DatesRange'
              && f.type != 'ExternalReference'?html`
            <vaadin-text-field id="${f.id}" label="${f.caption}"
                               placeholder="${f.placeholder}"
                               @change=${this.filterChanged}
            ></vaadin-text-field>
          `:''}
          ${f.type == 'boolean'?html`
            <vaadin-checkbox-group id="${f.id}" label="${f.caption}"
                               placeholder="${f.placeholder}"
                               @change=${this.filterChanged}>
              <vaadin-checkbox></vaadin-checkbox>
            </vaadin-checkbox-group>
          `:''}
          ${f.type == 'DatesRange'?html`
            <vaadin-date-picker id="${f.id}_from" label="${f.caption} from"
                               placeholder="${f.placeholder}"
                               @change=${this.filterChanged}></vaadin-date-picker>
            <vaadin-date-picker id="${f.id}_to" label="${f.caption} to"
                                placeholder="${f.placeholder}"
                                @change=${this.filterChanged}></vaadin-date-picker>
          `:''}
          ${f.type == 'enum'?html`
            
            <vaadin-combo-box label="${f.caption}" theme="vertical"
                                @change=${this.filterChanged}
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
                               baseUrl="${this.baseUrl}"
                               @filterchanged=${this.valueChanged}
                              item-label-path="key"
                              item-value-path="value"
                              placeholder="${f.placeholder}"
            >
            </field-externalref>
            
            
          `:''}
        `)}
      </vaadin-horizontal-layout>
      <vaadin-grid id="grid" .dataProvider="${this.dataProvider}" all-rows-visible>
        <vaadin-grid-selection-column></vaadin-grid-selection-column>

      ${this.metadata?.columns.map(c => {
        return this.getColumn(c)
      })}


        ${this.metadata.canEdit?html`
          <vaadin-grid-column
              frozen-to-end
              auto-width
              flex-grow="0"
              ${columnBodyRenderer(
                  (row) => html`<vaadin-button theme="tertiary-inline" .row="${row}" @click="${this.edit}">Edit</vaadin-button>`,
                  []
              )}></vaadin-grid-column>
        `:''}
        
        </vaadin-grid>
      
      <vaadin-horizontal-layout style="align-items: baseline; width: 100%;" theme="spacing">
        <div style=" flex-grow: 1;">${this.message}</div>
        <div style="justify-content: end;">
          <mateu-paginator
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}"
                            stepId="${this.stepId}"
                            baseUrl="${this.baseUrl}"
                            @page-changed="${this.pageChanged}"
                            count="${this.count}"
                            pageSize="${this.pageSize}"
                            .page=${this.page}
            ></mateu-paginator>
        </div>
        <div style="justify-content: end;">
          <vaadin-menu-bar
              .items=${[{ text: 'Export as ...', children: [
                  {text: 'Excel'},
                  {text: 'Csv'}
                ] }]}
              theme="tertiary"
              @item-selected="${this.exportItemSelected}"
          ></vaadin-menu-bar>
        </div>
      </vaadin-horizontal-layout>


      <vaadin-dialog
          header-title="${this.confirmationTexts?.title}"
          .opened="${this.confirmationOpened}"
          ${dialogRenderer(() => html`${this.confirmationTexts?.message}`, [])}
          ${dialogFooterRenderer(
              () => html`
      <vaadin-button theme="primary error" @click="${this.runConfirmedAction}" style="margin-right: auto;">
        ${this.confirmationTexts?.action}
      </vaadin-button>
      <vaadin-button theme="tertiary" @click="${this.closeConfirmation}">Cancel</vaadin-button>
    `,
              []
          )}
      ></vaadin-dialog>
    `
  }

  static styles = css`
  ${badge}
    
  [theme~='badge'][theme~='warning'] {
    color: #6f6800;
    background-color: #FFFCC0;
  }
  [theme~='badge'][theme~='warning'][theme~='primary'] {
    color: #ffffff;
    background-color: #6f6800;
  }
  
  .menu {
    /* color: var(--lumo-secondary-text-color); */
    color: grey;
    height: 1.2rem;
  }
  
    :host {

    }

  `

}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-crud': MateuCrud
  }
}
//hola
