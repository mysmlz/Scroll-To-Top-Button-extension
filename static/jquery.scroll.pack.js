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
    const BUTTON_DISABLED_CLASS = 'disabled';

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
                    $scrollDiv.click(function(event){
                        if ( sttb.isClickthroughKeyPressed( event, o ) ) {
                          clickThrough( event );

                          return;
                        }

                        // Stops the scrolling if button is clicked a second time.
                        if(inProgress=="yes"){
                            sttb.getAnimatableElement().stop();
                            inProgress="no";
                        }

                        // Runs the proper scroll direction function
                        else if(o.direction=="up"){
                            inProgress="yes";
                            speed=o.speed;
                            ease=o.ease;
                            sttb.scrollUp( speed, ease );

                            if((o.transparency=="0.0")&&(o.stbb=="dual")){
                                $(this).fadeTo("medium", 0.5);
                            }
                            else{
                                $(this).fadeTo("medium", o.transparency);
                            }
                        }

                        else if(o.direction=="down"){
                            inProgress="yes";
                            speed=o.speed;
                            ease=o.ease;
                            sttb.scrollDown( speed, ease );

                            if((o.transparency=="0.0")&&(o.stbb=="dual")){
                                $(this).fadeTo("medium", 0.5);
                            }
                            else{
                                $(this).fadeTo("medium", o.transparency);
                            }
                        }
                    })
                }

                // Sets up the scrolling rules when in only Scroll to Top mode
                else if(o.stbb=="off"){
                    $scrollDiv.click(function(event){
                        if ( sttb.isClickthroughKeyPressed( event, o ) ) {
                          clickThrough( event );

                          return;
                        }

                        if(inProgress=="yes"){
                            sttb.getAnimatableElement().stop();
                            inProgress="no";
                        }

                        else{
                            inProgress="yes";
                            speed=o.speed;
                            ease=o.ease;
                            sttb.scrollUp( speed, ease );
                        }
                    })
                }
            });
        }
    });

    /**
     * When a “clickthrough key” is pressed, make sure the click happens on the element underneath/behind the button and not the button itself.
     *
     * @param {KeyboardEvent|MouseEvent} event - The event.
     */

    function clickThrough( event ) {
      const target = event.target;

      if ( target ) {
        target.classList.add( BUTTON_DISABLED_CLASS );

        const elementFromPoint = document.elementFromPoint( event.clientX, event.clientY );

        if ( elementFromPoint ) {
          elementFromPoint.click();
        }

        target.classList.remove( BUTTON_DISABLED_CLASS );
      }
    }
})
(jQuery);
