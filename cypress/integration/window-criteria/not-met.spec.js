import * as windows from '../../shared/windows';
import * as elements from '../../shared/elements';

context( 'Window criteria not met', runTests );

/**
 * Define & execute the tests.
 */

function runTests() {
  it( 'Elements do not exist on short pages', checkElementsDoNotExist );
}

/**
 * Make sure the Scroll To Top Button's elements do not exist on the page when the page is not scrollable.
 */

function checkElementsDoNotExist() {
  // @todo Pick the safest site to load in terms of speed, security, & not to DoS it.
  cy.visit( 'https://example.com/' );

  // Make sure the page is not scrollable.
  // @todo Account for distanceLength.
  cy.document()
    .its( 'documentElement.scrollHeight' )
    .should( 'lte', windows.DEFAULT_VIEWPORT_HEIGHT );

  // Checking just for the container should suffice, as the buttons don't exist without it
  elements.getButtonContainerElement()
    .should( 'not.exist' );
}
