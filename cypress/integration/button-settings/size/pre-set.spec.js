import * as buttonSettings from '../../../shared/button-settings';
import * as testPages from '../../../shared/test-pages';
import * as elements from '../../../shared/elements';

context( 'Button settings -> Size -> Pre-set values', runTests );

/**
 * Define & execute the tests.
 */

function runTests() {
  const buttonSizes = [
    '50px',
    '45px',
    '40px',
    '35px',
  ];

  for ( const buttonSize of buttonSizes ) {
    it( `Button size is ${ buttonSize } by ${ buttonSize }`, checkSize.bind( null, buttonSize ) );
  }
}

/**
 * Prepare the button by setting its settings and making it appear on the page, then make sure its size (width and height) matches the specified one.
 *
 * @param {string} buttonSize - {@see Settings.buttonSize}
 */

function checkSize( buttonSize ) {
  buttonSettings.updateButtonSettings( {
    buttonSize,
    buttonWidthCustom: 60,
    buttonHeightCustom: 60,
  } );

  testPages.openTestPage();
  testPages.forceButtonInjection();

  elements.getButton1Element()
    .should( assertButtonSize.bind( null, buttonSize ) );
}

/**
 * Make sure the button size matches the size set in the settings.
 *
 * @param {string} buttonSize - {@see Settings.buttonSize}
 * @param {Cypress.Chainable<JQuery<HTMLElement>>} $button1
 */

function assertButtonSize( buttonSize, $button1 ) {
  expect( $button1 ).to.have.css( 'width', buttonSize );
  expect( $button1 ).to.have.css( 'height', buttonSize );
}
