import 'dom4';

import './options.css';

import utils from 'Shared/utils';
import * as permissions from 'Shared/permissions';
import * as settings from 'Shared/settings';

const browserTypeIsFirefox = window.navigator.userAgent.includes( ' Firefox/' );
const NOT_READY_CLASS = 'waitingForJs';
const form = document.getElementById( 'settingsForm' );
const SETTING_SECTION_CONTAINER_SELECTOR = '.pwFormGroup';
const SETTING_CONTAINER_SELECTOR = '.pwFormRow';
const options = Array.from( document.getElementsByClassName( 'optionsChanger' ) );
const CUSTOMIZABLE_OPTION_ATTRIBUTE_NAME = 'data-customizable';
const CUSTOMIZABLE_OPTION_ATTRIBUTE_VALUE = 1;
const CUSTOMIZABLE_OPTION_SELECTOR = '[' + CUSTOMIZABLE_OPTION_ATTRIBUTE_NAME + '="' + CUSTOMIZABLE_OPTION_ATTRIBUTE_VALUE + '"]';
const CUSTOM_OPTION_CLASS = 'custom';
const CUSTOM_OPTION_SELECTOR = '.' + CUSTOM_OPTION_CLASS;
const CUSTOM_VALUE_INDICATOR = '-1';
const buttonMode = document.getElementById( 'buttonMode' );
let buttonModeCachedValue;
const buttonModeExpertGroup = document.getElementById( 'buttonModeExpertGroup' );
const enableExpertButtonModesCta = document.getElementById( 'enableExpertButtonModesCta' );
const disableExpertButtonModesCta = document.getElementById( 'disableExpertButtonModesCta' );
const permissionsPrivacyDetailsContainer = document.getElementById( 'permissionsPrivacyDetailsContainer' );
const distanceType = document.getElementById( 'distanceType' );
const UI_LANGUAGE_ID = 'uiLanguage';
const uiLanguage = document.getElementById( UI_LANGUAGE_ID );
const status = document.getElementById( 'status' );
let statusOptionsSaved;
let statusTimeoutId;
const STATUS_TIMEOUT_DELAY = 3000;
let originalSettings;

let permissionsGranted;

init();

/**
 * Initialize all the logic.
 */

function init() {
  setBrowserSpecificI18n();
  poziworldExtension.page.init( 'options' )
    .then( permissions.hasPermissions )
    .then( cachePermissionsCheckResult )
    .then( getSettings )
    .then( cacheMessages )
    .then( setLinks )
    .then( sortLanguages )
    .then( setDocumentLanguage );

  addListeners();
}

/**
 *
 */

function setBrowserSpecificI18n() {
  const BROWSER_TYPE_PLACEHOLDER = '%BROWSER_TYPE%';
  const browserType = getPermissionsRelatedBrowserType();
  const browserSpecificI18nElements = [
    ...document.querySelectorAll( `[data-i18n-parameters$="${ BROWSER_TYPE_PLACEHOLDER }"]` ),
  ];

  for ( let element of browserSpecificI18nElements ) {
    const currentValue = element.getAttribute( 'data-i18n-parameters' );
    const newValue = currentValue.replace( BROWSER_TYPE_PLACEHOLDER, browserType );

    element.setAttribute( 'data-i18n-parameters', newValue );
  }
}

/**
 * Between the supported browsers, all/most Chromium-based ones have the same permission messaging. And Firefox-based one have the same permission messaging.
 *
 * @todo Replace with UA-CH when userAgent can no longer be trusted. {@link https://groups.google.com/a/chromium.org/forum/#!msg/blink-dev/-2JIRNMWJ7s/yHe4tQNLCgAJ}
 */

function getPermissionsRelatedBrowserType() {
  if ( browserTypeIsFirefox ) {
    return 'Firefox';
  }

  return 'Chromium';
}

/**
 * Save whether the permissions required for the advanced button modes had been granted.
 *
 * @param {boolean} granted
 */

function cachePermissionsCheckResult( granted ) {
  permissionsGranted = granted;
}

async function setUi() {
  setButtonModesControllingCtasState();
  await setHadVersion8InstalledBeforeMessageVisibility();
  signalPageReady();
}

