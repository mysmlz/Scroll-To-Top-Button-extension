/*-----------------------
* jQuery Plugin: Scroll to Top
* by Craig Wilson, Ph.Creative http://www.ph-creative.com
*
* Copyright (c) 2009 Ph.Creative Ltd.
* Licensed under the MIT License http://www.opensource.org/licenses/mit-license.php
*
* Description: Adds an unobtrusive "Scroll to Top" link to your page with smooth scrolling.
* For usage instructions and version updates to go http://blog.ph-creative.com/post/jquery-plugin-scroll-to-top-v3.aspx
*
* Version: 3.1, 29/07/2010
*
* Modified for Scroll to Top Button
-----------------------*/

// Craig's Scroll to Top Plugin with modifications
(function($){
    $.fn.extend({
        scrollToTop:function(options){

            var defaults = {
                    speed : 'slow'
                ,   ease : 'jswing'
                ,   start : 0
            };

            options = $.extend( defaults, options );

            return this.each(function(){

                var o = options;
                var $scrollDiv = $( this );

                switchButtonVisualProperties( $scrollDiv, o );
                stopProgress();
                addListeners( $scrollDiv, o );
            });
        }
    });

    /**
     * Set up event listeners.
     *
     * @param {jQuery} $button
     * @param {object} options
     */

    function addListeners( $button, options ) {
      sttb.getJqueriedScrollableElement().scroll( handleScroll.bind( null, $button, options ) );

      if ( options.stbb === 'flip' || options.stbb === 'dual' ) {
          $button.click( handleBidirectionalModeClick.bind( null, $button, options ) );
      }
      else if ( options.stbb === 'off' ) {
          $button.click( handleUnidirectionalModeClick.bind( null, options ) );
      }
    }

    /**
     * Check whether the button should be visible and/or flipped on scroll.
     *
     * @param {jQuery} $button
     * @param {object} options
     */

    function handleScroll( $button, options ) {
      switchButtonVisualProperties( $button, options );
    }

    /**
     * Show/hide the button and flip it, if necessary.
     *
     * @param {jQuery} $button
     * @param {object} options
     */

    function switchButtonVisualProperties( $button, options ) {
      $button.toggle( sttb.getScrollTop() >= options.start );
      flipButtonIfNecessary( $button, options );
    }

    /**
     * Rules specific to the button when it is in a bi-directional (flip or dual arrows) mode.
     *
     * @param {jQuery} $button
     * @param {object} options
     */

    function handleBidirectionalModeClick( $button, options ) {
      if ( isInProgress() ) {
        stopScrolling();
      }
      else {
        if ( options.direction === 'up' ) {
          scrollUp( options );
        }
        else {
          scrollDown( options );
        }

        restoreButtonOpacity( $button, options );
      }
    }

    /**
     * Set up the scrolling rules when in the “scroll to top only” mode.
     *
     * @param {object} options
     */

    function handleUnidirectionalModeClick( options ) {
      if ( isInProgress() ) {
        stopScrolling();
      }
      else {
        scrollUp( options );
      }
    }

    /**
     * If user chose the flip (between top and bottom) mode, flip the button.
     *
     * @param {jQuery} $button
     * @param {object} options
     */

    function flipButtonIfNecessary( $button, options ) {
      if ( options.stbb === 'flip' ) {
        if ( sttb.getScrollTop() >= options.flipDistance ) {
          $button.rotate( {
            animateTo: 0,
          } );

          options.direction = 'up';
        }
        else {
          $button.rotate( {
            animateTo: -180,
          } );

          options.direction = 'down';
        }
      }
    }

    /**
     * Scroll the page up.
     *
     * @param {object} options
     */

    function scrollUp( options ) {
      startProgress();
      sttb.scrollUp( options.speed, options.ease );
    }

    /**
     * Scroll the page down.
     *
     * @param {object} options
     */

    function scrollDown( options ) {
      startProgress();
      sttb.scrollDown( options.speed, options.ease );
    }

    /**
     * Stops the scrolling (for example, if button is clicked a second time).
     */

    function stopScrolling() {
      sttb.getAnimatableElement().stop();
      stopProgress();
    }

    /**
     * Options allow user to specify “not active button opacity”, which gets changed on hover.
     * Once scrolling is finished, restore the value from the Options.
     *
     * @param {jQuery} $button
     * @param {object} options
     */

    function restoreButtonOpacity( $button, options ) {
        let opacity;

        if ( options.transparency === '0.0' && options.stbb === 'dual' ) {
            opacity = 0.5;
        }
        else {
            opacity = options.transparency;
        }

        $button.fadeTo( 'medium', opacity );
    }

    /**
     * Check whether the scrolling is currently in progress.
     *
     * @return {boolean}
     */

    function isInProgress() {
      return window.inProgress === 'yes';
    }

    /**
     * Set scrolling state to “in progress”.
     */

    function startProgress() {
      window.inProgress = 'yes';
    }

    /**
     * Set scrolling state to “not in progress”.
     */

    function stopProgress() {
      window.inProgress = 'no';
    }
})
(jQuery);
