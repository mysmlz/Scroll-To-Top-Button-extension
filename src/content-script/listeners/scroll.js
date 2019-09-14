import * as elements from '../button/elements';
import * as visualProperties from '../button/visual-properties';

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
  visualProperties.switchVisualProperties();
}
