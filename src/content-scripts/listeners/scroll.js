import * as elements from '../button/elements';
import * as visualProperties from '../button/visual-properties';
import * as listenersUtils from './utils';

const SCROLL_THROTTLE_DELAY = 250;

/**
 * Might need to toggle button(s) appearance and flip on scroll.
 */

export function addScrollListener() {
  const throttledScrollHandler = listenersUtils.throttle( handleScroll, SCROLL_THROTTLE_DELAY );

  elements.getScrollableElement().addEventListener( 'scroll', throttledScrollHandler );
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
