import * as buttonSettings from '../../../shared/button-settings';
import * as testPages from '../../../shared/test-pages';
import * as elements from '../../../shared/elements';

/**
 * @type {string[]} {@see Settings.buttonSize}
 */

const buttonSizes = [
  '50px',
  '45px',
  '40px',
  '35px',
];

const BUTTON_WIDTH_CUSTOM = 60;
const BUTTON_HEIGHT_CUSTOM = 60;
const buttonWidthCustomPx = `${ BUTTON_WIDTH_CUSTOM }px`;
const buttonHeightCustomPx = `${ BUTTON_HEIGHT_CUSTOM }px`;

context( 'Button settings -> Size -> Pre-set values', runTests );

/**
 * Define & execute the tests.
 */

function runTests() {
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
    buttonWidthCustom: BUTTON_WIDTH_CUSTOM,
    buttonHeightCustom: BUTTON_HEIGHT_CUSTOM,
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

  expect( $button1 ).to.not.have.css( 'width', buttonWidthCustomPx );
  expect( $button1 ).to.not.have.css( 'height', buttonHeightCustomPx );
}
