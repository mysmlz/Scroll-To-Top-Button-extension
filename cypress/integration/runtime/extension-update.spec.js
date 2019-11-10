import * as runtime from '../../shared/runtime';
import * as testPages from '../../shared/test-pages';
import * as buttonSettings from '../../shared/button-settings';
import * as elements from '../../shared/elements';

/** @type {number} {@link availableSettings.scrollUpSpeedDefault} */
const SCROLL_UP_SPEED = 1000;
/** @type {number} {@link availableSettings.buttonWidthCustomDefault} */
const BUTTON_WIDTH_CUSTOM = 60;
/** @type {number} {@link availableSettings.buttonHeightCustomDefault} */
const BUTTON_HEIGHT_CUSTOM = 60;
/** @type {string} {@link availableSettings.clickthroughKeysDefault} */
const CLICKTHROUGH_KEYS = 'ctrl|shift';

const nonDefaultSettings = {
  uiLanguage: 'browserDefault',
  buttonMode: 'dual',
  scrollUpSpeed: SCROLL_UP_SPEED,
  scrollUpSpeedCustom: 1000,
  scrollDownSpeed: 1000,
  scrollDownSpeedCustom: 1000,
  distanceLength: 400,
  buttonSize: '50px',
  buttonWidthCustom: BUTTON_WIDTH_CUSTOM,
  buttonHeightCustom: BUTTON_HEIGHT_CUSTOM,
  buttonDesign: 'arrow_only_blue',
  buttonLocation: 'CR',
  notActiveButtonOpacity: '0.5',
  keyboardShortcuts: 'arrows',
  contextMenu: 'on',
  homeEndKeysControlledBy: 'sttb',
  clickthroughKeys: CLICKTHROUGH_KEYS,
  scroll: 'jswing',
};

context( 'Extension update', runTests );

/**
 * Define & execute the tests.
 */

function runTests() {
  it( 'Preserves settings (user preferences)', checkPreservesSettings );
  it( 'Sets default values for new/missing settings', checkSetsMissingSettings );
}

/**
 * Make sure the extension preserves settings (user preferences) on update.
 *
 * The reasoning: while in alpha/beta, v8 had a bug where each extension reload/restart ({@link https://developer.chrome.com/extensions/runtime#event-onInstalled runtime.onInstalled}) would reset the button settings.
 */

function checkPreservesSettings() {
  setNonDefaultSettings();
  runtime.requestToSimulateExtensionUpdate();
  testPages.openTestPage();
  testPages.forceButtonInjection();
  compareSettings();
}

/**
 * Make sure the extension preserves settings (user preferences) on update.
 */

function setNonDefaultSettings() {
  buttonSettings.setButtonSettings( nonDefaultSettings );
}

/**
 * Make sure all the settings and their values remained in tact or got (re)created, if needed, after the extension update.
 */

function compareSettings() {
  buttonSettings.getButtonSettings()
    .should( 'deep.eq', buttonSettings.prepareForStorage( nonDefaultSettings ) );
}

/**
 * If one or more settings or their values go missing or new settings get added in a new extension version, make sure the settings get (re)created and their default values get set.
 */

function checkSetsMissingSettings() {
  simulateCorruptedSettings();
  runtime.requestToSimulateExtensionUpdate();
  testPages.openTestPage();
  testPages.forceButtonInjection();
  elements.expectToExist( elements.getButton1Element() );
  compareSettings();
}

/**
 * Fake a corrupted value of an existing setting and remove new settings added in v8.0.0.
 */

function simulateCorruptedSettings() {
  const corruptedSettings = Object.assign( {}, nonDefaultSettings );

  corruptedSettings.scrollUpSpeed = undefined;
  delete corruptedSettings.buttonWidthCustom;
  delete corruptedSettings.buttonHeightCustom;
  delete corruptedSettings.clickthroughKeys;

  buttonSettings.setButtonSettings( corruptedSettings );
}
