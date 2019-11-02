import buttonSettings from '../settings';
import * as modes from '../settings/modes';
import * as styles from '../settings/styles';
import * as elements from '../elements';
import * as visualProperties from '../visual-properties';
import { isClickthroughKeyPressed } from '../../listeners/keypress';

/**
 * So that the button(s) don't catch the eye all the time, change their transparency when hovering over and out.
 */

export function addButtonsHoverListeners() {
  const opacity = buttonSettings.notActiveButtonOpacity;
  const dualArrowModeActive = modes.isDualArrowsMode();

  if ( opacity === styles.STYLE_TRANSPARENT && dualArrowModeActive ) {
    addInvisibleDualArrowsButtonHoverListener( elements.$button1, elements.$button2 );
    addInvisibleDualArrowsButtonHoverListener( elements.$button2, elements.$button1 );
  }
  else if ( opacity !== styles.STYLE_OPAQUE ) {
    addNonOpaqueSingleArrowHoverListener( elements.$button1 );

    if ( dualArrowModeActive ) {
      addNonOpaqueSingleArrowHoverListener( elements.$button2 );
    }
  }
}

/**
 * If transparency set to 0, both buttons appear when hovering over one in “dual arrows” mode.
 *
 * @param {jQuery} $thisButton - The button being hovered over.
 * @param {jQuery} $otherButton - The other button.
 */

function addInvisibleDualArrowsButtonHoverListener( $thisButton, $otherButton ) {
  const button = $thisButton[ 0 ];

  button.addEventListener( 'mouseover', handleInvisibleDualArrowsMouseenter.bind( null, $thisButton, $otherButton ) );
  button.addEventListener( 'mouseout', handleInvisibleDualArrowsMouseleave );
}

/**
 * The button has transparency change on mouseover.
 *
 * @param {jQuery} $thisButton - The button being hovered over.
 */

function addNonOpaqueSingleArrowHoverListener( $thisButton ) {
  const button = $thisButton[ 0 ];

  button.addEventListener( 'mouseover', handleNonOpaqueSingleArrowMouseenter.bind( null, $thisButton ) );
  button.addEventListener( 'mouseout', handleNonOpaqueSingleArrowMouseleave.bind( null, $thisButton ) );
}

/**
 * If user has set transparency to 0, both buttons will appear when hovering over one in “dual arrows” mode.
 *
 * @param {jQuery} $thisButton - The button being hovered over.
 * @param {jQuery} $otherButton - The other button.
 * @param {MouseEvent} event - The event.
 */

function handleInvisibleDualArrowsMouseenter( $thisButton, $otherButton, event ) {
  if ( visualProperties.isButtonHoverable() ) {
    if ( isClickthroughKeyPressed( event ) ) {
      visualProperties.toggleButton( $thisButton, false );

      return;
    }

    $thisButton.stop();
    $otherButton.stop();
    $thisButton.stop().fadeTo( 'fast', styles.STYLE_OPAQUE );
    $otherButton.stop().fadeTo( 'fast', styles.STYLE_SEMITRANSPARENT );
  }
}

/**
 * If user has set transparency to 0, both buttons will disappear when hovering out one in “dual arrows” mode.
 *
 * @param {MouseEvent} event - The event.
 */

function handleInvisibleDualArrowsMouseleave( event ) {
  if ( ! isClickthroughKeyPressed( event ) ) {
    visualProperties.toggleButton( $( event.target ), true );
  }

  if ( visualProperties.isButtonHoverable() ) {
    const opacity = buttonSettings.notActiveButtonOpacity;

    elements.$button1.fadeTo( 'medium', opacity );
    elements.$button2.fadeTo( 'medium', opacity );
  }
}

/**
 * Fade in the button on hover over.
 *
 * @param {jQuery} $thisButton - The button being hovered over.
 * @param {MouseEvent} event - The event.
 */

function handleNonOpaqueSingleArrowMouseenter( $thisButton, event ) {
  if ( visualProperties.isButtonHoverable() ) {
    if ( isClickthroughKeyPressed( event ) ) {
      visualProperties.toggleButton( $thisButton, false );

      return;
    }

    $thisButton.stop().fadeTo( 'fast', styles.STYLE_OPAQUE );
  }
}

/**
 * Fade out the button on hover out.
 *
 * @param {jQuery} $thisButton - The button being hovered out.
 * @param {MouseEvent} event - The event.
 */

function handleNonOpaqueSingleArrowMouseleave( $thisButton, event ) {
  if ( ! isClickthroughKeyPressed( event ) ) {
    visualProperties.toggleButton( $thisButton, true );
  }

  if ( visualProperties.isButtonHoverable() ) {
    $thisButton.stop().fadeTo( 'medium', buttonSettings.notActiveButtonOpacity );
  }
}
