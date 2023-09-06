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
import {mapField} from "./crudFieldMapping";

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
  timestamp!: string

  @property()
  previousStepId!: string

  @property()
  listId!: string

  searchSignature = ''


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
      // @ts-ignore
      filters: this.data,
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
    || changedProperties.has("timestamp")
    || changedProperties.has("listId")) {
      let currentSearchSignature = this.searchSignature;
      if (changedProperties.has("searchSignature")) {
        currentSearchSignature = changedProperties.get("searchSignature") as string;
      }
      let journeyId = this.journeyId;
      if (changedProperties.has("journeyId")) {
        journeyId = changedProperties.get("journeyId") as string;
      }
      let stepId = this.stepId;
      if (changedProperties.has("stepId")) {
        stepId = changedProperties.get("stepId") as string;
      }
      let timestamp = this.timestamp;
      if (changedProperties.has("timestamp")) {
        timestamp = changedProperties.get("timestamp") as string;
      }
      let listId = this.listId;
      if (changedProperties.has("listId")) {
        listId = changedProperties.get("listId") as string;
      }
      this.setUp();
      console.log(currentSearchSignature, this.searchSignature)
      if (currentSearchSignature != journeyId + '-' + stepId + '-' + timestamp + '-' + listId) {
        currentSearchSignature = journeyId + '-' + stepId + '-' + timestamp + '-' + listId
        console.log('signature has changed')
        //setTimeout(() => this.search(currentSearchSignature));
        this.search(currentSearchSignature)
      } else {
        currentSearchSignature = journeyId + '-' + stepId + '-' + timestamp + '-' + listId
        console.log('signature has not changed')
      }
    }
  }

  search(currentSearchSignature: string) {
    if (currentSearchSignature && (!this.searchSignature || currentSearchSignature != this.searchSignature)) {
      this.searchSignature = currentSearchSignature
      console.log(currentSearchSignature, this.searchSignature)
      this.doSearch();
    }
  }

  doSearch() {
    console.log('do search!!!!')
    const grid = this.shadowRoot!.getElementById('grid') as Grid;
    this.page = 0;
    if (grid) {
      grid.clearCache();
    } else {
      console.log('grid no existe')
    }
    //this.searchSignature = this.journeyId + '-' + this.stepId + '-' + this.timestamp + '-' + this.listId
  }

  async fetchData(params: {
    page: number;
    pageSize: number;
    filters: object;
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
    filters: object;
    sortOrders: string;
  }): Promise<any[]> {
    this.lastFilters = Base64.encode(JSON.stringify(params.filters));
    this.lastSortOrders = params.sortOrders;
    return new MateuApiClient(this.baseUrl).fetchRows(this.journeyTypeId, this.journeyId,
        this.stepId, this.listId, params.page, params.pageSize,
        params.sortOrders, params.filters)
  }

  async fetchCount(filters: object): Promise<number> {
    return new MateuApiClient(this.baseUrl).fetchCount(this.journeyTypeId, this.journeyId,
        this.stepId, this.listId, filters)
  }

  connectedCallback() {
    console.log('connected')
    super.connectedCallback();
    this.setUp()
  }

  disconnectedCallback() {
    console.log('disconnected')
    this.removeEventListener('keydown', this.handleKey)
    super.disconnectedCallback();
  }

  setUp() {
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    console.log('first updated')
    //this.search('')
    this.addEventListener('keydown', this.handleKey);
  }

  private handleKey(e: KeyboardEvent) {
    if (e.code == 'Enter') {
      setTimeout(() => this.doSearch());
    }
  }

  stateChanged(state: any) {
    //debugger;
    console.log('state changed in crud', state)
  }

  filterChanged(e:Event) {
    const input = e.currentTarget as HTMLInputElement;
    console.log('input', input)
    const obj = {};
    // @ts-ignore
    console.log('e', e)
    let newValue = null;
    // @ts-ignore
    if (e.detail && e.detail.value) {
      // @ts-ignore
      newValue = e.detail.value;
    } else {
      newValue = input.value;
    }
    // @ts-ignore
    obj[input.id] = newValue || null;
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
                                      width="${c.width}" data-testid="column-${c.id}"
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
        <vaadin-grid-column  path="${c.id}" data-testid="column-${c.id}" header="${c.caption}" width="60px"
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
                                         data-testid="menubar-${c.id}"
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
                                     data-testid="column-${c.id}"
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
    console.log('page changed to ' + this.page)
    grid.clearCache();
  }

  render() {
    // @ts-ignore
    // @ts-ignore
    return html`

      <vaadin-horizontal-layout class="header">
        <div>
          <h3>${this.metadata.title}</h3>
          <p>${this.metadata.subtitle}</p>
        </div>
        <vaadin-horizontal-layout style="justify-content: end; flex-grow: 1; align-items: center;" theme="spacing">
          ${this.metadata.actions.map(a => html`
            <vaadin-button theme="secondary" @click=${this.runAction}
                           data-testid="action-${a.id}"
                           actionId=${a.id}>${a.caption}</vaadin-button>
          `)}
        </vaadin-horizontal-layout>
      </vaadin-horizontal-layout>
      <vaadin-horizontal-layout style="align-items: baseline;" theme="spacing">
        ${this.metadata?.searchForm.fields.slice(0,1).map(f => html`
          <vaadin-text-field id="${f.id}" data-testid="filter-${f.id}" label="${f.caption}" @change=${this.filterChanged}
                             placeholder="${f.placeholder}"
                             style="flex-grow: 1;"></vaadin-text-field>
        `)}
        <vaadin-button theme="primary" @click="${this.doSearch}" data-testid="search">Search</vaadin-button>
      </vaadin-horizontal-layout>

      <vaadin-horizontal-layout style="align-items: baseline;" theme="spacing">
        ${this.metadata?.searchForm.fields.slice(1).map(f => mapField(f, this.filterChanged, this.baseUrl))}
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
                  (row) => html`<vaadin-button theme="tertiary-inline" .row="${row}" @click="${this.edit}" data-testid="edit-${this.getRowId(row)}">Edit</vaadin-button>`,
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
                            data-testid="pagination"
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
              data-testid="export-menu"
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
      <vaadin-button theme="primary error" @click="${this.runConfirmedAction}" style="margin-right: auto;" data-testid="dialog-confirm">
        ${this.confirmationTexts?.action}
      </vaadin-button>
      <vaadin-button theme="tertiary" @click="${this.closeConfirmation}" data-testid="dialog-cancel">Cancel</vaadin-button>
    `,
              []
          )}
      ></vaadin-dialog>
    `
  }

  getRowId(row: unknown): unknown {
        // @ts-ignore
    return row.id;
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
