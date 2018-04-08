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

  function Sttb() {
    const $window = $( window );
    let $$scrollableElement = null;
    let $$scrollCausingElement = null;

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
     * If there is a scroll-causing element, set it.
     *
     * @param {HTMLElement} [$$element]
     */

    Sttb.prototype.setScrollCausingElement = function ( $$element ) {
      $$scrollCausingElement = $$element;
    };
  }

  /**
   * Check whether the page changes size later or a mistake was made judging size by user scrolling.
   *
   * @param {boolean} boolSkipSpecialCase
   */

  Sttb.prototype.watch = function ( boolSkipSpecialCase ) {
    // Gmail
    if ( /^mail.google\.[a-z]{2,}$/.test( location.host ) ) {
      this.handleGmail();
    }
    // Transifex
    else if ( ! boolSkipSpecialCase && /^www\.transifex\.com$/.test( location.host ) ) {
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
      window.innerHeight < ( $( document ).height() - 3 ); // Hello, Transifex's 3px!
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

  if ( typeof sttb === 'undefined' ) {
    window.sttb = new Sttb();
  }
} )();
