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
    const MODE_FLIP = 'flip';
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

    /**
     * @typedef {Object} Settings
     * @property {string} buttonMode
     * @property {number} scrollUpSpeed
     * @property {number} scrollUpSpeedCustom
     * @property {number} scrollDownSpeed
     * @property {number} scrollDownSpeedCustom
     * @property {number} distanceLength
     * @property {number} flipDistanceLength
     * @property {string} buttonSize
     * @property {number} buttonWidthCustom
     * @property {number} buttonHeightCustom
     * @property {string} buttonDesign
     * @property {string} buttonLocation
     * @property {string} notActiveButtonOpacity
     * @property {string} keyboardShortcuts
     * @property {string} contextMenu
     * @property {string} homeEndKeysControlledBy
     * @property {string} scroll
     */

    const settings = {
      buttonMode: 'off',
      scrollUpSpeed: 1000,
      scrollUpSpeedCustom: 1000,
      scrollDownSpeed: 1000,
      scrollDownSpeedCustom: 1000,
      distanceLength: 400,
      flipDistanceLength: 400,
      buttonSize: '50px',
      buttonWidthCustom: 60,
      buttonHeightCustom: 60,
      buttonDesign: 'arrow_blue',
      buttonLocation: 'TR',
      notActiveButtonOpacity: '0.5',
      keyboardShortcuts: 'arrows',
      contextMenu: 'on',
      homeEndKeysControlledBy: 'sttb',
      scroll: 'jswing',
    };

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
     * To get started, retrieve the settings from the Storage and normalize them.
     */

    function setUp() {
      new Promise( getSettings )
        .then( normalizeSettings )
        .then( init );
    }

    /**
     * Retrieve the settings from the Storage.
     *
     * @param {resolve} resolve
     * @param {reject} reject
     */

    function getSettings( resolve, reject ) {
      poziworldExtension.utils.getSettings(
        '',
        resolve,
        reject,
        true,
      );
    }

    /**
     * Make sure the settings from the Storage are in the right format and tweak a few parameters if necessary.
     *
     * @param {Settings} settingsToNormalize - Extension settings.
     */

    function normalizeSettings( settingsToNormalize ) {
      const normalizedSettings = {
        buttonMode: settingsToNormalize.buttonMode,
        scrollUpSpeed: parseInt( settingsToNormalize.scrollUpSpeed ),
        scrollUpSpeedCustom: parseInt( settingsToNormalize.scrollUpSpeedCustom ),
        scrollDownSpeed: parseInt( settingsToNormalize.scrollDownSpeed ),
        scrollDownSpeedCustom: parseInt( settingsToNormalize.scrollDownSpeedCustom ),
        distanceLength: parseInt( settingsToNormalize.distanceLength ),
        flipDistanceLength: parseInt( settingsToNormalize.distanceLength ),
        buttonSize: settingsToNormalize.buttonSize,
        buttonWidthCustom: settingsToNormalize.buttonWidthCustom,
        buttonHeightCustom: settingsToNormalize.buttonHeightCustom,
        buttonDesign: settingsToNormalize.buttonDesign,
        buttonLocation: settingsToNormalize.buttonLocation,
        notActiveButtonOpacity: settingsToNormalize.notActiveButtonOpacity,
        keyboardShortcuts: settingsToNormalize.keyboardShortcuts,
        contextMenu: settingsToNormalize.contextMenu,
        homeEndKeysControlledBy: settingsToNormalize.homeEndKeysControlledBy,
      };
      const buttonMode = normalizedSettings.buttonMode;
      const scrollUpSpeedCustom = normalizedSettings.scrollUpSpeedCustom;
      const scrollDownSpeedCustom = normalizedSettings.scrollDownSpeedCustom;

      if ( shouldUseCustom( normalizedSettings.scrollUpSpeed, scrollUpSpeedCustom ) ) {
        normalizedSettings.scrollUpSpeed = scrollUpSpeedCustom;
      }

      if ( shouldUseCustom( normalizedSettings.scrollDownSpeed, scrollDownSpeedCustom ) ) {
        normalizedSettings.scrollDownSpeed = scrollDownSpeedCustom;
      }

      // Button is always present in these modes
      if ( isDualArrowsMode( buttonMode ) || isFlipMode( buttonMode ) ) {
        normalizedSettings.distanceLength = 0;
      }

      Object.assign( settings, normalizedSettings );
    }

    /**
     * Inject the button(s) if needed, add listeners.
     */

    function init() {
        const scrollUpSpeed = settings.scrollUpSpeed;
        const scrollDownSpeed = settings.scrollDownSpeed;

        const distance = settings.distanceLength;
        const scroll = settings.scroll;
        const stbb = settings.buttonMode;
        const transparency = settings.notActiveButtonOpacity;
        const shortcuts = settings.keyboardShortcuts;
        const homeendaction = settings.homeEndKeysControlledBy;

        if ( ! isKeyboardOnlyMode( stbb ) ) {
            createElements();

            if ( stbb === 'flip' ) {
              $button.rotate( -180 );
            }

            if(stbb=="dual"){
                $button2.rotate(-180);
            }

            // A fix so that if user has set transparency to 0, both buttons will appear when hovering over one in dual mode
            if ((transparency == 0.0) && (stbb=="dual")){
                $button.hover(
                  handleInvisibleDualArrowsMouseenter.bind( null, $button, $button2 ),
                  handleInvisibleDualArrowsMouseleave
                );

                $button2.hover(
                  handleInvisibleDualArrowsMouseenter.bind( null, $button2, $button ),
                  handleInvisibleDualArrowsMouseleave
                );
            }

            // Has transparency change on mouseover
            else{
                if (transparency != 1.0) {
                    $button.hover(
                      handleNonOpaqueSingleArrowMouseenter.bind( null, $button ),
                      handleNonOpaqueSingleArrowMouseleave.bind( null, $button )
                    );

                    if ( isDualArrowsMode( stbb ) ) {
                        $button2.hover(
                          handleNonOpaqueSingleArrowMouseenter.bind( null, $button2 ),
                          handleNonOpaqueSingleArrowMouseleave.bind( null, $button2 )
                        );
                    }
                }
            }

            setButtonsAction();
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
     */

    function createElements() {
      container = createContainer( settings.buttonLocation );
      button = createButton();
      $button = $( button );

      container.append( button );

      if ( isDualArrowsMode( settings.buttonMode ) ) {
        button2 = createButton();
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
     * @return {HTMLElement}
     */

    function createButton() {
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
     * Configure the buttons onclick behavior (main functionality of this extension).
     */

    function setButtonsAction() {
      setButtonAction( $button, settings.scrollUpSpeed, 'up' );

      if ( isDualArrowsMode( settings.buttonMode ) ) {
        setButtonAction( $button2, settings.scrollDownSpeed, 'down' );
      }
    }

    /**
     * Configure the button onclick behavior (main functionality of this extension).
     */

    function setButtonAction( $element, scrollSpeed, direction ) {
      $element.scrollToTop( {
        direction: direction,
        speed: scrollSpeed,
        ease: settings.scroll,
        start: settings.distanceLength,
        stbb: settings.buttonMode,
        flipDistance: settings.flipDistanceLength,
        transparency: settings.notActiveButtonOpacity,
      } );
    }

    /**
     * If user has set transparency to 0, both buttons will appear when hovering over one in “dual arrows” mode.
     *
     * @param {jQuery} $thisButton - The button being hovered over.
     * @param {jQuery} $otherButton - The other button.
     */

    function handleInvisibleDualArrowsMouseenter( $thisButton, $otherButton ) {
      if ( sttb.getScrollTop() >= settings.distanceLength ) {
        $thisButton.stop();
        $otherButton.stop();
        $thisButton.stop().fadeTo( 'fast', 1.0 );
        $otherButton.stop().fadeTo( 'fast', 0.5 );
      }
    }

    /**
     * If user has set transparency to 0, both buttons will disappear when hovering out one in “dual arrows” mode.
     */

    function handleInvisibleDualArrowsMouseleave() {
      if ( sttb.getScrollTop() >= settings.distanceLength ) {
        const opacity = settings.notActiveButtonOpacity;

        $button.fadeTo( 'medium', opacity );
        $button2.fadeTo( 'medium', opacity );
      }
    }

    /**
     * Fade in the button on hover over.
     *
     * @param {jQuery} $thisButton - The button being hovered over.
     */

    function handleNonOpaqueSingleArrowMouseenter( $thisButton ) {
      if ( sttb.getScrollTop() >= settings.distanceLength ) {
        $thisButton.stop().fadeTo( 'fast', 1.0 );
      }
    }

    /**
     * Fade out the button on hover out.
     *
     * @param {jQuery} $thisButton - The button being hovered out.
     */

    function handleNonOpaqueSingleArrowMouseleave( $thisButton ) {
      if ( sttb.getScrollTop() >= settings.distanceLength ) {
        $thisButton.stop().fadeTo( 'medium', settings.notActiveButtonOpacity );
      }
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
     * Check whether user chose to use the flip (between top and bottom) mode.
     *
     * @param {string} buttonMode
     * @return {boolean}
     */

    function isFlipMode( buttonMode ) {
      return buttonMode === MODE_FLIP;
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
