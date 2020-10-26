import 'dom4';

import './options.css';

import utils from 'Shared/utils';
import * as i18n from 'Shared/i18n';
import * as permissions from 'Shared/permissions';
import * as settingsHelpers from 'Shared/settings';
import * as pages from 'Shared/pages';
import * as feedback from 'Shared/feedback';

import * as browsersHelpers from './browsers';
import * as i18nModule from './i18n';
import * as languagesModule from './languages';
import * as linksModule from './links';

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
const BUTTON_MODE_SELECTOR = '[name="buttonMode"]';
const BUTTON_MODE_SELECTED_SELECTOR = `${ BUTTON_MODE_SELECTOR }:checked`;
let buttonMode = document.querySelector( BUTTON_MODE_SELECTED_SELECTOR );
let buttonModeCachedValue;
const PERMISSIONS_REQUIRED_ATTRIBUTE_KEY = 'data-permissions-required';
const disableExpertButtonModesCta = document.getElementById( 'disableExpertButtonModesCta' );
const permissionsPrivacyDetailsContainer = document.getElementById( 'permissionsPrivacyDetailsContainer' );
const distanceType = document.getElementById( 'distanceType' );
const status = document.getElementById( 'status' );
let statusOptionsSaved;
let statusTimeoutId;
const STATUS_TIMEOUT_DELAY = 3000;
let originalSettings;

let permissionsGranted;
let changedElementBeingHandled;
const ELEMENT_TYPE_RADIO = 'radio';

init();

/**
 * Initialize all the logic.
 */

async function init() {
  i18nModule.setBrowserSpecificI18n();
  await pages.init( 'options' );
  cachePermissionsCheckResult( await permissions.hasPermissions() );
  setUi();
  cacheMessages();
  linksModule.setLinks();
  languagesModule.sortLanguages();
  languagesModule.setDocumentLanguage();
  addListeners();
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
  try {
    // @todo Offer user to refresh page on settingsReady in case page got opened before settings got set for the first time?
    const savedSettings = await settingsHelpers.getSettings();

    if ( settingsHelpers.isExpectedFormat( savedSettings ) ) {
      cacheSettings( savedSettings );
      updateSelectedOptions( savedSettings );
    }
  }
  catch ( error ) {
    Log.add( 'Failed to load saved settings', error, false, {
      level: 'warn',
    } );
  }

  setButtonModesControllingCtasState( true );
  await setHadVersion8InstalledBeforeMessageVisibility();
  togglePageReadyState();
}

function setButtonModesControllingCtasState( expertModeShouldBeReplaced ) {
  if ( ! disableExpertButtonModesCta ) {
    return;
  }

  // @todo Optimize.
  if ( permissionsGranted ) {
    disableExpertButtonModesCta.hidden = false;
    disableExpertButtonModesCta.addEventListener( 'click', revokePermissions );
  }
  else {
    disableExpertButtonModesCta.hidden = true;
    disableExpertButtonModesCta.removeEventListener( 'click', revokePermissions );

    const buttonModeValue = getButtonModeValue();

    if ( expertModeShouldBeReplaced && settingsHelpers.isExpertButtonMode( buttonModeValue ) ) {
      const buttonModeNewValue = settingsHelpers.getExpertModeReplacement( buttonModeValue );
      // @todo Optimize.
      const buttonModeNewElement = document.querySelector( `${ BUTTON_MODE_SELECTOR }[value="${ buttonModeNewValue }"` );

      if ( buttonModeNewElement ) {
        const event = new Event( 'change' );

        buttonMode = buttonModeNewElement;

        buttonMode.checked = true;
        buttonMode.dispatchEvent( event );
      }
    }
  }
}

async function setHadVersion8InstalledBeforeMessageVisibility() {
  const messageContainer = document.getElementById( 'hadVersion8InstalledBeforeMessageContainer' );

  if ( messageContainer ) {
    const hidden = await settingsHelpers.haveGrantedPermissionsAtLeastOnce() || await settingsHelpers.hadAskedToNotShowWarningAgain();

    if ( ! hidden ) {
      const acknowledgmentCta = document.getElementById( 'hadVersion8InstalledBeforeMessageAcknowledgmentCta' );
      const removalCta = document.getElementById( 'hadVersion8InstalledBeforeMessageRemovalCta' );
      const activeTabInfoUrlPlaceholder = messageContainer.querySelector( '[data-context="activeTabInfoUrlPlaceholder"]' );

      if ( acknowledgmentCta ) {
        acknowledgmentCta.addEventListener( 'click', () => toggleTakeover( messageContainer ) );
      }

      if ( removalCta ) {
        removalCta.addEventListener( 'click', requestToNeverShowAgain );
        removalCta.addEventListener( 'click', () => toggleTakeover( messageContainer ) );
      }

      if ( activeTabInfoUrlPlaceholder ) {
        activeTabInfoUrlPlaceholder.textContent = 'https://scroll-to-top-button.com/info/activeTab/';
      }

      toggleTakeover( messageContainer );
    }
  }
}

