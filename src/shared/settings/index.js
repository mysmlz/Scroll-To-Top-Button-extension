import utils from 'Shared/utils';

import * as buttonModesModule from './button-modes';
export * from './button-modes';

import * as eventsModule from './events';
export * from './events';

const SETTINGS_STORAGE_KEY = 'settings';

const PREVIOUS_VERSION_STORAGE_KEY = 'previousVersion';
const PREVIOUS_VERSION_8_PREFIX = '8.';

export const HAVE_GRANTED_PERMISSIONS_AT_LEAST_ONCE_KEY = 'haveGrantedPermissionsAtLeastOnce';
export const HAD_ASKED_TO_NOT_SHOW_WARNING_AGAIN_KEY = 'hadAskedToNotShowWarningAgain';

export async function getButtonMode() {
  try {
    const settings = await getSettings();

    if ( settings ) {
      return buttonModesModule.extractButtonMode( settings );
    }
  }
  catch ( error ) {
    Log.add( 'Failed to get button mode', error, false, {
      level: 'error',
    } );
  }
}

export async function getSettings() {
  let settings;
  let synchronizedSettings;
  let nonSynchronizedSettings;

  try {
    synchronizedSettings = await retrieveSettingsFromStorage( utils.SYNCHRONIZABLE_STORAGE_TYPE );
    nonSynchronizedSettings = await retrieveSettingsFromStorage( utils.NON_SYNCHRONIZABLE_STORAGE_TYPE );

    // @todo Allow user to choose which settings should have more priority, as user might want a different set of settings on some computer/browser instance. Example: user might want to use the same set of settings on their desktop and laptop, but a different set on their mobile phone.
    settings = {
      ...synchronizedSettings,
      ...nonSynchronizedSettings,
    };
  }
  catch ( error ) {
    Log.add( 'Failed to get settings', error, false, {
      level: 'error',
    } );
  }

  if ( ! isBasicExpectedFormat( settings ) ) {
    eventsModule.signalSettingsNotReady();
    throw new TypeError( 'Settings appear to be corrupted.' );
  }

  if ( isUnusableButtonMode( synchronizedSettings, nonSynchronizedSettings ) ) {
    const synchronizedButtonMode = buttonModesModule.extractButtonMode( synchronizedSettings );

    settings.buttonMode = buttonModesModule.getExpertModeReplacement( synchronizedButtonMode );
  }

  return settings;
}

/**
 * If there is no locally saved button mode or it's corrupted and the synchronized button mode is from the Expert group, such synchronized button mode can't be used, as its required permissions aren't synchronized.
 *
 * @param {Settings} synchronizedSettings
 * @param {Settings} nonSynchronizedSettings
 * @returns {boolean}
 */

function isUnusableButtonMode( synchronizedSettings, nonSynchronizedSettings ) {
  const nonSynchronizedSettingsOfExpectedFormat = isExpectedFormat( nonSynchronizedSettings );

  return (
    ( nonSynchronizedSettingsOfExpectedFormat && ! buttonModesModule.AVAILABLE_BUTTON_MODES.includes( buttonModesModule.extractButtonMode( nonSynchronizedSettings ) ) || ! nonSynchronizedSettingsOfExpectedFormat ) &&
    isExpectedFormat( synchronizedSettings ) &&
    buttonModesModule.isExpertButtonMode( buttonModesModule.extractButtonMode( synchronizedSettings ) )
  );
}

export async function setSettings( newSettings ) {
  let settings;

  try {
    settings = await getSettings();
  }
  catch ( error ) {
    Log.add( 'No settings to override', error, false, {
      level: 'warn',
    } );
  }

  const storageDataWrapper = {
    [ SETTINGS_STORAGE_KEY ]: {
      ...settings,
      ...newSettings,
    },
  };

  // Saving in local and sync is necessary as buttonMode can't be synchronized, as it depends on permissions, which are not synchronized. Will also allow user to choose whether user wants to synchronize settings
  await utils.saveInStorage( utils.NON_SYNCHRONIZABLE_STORAGE_TYPE, storageDataWrapper );
  await utils.saveInStorage( utils.SYNCHRONIZABLE_STORAGE_TYPE, storageDataWrapper );
  eventsModule.signalSettingsReady();
}

async function retrieveSettingsFromStorage( storageType ) {
  try {
    const { [ SETTINGS_STORAGE_KEY ]: settings } = await utils.getFromStorage( storageType, SETTINGS_STORAGE_KEY );

    return settings;
  }
  catch ( error ) {
    Log.add( `Failed to retrieve settings from ${ storageType } storage`, error, false, {
      level: 'error',
    } );
  }
}

export function isExpectedFormat( settings ) {
  return isBasicExpectedFormat( settings ) && ! Global.isEmpty( settings );
}

/**
 * If settings haven't been set yet, the very least to do is check the API doesn't fail - it returns empty object if no result.
 *
 * @param {Settings} settings
 * @returns {boolean}
 */

export function isBasicExpectedFormat( settings ) {
  return window.poziworldExtension.utils.isType( settings, 'object' );
}

/**
 * Version 8 of the extension required permissions granted upon installation.
 * There was no way to carry over the content scripts' “<all_urls>” as an origin permission, so when updated to version 9 users have grant the permissions again in Options. Otherwise, the extension would only work when activeTab is invoked.
 *
 * “mightHaveHad” in the name refers to a bug in pre-9.2.0 versions that was wrongly checking whether a previous version was version 8, while for version 9.1.0 it would have been 9.0.0.
 * As a precaution, show the breaking changes warning to extra users than none.
 *
 * @see {@link https://developer.chrome.com/extensions/activeTab}
 */

export async function mightHaveHadVersion8InstalledBefore() {
  try {
    const { [ PREVIOUS_VERSION_STORAGE_KEY ]: previousVersion } = await browser.storage.local.get( PREVIOUS_VERSION_STORAGE_KEY );

    return window.poziworldExtension.utils.isNonEmptyString( previousVersion ) && previousVersion.startsWith( PREVIOUS_VERSION_8_PREFIX );
  }
  catch ( error ) {
    // @todo
  }
}

export async function haveGrantedPermissionsAtLeastOnce() {
  try {
    const { [ HAVE_GRANTED_PERMISSIONS_AT_LEAST_ONCE_KEY ]: granted } = await browser.storage.local.get( HAVE_GRANTED_PERMISSIONS_AT_LEAST_ONCE_KEY );

    return window.poziworldExtension.utils.isType( granted, 'boolean' ) && granted;
  }
  catch ( error ) {
    // @todo
  }
}

// @todo DRY.
export async function hadAskedToNotShowWarningAgain() {
  try {
    const { [ HAD_ASKED_TO_NOT_SHOW_WARNING_AGAIN_KEY ]: asked } = await browser.storage.local.get( HAD_ASKED_TO_NOT_SHOW_WARNING_AGAIN_KEY );

    return window.poziworldExtension.utils.isType( asked, 'boolean' ) && asked;
  }
  catch ( error ) {
    // @todo
  }
}