function setButtonModesControllingCtasState() {
  if ( ! buttonModeExpertGroup || ! enableExpertButtonModesCta || ! disableExpertButtonModesCta ) {
    return;
  }

  // @todo Optimize.
  if ( permissionsGranted ) {
    buttonModeExpertGroup.disabled = false;
    enableExpertButtonModesCta.hidden = true;
    enableExpertButtonModesCta.removeEventListener( 'click', requestPermissions );
    disableExpertButtonModesCta.hidden = false;
    disableExpertButtonModesCta.addEventListener( 'click', revokePermissions );
  }
  else {
    buttonModeExpertGroup.disabled = true;
    disableExpertButtonModesCta.hidden = true;
    disableExpertButtonModesCta.removeEventListener( 'click', revokePermissions );
    enableExpertButtonModesCta.hidden = false;
    enableExpertButtonModesCta.addEventListener( 'click', requestPermissions );

    const event = new Event( 'change' );
    const buttonModeValue = buttonMode.value;

    if ( settings.isExpertButtonMode( buttonModeValue ) ) {
      buttonMode.value = settings.getExpertModeReplacement( buttonModeValue );
      buttonMode.dispatchEvent( event );
    }
  }
}

async function setHadVersion8InstalledBeforeMessageVisibility() {
  const hadVersion8InstalledBeforeMessage = document.getElementById( 'hadVersion8InstalledBeforeMessage' );

  if ( hadVersion8InstalledBeforeMessage ) {
    hadVersion8InstalledBeforeMessage.hidden = ! await settings.hadVersion8InstalledBefore() || await settings.haveGrantedPermissionsAtLeastOnce();
  }
}

async function requestPermissions( event ) {
  event.preventDefault();

  togglePermissionsPrivacyDetails();

  const granted = await browser.permissions.request( permissions.ADVANCED_BUTTON_MODES_PERMISSIONS );

  handlePermissionsRequestResult( granted );
}

function togglePermissionsPrivacyDetails() {
  const hidden = permissionsPrivacyDetailsContainer.hidden;

  // Always reset the scrolling position of this takeover/modal.
  permissionsPrivacyDetailsContainer.scrollTop = 0;
  permissionsPrivacyDetailsContainer.hidden = ! hidden;
  document.body.setAttribute( 'data-takeover-active', hidden );
}

async function handlePermissionsRequestResult( granted ) {
  cachePermissionsCheckResult( granted );
  setButtonModesControllingCtasState();

  if ( granted ) {
    await rememberGrantedAtLeastOnce( granted );
    await setHadVersion8InstalledBeforeMessageVisibility();
    reloadExtensionOnPermissionChange();
  }

  togglePermissionsPrivacyDetails();
}

async function rememberGrantedAtLeastOnce( granted ) {
  try {
    await browser.storage.local.set( {
      [ settings.HAVE_GRANTED_PERMISSIONS_AT_LEAST_ONCE_KEY ]: granted,
    } );
  }
  catch ( error ) {
    // @todo
  }
}

function revokePermissions( event ) {
  event.preventDefault();

  browser.permissions.remove( permissions.ADVANCED_BUTTON_MODES_PERMISSIONS )
    .then( handlePermissionsRevocationResult );
}

function handlePermissionsRevocationResult( revoked ) {
  cachePermissionsCheckResult( ! revoked );
  setButtonModesControllingCtasState();

  if ( revoked ) {
    reloadExtensionOnPermissionChange();
  }
}

/**
 * In Firefox, permissions listeners aren't available. In Chrome, they reconfigure the extension on the fly.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/permissions}
 */

function reloadExtensionOnPermissionChange() {
  if ( browserTypeIsFirefox ) {
    reloadExtension();
  }
}

async function reloadExtension() {
  await poziworldExtension.i18n.init();

  if ( window.confirm( poziworldExtension.i18n.getMessage( 'extensionReloadConfirmationMessage' ) ) ) {
    browser.runtime.reload();
  }
}

/**
 * To avoid requesting localization of some status messages multiples times, request once and save.
 */

function cacheMessages() {
  statusOptionsSaved = poziworldExtension.i18n.getMessage( 'optionsSaved' );
}

/**
 * Retrieve the settings from the Storage.
 */

function getSettings() {
  poziworldExtension.utils.getSettings( 'getSettings', handleGotSettings );
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
    else if ( utils.isEdge() ) {
      strRateLink = 'https://www.trustpilot.com/review/scroll-to-top-button.com';
    }

    document.getElementById( 'rateLink' ).href = strRateLink;
  }
}

/**
 * In the markup, languages are sorted by language codes.
 * When showing to user, sort by language names in the current language.
 */

