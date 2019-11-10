import * as elements from '../../../shared/elements';

import { checkElementsExist } from '../../window-criteria/met.spec';

const ANIMATION_DURATION = 500;

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
  elements.expectToNotExist( elements.getButton2Element() );
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

  elements.getButton1Element().shadowClick();

  cy.document()
    .its( 'documentElement.scrollTop' )
    .should( 'eq', 0 );

  elements.expectToNotBeVisible( elements.getButton1Element() );
  cy.wait( ANIMATION_DURATION );
  // @todo Use > distanceLength
  cy.scrollTo( 'center' );
  cy.wait( ANIMATION_DURATION );
  elements.expectToBeVisible( elements.getButton1Element() );
  elements.getButton1Element().shadowClick();

  cy.document()
    .its( 'documentElement.scrollTop' )
    .should( 'eq', 0 );

  elements.expectToNotBeVisible( elements.getButton1Element() );
}