async function requestPermissions() {
  togglePermissionsPrivacyDetails();

  try {
    const granted = await permissions.requestPermissions();

    await handlePermissionsRequestResult( granted );

    return granted;
  }
  catch ( error ) {
    requestToReportPermissionsRequestIssue( error );

    return false;
  }
}

async function requestToReportPermissionsRequestIssue( error ) {
  const installationId = await utils.getInstallationId();
  const ISSUE_MESSAGE_JSON_KEY = 'permissionsRequestIssue';
  // Don't translate, as this gets sent to developer
  const ISSUE_TITLE = 'Permissions request issue';
  // Don't translate, as this gets sent to developer
  // @todo Move out generic error report.
  const debuggingInformation = `
Version: ${ strConstExtensionVersion }
Error: ${ JSON.stringify( error ) }
Browser: ${ window.navigator.userAgent }
Anonymous installation ID: ${ installationId }`;

  feedback.requestToReportIssue( ISSUE_MESSAGE_JSON_KEY, ISSUE_TITLE, debuggingInformation );
}

function togglePermissionsPrivacyDetails() {
  toggleTakeover( permissionsPrivacyDetailsContainer );
}

function toggleTakeover( element ) {
  const hidden = element.hidden;

  // Always reset the scrolling position of this takeover/modal.
  element.scrollTop = 0;
  element.hidden = ! hidden;
  document.body.setAttribute( 'data-takeover-active', hidden );
}

async function handlePermissionsRequestResult( granted ) {
  cachePermissionsCheckResult( granted );
  setButtonModesControllingCtasState();

  if ( granted ) {
    await permissions.rememberGrantedAtLeastOnce( granted );
    await setHadVersion8InstalledBeforeMessageVisibility();
  }

  togglePermissionsPrivacyDetails();
}

async function requestToNeverShowAgain() {
  try {
    await browser.storage.local.set( {
      [ settingsHelpers.HAD_ASKED_TO_NOT_SHOW_WARNING_AGAIN_KEY ]: true,
    } );
  }
  catch ( error ) {
    // @todo
  }
}

async function revokePermissions( event ) {
  event.preventDefault();
  settingsHelpers.requestToSignalSettingsToBeUpdated();

  let revoked = false;

  try {
    revoked = await permissions.revokePermissions();
  }
  catch ( error ) {
    // @todo
  }

  handlePermissionsRevocationResult( revoked );
}

function handlePermissionsRevocationResult( revoked ) {
  cachePermissionsCheckResult( ! revoked );
  setButtonModesControllingCtasState( true );

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
  if ( browsersHelpers.isFirefox() ) {
    requestToReloadExtension();
  }
}

async function requestToReloadExtension() {
  togglePageReadyState();

  if ( window.confirm( await i18n.getMessage( 'extensionReloadConfirmationMessage' ) ) ) {
    await letRuntimeFinishAllTasks();

    try {
      browser.runtime.reload();
    }
    catch ( error ) {
      requestToReportExtensionReloadIssue( error );
    }

    return true;
  }
  else {
    togglePageReadyState();

    return false;
  }
}

async function requestToReportExtensionReloadIssue( error ) {
  const installationId = await utils.getInstallationId();
  const ISSUE_MESSAGE_JSON_KEY = 'extensionReloadIssue';
  // Don't translate, as this gets sent to developer
  const ISSUE_TITLE = 'Extension reload issue';
  // Don't translate, as this gets sent to developer
  // @todo Move out generic error report.
  const debuggingInformation = `
Version: ${ strConstExtensionVersion }
Error: ${ JSON.stringify( error ) }
Browser: ${ window.navigator.userAgent }
Anonymous installation ID: ${ installationId }`;

  feedback.requestToReportIssue( ISSUE_MESSAGE_JSON_KEY, ISSUE_TITLE, debuggingInformation );
}

/**
 * There is an ongoing issue where some users' installations don't have “<all_urls>” origin permission. Users report that sometimes Expert mode gets reverted to Advanced for an unknown reason. This is an attempt to give some time to the runtime to finish all tasks before the extension restart.
 *
 * @returns {Promise<void>}
 */