function sortLanguages() {
  if ( uiLanguage ) {
    const currentLanguage = uiLanguage.value;
    const languages = Array.from( uiLanguage.children );
    // Keep “Automatic (browser default)” always first in the sorted list
    const automaticLanguage = languages.shift();

    languages.sort( sortByTextContent );

    const sortedLanguages = [ automaticLanguage ].concat( languages );

    uiLanguage.innerHTML = '';

    while ( sortedLanguages.length ) {
      uiLanguage.append( sortedLanguages.shift() );
    }

    // Once sorted, the last option gets selected, if the language hasn't been previously set
    uiLanguage.value = currentLanguage;
  }
}

/**
 * Add the appropriate event listeners for the form elements.
 */

function addListeners() {
  options.forEach( addOptionChangeListener );

  buttonMode.addEventListener( 'change', checkMode );
  document.getElementById( 'restore' ).addEventListener( 'click', restoreDefaultSettings );
  document.getElementById( 'author' ).addEventListener( 'click', setOriginalAuthorSettings );
  document.getElementById( 'save' ).addEventListener( 'click', handleFormSubmit );
  form.addEventListener( 'submit', handleFormSubmit );
}

/**
 * Listen for setting changes.
 *
 * @param {HTMLElement} element
 */

function addOptionChangeListener( element ) {
  element.addEventListener( 'change', handleOptionChange );
  element.addEventListener( 'blur', handleOptionChange );
}

/**
 * Restore the settings to the state as if the extension was just installed for the first time.
 *
 * @param {Event} event
 */

function restoreDefaultSettings( event ) {
  event.preventDefault();

  /**
   * @todo Have one source of truth (make all places reference the same settings object).
   */

  const settings = {
    buttonMode: settings.SCROLL_TO_TOP_ONLY_EXPERT_BUTTON_MODE,
    scrollUpSpeed: 1000,
    scrollUpSpeedCustom: 1000,
    scrollDownSpeed: 1000,
    scrollDownSpeedCustom: 1000,
    distanceLength: 400,
    buttonSize: '50px',
    buttonWidthCustom: 60,
    buttonHeightCustom: 60,
    buttonDesign: 'arrow_blue',
    buttonLocation: 'TR',
    notActiveButtonOpacity: '0.5',
    keyboardShortcuts: 'arrows',
    contextMenu: 'on',
    homeEndKeysControlledBy: 'sttb',
    clickthroughKeys: 'ctrl|shift',
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
    buttonMode: settings.DUAL_ARROWS_EXPERT_BUTTON_MODE,
    scrollUpSpeed: 1000,
    scrollUpSpeedCustom: 1000,
    scrollDownSpeed: 1000,
    scrollDownSpeedCustom: 1000,
    distanceLength: 400,
    buttonSize: '50px',
    buttonWidthCustom: 60,
    buttonHeightCustom: 60,
    buttonDesign: 'arrow_only_blue',
    buttonLocation: 'CR',
    notActiveButtonOpacity: '0.5',
    keyboardShortcuts: 'arrows',
    contextMenu: 'on',
    homeEndKeysControlledBy: 'sttb',
    clickthroughKeys: 'ctrl|shift',
    scroll: 'jswing'
  };

  setSettings( settings, true );
}

/**
 * The settings from the Storage are retrived, proceed.
 *
 * @param {Object} settings - Key-value pairs of the main extension settings (the ones set on the Options page).
 */

function handleGotSettings( settings ) {
  if ( poziworldExtension.utils.isType( settings, 'object' ) && ! Global.isEmpty( settings ) ) {
    setOriginalSettings( settings );
    updateSelectedOptions( settings );

    // @todo Move out.
    buttonModeCachedValue = settings.buttonMode;
  }

  setUi();
}

/**
 * Remember what settings values were on page load.
 *
 * @param {Object} settings - Key-value pairs of the main extension settings (the ones set on the Options page).
 */

function setOriginalSettings( settings ) {
  if ( poziworldExtension.utils.isType( settings, 'object' ) && ! Global.isEmpty( settings ) ) {
    originalSettings = settings;
  }
}

/**
 * Remind what settings values were on page load.
 *
 * @return {Object} settings - Key-value pairs of the main extension settings (the ones set on the Options page).
 */

