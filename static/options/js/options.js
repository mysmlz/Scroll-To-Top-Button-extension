( function() {
  'use strict';

  const options = document.getElementsByClassName( 'optionsChanger' );
  const optionsCount = options.length;
  const buttonMode = document.getElementById( 'buttonMode' );
  const distanceType = document.getElementById( 'distanceType' );
  const status = document.getElementById( 'status' );
  const statusOptionsSaved = browser.i18n.getMessage( 'optionsSaved' );
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
    document.getElementById( 'settingsForm' ).addEventListener( 'submit', handleFormSubmit );
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
      scrollDownSpeed: 1000,
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
      scrollDownSpeed: 1000,
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
      const settings = {};
      const target = event.target;

      settings[ target.id ] = target.value;

      setSettings( settings );
    }
  }

  /**
   * Get the current values of all the settings.
   *
   * @param {Event} event
   */

  function handleFormSubmit( event ) {
    event.preventDefault();

    const settings = {};

    for ( let i = 0, l = optionsCount; i < l; i++ ) {
      const option = options[ i ];

      settings[ option.id ] = option.value;
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
    distanceType.textContent = browser.i18n.getMessage( type );
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
    element.closest( '.settingContainer' ).hidden = ! show;
  }
} )();
