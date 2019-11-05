import * as windows from '../../../shared/windows';
import * as buttonSettings from '../../../shared/button-settings';
import * as elements from '../../../shared/elements';
import * as testPages from '../../../shared/test-pages';

// URL browser stays on when clicking without Ctrl pressed
const PAGE_URL = 'https://developers.cloudflare.com/docs/';
// URL browser navigates to when clicking with Ctrl pressed
const FINAL_PAGE_URL = 'https://developers.cloudflare.com/1.1.1.1/';

/**
 * @type {number} Settings.scrollUpSpeed
 */

const SCROLLING_DURATION = 1000;

// Cache Cypress equivalent of window
let _window;
// Cache Cypress equivalent of window.document
let _document;

let buttonHeight;
let finalPageLinkScrollTop;

let buttonPositionTop;
let buttonPositionLeft;

// Attributes that distinguish the test elements
const BUTTON_ATTRIBUTE = 'data-design';
const FINAL_PAGE_LINK_SELECTOR = '.hero-button[href^="/1.1.1.1"]';
const FINAL_PAGE_LINK_ATTRIBUTE = 'href';

context( 'Button settings -> Clickthrough keys -> Ctrl', runTests );

/**
 * Define & execute the tests.
 */

function runTests() {
  beforeEach( applyTestSpecificSettings );

  it( 'Button hides on hover when Ctrl is pressed (able to click through)', checkCtrlHidesButton );
}

/**
 * Set appropriate settings for the test.
 */

function applyTestSpecificSettings() {
  buttonSettings.updateButtonSettings( {
    buttonLocation: 'CR',
    clickthroughKeys: 'ctrl',
  } );
}

/**
 * Make sure the Scroll To Top Button's button (the button) is not shown on hover when Ctrl is pressed and click happens on the element that was previously (hidden) behind/underneath the button.
 */

function checkCtrlHidesButton() {
  preparePage()
    .then( getWindowObject )
    .then( cacheWindowDocument )
    .then( testPages.forceButtonInjection )
    // @todo Use fadeIn duration.
    .then( waitForScrollEnd )
    .then( elements.getButton1Element )
    .then( saveButtonHeight )
    .then( saveButtonPosition )
    .then( simulateMousemove )
    .then( getFinalPageLinkElement )
    .then( saveFinalPageLinkScrollTop )
    // When Ctrl is not pressed, make sure click happens on button, not final page link (element behind/underneath button)
    .then( scrollToFinalPageLink )
    .then( waitForScrollEnd )
    .then( simulateClick.bind( null, BUTTON_ATTRIBUTE ) )
    .then( waitForScrollEnd )
    .then( assertUrl.bind( null, PAGE_URL ) )
    // When Ctrl is not pressed again, make sure click happens on button again (make sure first time wasn't a coincidence), not final page link (element behind/underneath button)
    .then( scrollToFinalPageLink )
    .then( waitForScrollEnd )
    .then( simulateClick.bind( null, BUTTON_ATTRIBUTE ) )
    .then( waitForScrollEnd )
    .then( assertUrl.bind( null, PAGE_URL ) )
    // When Ctrl is pressed, make sure click happens on final page link (previously, element behind/underneath button), not button
    .then( scrollToFinalPageLink )
    .then( waitForScrollEnd )
    .then( simulateKeydown )
    .then( waitForScrollEnd )
    .then( simulateClick.bind( null, FINAL_PAGE_LINK_ATTRIBUTE ) )
    .then( assertUrl.bind( null, FINAL_PAGE_URL ) );
}

/**
 * Set a viewport size, where there is a clickable element behind/underneath the button (the button overlaps a clickable element) on the test page.
 *
 * @returns {Cypress.Chainable<Window>}
 */

function preparePage() {
  const VIEWPORT_WIDTH = 517;

  return cy.viewport( VIEWPORT_WIDTH, windows.DEFAULT_VIEWPORT_HEIGHT )
    .visit( PAGE_URL );
}

/**
 * Get window object asynchronously.
 */

function getWindowObject() {
  cy.window();
}

/**
 * Cache window object and window.document for reuse.
 *
 * @param {Cypress.Chainable<Document>} win
 */

function cacheWindowDocument( win ) {
  _window = win;
  _document = win.document;
}

/**
 * By default, the extension has a scroll animation on the button click. Wait for the animation to complete.
 */

function waitForScrollEnd() {
  cy.wait( SCROLLING_DURATION );
}

