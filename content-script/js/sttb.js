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

( function() {
  'use strict';

  function Sttb() {
    this.$window = $( window );
    this.$$scrollableElement = null;
  }

  /**
   * Check whether the page changes size later or a mistake was made judging
   * size by user scrolling.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  Sttb.prototype.watch = function () {
    // Gmail
    if ( /^mail.google\.[a-z]{2,}$/.test( location.host ) ) {
      this.handleGmail();
    }
    // All other sites
    else {
      var $window = this.$window;

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
    var $$scrollableElementParent = document.querySelector( '.AO' )
      , self = this
      ;

    if ( ! $$scrollableElementParent ) {
      window.requestAnimationFrame( function () {
        self.handleGmail();
      } );
    }
    else {
      this.setScrollableElement( $$scrollableElementParent.firstElementChild );
      ContentScript.init();
    }
  };

  /**
   * If there is a scrollable element other than the whole document, set it.
   *
   * @type    method
   * @param   $$scrollableElement
   *              Optional. When not the whole page is scrollable,
   *              only some element.
   * @return  void
   **/

  Sttb.prototype.setScrollableElement = function ( $$scrollableElement ) {
    this.$$scrollableElement = $$scrollableElement;
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
        $( this.$$scrollableElement
            ? this.$$scrollableElement.firstElementChild
            : document
        ).height()
      , intSpeed
      , strEase
    );
  };

  /**
   * Get scrollable element if provided on init or use window object otherwise.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  jQuery element
   **/

  Sttb.prototype.getScrollableElement = function () {
    return ( this.$$scrollableElement ? $( this.$$scrollableElement ) : this.$window );
  };

  /**
   * Get animatable element if provided on init or use 'html, body' otherwise.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  jQuery element
   **/

  Sttb.prototype.getAnimatableElement = function () {
    return $( this.$$scrollableElement ? this.$$scrollableElement : 'html, body' );
  };

  /**
   * Get vertical scroll position.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  integer
   **/

  Sttb.prototype.getScrollTop = function () {
    return this.getScrollableElement().scrollTop();
  };

  if ( typeof sttb === 'undefined' ) {
    window.sttb = new Sttb();
  }
} )();
