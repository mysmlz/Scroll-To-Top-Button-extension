// @todo https://docs.cypress.io/api/cypress-api/custom-commands.html#2-Don%E2%80%99t-overcomplicate-things ?

export const BUTTON_1_SELECTOR = '#scroll-to-top-button-1';

/**
 * Return the Scroll To Top Button's container element.
 *
 * @return {Cypress.Chainable<JQuery<HTMLElement>>}
 */

export function getButtonContainerElement() {
  // @todo Get the tag name from const.
  return cy.get( 'scroll-to-top-button-container' );
}

/**
 * Return the Scroll To Top Button element.
 *
 * @return {Cypress.Chainable<JQuery<HTMLElement>>}
 */

export function getButton1Element() {
  // @todo Get the tag name from const.
  return cy.get( BUTTON_1_SELECTOR );
}

/**
 * Return the Scroll To Top Button's second button element.
 *
 * @return {Cypress.Chainable<JQuery<HTMLElement>>}
 */

export function getButton2Element() {
  // @todo Get the tag name from const.
  return cy.get( '#scroll-to-top-button-2' );
}
