// @todo https://docs.cypress.io/api/cypress-api/custom-commands.html#2-Don%E2%80%99t-overcomplicate-things ?

// @todo Get the ID pattern from const.
export const BUTTON_1_SELECTOR = '#scroll-to-top-button-1';
const BUTTON_2_SELECTOR = '#scroll-to-top-button-2';

/**
 * Return the Scroll To Top Button's container element.
 *
 * @return {Cypress.Chainable<JQuery<HTMLElement>>}
 */

export function getButtonContainerElement() {
  // @todo Get the tag name from const.
  return cy.shadowGet( 'scroll-to-top-button-container' );
}

/**
 * Return the Scroll To Top Button element.
 *
 * @return {Cypress.Chainable<JQuery<HTMLElement>>}
 */

export function getButton1Element() {
  return getButtonContainerElement()
    .shadowFind( BUTTON_1_SELECTOR )
    .shadowFirst();
}

/**
 * Return the Scroll To Top Button's second button element.
 *
 * @return {Cypress.Chainable<JQuery<HTMLElement>>}
 */

export function getButton2Element() {
  return getButtonContainerElement()
    .shadowFind( BUTTON_2_SELECTOR )
    .shadowFirst();
}
