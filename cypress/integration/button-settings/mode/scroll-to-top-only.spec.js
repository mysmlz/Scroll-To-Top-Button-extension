import * as elements from '../../../shared/elements';

import { checkElementsExist } from '../../window-criteria/met.spec';

context( 'Button settings -> Mode -> Scroll to top only', runTests );

/**
 * Define & execute the tests.
 */

function runTests() {
  it( 'Only one button exists', checkOnlyOneButtonExists );
  it( 'Scrolls to top only', checkScrollsToTop );
}

/**
 * Make sure only one button exists in the “scroll to top only” mode.
 */

function checkOnlyOneButtonExists() {
  // @todo Replace with a custom command? https://docs.cypress.io/api/cypress-api/custom-commands.html
  checkElementsExist();

  elements.getButton2Element()
    .should( 'not.exist' );
}

/**
 * Make sure:
 * 1. When the page is scrolled past distanceLength, the button appears.
 * 2. When the button is clicked, the page is scrolled to the top and the button disappears.
 */

function checkScrollsToTop() {
  // Make sure the page had been scrolled down, so we can compare later
  cy.document()
    .its( 'documentElement.scrollTop' )
    .should( 'gt', 0 );

  elements.getButton1Element().click();

  cy.document()
    .its( 'documentElement.scrollTop' )
    .should( 'eq', 0 );

  elements.getButton1Element()
    .should( 'not.be.visible' );

  // Account for jQuery animation
  cy.wait( 500 );

  // @todo Use > distanceLength
  cy.scrollTo( 'center' );

  // Account for jQuery animation
  cy.wait( 500 );

  elements.getButton1Element()
    .should( 'be.visible' );

  elements.getButton1Element().click();

  cy.document()
    .its( 'documentElement.scrollTop' )
    .should( 'eq', 0 );

  elements.getButton1Element()
    .should( 'not.be.visible' );
}
