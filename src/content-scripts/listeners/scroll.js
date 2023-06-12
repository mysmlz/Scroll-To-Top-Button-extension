import * as eventsHelpers from 'Shared/events';
import * as elements from '../button/elements';
import * as visualProperties from '../button/visual-properties';
import * as listenersUtils from './utils';

const SCROLL_THROTTLE_DELAY = 250;
const throttledScrollHandler = listenersUtils.throttle( handleScroll, SCROLL_THROTTLE_DELAY );

/**
 * Might need to toggle button(s) appearance and flip on scroll.
 */

export function addScrollListener() {
  const scrollableElement = elements.getScrollableElement();

  scrollableElement.addEventListener( 'scroll', throttledScrollHandler, { passive: true } );
  eventsHelpers.addListener( {
    name: eventsHelpers.EVENT_NAMES.scrollableElementSet,
    callback: () => resetScrollListener( scrollableElement ),
    oneTime: true,
  } );
}

function resetScrollListener( previousScrollableElement ) {
  previousScrollableElement?.removeEventListener( 'scroll', throttledScrollHandler );
  addScrollListener();
  visualProperties.switchVisualProperties();
}

/**
 * Check whether the button should be visible and/or flipped on scroll.
 */

function handleScroll() {
  // When turning on full screen on YouTube in Chrome 87, it triggers “scroll” event.
  // Buttons should stay hidden when in full screen.
  if ( listenersUtils.isFullscreenActive() ) {
    return;
  }

  visualProperties.switchVisualProperties();
}
