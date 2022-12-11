import * as modes from '../settings/modes';
import * as elements from '../elements';
import * as scrollActions from '../scroll-actions';
import * as scrollDirections from '../scroll-directions';
import * as visualProperties from '../visual-properties';

/**
 * Main functionality of the extension is handled by these click listeners.
 */

export function addButtonsClickListeners() {
  if ( modes.isDualArrowsMode() ) {
    addButtonClickListener( elements.button1, elements.$button1, scrollDirections.UP );
    addButtonClickListener( elements.button2, elements.$button2, scrollDirections.DOWN );
  }
  else {
    addButtonClickListener( elements.button1, elements.$button1 );
  }
}

/**
 * Set up an appropriate click listener.
 *
 * @param {HTMLElement} button
 * @param {jQuery} $button
 * @param {string} [enforcedScrollDirection]
 */

function addButtonClickListener( button, $button, enforcedScrollDirection ) {
  button.addEventListener( 'click', handleButtonClick.bind( null, $button, enforcedScrollDirection ) );
}

/**
 * Handle button clicks.
 *
 * @param {jQuery} $button
 * @param {string} [enforcedScrollDirection]
 */

function handleButtonClick( $button, enforcedScrollDirection ) {
  if ( scrollActions.isInProgress() || scrollActions.isInfiniteScrollDownEnabled() && elements.isInfiniteScrollDownRecheckDelayActiveIndicatorShown() ) {
    scrollActions.stopScrolling();
    elements.toggleInfiniteScrollDownRecheckDelayActiveIndicator( false );
  }
  else {
    const direction = enforcedScrollDirection || scrollDirections.currentDirection;

    if ( direction === scrollDirections.UP ) {
      scrollActions.scrollUp();
    }
    else {
      scrollActions.scrollDown();
    }

    visualProperties.restoreButtonOpacity( $button );
  }
}
