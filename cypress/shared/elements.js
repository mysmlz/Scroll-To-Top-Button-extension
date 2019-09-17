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

export function getButtonElement() {
  // @todo Get the tag name from const.
  return cy.get( 'scroll-to-top-button' );
}
