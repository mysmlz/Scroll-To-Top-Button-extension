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

                $scrollDiv.hide();

                // Allows the button to change directions when in "Flip" mode on page load
                if(o.stbb=="flip"){
                    if ( sttb.getScrollTop() >= o.flipDistance){
                        $scrollDiv.rotate({animateTo:0});
                        o.direction="up";
                    }

                    if ( sttb.getScrollTop() < "200"){
                        $scrollDiv.rotate({animateTo:-180});
                        o.direction="down";
                    }
                }

                // Checks whether button should be visible at page load
                if ( sttb.getScrollTop() >= o.start ) {
                    $scrollDiv.show();
                }

                // Checks whether button should be visible/flipped on scroll
                sttb.getJqueriedScrollableElement().scroll( function() {
                    $scrollDiv.toggle( sttb.getScrollTop() >= o.start );

                    if(o.stbb=="flip"){
                        if ( sttb.getScrollTop() >= o.flipDistance ) {
                            $scrollDiv.rotate({animateTo:0});
                            o.direction="up";
                        }
                        else {
                            $scrollDiv.rotate({animateTo:-180});
                            o.direction="down";
                        }
                    }
                });

                inProgress="no";

                //Rules specific to the button when it is bi-directional
                if((o.stbb=="flip") || (o.stbb=="dual")){
                    $scrollDiv.click(function(){
                        if ( isInProgress() ) {
                            stopScrolling();
                        }
                        else {
                            if ( o.direction === 'up' ) {
                                scrollUp( o );
                            }
                            else {
                                scrollDown( o );
                            }

                            restoreButtonOpacity( $scrollDiv, o );
                        }
                    })
                }

                // Sets up the scrolling rules when in only Scroll to Top mode
                else if(o.stbb=="off"){
                    $scrollDiv.click(function(){
                        if ( isInProgress() ) {
                            stopScrolling();
                        }
                        else {
                            scrollUp( o );
                        }
                    })
                }
            });
        }
    });

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
