import utils from 'Shared/utils';
import * as sharedElements from 'Shared/elements';

import buttonSettings from './settings';
import * as modes from './settings/modes';

export let container = null;
export let containerShadow = null;
export let button1 = null;
export let button2 = null;
export let $button1 = null;
export let $button2 = null;
let buttonsCount = 0;

export const CONTAINER_ATTRIBUTE_STATE_ACTIVE = 'data-state-active';

const BUTTON_NUMBER_PLACEHOLDER = '$NUMBER$';
const BUTTON_ID = `${ sharedElements.BUTTON_TAG_NAME }-${ BUTTON_NUMBER_PLACEHOLDER }`;
const INFINITE_SCROLL_DOWN_RECHECK_DELAY_ACTIVE_INDICATOR_ATTRIBUTE = 'data-infinite';
const BUTTON_LABEL = 'Scroll To Top Button';
export const BUTTON_ATTRIBUTE_STATE_DISABLED = 'data-state-disabled';
export const BUTTON_HOVERED_SELECTOR = ':hover';

export let scrollableElement = null;
export let scrollCausingElement = null;

/**
 * Create button(s) with the specified settings (user preferences) and add it to the page.
 */

export function createElements() {
  sharedElements.setUp();
  createContainer( buttonSettings.buttonLocation );
  createButton1();

  if ( modes.isDualArrowsMode() ) {
    createButton2();
  }

  createButtonsStyles();
  createDisabledJavascriptBandage();
  injectElementsIntoPage();
}

/**
 * For easier styling, wrap the button(s) with a container.
 *
 * @param {string} buttonLocation - Position of the button on the page.
 */

function createContainer( buttonLocation ) {
  const position = getPosition( buttonLocation );

  container = document.createElement( sharedElements.CONTAINER_TAG_NAME );

  container.setAttribute( 'data-position-vertical', position.vertical );
  container.setAttribute( 'data-position-horizontal', position.horizontal );

  if ( utils.canUseShadowDom() ) {
    try {
      // Avoid CSS collisions when websites define styles for [role="button"] or even <scroll-to-top-button>
      containerShadow = container.attachShadow( {
        mode: 'open',
      } );
    }
    catch ( error ) {
      // @todo Shouldn't be a case?
    }
  }
  else {
    containerShadow = container;
  }
}

/**
 * Create button 1 element, cache it for reuse, and it add to the page.
 *
 * @todo DRY.
 */

function createButton1() {
  button1 = createButton();
  $button1 = $( button1 );

  containerShadow.append( button1 );
}

/**
 * Create button 2 element, cache it for reuse, and it add to the page.
 *
 * @todo DRY.
 */

function createButton2() {
  button2 = createButton();
  $button2 = $( button2 );

  containerShadow.append( button2 );
}

/**
 * Create a button with the specified settings (user preferences).
 *
 * @returns {HTMLElement}
 */

function createButton() {
  // @todo Investigate why lowercase doesn't work.
  const button = document.createElement( sharedElements.BUTTON_TAG_NAME.toUpperCase() );

  buttonsCount++;
  button.id = BUTTON_ID.replace( BUTTON_NUMBER_PLACEHOLDER, buttonsCount );
  button.setAttribute( 'data-mode', buttonSettings.buttonMode );
  button.setAttribute( 'data-design', buttonSettings.buttonDesign );
  button.setAttribute( 'data-size', buttonSettings.buttonSize );
  button.setAttribute( 'data-width', buttonSettings.buttonWidthCustom );
  button.setAttribute( 'data-height', buttonSettings.buttonHeightCustom );
  button.setAttribute( 'data-opacity', buttonSettings.notActiveButtonOpacity );
  button.setAttribute( 'aria-label', BUTTON_LABEL );

  return button;
}

/**
 * Some websites, such as Twitter, Instagram, Facebook, and Quora, keep loading more content as user scrolls down.
 * Show/hide a recheck delay active indicator when the extension is checking for infinite scrolling.
 *
 * @param {boolean} toBeShown
 **/

export function toggleInfiniteScrollDownRecheckDelayActiveIndicator( toBeShown ) {
  if ( toBeShown && ! isInfiniteScrollDownRecheckDelayActiveIndicatorEnabled() ) {
    return;
  }

  button1?.toggleAttribute( INFINITE_SCROLL_DOWN_RECHECK_DELAY_ACTIVE_INDICATOR_ATTRIBUTE, toBeShown );
  button2?.toggleAttribute( INFINITE_SCROLL_DOWN_RECHECK_DELAY_ACTIVE_INDICATOR_ATTRIBUTE, toBeShown );
}

/**
 * Some websites, such as Twitter, Instagram, Facebook, and Quora, keep loading more content as user scrolls down.
 * Check whether the extension is set to show a recheck delay active indicator.
 *
 * @returns {boolean}
 **/

export function isInfiniteScrollDownRecheckDelayActiveIndicatorEnabled() {
  return buttonSettings.infiniteScrollDownRecheckDelayActiveIndicator === 'on';
}

