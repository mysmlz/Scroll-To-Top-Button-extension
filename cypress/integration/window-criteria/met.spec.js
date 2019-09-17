import * as windows from '../../shared/windows';
import * as elements from '../../shared/elements';

context( 'Window criteria met', runTests );

/**
 * Define & execute the tests.
 */

function runTests() {
  it( 'Elements exist on long pages', checkElementsExist );
}

/**
 * Make sure the Scroll To Top Button's elements exist on the page when the page is scrollable.
 */

function checkElementsExist() {
  // @todo Pick the safest site to load in terms of speed, security, & not to DoS it.
  cy.visit( 'https://developers.cloudflare.com/sponsorships/' );

  // Make sure the page is scrollable.
  // @todo Account for distanceLength.
  cy.document()
    .its( 'documentElement.scrollHeight' )
    .should( 'gt', windows.DEFAULT_VIEWPORT_HEIGHT );

  // @todo Figure out how to get elements injected on page load.
  cy.scrollTo( 'bottom' );

  elements.getButtonContainerElement()
    .should( 'exist' );

  elements.getButtonElement()
    .should( 'exist' );
}
