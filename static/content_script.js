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

    const STYLE_TRANSPARENT = '0.0';
    const STYLE_SEMITRANSPARENT = '0.5';
    const STYLE_OPAQUE = '1.0';
    const STYLE_ROTATED_BUTTON_DEGREE = -180;

    const KEYBOARD_SHORTCUTS_ALT_UP_DOWN_ARROWS = 'arrows';
    const KEYBOARD_SHORTCUTS_ALT_T_B = 'tb';
    const HOME_END_KEYS_CONTROLLED_BY_STTB = 'sttb';
    const CLICKTHROUGH_KEYS_DIVIDER = '|';
    const KEYPRESS_THROTTLE_DELAY = 150;

    const MOUSEMOVE_DEBOUNCE_DELAY = 200;
    const cursorPosition = {
      x: 0,
      y: 0,
    };

    const CONTAINER_TAG_NAME = 'SCROLL-TO-TOP-BUTTON-CONTAINER';
    const BUTTON_TAG_NAME = 'SCROLL-TO-TOP-BUTTON';
    const BUTTON_NUMBER_PLACEHOLDER = '$NUMBER$';
    const BUTTON_ID = 'scroll-to-top-button-' + BUTTON_NUMBER_PLACEHOLDER;
    const BUTTON_LABEL = 'Scroll To Top Button';
    const BUTTON_DISABLED_CLASS = 'disabled';
    const BUTTON_HOVERED_SELECTOR = ':hover';

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
     * @property {string} clickthroughKeys
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
      notActiveButtonOpacity: STYLE_SEMITRANSPARENT,
      keyboardShortcuts: KEYBOARD_SHORTCUTS_ALT_UP_DOWN_ARROWS,
      contextMenu: 'on',
      homeEndKeysControlledBy: HOME_END_KEYS_CONTROLLED_BY_STTB,
      clickthroughKeys: 'ctrl|shift',
      scroll: 'jswing',
    };

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
        clickthroughKeys: settingsToNormalize.clickthroughKeys,
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
      if ( ! isKeyboardOnlyMode() ) {
        createElements();
        addListeners();
        rotateButtons();
        setButtonsAction();
      }

      setKeyboardShortcuts();
    }

    /**
     * Create button(s) with the specified settings (user preferences) and add it to the page.
     */

    function createElements() {
      container = createContainer( settings.buttonLocation );
      button = createButton();
      $button = $( button );

      container.append( button );

      if ( isDualArrowsMode() ) {
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
     * Set up event listeners.
     */

    function addListeners() {
      addButtonsHoverListeners();
      addKeypressListener();
      addFullscreenchangeListener();
      addMousemoveListener();
    }

    /**
     * So that the button(s) don't catch the eye all the time, change their transparency when hovering over and out.
     */

    function addButtonsHoverListeners() {
      const opacity = settings.notActiveButtonOpacity;
      const dualArrowModeActive = isDualArrowsMode();

      if ( opacity === STYLE_TRANSPARENT && dualArrowModeActive ) {
        addInvisibleDualArrowsButtonHoverListener( $button, $button2 );
        addInvisibleDualArrowsButtonHoverListener( $button2, $button );
      }
      else if ( opacity !== STYLE_OPAQUE ) {
        addNonOpaqueSingleArrowHoverListener( $button );

        if ( dualArrowModeActive ) {
          addNonOpaqueSingleArrowHoverListener( $button2 );
        }
      }
    }

    /**
     * If transparency set to 0, both buttons appear when hovering over one in “dual arrows” mode.
     *
     * @param {jQuery} $thisButton - The button being hovered over.
     * @param {jQuery} $otherButton - The other button.
     */

    function addInvisibleDualArrowsButtonHoverListener( $thisButton, $otherButton ) {
      $thisButton.hover(
        handleInvisibleDualArrowsMouseenter.bind( null, $thisButton, $otherButton ),
        handleInvisibleDualArrowsMouseleave
      );
    }

    /**
     * The button has transparency change on mouseover.
     *
     * @param {jQuery} $thisButton - The button being hovered over.
     */

    function addNonOpaqueSingleArrowHoverListener( $thisButton ) {
      $thisButton.hover(
        handleNonOpaqueSingleArrowMouseenter.bind( null, $thisButton ),
        handleNonOpaqueSingleArrowMouseleave.bind( null, $thisButton )
      );
    }

    /**
     * Monitor key presses for presses of “clickthrough keys”.
     * Listen on window, as STTB is inserted after <body />.
     */

    function addKeypressListener() {
      const throttledKeydownHandler = throttle( handleKeydown, KEYPRESS_THROTTLE_DELAY );
      const throttledKeyupHandler = throttle( handleKeyup, KEYPRESS_THROTTLE_DELAY );

      window.addEventListener( 'keydown', throttledKeydownHandler );
      window.addEventListener( 'keyup', throttledKeyupHandler );
    }

    /**
     * Process the “keydown” event.
     *
     * @param {KeyboardEvent} event - The event.
     */

    function handleKeydown( event ) {
      if ( ! isClickthroughKeyPressed( event ) ) {
        return;
      }

      handleClickthroughKeydown( event );
    }

    /**
     * Process the “keyup” event.
     *
     * @param {KeyboardEvent} event - The event.
     */

    function handleKeyup( event ) {
      if ( isClickthroughKeyPressed( event ) ) {
        return;
      }

      handleClickthroughKeyup( event );
    }

    /**
     * If a “clickthrough key” is pressed, hide the button.
     *
     * @param {KeyboardEvent} event - The event.
     */

    function handleClickthroughKeydown( event ) {
      const buttons = [
        button,
      ];

      if ( isDualArrowsMode() ) {
        buttons.push( button2 );
      }

      while ( buttons.length ) {
        const buttonTemp = buttons.shift();

        if ( buttonTemp && isButtonHovered( buttonTemp ) ) {
          hideButton( $( buttonTemp ) );

          break;
        }
      }
    }

    /**
     * If a “clickthrough key” is unpressed, show the button.
     *
     * @param {KeyboardEvent} event - The event.
     */

    function handleClickthroughKeyup( event ) {
      const buttons = [
        button,
      ];

      if ( isDualArrowsMode() ) {
        buttons.push( button2 );
      }

      while ( buttons.length ) {
        const buttonTemp = buttons.shift();

        if ( buttonTemp && ! isButtonHovered( buttonTemp ) ) {
          showButton( $( buttonTemp ) );

          break;
        }
      }
    }

    /**
     * Monitor for a fullscreenchange event to hide the button(s), as it's most likely a video player and it doesn't need the button(s).
     */

    function addFullscreenchangeListener() {
      document.addEventListener( 'webkitfullscreenchange', handleFullscreenchangeEvent );
      document.addEventListener( 'mozfullscreenchange', handleFullscreenchangeEvent );
      document.addEventListener( 'msfullscreenchange', handleFullscreenchangeEvent );
      document.addEventListener( 'fullscreenchange', handleFullscreenchangeEvent );
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

    /**
     * Listen for the mousemove event, so when a “clickthrough key” is unpressed the “keyup” event can check the position of the cursor (not natively accessible on a key-related event) and if it's over the button then the button doesn't get shown.
     */

    function addMousemoveListener() {
      const debouncedHandler = debounce( saveCursorPosition, MOUSEMOVE_DEBOUNCE_DELAY );

      document.addEventListener( 'mousemove', debouncedHandler );
    }

    /**
     * Save the cursor position, so when a “clickthrough key” is unpressed the “keyup” event can check the position of the cursor (not natively accessible on a key-related event) and if it's over the button then the button doesn't get shown.
     *
     * @param {MouseEvent} event - The event.
     */

    function saveCursorPosition( event ) {
      cursorPosition.x = event.clientX;
      cursorPosition.y = event.clientY;
    }

    /**
     * As arrow image buttons are reused, rotate when necessary.
     */

    function rotateButtons() {
      if ( isFlipMode() ) {
        rotateButton( $button );
      }

      if ( isDualArrowsMode() ) {
        rotateButton( $button2 );
      }
    }

    /**
     * Rotate the arrow image, so it's pointing the right direction, according to its function.
     *
     * @param {jQuery} $buttonToRotate - The button being rotated.
     */

    function rotateButton( $buttonToRotate ) {
      $buttonToRotate.rotate( STYLE_ROTATED_BUTTON_DEGREE );
    }

    /**
     * Configure the buttons onclick behavior (main functionality of this extension).
     */

    function setButtonsAction() {
      setButtonAction( $button, settings.scrollUpSpeed, 'up' );

      if ( isDualArrowsMode() ) {
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
        clickthroughKeys: settings.clickthroughKeys,
      } );
    }

    /**
     * If user selected one of the predefined keyboard shortcuts, set them up.
     */

    function setKeyboardShortcuts() {
      const keyboardShortcuts = settings.keyboardShortcuts;

      if ( keyboardShortcuts === KEYBOARD_SHORTCUTS_ALT_UP_DOWN_ARROWS ) {
        shortcut.add( 'Alt+Down', scrollDown );
        shortcut.add( 'Alt+Up', scrollUp );
      }
      else if ( keyboardShortcuts === KEYBOARD_SHORTCUTS_ALT_T_B ) {
        shortcut.add( 'Alt+B', scrollDown );
        shortcut.add( 'Alt+T', scrollUp );
      }

      if ( settings.homeEndKeysControlledBy === HOME_END_KEYS_CONTROLLED_BY_STTB ) {
        const options = {
          disable_in_input: true,
        };

        shortcut.add( 'End', scrollDown, options );
        shortcut.add( 'Home', scrollUp, options );
      }
    }

    /**
     * Scroll the page down.
     */

    function scrollDown() {
      sttb.scrollDown( settings.scrollDownSpeed, settings.scroll );
    }

    /**
     * Scroll the page up.
     */

    function scrollUp() {
      sttb.scrollUp( settings.scrollUpSpeed, settings.scroll );
    }

    /**
     * If user has set transparency to 0, both buttons will appear when hovering over one in “dual arrows” mode.
     *
     * @param {jQuery} $thisButton - The button being hovered over.
     * @param {jQuery} $otherButton - The other button.
     * @param {MouseEvent} event - The event.
     */

    function handleInvisibleDualArrowsMouseenter( $thisButton, $otherButton, event ) {
      if ( isButtonHoverable() ) {
        if ( isClickthroughKeyPressed( event ) ) {
          hideButton( $thisButton );

          return;
        }

        $thisButton.stop();
        $otherButton.stop();
        $thisButton.stop().fadeTo( 'fast', STYLE_OPAQUE );
        $otherButton.stop().fadeTo( 'fast', STYLE_SEMITRANSPARENT );
      }
    }

    /**
     * If user has set transparency to 0, both buttons will disappear when hovering out one in “dual arrows” mode.
     *
     * @param {MouseEvent} event - The event.
     */

    function handleInvisibleDualArrowsMouseleave( event ) {
      if ( ! isClickthroughKeyPressed( event ) ) {
        showButton( $( event.target ) );
      }

      if ( isButtonHoverable() ) {
        const opacity = settings.notActiveButtonOpacity;

        $button.fadeTo( 'medium', opacity );
        $button2.fadeTo( 'medium', opacity );
      }
    }

    /**
     * Fade in the button on hover over.
     *
     * @param {jQuery} $thisButton - The button being hovered over.
     * @param {MouseEvent} event - The event.
     */

    function handleNonOpaqueSingleArrowMouseenter( $thisButton, event ) {
      if ( isButtonHoverable() ) {
        if ( isClickthroughKeyPressed( event ) ) {
          hideButton( $thisButton );

          return;
        }

        $thisButton.stop().fadeTo( 'fast', STYLE_OPAQUE );
      }
    }

    /**
     * Fade out the button on hover out.
     *
     * @param {jQuery} $thisButton - The button being hovered out.
     * @param {MouseEvent} event - The event.
     */

    function handleNonOpaqueSingleArrowMouseleave( $thisButton, event ) {
      if ( ! isClickthroughKeyPressed( event ) ) {
        showButton( $thisButton );
      }

      if ( isButtonHoverable() ) {
        $thisButton.stop().fadeTo( 'medium', settings.notActiveButtonOpacity );
      }
    }

    /**
     * Make the button see-through, let user click what's underneath/behind it.
     *
     * @param {jQuery} $thisButton - The button being hovered over.
     */

    function hideButton( $thisButton ) {
      $thisButton[ 0 ].classList.add( BUTTON_DISABLED_CLASS );
    }

    /**
     * Restore button state to the original.
     *
     * @param {jQuery} $thisButton - The button being hovered over.
     */

    function showButton( $thisButton ) {
      $thisButton[ 0 ].classList.remove( BUTTON_DISABLED_CLASS );
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
     * @param {string} [buttonMode]
     * @return {boolean}
     */

    function isDualArrowsMode( buttonMode ) {
      return isMode( buttonMode, MODE_DUAL_ARROWS );
    }

    /**
     * Check whether user chose to use the flip (between top and bottom) mode.
     *
     * @param {string} [buttonMode]
     * @return {boolean}
     */

    function isFlipMode( buttonMode ) {
      return isMode( buttonMode, MODE_FLIP );
    }

    /**
     * Check whether user chose to use keyboard only.
     *
     * @param {string} [buttonMode]
     * @return {boolean}
     */

    function isKeyboardOnlyMode( buttonMode ) {
      return isMode( buttonMode, MODE_KEYBOARD_ONLY );
    }

    /**
     * Check whether the mode specified in the Settings is equal to the one being checked.
     *
     * @param {string} [buttonMode] - The mode specified in settings.
     * @param {string} modeToCheck - The mode to check against.
     * @return {boolean}
     */

    function isMode( buttonMode, modeToCheck ) {
      let buttonModeTemp = buttonMode;

      if ( ! poziworldExtension.utils.isNonEmptyString( buttonMode ) ) {
        buttonModeTemp = settings.buttonMode;
      }

      return buttonModeTemp === modeToCheck;
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
     * Whether the button would be active if hovered, whether the page has been scrolled enough (equal to or more than set by “Appear distance” option).
     *
     * @return {boolean}
     */

    function isButtonHoverable() {
      return sttb.getScrollTop() >= settings.distanceLength;
    }

    /**
     * Check whether one of the “clickthrough keys” is pressed when hovering over or clicking the button.
     *
     * @param {KeyboardEvent|MouseEvent} event - The event.
     * @return {boolean}
     */

    function isClickthroughKeyPressed( event ) {
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
    }

    /**
     * Check whether the cursor is currently positioned over the button.
     *
     * @param {HTMLElement} buttonToCheck - The button in question.
     * @return {boolean}
     */

    function isButtonHovered( buttonToCheck ) {
      return buttonToCheck.matches( BUTTON_HOVERED_SELECTOR ) ||
        buttonToCheck.isSameNode( document.elementFromPoint( cursorPosition.x, cursorPosition.y ) );
    }

    /**
     * Returns a function, that, as long as it continues to be invoked, will not be triggered. The function will be called after it stops being called for N milliseconds. If `immediate` is passed, trigger the function on the leading edge, instead of the trailing.
     *
     * @see https://davidwalsh.name/javascript-debounce-function
     *
     * @param func
     * @param wait
     * @param immediate
     * @return {Function}
     */

    function debounce( func, wait, immediate ) {
      let timeout;

      return function () {
        const context = this;
        const args = arguments;
        const later = function () {
          timeout = null;

          if ( ! immediate ) {
            func.apply( context, args );
          }
        };
        const callNow = immediate && !timeout;

        clearTimeout( timeout );

        timeout = setTimeout( later, wait );

        if ( callNow ) {
          func.apply( context, args );
        }
      };
    }

    /**
     * Returns a function, that, as long as it continues to be invoked, will only trigger every N milliseconds. If `immediate` is passed, trigger the function on the leading edge, instead of the trailing.
     *
     * @see https://davidwalsh.name/javascript-debounce-function
     *
     * @param func
     * @param wait
     * @param immediate
     * @return {Function}
     */

    function throttle( func, wait, immediate ) {
      let timeout;

      return function () {
        const context = this;
        const args = arguments;
        const later = function () {
          timeout = null;

          if ( ! immediate ) {
            func.apply( context, args );
          }
        };
        const callNow = immediate && !timeout;

        if ( ! timeout ) {
          timeout = setTimeout( later, wait );
        }

        if ( callNow ) {
          func.apply( context, args );
        }
      };
    }
}
