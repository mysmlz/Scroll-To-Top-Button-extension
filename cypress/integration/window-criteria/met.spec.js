import * as windows from '../../shared/windows';
import * as elements from '../../shared/elements';
import * as testPages from '../../shared/test-pages';

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

export function checkElementsExist() {
  testPages.openTestPage();

  // Make sure the page is scrollable.
  // @todo Account for distanceLength.
  cy.document()
    .its( 'documentElement.scrollHeight' )
    .should( 'gt', windows.DEFAULT_VIEWPORT_HEIGHT );

  testPages.forceButtonInjection();

  elements.getButtonContainerElement()
    .should( 'exist' );

  elements.getButton1Element()
    .should( 'exist' );
}
