/* =============================================================================

  Product     : Scroll To Top Button
  Authors     : Cody Sherman (versions < 6.1.3), PoziWorld
  Copyright   : (c) 2016 PoziWorld
  File        : content-script/js/sttb.js
  Description : Scroll To Top Button JavaScript

  Table of Contents:

    Sttb
      watch()
      handleGmail()
      setScrollableElement()
      scroll()
      scrollUp()
      scrollDown()
      getScrollableElement()
      getAnimatableElement()
      getScrollTop()

 ============================================================================ */

( function () {
  'use strict';

  const CLICKTHROUGH_KEYS_DIVIDER = '|';

  function Sttb() {
    const $window = $( window );
    let $$scrollableElement = null;
    let $$scrollCausingElement = null;

    /**
     * #editor-container on Transifex when viewing/editing translations is 3px higher than viewport.
     *
     * @type {number}
     */

    const TRANSIFEX_EDITOR_CONTAINER_EXTRA_HEIGHT = 3;

    /**
     * Return window.
     *
     * @return {jQuery}
     */

    Sttb.prototype.getWindow = function () {
      return $window;
    };

    /**
     * Get scrollable element if provided on init or use window object otherwise.
     *
     * @return {HTMLElement}
     */

    Sttb.prototype.getScrollableElement = function () {
      return $$scrollableElement;
    };

    /**
     * Get scrollable element as instance of jQuery if provided on init or use window object otherwise.
     *
     * @return {HTMLElement}
     */

    Sttb.prototype.getJqueriedScrollableElement = function () {
      return $$scrollableElement ? $( $$scrollableElement ) : this.getWindow();
    };

    /**
     * If there is a scrollable element other than the whole document, set it.
     *
     * @param {HTMLElement} [$$element] - When not the whole page is scrollable, only some element.
     */

    Sttb.prototype.setScrollableElement = function ( $$element ) {
      $$scrollableElement = $$element;
    };

    /**
     * If there is a scroll-causing element, return it.
     *
     * @return {HTMLElement}
     */

    Sttb.prototype.getScrollCausingElement = function () {
      return $$scrollCausingElement;
    };

    /**
     * If there is a scroll-causing (higher than viewport) element, set it.
     *
     * @param {HTMLElement} [$$element]
     */

    Sttb.prototype.setScrollCausingElement = function ( $$element ) {
      $$scrollCausingElement = $$element;
    };

    /**
     * Return the number of pixels the Transifex container is higher than viewport by.
     *
     * @return {number}
     */

    Sttb.prototype.getTransifexExtraHeight = function () {
      return TRANSIFEX_EDITOR_CONTAINER_EXTRA_HEIGHT;
    };
  }

  /**
   * Check whether the page changes size later or a mistake was made judging size by user scrolling.
   *
   * @todo Find a universal way to detect scrollable pages where body height: 100% and overflow: hidden.
   *
   * @param {boolean} boolSkipSpecialCase
   */

  Sttb.prototype.watch = function ( boolSkipSpecialCase ) {
    const strHost = location.host;

    // Gmail
    if ( /^mail.google\.[a-z]{2,}$/.test( strHost ) ) {
      this.handleGmail();
    }
    // Google News
    if ( /^news.google\.[a-z]{2,}$/.test( strHost ) ) {
      this.handleGoogleNews();
    }
    // Transifex
    else if ( ! boolSkipSpecialCase && /^www\.transifex\.com$/.test( strHost ) ) {
      this.handleTransifex();
    }
    // All other sites
    else {
      var $window = this.getWindow();

      $window.scroll( function () {
        ContentScript.init();

        $window.unbind( 'scroll' );
      } );
    }
  };

  /**
   * Gmail's main scrollable area is a div, not whole document like on most
   * other sites. Thus, it needs a special treatment.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  Sttb.prototype.handleGmail = function () {
    const $$scrollableElementParent = document.querySelector( '.AO' );
    const _this = this;

    if ( ! $$scrollableElementParent ) {
      window.requestAnimationFrame( _this.handleGmail.bind( _this ) );
    }
    else {
      const $$scrollableElement = $$scrollableElementParent.firstElementChild;

      this.setScrollableElement( $$scrollableElement );
      this.setScrollCausingElement( $$scrollableElement.firstElementChild );
      ContentScript.init();
    }
  };

  /**
   * Google News' main scrollable area is a div, not whole document like on most other sites. Thus, it needs a special treatment.
   **/

  Sttb.prototype.handleGoogleNews = function () {
    const _this = this;

    /**
     * Google News uses tabs for different “pages”. On navigation, it hides the current and (creates and) shows the new one.
     *
     * @type {NodeListOf<Element>}
     */

    const $$scrollCausingElementsParents = document.querySelectorAll( 'body > div > c-wiz' );

    if ( ! $$scrollCausingElementsParents ) {
      this.watchForGoogleNewsRepaint();

      return;
    }

    let $$currentScrollCausingElementParent;

    for ( let $$node of $$scrollCausingElementsParents ) {
      if ( $$node.offsetHeight ) {
        $$currentScrollCausingElementParent = $$node;

        break;
      }
    }

    const $$currentScrollCausingElement = $$currentScrollCausingElementParent.querySelector( 'div' );

    if ( ! $$currentScrollCausingElement ) {
      this.watchForGoogleNewsRepaint();
    }
    else {
      this.setScrollableElement( $$currentScrollCausingElementParent );
      this.setScrollCausingElement( $$currentScrollCausingElement );
      ContentScript.init();
      this.watchForGoogleNewsPageChange( $$currentScrollCausingElementParent );
    }
  };

  /**
   * Recheck for scrollable items on repaint.
   */

  Sttb.prototype.watchForGoogleNewsRepaint = function () {
    const _this = this;

    window.requestAnimationFrame( _this.handleGoogleNews.bind( _this ) );
  };

  /**
   * Google News uses tabs for different “pages”. On navigation, it hides the current and (creates and) shows the new one.
   *
   * @param {HTMLElement} $$currentScrollCausingElementParent
   */

  Sttb.prototype.watchForGoogleNewsPageChange = function ( $$currentScrollCausingElementParent ) {
    const _this = this;

    var objObserverWatchFor = {
      attributes: true,
      attributeFilter: [
        'style'
      ]
    };

    let observer;

    const disconnectObserver = function () {
      observer.disconnect();
    };

    observer = new MutationObserver( this.handleGoogleNewsMutations.bind( _this, disconnectObserver ) );

    observer.observe( $$currentScrollCausingElementParent, objObserverWatchFor );
  };

  /**
   * Google News uses tabs for different “pages”. On navigation, it hides the current and (creates and) shows the new one.
   *
   * @param disconnectObserver
   * @param {Object[]} arrMutations
   */

  Sttb.prototype.handleGoogleNewsMutations = function ( disconnectObserver, arrMutations ) {
    for ( let objMutation of arrMutations ) {
      const strDisplay = objMutation.target.style.display;

      if ( typeof strDisplay === 'string' && strDisplay === 'none' ) {
        disconnectObserver();
        this.handleGoogleNews();

        break;
      }
    }
  };

  /**
   * Transifex's scrollable area is a div when viewing/editing translations, not whole document like on most other sites. Plus, they manipulate CSS “top” property instead of “scrollTop”. Ignore this page for now.
   **/

  Sttb.prototype.handleTransifex = function () {
    var $$scrollableElement = document.querySelector( '#stringlist-area .viewport' );

    if ( ! $$scrollableElement ) {
      this.watch( true );
    }
  };

  /***
   * Check whether the window meets the criteria before initializing STTB.
   *
   * Only top frames and ~full-screen iframes (since there is no access to the top frame, compare the iframe height to the screen height, considering it also includes the height of the address bar, tabs titles, optional bookmarks bar – the ratio for Chrome and Opera is ~91%, but make it 85% just in case).
   *
   * @return {boolean}
   */

  Sttb.prototype.isWindowReady = function () {
    return ( window == top || window.innerHeight / window.screen.height > .85 ) &&
      window.innerHeight < ( $( document ).height() - this.getTransifexExtraHeight() );
  };

  /**
   * Main underlying function for scrolling.
   *
   * @type    method
   * @param   intScrollTop
   *              scrollTop position to scroll to.
   * @param   intSpeed
   *              Animation speed in ms.
   * @param   strEase
   *              Easing functions specify the speed at which an animation
   *              progresses at different points within the animation.
   * @return  void
   **/

  Sttb.prototype.scroll = function ( intScrollTop, intSpeed, strEase ) {
    this.getAnimatableElement().animate(
        { scrollTop : intScrollTop }
      , intSpeed
      , strEase
      , function () {
          if ( typeof inProgress === 'string' ) {
            inProgress = 'no';
          }
        }
    );
  };

  /**
   * Main underlying function for going up.
   *
   * @type    method
   * @param   intSpeed
   *            Animation speed in ms.
   * @param   strEase
   *            Easing functions specify the speed at which an animation
   *            progresses at different points within the animation.
   * @return  void
   **/

  Sttb.prototype.scrollUp = function ( intSpeed, strEase ) {
    this.scroll( 0, intSpeed, strEase );
  };

  /**
   * Main underlying function for going down.
   *
   * @type    method
   * @param   intSpeed
   *              Animation speed in ms.
   * @param   strEase
   *              Easing functions specify the speed at which an animation
   *              progresses at different points within the animation.
   * @return  void
   **/

  Sttb.prototype.scrollDown = function ( intSpeed, strEase ) {
    this.scroll(
        $( this.getScrollCausingElement()
            ? this.getScrollCausingElement()
            : document
        ).height()
      , intSpeed
      , strEase
    );
  };

  /**
   * Get animatable element if provided on init or use 'html, body' otherwise.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  jQuery element
   **/

  Sttb.prototype.getAnimatableElement = function () {
    return $( this.getScrollableElement() ? this.getScrollableElement() : 'html, body' );
  };

  /**
   * Get vertical scroll position.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  integer
   **/

  Sttb.prototype.getScrollTop = function () {
    return this.getJqueriedScrollableElement().scrollTop();
  };

  /**
   * Check whether one of the “clickthrough keys” is pressed when hovering over or clicking the button.
   *
   * @param {KeyboardEvent|MouseEvent} event - The event.
   * @param {Settings} settings - The button settings.
   * @return {boolean}
   */

  Sttb.prototype.isClickthroughKeyPressed = function ( event, settings ) {
    const option = settings.clickthroughKeys;

    if ( poziworldExtension.utils.isNonEmptyString( option ) ) {
      const keys = option.split( CLICKTHROUGH_KEYS_DIVIDER );

      while ( keys.length ) {
        const key = keys.shift();

        if ( poziworldExtension.utils.isNonEmptyString( key ) && event[ `${ key }Key` ] ) {
          return true;
        }
      }
    }

    return false;
  };

  if ( typeof sttb === 'undefined' ) {
    window.sttb = new Sttb();
  }
} )();