/**
 * Cache the button height for reuse.
 *
 * @param {Cypress.Chainable<JQuery<HTMLElement>>} $button
 * @returns {Cypress.Chainable<JQuery<HTMLElement>>}
 */

function saveButtonHeight( $button ) {
  buttonHeight = $button.height();

  return $button;
}

/**
 * Cache the button position on the page (top and left coordinates) for reuse.
 *
 * @param {Cypress.Chainable<JQuery<HTMLElement>>} $button
 */

function saveButtonPosition( $button ) {
  buttonPositionTop = $button.position().top;
  buttonPositionLeft = $button.position().left;

  // @todo DRY.
  const TOP_KEY = 'top';
  const TOP_VALUE = 305;
  const LEFT_KEY = 'left';
  const LEFT_VALUE = 430;

  cy.wrap( { [ TOP_KEY ]: TOP_VALUE } )
    .its( TOP_KEY )
    .should( 'eq', buttonPositionTop );

  cy.wrap( { [ LEFT_KEY ]: LEFT_VALUE } )
    .its( LEFT_KEY )
    .should( 'eq', buttonPositionLeft );
}

/**
 * Simulate a “mousemove” event, which makes the extension remember the cursor position, which is checked on a clickthrough key press.
 */

function simulateMousemove() {
  const MOUSEMOVE_DELAY = 500;

  // @todo Figure out why https://docs.cypress.io/api/commands/trigger.html#Specify-the-exact-clientX-and-clientY-the-event-should-have doesn't pass clientX, clientY.
  const mousemoveEvent = new MouseEvent( 'mousemove', {
    clientX: buttonPositionLeft,
    clientY: buttonPositionTop,
  } );

  _document.dispatchEvent( mousemoveEvent );

  cy.wait( MOUSEMOVE_DELAY );
}

/**
 * Get the element behind/underneath the button.
 *
 * @returns {Cypress.Chainable<Subject>}
 */

function getFinalPageLinkElement() {
  return cy.get( FINAL_PAGE_LINK_SELECTOR )
    .should( 'exist' );
}

/**
 * Remember the offset of the element behind/underneath the button, so it can be scrolled to.
 *
 * @param {Cypress.Chainable<JQuery<HTMLElement>>} $element
 */

function saveFinalPageLinkScrollTop( $element ) {
  const elementOffsetTop = $element.offset().top;

  // @todo DRY.
  const TOP_KEY = 'top';
  const TOP_VALUE = 986.5;

  cy.wrap( { [ TOP_KEY ]: TOP_VALUE } )
    .its( TOP_KEY )
    .should( 'eq', elementOffsetTop );

  finalPageLinkScrollTop = elementOffsetTop - windows.DEFAULT_VIEWPORT_HEIGHT / 2 + buttonHeight / 2;
}

/**
 * Scroll to where the clickable/actionable target element behind/underneath the button is located.
 * This is the position where the main test is going to happen.
 */

function scrollToFinalPageLink() {
  cy.scrollTo( 0, finalPageLinkScrollTop );
}

/**
 * Click at the point where the clickable target element behind/underneath the button is.
 * This is an action before the main assertion.
 *
 * @param {string} selector
 */

function simulateClick( selector ) {
  let elementFromPoint = getElementFromButtonPosition( _document );

  if ( selector === BUTTON_ATTRIBUTE ) {
    elementFromPoint = getElementFromButtonPosition( elementFromPoint.shadowRoot );
  }

  expect( elementFromPoint.getAttribute( selector ) ).to.not.be.empty;

  elementFromPoint.click();
}

/**
 * Find which element is located on top of others at the initial button position.
 *
 * @param {HTMLDocument|ShadowRoot} element
 * @return {Element}
 */

function getElementFromButtonPosition( element ) {
  return element.elementFromPoint( buttonPositionLeft, buttonPositionTop );
}

/**
 * Press Ctrl (Control).
 * This is the main prerequisite for the main assertion.
 */

function simulateKeydown() {
  // @todo Figure out why https://docs.cypress.io/api/commands/trigger.html#Specify-the-exact-clientX-and-clientY-the-event-should-have doesn't pass ctrlKey.
  const event = new KeyboardEvent( 'keydown', {
    ctrlKey: true,
  } );

  _window.dispatchEvent( event );
}

/**
 * Assert whether the URL is the same on the button click and whether the URL is different on the element behind/underneath the button click when Ctrl is pressed.
 * This is the main assertion of the test.
 *
 * @param {string} url
 */

function assertUrl( url ) {
  cy.location( 'href' )
    .should( 'eq', url );
}