/**
 * Some websites, such as Twitter, Instagram, Facebook, and Quora, keep loading more content as user scrolls down.
 * Check whether the extension is showing a recheck delay active indicator.
 *
 * @returns {boolean}
 **/

export function isInfiniteScrollDownRecheckDelayActiveIndicatorShown() {
  return button1?.hasAttribute( INFINITE_SCROLL_DOWN_RECHECK_DELAY_ACTIVE_INDICATOR_ATTRIBUTE );
}

/**
 * As the buttons are a part of the Shadow DOM, their CSS is scoped and need to be loaded separately.
 */

function createButtonsStyles() {
  const link = document.createElement( 'LINK' );

  link.rel = 'stylesheet';
  link.href = utils.getUrl( 'shared/elements/scroll-to-top-button.css' );

  containerShadow.append( link );
}

/**
 * When JavaScript is disabled, the extensions still work.
 * One user requested to make the button not show up in such case.
 */

function createDisabledJavascriptBandage() {
  const html = `
    <noscript>
      <style>
        ${ sharedElements.CONTAINER_TAG_NAME } { display: none !important; }
      </style>
    </noscript>
  `;

  // .append and .innerHTML don't work as expected in Chrome v49
  container.insertAdjacentHTML( 'beforeend', html );
}

/**
 * Add the extension elements to the page.
 */

function injectElementsIntoPage() {
  /**
   * No page elements should be placed outside the body, but some browser extensions employ this technique to make sure their elements, such as the Scroll To Top Button's buttons, are always on top of other elements and to make sure those elements don't get (un)intentionally removed by the page's scripts (for example, there was an issue on Bing: its JavaScript was removing one of the buttons).
   *
   * @type {InsertPosition}
   */

  let position = 'afterend';

  /**
   * These websites' scripts don't work correctly in some instances because of the way the extension elements are injected into a page.
   *
   * @see {@link https://github.com/PoziWorld/Scroll-To-Top-Button-extension/issues/6}
   *
   * @type {Location.hostname[]}
   */

  const EXCLUDED_HOSTNAMES = [
    'www.lesswrong.com',
  ];

  if ( EXCLUDED_HOSTNAMES.includes( window.location.hostname ) ) {
    position = 'beforeend';
  }

  document.body.insertAdjacentElement( position, container );
}

/**
 * Get scrollable element as instance of jQuery if provided on init or use window object otherwise.
 *
 * @returns {jQuery}
 */

export function getScrollableElement() {
  return scrollableElement ?
    scrollableElement :
    document;
}

/**
 * Get animatable element if provided on init or use 'html, body' otherwise.
 *
 * @returns {jQuery}
 **/

export function getAnimatableElement() {
  return $( scrollableElement ?
    scrollableElement :
    'html, body' );
}

/**
 * If there is a scrollable element other than the whole document, set it.
 *
 * @param {HTMLElement|Element} [element] - When not the whole page is scrollable, only some element.
 */

export function setScrollableElement( element ) {
  scrollableElement = element;
}

/**
 * If there is a scroll-causing (higher than viewport) element, set it.
 *
 * @param {HTMLElement|Element} [element]
 */

export function setScrollCausingElement( element ) {
  scrollCausingElement = element;
}

/**
 * Return the height of the scroll-causing (higher than viewport) element, if any, or document.
 *
 * @returns {number}
 */

export function getScrollCausingElementHeight() {
  return $(
    scrollCausingElement ?
      scrollCausingElement :
      document
    ).height();
}

/**
 * Get vertical scroll position.
 *
 * @returns {number}
 */

export function getScrollTop() {
  return scrollableElement ?
    scrollableElement.scrollTop :
    window.scrollY;
}

/**
 * “Decipher” the two-letter button position abbreviation.
 *
 * @param {string} buttonLocation - Position of the button on the page.
 * @returns {{horizontal: string, vertical: string}}
 */

function getPosition( buttonLocation ) {
  return {
    vertical: getPositionVertical( buttonLocation[ 0 ] ),
    horizontal: getPositionHorizontal( buttonLocation[ 1 ] ),
  };
}

/**
 * “Decipher” the button vertical position from the two-letter button position abbreviation.
 *
 * @param {string} positionIndicator - The first letter of the two-letter button position abbreviation.
 * @returns {string}
 */

function getPositionVertical( positionIndicator ) {
  switch ( positionIndicator ) {
    case 'T':
      return 'top';
    case 'B':
      return 'bottom';
    default:
      return 'center';
  }
}

/**
 * “Decipher” the button horizontal position from the two-letter button position abbreviation.
 *
 * @param {string} positionIndicator - The second letter of the two-letter button position abbreviation.
 * @returns {string}
 */

function getPositionHorizontal( positionIndicator ) {
  switch ( positionIndicator ) {
    case 'L':
      return 'left';
    case 'C':
      return 'center';
    default:
      return 'right';
  }
}
