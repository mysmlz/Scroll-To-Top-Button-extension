( function() {
  'use strict';

  const form = document.getElementById( 'settingsForm' );
  const SETTING_CONTAINER_SELECTOR = '.settingContainer';
  const options = document.getElementsByClassName( 'optionsChanger' );
  const optionsCount = options.length;
  const SCROLL_UP_SPEED_ID = 'scrollUpSpeed';
  const SCROLL_DOWN_SPEED_ID = 'scrollDownSpeed';
  const SCROLL_SPEED_CUSTOM_ID_SUFFIX = 'Custom';
  const SCROLL_SPEED_CUSTOM_CLASS = 'custom';
  const SCROLL_SPEED_CUSTOM_VALUE_INDICATOR = '-1';
  const buttonMode = document.getElementById( 'buttonMode' );
  const distanceType = document.getElementById( 'distanceType' );
  const status = document.getElementById( 'status' );
  const statusOptionsSaved = poziworldExtension.i18n.getMessage( 'optionsSaved' );
  let statusTimeoutId;
  const STATUS_TIMEOUT_DELAY = 3000;

  init();

  /**
   * Initialize all the logic.
   */

  function init() {
    poziworldExtension.page.init( 'options' );
    getSettings();
    applyUi();
    setLinks();
    addListeners();
  }

  /**
   * Retrieve the settings from the Storage.
   */

  function getSettings() {
    poziworldExtension.utils.getSettings( 'getSettings', updateSelectedOptions );
  }

  /**
   * Apply the appropriate styles when needed.
   */

  function applyUi() {
    if ( boolConstUseOptionsUi ) {
      document.body.classList.add( 'newUi' );
    }
  }

  /**
   * Translations contain <a /> elements, but href attributes aren't specified there.
   */

  function setLinks() {
    const links = [
      [
        'translateLink',
        'https://www.transifex.com/poziworld/scroll-to-top-button/'
      ],
      [
        'releaseLink',
        'https://github.com/PoziWorld/Scroll-to-Top-Button-Extension/releases'
      ],
      [
        'officialWebsiteLink',
        'https://scroll-to-top-button.com'
      ]
    ];

    poziworldExtension.page.setLinks( links );
    poziworldExtension.incentive.setLinks();

    const translatedBy = document.getElementById( 'translatedBy' );
    const rateLink = document.getElementById( 'rateLink' );

    if ( translatedBy && translatedBy.textContent.length > 1 ) {
      translatedBy.hidden = false;
    }

    if ( rateLink ) {
      let strRateLink = 'https://chrome.google.com/webstore/detail/scroll-to-top-button/chinfkfmaefdlchhempbfgbdagheknoj/reviews';

      // Show appropriate link for Opera (snippet from http://stackoverflow.com/a/9851769)
      if ( ( !! window.opr && !! opr.addons ) || !! window.opera || navigator.userAgent.indexOf( ' OPR/' ) >= 0 ) {
        strRateLink = 'https://addons.opera.com/extensions/details/scroll-to-top-button/';
      }
      // Firefox
      else if ( typeof InstallTrigger !== 'undefined' ) {
        strRateLink = 'https://addons.mozilla.org/firefox/addon/scroll-to-top-button-extension/';
      }
      // Edge
      else if ( !! window.StyleMedia ) {
        strRateLink = 'https://www.microsoft.com/store/apps/9NS5KGBDLNGZ';
      }

      document.getElementById( 'rateLink' ).href = strRateLink;
    }
  }

  /**
   * Add the appropriate event listeners for the form elements.
   */

  function addListeners() {
    for ( let i = 0, l = optionsCount; i < l; i++ ) {
      const option = options[ i ];

      option.addEventListener( 'change', handleOptionChange );
      option.addEventListener( 'blur', handleOptionChange );
    }

    buttonMode.addEventListener( 'change', checkMode );
    document.getElementById( 'restore' ).addEventListener( 'click', restoreDefaultSettings );
    document.getElementById( 'author' ).addEventListener( 'click', setOriginalAuthorSettings );
    document.getElementById( 'save' ).addEventListener( 'click', handleFormSubmit );
    form.addEventListener( 'submit', handleFormSubmit );
  }

  /**
   * Restore the settings to the state as if the extension was just installed for the first time.
   *
   * @param {Event} event
   */

  function restoreDefaultSettings( event ) {
    event.preventDefault();

    const settings = {
      buttonMode: 'off',
      scrollUpSpeed: 1000,
      scrollUpSpeedCustom: 1000,
      scrollDownSpeed: 1000,
      scrollDownSpeedCustom: 1000,
      distanceLength: 400,
      buttonSize: '50px',
      buttonDesign: 'arrow_blue',
      buttonLocation: 'TR',
      notActiveButtonOpacity: '0.5',
      keyboardShortcuts: 'arrows',
      contextMenu: 'on',
      homeEndKeysControlledBy: 'sttb',
      scroll: 'jswing'
    };

    setSettings( settings, true );
  }

  /**
   * Set original author's favorite settings.
   *
   * @param {Event} event
   */

  function setOriginalAuthorSettings( event ) {
    event.preventDefault();

    const settings = {
      buttonMode: 'dual',
      scrollUpSpeed: 1000,
      scrollUpSpeedCustom: 1000,
      scrollDownSpeed: 1000,
      scrollDownSpeedCustom: 1000,
      distanceLength: 400,
      buttonSize: '50px',
      buttonDesign: 'arrow_only_blue',
      buttonLocation: 'CR',
      notActiveButtonOpacity: '0.5',
      keyboardShortcuts: 'arrows',
      contextMenu: 'on',
      homeEndKeysControlledBy: 'sttb',
      scroll: 'jswing'
    };

    setSettings( settings, true );
  }

  /**
   * Set the values of the dropdowns to the specified ones.
   *
   * @param {Object} settings - Key-value pairs of the main extension settings (the ones set on the Options page).
   */

  function updateSelectedOptions( settings ) {
    if ( poziworldExtension.utils.isType( settings, 'object' ) && ! Global.isEmpty( settings ) ) {
      let updatedSettingsCounter = 0;

      for ( const settingKey in settings ) {
        if ( settings.hasOwnProperty( settingKey ) ) {
          const setting = document.getElementById( settingKey );

          if ( setting ) {
            setting.value = settings[ settingKey ];

            updatedSettingsCounter++;
          }
        }
      }

      if ( updatedSettingsCounter ) {
        checkMode();
        switchCustomOptionsVisibility();
      }
    }
  }

  /**
   * Save the current value of the setting.
   *
   * @param {Event} event
   */

  function handleOptionChange( event ) {
    if ( event ) {
      const target = event.target;
      const id = target.id;

      if ( id === SCROLL_UP_SPEED_ID || id === SCROLL_DOWN_SPEED_ID ) {
        switchCustomOptionVisibility( id, target );
      }
      else if ( target.classList.contains( SCROLL_SPEED_CUSTOM_CLASS ) && ! checkFormValidity() ) {
        return;
      }

      handleFormSubmit();
    }
  }

  /**
   * Show custom value fields only when user chose to specify them instead of selecting pre-set values.
   */

  function switchCustomOptionsVisibility() {
    const optionIds = [
      SCROLL_UP_SPEED_ID,
      SCROLL_DOWN_SPEED_ID
    ];

    for ( let i = 0, l = optionIds.length; i < l; i++ ) {
      switchCustomOptionVisibility( optionIds[ i ] );
    }
  }

  /**
   * Show custom value field only when user chose to specify its value instead of selecting a pre-set one.
   *
   * @param {string} id - The ID of the element.
   * @param {EventTarget} [element] - The element which the custom value field is related to.
   */

  function switchCustomOptionVisibility( id, element ) {
    if ( ! document.contains( element ) ) {
      element = document.getElementById( id );
    }

    const customElement = document.getElementById( id + SCROLL_SPEED_CUSTOM_ID_SUFFIX );
    const hidden = ( element.value !== SCROLL_SPEED_CUSTOM_VALUE_INDICATOR );

    customElement.closest( SETTING_CONTAINER_SELECTOR ).hidden = hidden;
    customElement.required = ! hidden;
  }

  /**
   * Verify form fields values match patterns (if any).
   *
   * @return {boolean}
   */

  function checkFormValidity() {
    if ( ! form.checkValidity() ) {
      form.reportValidity();

      return false;
    }

    return true;
  }

  /**
   * Get the current values of all the settings.
   *
   * @param {Event} [event]
   */

  function handleFormSubmit( event ) {
    if ( event ) {
      event.preventDefault();
    }

    const settings = {};

    for ( let i = 0, l = optionsCount; i < l; i++ ) {
      const option = options[ i ];
      const id = option.id;
      const value = option.value;

      if ( value !== SCROLL_SPEED_CUSTOM_VALUE_INDICATOR || document.getElementById( id + SCROLL_SPEED_CUSTOM_ID_SUFFIX ).value !== '' ) {
        settings[ id ] = value;
      }
      else {
        form.reportValidity();

        return;
      }
    }

    setSettings( settings );
  }

  /**
   * Save the settings in the Storage.
   *
   * @param {Object} settings - Key-value pairs of the main extension settings (the ones set on the Options page).
   * @param {boolean} [refreshForm] - If the settings are being changed by a reset, update form values.
   */

  function setSettings( settings, refreshForm ) {
    if ( poziworldExtension.utils.isType( settings, 'object' ) && ! Global.isEmpty( settings ) ) {
      poziworldExtension.utils.setSettings(
        settings,
        'setSettings',
        handleSetSettingsSuccess.bind( null, settings, refreshForm )
      );

      if ( poziworldExtension.utils.isType( settings.contextMenu, 'string' ) ) {
        sttb.contextMenus.enableOrDisable( settings );
      }
    }
  }

  /**
   * Let user know the settings have been saved.
   *
   * @param {Object} settings - Key-value pairs of the main extension settings (the ones set on the Options page).
   * @param {boolean} [refreshForm] - If the settings are being changed by a reset, update form values.
   */

  function handleSetSettingsSuccess( settings, refreshForm ) {
    setStatus( statusOptionsSaved );

    window.clearTimeout( statusTimeoutId );
    statusTimeoutId = window.setTimeout( clearStatus, STATUS_TIMEOUT_DELAY );

    checkMode();

    if ( refreshForm ) {
      updateSelectedOptions( settings );
    }
  }

  /**
   * Message to display to user in regards to the form changes.
   *
   * @param {string} message
   */

  function setStatus( message ) {
    status.textContent = message;
  }

  /**
   * Clear status message after the preset delay.
   */

  function clearStatus() {
    setStatus( '' );
  }

  /**
   * Show only the settings related to the selected mode.
   */

  function checkMode() {
    const mode = buttonMode.value;

    switch ( mode ) {
      case 'flip':
        changeDistanceType( 'flipDistance' );
        switchElements(
          [
            '#checkMode',
            '#distanceLength',
            '.appearance',
            '#scrollDownSpeed',
          ],
          true
        );

        break;

      case 'dual':
        switchElements(
          [
            '#checkMode',
            '#distanceLength'
          ],
          false
        );
        switchElements(
          [
            '.appearance',
            '#scrollDownSpeed',
          ],
          true
        );

        break;

      case 'keys':
        switchElements(
          [
            '#checkMode',
            '#distanceLength',
            '.appearance'
          ],
          false
        );
        switchElements(
          [
            '#scrollDownSpeed'
          ],
          true
        );

        break;

      default:
        changeDistanceType( 'appearDistance' );
        switchElements(
          [
            '#checkMode',
            '#distanceLength',
            '.appearance'
          ],
          true
        );
        switchElements(
          [
            '#scrollDownSpeed'
          ],
          false
        );

        break;
    }
  }

  /**
   * Show whether the flip or appear distance is currently applicable.
   *
   * @param {string} type - A messages.json key.
   */

  function changeDistanceType( type ) {
    distanceType.textContent = poziworldExtension.i18n.getMessage( type );
  }

  /**
   * Show or hide elements of the provided selectors.
   *
   * @param {string[]} selectors
   * @param {boolean} show
   */

  function switchElements( selectors, show ) {
    if ( Array.isArray( selectors ) ) {
      const selector = selectors.join( ', ' );

      document.querySelectorAll( selector ).forEach( switchElement.bind( null, show ) );
    }
  }

  /**
   * Show or hide the specified element.
   *
   * @param {HTMLElement} element
   * @param {boolean} show
   */

  function switchElement( show, element ) {
    element.closest( SETTING_CONTAINER_SELECTOR ).hidden = ! show;
  }
} )();
