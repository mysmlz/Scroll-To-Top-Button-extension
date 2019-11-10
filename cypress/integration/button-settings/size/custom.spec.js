import * as buttonSettings from '../../../shared/button-settings';
import * as testPages from '../../../shared/test-pages';
import * as elements from '../../../shared/elements';

/** @type {string} {@link ScrollToTopButton#customSizeIndicator} */
const CUSTOM_SIZE_INDICATOR = '-1';

context( 'Button settings -> Size -> Custom values', runTests );

/**
 * Define & execute the tests.
 *
 * @todo Add tests to fail 50x50 (default), 0x500 (can't be < 1px), 1x501 (can't be >500px), for example.
 */

function runTests() {
  it( `Button size is 60px by 60px`, checkSize.bind( null, 60, 60 ) );
  it( `Button size is 1px by 500px`, checkSize.bind( null, 1, 500 ) );
  it( `Button size is 274px by 50px`, checkSize.bind( null, 274, 50 ) );
}

/**
 * Prepare the button by setting its settings and making it appear on the page, then make sure its size (width and height) matches the specified one.
 *
 * @param {string} buttonWidthCustom - {@link Settings#buttonWidthCustom}
 * @param {string} buttonHeightCustom - {@link Settings#buttonHeightCustom}
 */

function checkSize( buttonWidthCustom, buttonHeightCustom ) {
  buttonSettings.updateButtonSettings( {
    buttonSize: CUSTOM_SIZE_INDICATOR,
    buttonWidthCustom,
    buttonHeightCustom,
  } );

  testPages.openTestPage();
  testPages.forceButtonInjection();

  elements.getButton1Element()
    .should( assertButtonSize.bind( null, buttonWidthCustom, buttonHeightCustom ) );
}

/**
 * Make sure the button size matches the size set in the settings.
 *
 * @param {string} buttonWidthCustom - {@link Settings#buttonWidthCustom}
 * @param {string} buttonHeightCustom - {@link Settings#buttonHeightCustom}
 * @param {NodeList} nodeList
 */

function assertButtonSize( buttonWidthCustom, buttonHeightCustom, nodeList ) {
  const boundingRectangle = nodeList[ 0 ].getBoundingClientRect();

  expect( boundingRectangle.width ).to.equal( buttonWidthCustom );
  expect( boundingRectangle.height ).to.equal( buttonHeightCustom );
}
