import { getUrl } from 'Shared/utils';
// @todo Avoid name collision with window.customElements.
import * as customElements from 'Shared/custom-elements';

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
const BUTTON_ID = `${ customElements.BUTTON_TAG_NAME }-${ BUTTON_NUMBER_PLACEHOLDER }`;
const BUTTON_LABEL = 'Scroll To Top Button';
export const BUTTON_ATTRIBUTE_STATE_DISABLED = 'data-state-disabled';
export const BUTTON_HOVERED_SELECTOR = ':hover';

export let scrollableElement = null;
export let scrollCausingElement = null;

/**
 * Create button(s) with the specified settings (user preferences) and add it to the page.
 */

export function createElements() {
  customElements.setUp();
  createContainer( buttonSettings.buttonLocation );
  createButton1();

  if ( modes.isDualArrowsMode() ) {
    createButton2();
  }

  createButtonsStyles();
  createDisabledJavascriptBandage();

  document.body.insertAdjacentElement( 'afterend', container );
}

/**
 * For easier styling, wrap the button(s) with a container.
 *
 * @param {string} buttonLocation - Position of the button on the page.
 */

function createContainer( buttonLocation ) {
  const position = getPosition( buttonLocation );

  container = document.createElement( customElements.CONTAINER_TAG_NAME );

  container.setAttribute( 'data-position-vertical', position.vertical );
  container.setAttribute( 'data-position-horizontal', position.horizontal );

  // Avoid CSS collisions when websites define styles for [role="button"] or even <scroll-to-top-button>
  containerShadow = container.attachShadow( {
    mode: 'open',
  } );
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
  const button = document.createElement( customElements.BUTTON_TAG_NAME.toUpperCase() );

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
 * As the buttons are a part of the Shadow DOM, their CSS is scoped and need to be loaded separately.
 */

function createButtonsStyles() {
  const link = document.createElement( 'LINK' );

  link.rel = 'stylesheet';
  link.href = getUrl( 'shared/custom-elements/scroll-to-top-button.css' );

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
        ${ customElements.CONTAINER_TAG_NAME } { display: none !important; }
      </style>
    </noscript>
  `;

  // .append and .innerHTML don't work as expected in Chrome v49
  container.insertAdjacentHTML( 'beforeend', html );
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
