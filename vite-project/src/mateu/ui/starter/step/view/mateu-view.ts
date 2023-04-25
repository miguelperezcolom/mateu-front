import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './component/mateu-component';
import './component/crud/mateu-crud';
import View from "../../../../api/dtos/View";
import Step from "../../../../api/dtos/Step";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('mateu-view')
export class MateuView extends LitElement {
  /**
   * Copy for the read the docs hint.
   */

  @property()
  baseUrl = ''

  @property()
  view!: View

  @property()
  journeyTypeId!: string

  @property()
  journeyId!: string

  @property()
  stepId!: string

  @property()
  step!: Step;

  @property()
  previousStepId!: string


  connectedCallback() {
    super.connectedCallback();
  }

    async goBack() {
        this.dispatchEvent(new CustomEvent('back-requested', {
            bubbles: true,
            composed: true,
            detail: this.previousStepId}))
    }

    render() {
    return html`
      <aside class="left">
        ${this.view?.left?.components.map(c => html`<mateu-component
            .component=${c}
            journeyTypeId="${this.journeyTypeId}"
            journeyId="${this.journeyId}"
            stepId="${this.stepId}"
            .step=${this.step}
            baseUrl="${this.baseUrl}"
            previousStepId="${this.previousStepId}"
        >
          <slot></slot></mateu-component>
        `)}
      </aside>
      <main>

          ${this.step?.previousStepId?html`
              <vaadin-button theme="tertiary" @click=${this.goBack}><vaadin-icon icon="vaadin:arrow-left"></vaadin-icon></vaadin-button>
          `:''}
        
        ${this.view?.title?html`
          <h1>${this.view?.title}</h1>
        `:''}
        ${this.view?.subtitle?html`
          <h2>${this.view?.subtitle}</h2>
        `:''}
        
          <vaadin-vertical-layout style="width: 100%" theme="spacing-xl">
        ${this.view?.main?.components.map(c => html`<mateu-component 
            .component=${c} 
            journeyTypeId="${this.journeyTypeId}" 
            journeyId="${this.journeyId}" 
            stepId="${this.stepId}"
            .step=${this.step}
            baseUrl="${this.baseUrl}"
            previousStepId="${this.previousStepId}"
        >
          <slot></slot></mateu-component>
        `)}
          </vaadin-vertical-layout>
      </main><aside class="right">
        ${this.view?.right?.components.map(c => html`<mateu-component 
            .component=${c} 
            journeyTypeId="${this.journeyTypeId}" 
            journeyId="${this.journeyId}" 
            stepId="${this.stepId}"
            .step=${this.step}
            baseUrl="${this.baseUrl}"
            previousStepId="${this.previousStepId}"
        >
          <slot></slot></mateu-component>
        `)}
      </aside>`
  }

  static styles = css`
  
    :host {
      display: flex;
    }

    aside {
      flex: 1 1 0;
      max-width: 250px;
      padding: 2rem 1rem;
    }
  
    main {
      flex: 1 1 0;
      padding: 2rem;
      width: clamp(45ch, 90%, 75ch);
    }
    
    @media (max-width: 1200px) {
      aside {
          display: none;
          transition: 0.2s linear;
      }  
    }
  
    `
}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-view': MateuView
  }
}
