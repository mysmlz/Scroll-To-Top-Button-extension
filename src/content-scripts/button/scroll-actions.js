import buttonSettings from './settings';
import * as elements from './elements';

const ENABLED_SETTING_CUSTOM_VALUE_INDICATOR = '-1';

let scrollingInProgress = false;
let infiniteScrollDownChecker = null;

/**
 * Scroll the page down.
 */

export async function scrollDown() {
  const scrollTo = elements.getScrollCausingElementHeight();
  await scroll(
    scrollTo,
    buttonSettings.scrollDownSpeed,
    buttonSettings.scroll,
  );

  if ( isInfiniteScrollDownEnabled() ) {
    if ( ! continueScrollingDown( scrollTo ) ) {
      stopProgress();
      scheduleInfiniteScrollDownChecker( scrollTo );
    }
  }
  else {
    stopProgress();
  }
}

/**
 * Scroll the page up.
 */

export async function scrollUp() {
  await scroll( 0, buttonSettings.scrollUpSpeed, buttonSettings.scroll );
  stopProgress();
}

/**
 * Main underlying function for scrolling.
 *
 * @param {number} scrollTop - scrollTop position to scroll to.
 * @param {number} scrollSpeed - Animation speed in ms.
 * @param {string} scroll - Easing functions specify the speed at which an animation progresses at different points within the animation.
 * @returns {Promise<jQuery>}
 **/

async function scroll( scrollTop, scrollSpeed, scroll ) {
  startProgress();
  resetInfiniteScrollDownChecker();

  return new Promise( ( resolve, reject ) => {
    try {
      elements.getAnimatableElement().animate(
        {
          scrollTop,
        },
        scrollSpeed,
        scroll,
        resolve,
      );
    }
    catch ( error ) {
      window.console.error( 'Scroll To Top Button is unable to use jQuery for custom speed setting. Try refreshing the page.', error );
    }
  } );
}

/**
 * Some websites, such as Twitter, Instagram, Facebook, and Quora, keep loading more content as user scrolls down.
 * Check whether the extension should check for infinite scrolling.
 *
 * @param {number} previousHeight
 * @returns {boolean}
 **/

export function isInfiniteScrollDownEnabled() {
  return buttonSettings.infiniteScrollDown === ENABLED_SETTING_CUSTOM_VALUE_INDICATOR;
}

/**
 * Some websites, such as Twitter, Instagram, Facebook, and Quora, keep loading more content as user scrolls down.
 * Disable previously scheduled checks for infinite scrolling.
 *
 * @param {number} previousHeight
 **/

function resetInfiniteScrollDownChecker() {
  window.clearTimeout( infiniteScrollDownChecker );
}

/**
 * Some websites, such as Twitter, Instagram, Facebook, and Quora, keep loading more content as user scrolls down.
 * If the page height hasn't increased while the scroll was in-progress, but it might after a short delay, the extension will recheck.
 *
 * @param {number} previousHeight
 **/

function scheduleInfiniteScrollDownChecker( previousHeight ) {
  const infiniteScrollDownRecheckDelay = buttonSettings.infiniteScrollDownRecheckDelay;

  if ( Number.isInteger( infiniteScrollDownRecheckDelay ) ) {
    infiniteScrollDownChecker = window.setTimeout( () => continueScrollingDown( previousHeight ), infiniteScrollDownRecheckDelay );
    elements.toggleInfiniteScrollDownRecheckDelayActiveIndicator( true );
  }
}

/**
 * Some websites, such as Twitter, Instagram, Facebook, and Quora, keep loading more content as user scrolls down.
 * If the page height has increased while the scroll was in-progress, which most likely would mean more content got loaded, the extension continues scrolling down.
 *
 * @param {number} previousHeight
 * @returns {boolean}
 **/

function continueScrollingDown( previousHeight ) {
  elements.toggleInfiniteScrollDownRecheckDelayActiveIndicator( false );

  if ( hasScrollCausingElementHeightIncreased( previousHeight ) ) {
    scrollDown();

    return true;
  }

  return false;
}

/**
 * Some websites, such as Twitter, Instagram, Facebook, and Quora, keep loading more content as user scrolls down.
 * Check whether the page height has increased while the scroll was in-progress, which most likely would mean more content got loaded.
 *
 * @param {number} previousHeight
 * @returns {boolean}
 **/

function hasScrollCausingElementHeightIncreased( previousHeight ) {
  return elements.getScrollCausingElementHeight() > previousHeight;
}

/**
 * Stop the scrolling (for example, if button is clicked a second time).
 */

export function stopScrolling() {
  resetInfiniteScrollDownChecker();
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

function startProgress() {
  scrollingInProgress = true;
}

/**
 * Set scrolling state to “not in progress”.
 */

export function stopProgress() {
  scrollingInProgress = false;
}
