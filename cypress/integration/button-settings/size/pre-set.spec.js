import * as buttonSettings from '../../../shared/button-settings';
import * as testPages from '../../../shared/test-pages';
import * as elements from '../../../shared/elements';

/** @type {string[]} {@link Settings#buttonSize} */
const buttonSizes = [
  '50px',
  '45px',
  '40px',
  '35px',
];

/** @type {number} {@link availableSettings.buttonWidthCustomDefault} */
const BUTTON_WIDTH_CUSTOM = 60;
/** @type {number} {@link availableSettings.buttonHeightCustomDefault} */
const BUTTON_HEIGHT_CUSTOM = 60;

context( 'Button settings -> Size -> Pre-set values', runTests );

/**
 * Define & execute the tests.
 *
 * @todo Add a test to fail “5px”, for example.
 */

function runTests() {
  for ( const buttonSize of buttonSizes ) {
    it( `Button size is ${ buttonSize } by ${ buttonSize }`, checkSize.bind( null, buttonSize ) );
  }
}

/**
 * Prepare the button by setting its settings and making it appear on the page, then make sure its size (width and height) matches the specified one.
 *
 * @param {string} buttonSize - {@link Settings#buttonSize}
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
 * @param {string} buttonSize - {@link Settings#buttonSize}
 * @param {NodeList} nodeList
 */

function assertButtonSize( buttonSize, nodeList ) {
  const boundingRectangle = nodeList[ 0 ].getBoundingClientRect();
  const width = boundingRectangle.width;
  const height = boundingRectangle.height;
  const size = window.parseInt( buttonSize );

  expect( width ).to.equal( size );
  expect( height ).to.equal( size );

  expect( width ).to.not.equal( BUTTON_WIDTH_CUSTOM );
  expect( height ).to.not.equal( BUTTON_HEIGHT_CUSTOM );
}
