context( 'Custom elements', runTests );

/**
 * Define & execute the tests.
 */

function runTests() {
  beforeEach( definePrerequisites );

  // @todo Check doesn't exist on short sites.
  it( 'Container exists', checkContainerExists );
  it( 'Button exists', checkButtonExists );
}

/**
 * Define what is required to run before each test.
 */

function definePrerequisites() {
  // @todo Pick the safest site to load in terms of speed, security, & not to DoS it.
  cy.visit( 'https://developers.cloudflare.com/sponsorships/' );

  cy.scrollTo( 'bottom' );
}

/**
 * Check whether the Scroll To Top Button's container element exists.
 */

function checkContainerExists() {
  // @todo Get from const.
  cy.get( 'scroll-to-top-button-container' )
    .should( 'exist' );
}

/**
 * Check whether the Scroll To Top Button element exists.
 */

function checkButtonExists() {
  // @todo Get from const.
  cy.get( 'scroll-to-top-button' )
    .should( 'exist' );
}