function getOriginalSettings() {
  return originalSettings;
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
    const element = event.target;
    const customizable = Boolean( Number( element.getAttribute( CUSTOMIZABLE_OPTION_ATTRIBUTE_NAME ) ) );

    if ( customizable ) {
      switchCustomOptionVisibility( element );
    }
    else if ( element.classList.contains( CUSTOM_OPTION_CLASS ) && ! checkFormValidity() ) {
      return;
    }

    handleFormSubmit();
  }
}

/**
 * Show custom value fields only when user chose to specify them instead of selecting pre-set values.
 */

function switchCustomOptionsVisibility() {
  document.querySelectorAll( CUSTOMIZABLE_OPTION_SELECTOR ).forEach( switchCustomOptionVisibility );
}

/**
 * Show custom value field only when user chose to specify its value instead of selecting a pre-set one.
 *
 * @param {EventTarget} element - The element which the custom value field is related to.
 */

function switchCustomOptionVisibility( element ) {
  const customOptionNotApplicable = ( element.value !== CUSTOM_VALUE_INDICATOR );

  getCustomElements( element ).forEach( toggleElementActiveState.bind( null, customOptionNotApplicable ) );
}

/**
 * Show/hide the custom setting when appropriate.
 *
 * @param {boolean} customOptionNotApplicable
 * @param {HTMLElement} element
 */

function toggleElementActiveState( customOptionNotApplicable, element ) {
    element.closest( SETTING_CONTAINER_SELECTOR ).hidden = customOptionNotApplicable;
    element.required = ! customOptionNotApplicable;
}

/**
 * Find custom settings' elements for the specified element.
 *
 * @param {EventTarget} element
 * @return {HTMLElement[]}
 */

