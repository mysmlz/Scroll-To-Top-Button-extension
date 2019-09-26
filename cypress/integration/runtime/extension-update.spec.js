import * as runtime from '../../shared/runtime';
import * as testPages from '../../shared/test-pages';
import * as buttonSettings from '../../shared/button-settings';

const nonDefaultSettings = {
  buttonMode: 'dual',
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
  scroll: 'jswing',
};

context( 'Extension update', runTests );

/**
 * Define & execute the tests.
 */

function runTests() {
  it( 'Preserves settings (user preferences)', checkPreservesSettings );
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

function compareSettings() {
  buttonSettings.getButtonSettings()
    .should( 'deep.eq', buttonSettings.prepareForStorage( nonDefaultSettings ) );
}
