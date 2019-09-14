import buttonSettings from './settings';
import * as elements from './elements';

let scrollingInProgress = false;

/**
 * Scroll the page down.
 */

export function scrollDown() {
  startProgress();
  scroll(
    $( elements.scrollCausingElement ?
      elements.scrollCausingElement :
      document ).height(),
    buttonSettings.scrollDownSpeed,
    buttonSettings.scroll,
  );
}

/**
 * Scroll the page up.
 */

export function scrollUp() {
  startProgress();
  scroll( 0, buttonSettings.scrollUpSpeed, buttonSettings.scroll );
}

/**
 * Main underlying function for scrolling.
 *
 * @param {number} scrollTop - scrollTop position to scroll to.
 * @param {number} scrollSpeed - Animation speed in ms.
 * @param {string} scroll - Easing functions specify the speed at which an animation progresses at different points within the animation.
 **/

function scroll( scrollTop, scrollSpeed, scroll ) {
  elements.getAnimatableElement().animate(
    {
      scrollTop,
    },
    scrollSpeed,
    scroll,
    stopProgress,
  );
}

/**
 * Stops the scrolling (for example, if button is clicked a second time).
 */

export function stopScrolling() {
  elements.getAnimatableElement().stop();
  stopProgress();
}

/**
 * Check whether the scrolling is currently in progress.
 *
 * @returns {boolean}
 */

export function isInProgress() {
  return scrollingInProgress;
}

/**
 * Set scrolling state to “in progress”.
 */

export function startProgress() {
  scrollingInProgress = true;
}

/**
 * Set scrolling state to “not in progress”.
 */

export function stopProgress() {
  scrollingInProgress = false;
}
