import buttonSettings from './settings';
import * as modes from './settings/modes';
import * as styles from './settings/styles';
import * as elements from './elements';
import * as scrollDirections from './scroll-directions';
import { cursorPosition } from '../listeners/mousemove';

/**
 * Show/hide the button and flip it, if necessary.
 */

export function switchVisualProperties() {
  toggleButtons( isButtonHoverable() );
  flipButtonIfNecessary();
}

/**
 * If user chose the flip (between top and bottom) mode, flip the button.
 */

export function flipButtonIfNecessary() {
  if ( modes.isFlipMode() ) {
    if ( elements.getScrollTop() >= buttonSettings.flipDistanceLength ) {
      flipButton( styles.STYLE_NON_ROTATED_BUTTON_DEGREE, scrollDirections.UP );
    }
    else {
      flipButton( styles.STYLE_ROTATED_BUTTON_DEGREE, scrollDirections.DOWN );
    }
  }
}

/**
 * Flip button to show the correct direction the scrolling will go.
 *
 * @param {number} angle
 * @param {string} direction
 */

function flipButton( angle, direction ) {
  elements.$button1.rotate( {
    animateTo: angle,
  } );

  scrollDirections.setCurrentDirection( direction );
}

/**
 * Options allow user to specify “not active button opacity”, which gets changed on hover.
 * Once scrolling is finished, restore the value from the Options.
 *
 * @param {jQuery} $button
 */

export function restoreButtonOpacity( $button ) {
  let opacity;

  if ( buttonSettings.notActiveButtonOpacity === styles.STYLE_TRANSPARENT && modes.isDualArrowsMode() ) {
    opacity = styles.STYLE_SEMITRANSPARENT;
  }
  else {
    opacity = buttonSettings.notActiveButtonOpacity;
  }

  $button.fadeTo( 'medium', opacity );
}

/**
 * Show/hide the buttons when appropriate.
 *
 * @param {boolean} visible - Whether to show the buttons.
 */

export function toggleButtons( visible ) {
  elements.container.toggleAttribute( elements.CONTAINER_ATTRIBUTE_STATE_ACTIVE, visible );
}

/**
 * Make the button see-through, let user click what's underneath/behind it.
 * Or, restore button state to the original.
 *
 * @param {jQuery} $thisButton - The button being hovered over.
 * @param {boolean} visible - Whether the button should be present.
 */

export function toggleButton( $thisButton, visible ) {
  // Normal state of the button doesn't need an attribute, so it's only added when the button needs to be hidden
  $thisButton[ 0 ].toggleAttribute( elements.BUTTON_ATTRIBUTE_STATE_DISABLED, ! visible );
}

/**
 * Whether the button would be active if hovered, whether the page has been scrolled enough (equal to or more than set by “Appear distance” option).
 *
 * @returns {boolean}
 */

export function isButtonHoverable() {
  return elements.getScrollTop() >= buttonSettings.distanceLength;
}

/**
 * Check whether the cursor is currently positioned over the button.
 *
 * @param {HTMLElement} buttonToCheck - The button in question.
 * @returns {boolean}
 */

export function isButtonHovered( buttonToCheck ) {
  return buttonToCheck.matches( elements.BUTTON_HOVERED_SELECTOR ) ||
    buttonToCheck.isSameNode( document.elementFromPoint( cursorPosition.x, cursorPosition.y ) );
}
