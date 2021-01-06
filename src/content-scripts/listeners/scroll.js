import * as elements from '../button/elements';
import * as visualProperties from '../button/visual-properties';
import * as listenersUtils from './utils';

/**
 * Might need to toggle button(s) appearance and flip on scroll.
 */

export function addScrollListener() {
  elements.getScrollableElement().addEventListener( 'scroll', handleScroll );
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
