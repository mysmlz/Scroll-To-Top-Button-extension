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
  return cy.get( 'scroll-to-top-button-container' );
}

/**
 * Return the Scroll To Top Button element.
 *
 * @return {Cypress.Chainable<JQuery<HTMLElement>>}
 */

export function getButton1Element() {
  return getButtonContainerElement()
    .shadowFind( BUTTON_1_SELECTOR );
}

/**
 * Return the Scroll To Top Button's second button element.
 *
 * @return {Cypress.Chainable<JQuery<HTMLElement>>}
 */

export function getButton2Element() {
  return getButtonContainerElement()
    .shadowFind( BUTTON_2_SELECTOR );
}

/**
 * Method of making sure an element is visible that works for DOM and Shadow DOM elements.
 * element.should( 'be.visible' ) doesn't work for Shadow DOM elements.
 *
 * @param {Cypress.Chainable<JQuery<HTMLElement>>} element
 */

export function expectToBeVisible( element ) {
  element.then( ( nodeList ) => assertElementVisibility( nodeList, true ) );
}

/**
 * Method of making sure an element is not visible that works for DOM and Shadow DOM elements.
 * element.should( 'not.be.visible' ) doesn't work for Shadow DOM elements.
 *
 * @param {Cypress.Chainable<JQuery<HTMLElement>>} element
 */

export function expectToNotBeVisible( element ) {
  element.then( ( nodeList ) => assertElementVisibility( nodeList, false ) );
}

/**
 * Make sure element visibility matches the expected state (visible or not visible).
 *
 * @param {NodeList} nodeList
 * @param {boolean} expectedToBeVisible
 */

function assertElementVisibility( nodeList, expectedToBeVisible ) {
  // https://davidwalsh.name/offsetheight-visibility
  const elementOffsetHeight = nodeList[ 0 ].offsetHeight;
  const NOT_VISIBLE_OFFSET_HEIGHT = 0;

  if ( expectedToBeVisible ) {
    expect( elementOffsetHeight ).to.be.greaterThan( NOT_VISIBLE_OFFSET_HEIGHT );
  }
  else {
    expect( elementOffsetHeight ).to.equal( NOT_VISIBLE_OFFSET_HEIGHT );
  }
}

/**
 * Method of making sure an element exists that works for DOM and Shadow DOM elements.
 * element.should( 'exist' ) doesn't work for Shadow DOM elements.
 *
 * @param {Cypress.Chainable<JQuery<HTMLElement>>} element
 */

export function expectToExist( element ) {
  const ELEMENTS_COUNT = 1;

  return assertElementsCount( element, ELEMENTS_COUNT );
}

/**
 * Method of making sure an element does not exist that works for DOM and Shadow DOM elements.
 * element.should( 'not.exist' ) doesn't work for Shadow DOM elements.
 *
 * @param {Cypress.Chainable<JQuery<HTMLElement>>} element
 */

export function expectToNotExist( element ) {
  const ELEMENTS_COUNT = 0;

  return assertElementsCount( element, ELEMENTS_COUNT );
}

/**
 * Make sure element existence matches the expected state (exists or doesn't exist).
 *
 * @param {Cypress.Chainable<JQuery<HTMLElement>>} element
 * @param {number} elementsCount
 */

function assertElementsCount( element, elementsCount ) {
  return element
    .its( 'length' )
    .should( 'eq', elementsCount );
}
