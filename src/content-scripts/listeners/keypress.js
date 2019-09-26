import buttonSettings from '../button/settings';
import * as modes from '../button/settings/modes';
import * as elements from '../button/elements';
import * as visualProperties from '../button/visual-properties';
import * as utils from './utils';

const KEYPRESS_THROTTLE_DELAY = 150;
const CLICKTHROUGH_KEYS_DIVIDER = '|';

/**
 * Monitor key presses for presses of “clickthrough keys”.
 * Listen on window, as STTB is inserted after <body />.
 */

export function addKeypressListener() {
  const throttledKeydownHandler = utils.throttle( handleKeydown, KEYPRESS_THROTTLE_DELAY );
  const throttledKeyupHandler = utils.throttle( handleKeyup, KEYPRESS_THROTTLE_DELAY );

  window.addEventListener( 'keydown', throttledKeydownHandler );
  window.addEventListener( 'keyup', throttledKeyupHandler );
}

/**
 * Process the “keydown” event.
 *
 * @param {KeyboardEvent} event - The event.
 */

function handleKeydown( event ) {
  if ( ! isClickthroughKeyPressed( event ) ) {
    return;
  }

  handleClickthroughKeydown();
}

/**
 * Process the “keyup” event.
 *
 * @param {KeyboardEvent} event - The event.
 */

function handleKeyup( event ) {
  // @todo Handle a case when both, Ctrl and Shift, get keyed-up within KEYPRESS_THROTTLE_DELAY: only the first one gets picked-up and the second one gets ignored.
  if ( isClickthroughKeyPressed( event ) ) {
    return;
  }

  handleClickthroughKeyup();
}

/**
 * If a “clickthrough key” is pressed, hide the button.
 */

function handleClickthroughKeydown() {
  handleClickthroughKeyEvent( true );
}

/**
 * If a “clickthrough key” is unpressed, show the button.
 *
 * @todo Account for a case when “keyup” happens outside of the window.
 */

function handleClickthroughKeyup() {
  handleClickthroughKeyEvent( false );
}

/**
 * If a “clickthrough key” is pressed or unpressed, hide or show (correspondingly) the button.
 *
 * @param {boolean} pressed - Whether this is “keydown” (pressed) or “keyup” (unpressed) event.
 */

function handleClickthroughKeyEvent( pressed ) {
  const buttons = [
    elements.button1,
  ];

  if ( modes.isDualArrowsMode() ) {
    buttons.push( elements.button2 );
  }

  while ( buttons.length ) {
    const buttonTemp = buttons.shift();

    if ( buttonTemp ) {
      if ( pressed ) {
        if ( visualProperties.isButtonHovered( buttonTemp ) ) {
          visualProperties.toggleButton( $( buttonTemp ), false );

          // Only one button can be hovered at a time, no need to loop further
          break;
        }
      }
      else {
        if ( ! visualProperties.isButtonHovered( buttonTemp ) ) {
          visualProperties.toggleButton( $( buttonTemp ), true );
        }
      }
    }
  }
}

/**
 * Check whether one of the “clickthrough keys” is pressed when hovering over or clicking the button.
 *
 * @param {KeyboardEvent|MouseEvent} event - The event.
 * @returns {boolean}
 */

export function isClickthroughKeyPressed( event ) {
  const option = buttonSettings.clickthroughKeys;

  if ( poziworldExtension.utils.isNonEmptyString( option ) ) {
    const keys = option.split( CLICKTHROUGH_KEYS_DIVIDER );

    while ( keys.length ) {
      const key = keys.shift();

      if ( poziworldExtension.utils.isNonEmptyString( key ) && event[ `${ key }Key` ] ) {
        return true;
      }
    }
  }

  return false;
}
