/*-----------------------
* Scroll to Top Button
* by Cody Sherman (versions < 6.1.3), http://codysherman.com/
*
* Brought back to life by PoziWorld
*
* Copyright (c) 2011 Cody Sherman (versions < 6.1.3)
* Copyright (c) 2014-2016 PoziWorld
*
* Licensed under the MIT License
* http://www.opensource.org/licenses/mit-license.php
*
* Original source code at: http://github.com/codysherman/Scroll-to-Top-Button-Extension
* Forked source code at: http://github.com/PoziWorld/Scroll-to-Top-Button-Extension
-----------------------*/

if ( sttb.isWindowReady() ) {
    ContentScript.init();
}
else {
    sttb.watch();
}

/**
 * Main function, sets up the button.
 **/

function STTB() {
    const MODE_DUAL_ARROWS = 'dual';
    const MODE_KEYBOARD_ONLY = 'keys';

    const CONTAINER_TAG_NAME = 'SCROLL-TO-TOP-BUTTON-CONTAINER';
    const BUTTON_TAG_NAME = 'SCROLL-TO-TOP-BUTTON';
    const BUTTON_NUMBER_PLACEHOLDER = '$NUMBER$';
    const BUTTON_ID = 'scroll-to-top-button-' + BUTTON_NUMBER_PLACEHOLDER;
    const BUTTON_LABEL = 'Scroll To Top Button';

    let container = null;
    let button = null;
    let button2 = null;
    let $button = null;
    let $button2 = null;
    let buttonsCount = 0;

    // Removes the built-in button when on Tumblr
    if (window.location.href.indexOf('http://www.tumblr.com/') != -1) {
        var alreadyHasIt=['http://www.tumblr.com/dashboard','http://www.tumblr.com/tumblelog/','http://www.tumblr.com/messages','http://www.tumblr.com/tagged/','http://www.tumblr.com/liked/by/','http://www.tumblr.com/likes'];
        $.each( alreadyHasIt, function(i, urlString){
            if (window.location.href.indexOf( urlString ) != -1) {
                $('#return_to_top').remove();
            }
        })
    }

    setUp();

    /**
     * To get started, retrieve the settings from the Storage and verify their integrity.
     */

    function setUp() {
      strLog = 'setUp';
      Log.add( strLog );

      poziworldExtension.utils.getSettings(
        strLog,
        handleRetrievedSettings,
        undefined,
        true
      );
    }

    /**
     * Verify integrity of the settings.
     *
     * @param {Object} settings - Key-value pairs.
     */

    function handleRetrievedSettings( settings ) {
      strLog = 'handleRetrievedSettings';
      Log.add( strLog );

      if ( isExpectedSettingsFormat( settings ) ) {
        init( settings );
      }
      else {
        throw new TypeError();
      }
    }

    /**
     * Process settings, inject the button(s) if needed, add listeners.
     *
     * @param {Object} settings - Key-value pairs.
     */

    function init( settings ) {
        strLog = 'init';
        Log.add( strLog );

        let scrollUpSpeed = parseInt( settings.scrollUpSpeed );
        const scrollUpSpeedCustom = parseInt( settings.scrollUpSpeedCustom );
        let scrollDownSpeed = parseInt( settings.scrollDownSpeed );
        const scrollDownSpeedCustom = parseInt( settings.scrollDownSpeedCustom );

        var distance = parseInt(settings.distanceLength);
        var flipDistance = parseInt(settings.distanceLength);
        var scroll = settings.scroll;
        var stbb = settings.buttonMode;
        var transparency = settings.notActiveButtonOpacity;
        var shortcuts = settings.keyboardShortcuts;
        var homeendaction = settings.homeEndKeysControlledBy;

        if ( shouldUseCustom( scrollUpSpeed, scrollUpSpeedCustom ) ) {
          scrollUpSpeed = scrollUpSpeedCustom;
        }

        if ( shouldUseCustom( scrollDownSpeed, scrollDownSpeedCustom ) ) {
          scrollDownSpeed = scrollDownSpeedCustom;
        }

        if ( ! isKeyboardOnlyMode( stbb ) ) {
            createElements( settings );

            if ( stbb === 'flip' ) {
              $button.rotate( -180 );
            }

            if(stbb=="dual"){
                $button2.rotate(-180);
            }

            // Sets the appear distance to 0 for modes where button is always present
            if((stbb=="flip") || (stbb=="dual")){
                distance=0;
            }

            // A fix so that if user has set transparency to 0, both buttons will appear when hovering over one in dual mode
            if ((transparency == 0.0) && (stbb=="dual")){
                $button.hover(function(){
                    if ( sttb.getScrollTop() >= distance ) {
                        $button.stop();
                        $button2.stop();
                        $button.stop().fadeTo("fast", 1.0);
                        $button2.stop().fadeTo("fast", 0.5);
                    }
                },function(){
                    if ( sttb.getScrollTop() >= distance ) {
                        $button.stop().fadeTo("medium", transparency);
                        $button2.stop().fadeTo("medium", transparency);
                    }
                });

                $button2.hover(function(){
                    if ( sttb.getScrollTop() >= distance ) {
                        $button.stop();
                        $button2.stop();
                        $button.stop().fadeTo("fast", 0.5);
                        $button2.stop().fadeTo("fast", 1.0);
                    }
                },function(){
                    if ( sttb.getScrollTop() >= distance ) {
                        $button.fadeTo("medium", transparency);
                        $button2.fadeTo("medium", transparency);
                    }
                });
            }

            // Has transparency change on mouseover
            else{
                if (transparency != 1.0) {
                    $button.hover(function(){
                        if ( sttb.getScrollTop() >= distance ) {
                            $button.stop().fadeTo("fast", 1.0);
                        }
                    },function(){
                        if ( sttb.getScrollTop() >= distance ) {
                            $button.stop().fadeTo("medium", transparency);
                        }
                    });

                    if ( isDualArrowsMode( stbb ) ) {
                        $button2.hover(function(){
                            if ( sttb.getScrollTop() >= distance ) {
                                $button2.stop().fadeTo("fast", 1.0);
                            }
                        },function(){
                            if ( sttb.getScrollTop() >= distance ) {
                                $button2.stop().fadeTo("medium", transparency);
                            }
                        });
                    }
                }
            }

            // Calls and passes variables to jquery.scroll.pack.js which finds the created button and applies the scrolling rules.
            $button.scrollToTop( {
                    speed : scrollUpSpeed
                ,   ease : scroll
                ,   start : distance
                ,   stbb : stbb
                ,   flipDistance : flipDistance
                ,   transparency : transparency
                ,   direction : 'up'
            } );

            if ( isDualArrowsMode( stbb ) ) {
                $button2.scrollToTop( {
                        speed : scrollDownSpeed
                    ,   ease : scroll
                    ,   start : distance
                    ,   stbb : stbb
                    ,   flipDistance : flipDistance
                    ,   transparency : transparency
                    ,   direction : 'down'
                } );
            }
        }

        //Adds keyboard commands using shortcut.js
        if (shortcuts == "arrows") {
            shortcut.add("Alt+Down", function() {
                sttb.scrollDown( scrollDownSpeed, scroll );
            });
            shortcut.add("Alt+Up", function() {
                sttb.scrollUp( scrollUpSpeed, scroll );
            });
        }
        else if (shortcuts == "tb") {
            shortcut.add("Alt+B", function() {
                sttb.scrollDown( scrollDownSpeed, scroll );
            });
            shortcut.add("Alt+T", function() {
                sttb.scrollUp( scrollUpSpeed, scroll );
            });
        }

        if ( homeendaction === 'sttb' ) {
            shortcut.add("End", function() {
                sttb.scrollDown( scrollDownSpeed, scroll );
            },{
                'disable_in_input':true
            });
            shortcut.add("Home", function() {
                sttb.scrollUp( scrollUpSpeed, scroll );
            },{
                'disable_in_input':true
            });
        }

        if ( ! isKeyboardOnlyMode( stbb ) ) {
          document.addEventListener( 'webkitfullscreenchange', handleFullscreenchangeEvent );
          document.addEventListener( 'mozfullscreenchange', handleFullscreenchangeEvent );
          document.addEventListener( 'msfullscreenchange', handleFullscreenchangeEvent );
          document.addEventListener( 'fullscreenchange', handleFullscreenchangeEvent );
        }
    }

    /**
     * Create button(s) with the specified settings (user preferences) and add it to the page.
     *
     * @param {Object} settings - Key-value pairs.
     */

    function createElements( settings ) {
      container = createContainer( settings.buttonLocation );
      button = createButton( settings );
      $button = $( button );

      container.append( button );

      if ( isDualArrowsMode( settings.buttonMode ) ) {
        button2 = createButton( settings );
        $button2 = $( button2 );

        container.append( button2 );
      }

      container.insertAdjacentHTML( 'beforeend', createDisabledJavascriptBandage() );

      document.body.insertAdjacentElement( 'afterend', container );
    }

    /**
     * For easier styling, wrap the button(s) with a container.
     *
     * @param {string} buttonLocation - Position of the button on the page.
     * @return {HTMLElement}
     */

    function createContainer( buttonLocation ) {
      const container = document.createElement( CONTAINER_TAG_NAME );
      const position = getPosition( buttonLocation );

      container.setAttribute( 'data-position-vertical', position.vertical );
      container.setAttribute( 'data-position-horizontal', position.horizontal );

      return container;
    }

    /**
     * Create a button with the specified settings (user preferences).
     *
     * @param {Object} settings - Key-value pairs.
     * @return {HTMLElement}
     */

    function createButton( settings ) {
      const button = document.createElement( BUTTON_TAG_NAME );

      buttonsCount++;
      button.id = BUTTON_ID.replace( BUTTON_NUMBER_PLACEHOLDER, buttonsCount );
      button.setAttribute( 'data-mode', settings.buttonMode );
      button.setAttribute( 'data-design', settings.buttonDesign );
      button.setAttribute( 'data-size', settings.buttonSize );
      button.setAttribute( 'data-width', settings.buttonWidthCustom );
      button.setAttribute( 'data-height', settings.buttonHeightCustom );
      button.setAttribute( 'data-opacity', settings.notActiveButtonOpacity );
      button.setAttribute( 'aria-label', BUTTON_LABEL );

      return button;
    }

    /**
     * When JavaScript is disabled, the extensions still work.
     * One user requested to make the button not show up in such case.
     *
     * @return {string}
     */

    function createDisabledJavascriptBandage() {
      // .append and .innerHTML don't work as expected in Chrome v49
      return `
        <noscript>
          <style>
            ${ CONTAINER_TAG_NAME.toLowerCase() } { display: none !important; }
          </style>
        </noscript>
      `;
    }

    /**
     * “Decipher” the two-letter button position abbreviation.
     *
     * @param {string} buttonLocation - Position of the button on the page.
     * @return {{horizontal: string, vertical: string}}
     */

    function getPosition( buttonLocation ) {
      return {
        vertical: getPositionVertical( buttonLocation[ 0 ] ),
        horizontal: getPositionHorizontal( buttonLocation[ 1 ] ),
      };
    }

    /**
     * “Decipher” the button vertical position from the two-letter button position abbreviation.
     *
     * @param {string} positionIndicator - The first letter of the two-letter button position abbreviation.
     * @return {string}
     */

    function getPositionVertical( positionIndicator ) {
      switch ( positionIndicator ) {
        case 'T':
          return 'top';
        case 'B':
          return 'bottom';
        default:
          return 'center';
      }
    }

    /**
     * “Decipher” the button horizontal position from the two-letter button position abbreviation.
     *
     * @param {string} positionIndicator - The second letter of the two-letter button position abbreviation.
     * @return {string}
     */

    function getPositionHorizontal( positionIndicator ) {
      switch ( positionIndicator ) {
        case 'L':
          return 'left';
        case 'C':
          return 'center';
        default:
          return 'right';
      }
    }

    /**
     * Check whether user chose to have dual arrows.
     *
     * @param {string} buttonMode
     * @return {boolean}
     */

    function isDualArrowsMode( buttonMode ) {
      return buttonMode === MODE_DUAL_ARROWS;
    }

    /**
     * Check whether user chose to use keyboard only.
     *
     * @param {string} buttonMode
     * @return {boolean}
     */

    function isKeyboardOnlyMode( buttonMode ) {
      return buttonMode === MODE_KEYBOARD_ONLY;
    }

    /**
     * Check whether the settings are presented as key-value pairs.
     *
     * @param {Object} settings - Key-value pairs.
     * @return {boolean}
     */

    function isExpectedSettingsFormat( settings ) {
      return poziworldExtension.utils.isType( settings, 'object' ) && ! Global.isEmpty( settings );
    }

    /**
     * Check whether user chose to specify a value instead of selecting a pre-set one.
     *
     * @param {number} value - The value corresponding to a dropdown option.
     * @param {number} customValue - The number input field value.
     * @return {boolean}
     */

    function shouldUseCustom( value, customValue ) {
      return value === -1 && customValue > -1;
    }

    /**
     * Hide the button(s) when fullscreen is activated (most likely, a video player).
     */

    function handleFullscreenchangeEvent() {
      if ( document.contains( container ) ) {
        const fullscreen = !! ( document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement );

        container.hidden = fullscreen;
      }
    }
}
