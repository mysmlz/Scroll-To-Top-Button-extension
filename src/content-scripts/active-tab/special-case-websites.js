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
  // If the <main> element or one of its parents is scrollable
  else if ( setScrollableElement() ) {
    resolve();
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
  const scrollableParent = document.querySelector( '.Nr' );

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
 * If the <main> element or one of its parents is scrollable, use it.
 *
 * @returns {boolean}
 */

function setScrollableElement() {
  const mainElement = document.querySelector( 'main' );

  if ( ! mainElement ) {
    return false;
  }

  const checkedElements = new Set();
  let parentElement = mainElement;
  let childElement;

  while ( ( childElement = parentElement), ( parentElement = parentElement.parentElement ) ) {
    checkedElements.add( childElement );
    checkedElements.add( parentElement );

    if ( isScrollable( parentElement ) ) {
      elements.setScrollableElement( parentElement );
      elements.setScrollCausingElement( getScrollCausingElement( checkedElements, parentElement ) );

      return true;
    }
  }

  return false;
}

/**
 * Get the scroll-causing (higher than parent/scrollable) element.
 *
 * @param {Set.<HTMLElement>} elements
 * @param {HTMLElement} scrollableElement
 * @returns {HTMLElement}
 */

function getScrollCausingElement( elements, scrollableElement ) {
  const SCROLLABLE_ELEMENT_HEIGHT = scrollableElement.offsetHeight;

  for ( const element of elements ) {
    if ( element.offsetHeight > SCROLLABLE_ELEMENT_HEIGHT ) {
      return element;
    }
  }

  return parentElement;
}

/**
 * Find out whether the provided element is scrollable.
 *
 * @see {@link https://stackoverflow.com/a/57658945}
 *
 * @param {HTMLElement} element
 * @returns {boolean}
 */

function isScrollable( element ) {
  if ( element.scrollTopMax !== undefined ) {
    return element.scrollTopMax > 0;
  }

  if ( element == document.scrollingElement ) {
    return element.scrollHeight > element.clientHeight;
  }

  return element.scrollHeight > element.clientHeight && [ 'scroll', 'auto' ].indexOf( getComputedStyle( element ).overflowY ) >= 0;
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