async function letRuntimeFinishAllTasks() {
  const MILLISECONDS_TO_FINISH_ALL_TASKS = 1000;

  await new Promise( ( resolve ) => setTimeout( resolve, MILLISECONDS_TO_FINISH_ALL_TASKS ) );
}

/**
 * To avoid requesting localization of some status messages multiples times, request once and save.
 */

function cacheMessages() {
  statusOptionsSaved = poziworldExtension.i18n.getMessage( 'optionsSaved' );
}

/**
 * Add the appropriate event listeners for the form elements.
 */

function addListeners() {
  options.forEach( addOptionChangeListener );
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
  const type = element.type;

  element.addEventListener( 'change', handleOptionChange );

  if ( type !== ELEMENT_TYPE_RADIO ) {
    element.addEventListener( 'blur', handleOptionChange );
  }
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

  const newSettings = {
    buttonMode: settingsHelpers.SCROLL_TO_TOP_ONLY_EXPERT_BUTTON_MODE,
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

  setSettings( newSettings, true );
}

/**
 * Set original author's favorite settings.
 *
 * @param {Event} event
 */

function setOriginalAuthorSettings( event ) {
  event.preventDefault();

  const newSettings = {
    buttonMode: settingsHelpers.DUAL_ARROWS_EXPERT_BUTTON_MODE,
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

  setSettings( newSettings, true );
}

function cacheSettings( settings ) {
  setOriginalSettings( settings );
  // @todo Move out.
  buttonModeCachedValue = settings.buttonMode;
}

/**
 * Remember what settings values were on page load.
 *
 * @param {Object} settings - Key-value pairs of the main extension settings (the ones set on the Options page).
 */

function setOriginalSettings( settings ) {
  originalSettings = settings;
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
  let updatedSettingsCounter = 0;

  for ( const settingKey in settings ) {
    if ( settings.hasOwnProperty( settingKey ) ) {
      let settingElement = document.getElementById( settingKey );

      if ( settingElement ) {
        settingElement.value = settings[ settingKey ];

        updatedSettingsCounter++;
      }
      else {
        settingElement = document.querySelector( `[name="${ settingKey }"][value="${ settings[ settingKey ] }"` );

        if ( settingElement ) {
          settingElement.checked = true;

          updatedSettingsCounter++;
        }
      }
    }
  }

  if ( updatedSettingsCounter ) {
    checkMode();
    switchCustomOptionsVisibility();
  }
}

/**
 * Save the current value of the setting.
 *
 * @param {Event} event
 */

async function handleOptionChange( event ) {
  if ( event ) {
    const element = event.target;

    if ( element.isSameNode( changedElementBeingHandled ) ) {
      return;
    }

    // @todo Optimize.
    changedElementBeingHandled = element;

    const customizable = Boolean( Number( element.getAttribute( CUSTOMIZABLE_OPTION_ATTRIBUTE_NAME ) ) );

    if ( customizable ) {
      switchCustomOptionVisibility( element );
    }
    else if ( element.classList.contains( CUSTOM_OPTION_CLASS ) && ! checkFormValidity() ) {
      changedElementBeingHandled = null;

      return;
    }
    else {
      const permissionsRequiredAttributeValue = element.getAttribute( PERMISSIONS_REQUIRED_ATTRIBUTE_KEY );

      if ( permissionsRequiredAttributeValue ) {
        const permissionsRequired = window.JSON.parse( permissionsRequiredAttributeValue );

        if ( permissionsRequired ) {
          const granted = await requestPermissions();

          if ( ! granted ) {
            // @todo Make dynamic.
            document.querySelector( `${ BUTTON_MODE_SELECTOR }[value="${ buttonModeCachedValue }"` ).checked = true;

            changedElementBeingHandled = null;

            return;
          }
        }
      }
    }

    changedElementBeingHandled = null;

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

async function handleFormSubmit( event ) {
  if ( event ) {
    event.preventDefault();
  }

  const settings = {};
  const optionsTemp = Array.from( options );

  while ( optionsTemp.length ) {
    const option = optionsTemp.shift();
    const id = option.id;
    const value = option.value;

    if ( poziworldExtension.utils.isNonEmptyString( id ) && ( value !== CUSTOM_VALUE_INDICATOR || hasSetCustomValues( option ) ) ) {
      settings[ id ] = value;
    }
    else {
      const name = option.name;

      if ( poziworldExtension.utils.isNonEmptyString( name ) ) {
        // Radio buttons
        if ( option.checked ) {
          settings[ name ] = value;
        }
      }
      else {
        form.reportValidity();

        return;
      }
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
 * @param {object} newSettings - Key-value pairs of the main extension settings (the ones set on the Options page).
 * @param {boolean} [refreshForm] - If the settings are being changed by a reset, update form values.
 */

async function setSettings( newSettings, refreshForm ) {
  if ( ! settingsHelpers.isExpectedFormat( newSettings ) ) {
    return;
  }

  try {
    await settingsHelpers.setSettings( newSettings );
    applySettings( newSettings, refreshForm );
    settingsHelpers.requestToSignalSettingsGotUpdated();
  }
  catch ( error ) {
    const GLOBAL_LOG_MESSAGE_UPDATED = false;

    Log.add(
      'Failed to save settings',
      {
        error,
        newSettings,
        refreshForm,
      },
      GLOBAL_LOG_MESSAGE_UPDATED,
      {
        level: 'error',
      },
    );
  }
}

/**
 * Let user know the settings have been saved.
 *
 * @param {object} settings - Key-value pairs of the main extension settings (the ones set on the Options page).
 * @param {boolean} [refreshForm] - If the settings are being changed by a reset, update form values.
 */

async function applySettings( settings, refreshForm ) {
  setStatus( statusOptionsSaved );

  window.clearTimeout( statusTimeoutId );
  statusTimeoutId = window.setTimeout( clearStatus, STATUS_TIMEOUT_DELAY );

  checkMode();

  if ( refreshForm ) {
    updateSelectedOptions( settings );
  }

  if ( poziworldExtension.utils.isNonEmptyString( settings.contextMenu ) ) {
    sttb.contextMenus.toggle( settings );
  }

  if ( languagesModule.isLanguageBeingChanged( settings, getOriginalSettings() ) ) {
    const approved = await requestToReloadExtension();

    if ( approved ) {
      window.location.reload();
    }
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
  const mode = getButtonModeValue();

  // @todo Optimize.
  switch ( mode ) {
    case settingsHelpers.SCROLL_TO_TOP_ONLY_BASIC_BUTTON_MODE:
    case settingsHelpers.SCROLL_TO_TOP_ONLY_ADVANCED_BUTTON_MODE:
    case settingsHelpers.FLIP_ADVANCED_BUTTON_MODE:
    case settingsHelpers.DUAL_ARROWS_ADVANCED_BUTTON_MODE:
    {
      switchElements(
        [
          '#button-settings',
          '#scrollUpSpeed',
          '#scrollDownSpeed',
          '#distanceLength',
          '.appearance',
          '#clickthroughKeys',
          '#keyboard-settings',
          '#contextMenu',
          '#settingsOverrideCtasContainer',
        ],
        false
      );

      break;
    }

    case settingsHelpers.FLIP_EXPERT_BUTTON_MODE: {
      changeDistanceType( 'flipDistance' );
      switchElements(
        [
          '#button-settings',
          '#distanceLength',
          '.appearance',
          '#scrollDownSpeed',
          '#clickthroughKeys',
          '#keyboard-settings',
          '#contextMenu',
          '#settingsOverrideCtasContainer',
        ],
        true
      );

      break;
    }

    case settingsHelpers.DUAL_ARROWS_EXPERT_BUTTON_MODE: {
      switchElements(
        [
          '#distanceLength',
        ],
        false
      );
      switchElements(
        [
          '#button-settings',
          '.appearance',
          '#scrollUpSpeed',
          '#scrollDownSpeed',
          '#clickthroughKeys',
          '#keyboard-settings',
          '#contextMenu',
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
          '#button-settings',
          '#scrollDownSpeed',
          '#keyboard-settings',
          '#contextMenu',
          '#settingsOverrideCtasContainer',
        ],
        true
      );

      break;
    }

    case settingsHelpers.SCROLL_TO_TOP_ONLY_EXPERT_BUTTON_MODE: {
      changeDistanceType( 'appearDistance' );
      switchElements(
        [
          '#button-settings',
          '#distanceLength',
          '.appearance',
          '#clickthroughKeys',
          '#keyboard-settings',
          '#contextMenu',
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

function getButtonModeValue() {
  buttonMode = document.querySelector( BUTTON_MODE_SELECTED_SELECTOR );

  if ( buttonMode ) {
    return buttonMode.value;
  }

  // @todo Localize.
  throw new Error( 'No selected button mode.' );
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

function togglePageReadyState() {
  document.body.classList.toggle( NOT_READY_CLASS );
}