function getCustomElements( element ) {
  return Array.from( getSettingContainer( element ).querySelectorAll( CUSTOM_OPTION_SELECTOR ) );
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
  const optionsTemp = Array.from( options );

  while ( optionsTemp.length ) {
    const option = optionsTemp.shift();
    const id = option.id;
    const value = option.value;

    if ( value !== CUSTOM_VALUE_INDICATOR || hasSetCustomValues( option ) ) {
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
 * If the setting is set to use custom value(s), make sure that custom value(s) is set.
 *
 * @param {HTMLElement} element
 * @return {boolean}
 */

function hasSetCustomValues( element ) {
  const customElements = getCustomElements( element );

  while ( customElements.length ) {
    const customElement = customElements.shift();

    if ( ! poziworldExtension.utils.isNonEmptyString( customElement.value ) ) {
      return false;
    }
  }

  return true;
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
      sttb.contextMenus.toggle( settings );
    }
  }
}

/**
 * Let user know the settings have been saved.
 *
 * @param {Object} settings - Key-value pairs of the main extension settings (the ones set on the Options page).
 * @param {boolean} [refreshForm] - If the settings are being changed by a reset, update form values.
 */

async function handleSetSettingsSuccess( settings, refreshForm ) {
  setStatus( statusOptionsSaved );

  window.clearTimeout( statusTimeoutId );
  statusTimeoutId = window.setTimeout( clearStatus, STATUS_TIMEOUT_DELAY );

  checkMode();

  if ( refreshForm ) {
    updateSelectedOptions( settings );
  }

  if ( isLanguageBeingChanged( settings ) || isButtonModeGroupBeingChanged( settings ) ) {
    await reloadExtension();
    window.close();
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

  // @todo Optimize.
  switch ( mode ) {
    case settings.SCROLL_TO_TOP_ONLY_BASIC_BUTTON_MODE:
    case settings.SCROLL_TO_TOP_ONLY_ADVANCED_BUTTON_MODE:
    case settings.FLIP_ADVANCED_BUTTON_MODE:
    case settings.DUAL_ARROWS_ADVANCED_BUTTON_MODE:
    {
      switchElements(
        [
          '#scrollUpSpeed',
          '#scrollDownSpeed',
          '#distanceLength',
          '.appearance',
          '#clickthroughKeys',
          '#keyboard-settings',
          '#settingsOverrideCtasContainer',
        ],
        false
      );

      break;
    }

    case settings.FLIP_EXPERT_BUTTON_MODE: {
      changeDistanceType( 'flipDistance' );
      switchElements(
        [
          '#distanceLength',
          '.appearance',
          '#scrollDownSpeed',
          '#clickthroughKeys',
          '#keyboard-settings',
          '#settingsOverrideCtasContainer',
        ],
        true
      );

      break;
    }

    case settings.DUAL_ARROWS_EXPERT_BUTTON_MODE: {
      switchElements(
        [
          '#distanceLength',
        ],
        false
      );
      switchElements(
        [
          '.appearance',
          '#scrollUpSpeed',
          '#scrollDownSpeed',
          '#clickthroughKeys',
          '#keyboard-settings',
          '#settingsOverrideCtasContainer',
        ],
        true
      );

      break;
    }

    case 'keys': {
      switchElements(
        [
          '#distanceLength',
          '.appearance',
          '#clickthroughKeys',
        ],
        false
      );
      switchElements(
        [
          '#scrollDownSpeed',
          '#keyboard-settings',
          '#settingsOverrideCtasContainer',
        ],
        true
      );

      break;
    }

    case settings.SCROLL_TO_TOP_ONLY_EXPERT_BUTTON_MODE: {
      changeDistanceType( 'appearDistance' );
      switchElements(
        [
          '#distanceLength',
          '.appearance',
          '#clickthroughKeys',
          '#keyboard-settings',
          '#settingsOverrideCtasContainer',
        ],
        true
      );
      switchElements(
        [
          '#scrollDownSpeed',
        ],
        false
      );

      break;
    }
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
  getSettingContainer( element ).hidden = ! show;
}

/**
 * Find the setting (option + its custom options) container.
 *
 * @param {HTMLElement} element
 * @return {HTMLElement} element
 */

function getSettingContainer( element ) {
  return element.closest( SETTING_CONTAINER_SELECTOR ) || element.closest( SETTING_SECTION_CONTAINER_SELECTOR );
}

/**
 * If page waited for JavaScript to show content, signal it's now ready.
 */

function signalPageReady() {
  document.body.classList.remove( NOT_READY_CLASS );
}

/**
 * Set lang attribute value on <html />.
 */

function setDocumentLanguage() {
  const i18n = window.i18next;

  if ( i18n ) {
    const language = i18n.language;

    if ( poziworldExtension.utils.isNonEmptyString( language ) ) {
      const PLATFORM_LANGUAGE_SEPARATOR = '_';
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang#Language_tag_syntax
      const LANGUAGE_TAG_SEPARATOR = '-';

      document.documentElement.lang = language.replace( PLATFORM_LANGUAGE_SEPARATOR, LANGUAGE_TAG_SEPARATOR );
    }
  }
}

/**
 * Check whether a new language has been chosen.
 *
 * @param {Object} settings - Key-value pairs of the main extension settings (the ones set on the Options page).
 * @return {boolean}
 */

function isLanguageBeingChanged( settings ) {
  const newUiLanguage = settings.uiLanguage;

  if ( poziworldExtension.utils.isNonEmptyString( newUiLanguage ) ) {
    return newUiLanguage !== getOriginalSettings().uiLanguage;
  }

  return false;
}

/**
 * Check whether the newly chosen button mode is from another group (basic, advanced, expert).
 *
 * @param {object} newSettings - Key-value pairs of the main extension settings (the ones set on the Options page).
 * @returns {boolean}
 */

function isButtonModeGroupBeingChanged( newSettings ) {
  const newButtonMode = newSettings.buttonMode;

  return ( poziworldExtension.utils.isNonEmptyString( newButtonMode ) && (
    // @todo Optimize.
    settings.isBasicButtonMode( newButtonMode ) && ! settings.isBasicButtonMode( buttonModeCachedValue ) ||
    ! settings.isBasicButtonMode( newButtonMode ) && settings.isBasicButtonMode( buttonModeCachedValue ) ||
    settings.isAdvancedButtonMode( newButtonMode ) && ! settings.isAdvancedButtonMode( buttonModeCachedValue ) ||
    ! settings.isAdvancedButtonMode( newButtonMode ) && settings.isAdvancedButtonMode( buttonModeCachedValue ) ||
    settings.isExpertButtonMode( newButtonMode ) && ! settings.isExpertButtonMode( buttonModeCachedValue ) ||
    ! settings.isExpertButtonMode( newButtonMode ) && settings.isExpertButtonMode( buttonModeCachedValue )
  ) );
}

/**
 * Sort Nodes by their text content.
 *
 * @param {Node} a
 * @param {Node} b
 * @return {number}
 */

function sortByTextContent( a, b ) {
  const aTextContent = a.textContent;
  const bTextContent = b.textContent;

  if ( aTextContent < bTextContent ) {
    return -1;
  }
  else if ( aTextContent > bTextContent ) {
    return 1;
  }

  return 0;
}
