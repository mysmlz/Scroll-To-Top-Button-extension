import * as elements from '../button/elements';

/**
 * #editor-container on Transifex when viewing/editing translations is 3px higher than viewport.
 *
 * @type {number}
 */

export const TRANSIFEX_EDITOR_CONTAINER_EXTRA_HEIGHT = 3;

/**
 * Check whether the page changes size later or a mistake was made judging size by user scrolling.
 *
 * @todo Find a universal way to detect scrollable pages where body height: 100% and overflow: hidden.
 *
 * @param {resolve} resolve
 * @param {reject} reject
 * @param {boolean} [skippableSpecialCase]
 */

export function watch( resolve, reject, skippableSpecialCase ) {
  const host = window.location.host;

  // Gmail
  if ( /^mail.google\.[a-z]{2,}$/.test( host ) ) {
    handleGmail( resolve );
  }
  // Google News
  if ( /^news.google\.[a-z]{2,}$/.test( host ) ) {
    handleGoogleNews( resolve, reject );
  }
  // Transifex
  else if ( ! skippableSpecialCase && /^www\.transifex\.com$/.test( host ) ) {
    handleTransifex( resolve, reject );
  }
  // All other sites
  else {
    window.addEventListener( 'scroll', handleScroll.bind( null, resolve ) );
  }
}

/**
 * Gmail's main scrollable area is a div, not the whole document like on most other sites. Thus, it needs a special treatment.
 *
 * @param {resolve} resolve
 **/

function handleGmail( resolve ) {
  const scrollableParent = document.querySelector( '.AO' );

  if ( ! scrollableParent ) {
    window.requestAnimationFrame( handleGmail.bind( null, resolve ) );
  }
  else {
    const scrollableElement = scrollableParent.firstElementChild;

    elements.setScrollableElement( scrollableElement );
    elements.setScrollCausingElement( scrollableElement.firstElementChild );

    resolve();
  }
}

/**
 * Google News' main scrollable area is a div, not the whole document like on most other sites. Thus, it needs a special treatment.
 *
 * @param {resolve} resolve
 * @param {reject} reject
 **/

function handleGoogleNews( resolve, reject ) {
  /**
   * Google News uses tabs for different “pages”. On navigation, it hides the current and (creates and) shows the new one.
   *
   * @type {NodeListOf<Element>}
   */

  const scrollCausingParents = document.querySelectorAll( 'body > div > c-wiz' );

  if ( ! scrollCausingParents ) {
    watchForGoogleNewsRepaint( resolve, reject );

    return;
  }

  let currentScrollCausingParent;

  for ( let node of scrollCausingParents ) {
    if ( node.offsetHeight ) {
      currentScrollCausingParent = node;

      break;
    }
  }

  if ( ! currentScrollCausingParent ) {
    reject();

    return;
  }

  const currentScrollCausingElement = currentScrollCausingParent.querySelector( 'div' );

  if ( ! currentScrollCausingElement ) {
    watchForGoogleNewsRepaint( resolve, reject );
  }
  else {
    elements.setScrollableElement( currentScrollCausingParent );
    elements.setScrollCausingElement( currentScrollCausingElement );

    resolve();

    watchForGoogleNewsPageChange( resolve, reject, currentScrollCausingParent );
  }
}

/**
 * Recheck for scrollable items on repaint.
 *
 * @param {resolve} resolve
 * @param {reject} reject
 */

function watchForGoogleNewsRepaint( resolve, reject ) {
  window.requestAnimationFrame( handleGoogleNews.bind( null, resolve, reject ) );
}

/**
 * Google News uses tabs for different “pages”. On navigation, it hides the current and (creates and) shows the new one.
 *
 * @param {resolve} resolve
 * @param {reject} reject
 * @param {HTMLElement} currentScrollCausingParent
 */

function watchForGoogleNewsPageChange( resolve, reject, currentScrollCausingParent ) {
  const observerOptions = {
    attributes: true,
    attributeFilter: [
      'style',
    ],
  };

  let observer;

  const disconnectObserver = function () {
    observer.disconnect();
  };

  observer = new MutationObserver( handleGoogleNewsMutations.bind( null, resolve, reject, disconnectObserver ) );

  observer.observe( currentScrollCausingParent, observerOptions );
}

/**
 * Google News uses tabs for different “pages”. On navigation, it hides the current and (creates and) shows the new one.
 *
 * @param {resolve} resolve
 * @param {reject} reject
 * @param disconnectObserver
 * @param {Object[]} mutations
 */

function handleGoogleNewsMutations( resolve, reject, disconnectObserver, mutations ) {
  for ( let mutation of mutations ) {
    const displayProperty = mutation.target.style.display;

    if ( displayProperty === 'none' ) {
      disconnectObserver();
      handleGoogleNews( resolve, reject );

      break;
    }
  }
}

/**
 * Transifex's scrollable area is a div when viewing/editing translations, not whole document like on most other sites. Plus, they manipulate CSS “top” property instead of “scrollTop”. Ignore this page for now.
 *
 * @param {resolve} resolve
 * @param {reject} reject
 **/

function handleTransifex( resolve, reject ) {
  const scrollableElement = document.querySelector( '#stringlist-area .viewport' );

  if ( ! scrollableElement ) {
    watch( resolve, reject, true );
  }
}

/**
 * When the scroll event is fired, that means the page is ready for the extension.
 *
 * @param {resolve} resolve
 */

function handleScroll( resolve ) {
  resolve();

  window.removeEventListener( 'scroll', handleScroll );
}
